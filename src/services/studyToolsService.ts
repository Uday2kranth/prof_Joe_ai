import type { Message, UserKeys, Flashcard, QuizQuestion, FlashcardDeck, QuizDeck } from '../types';
import { sendChatMessage } from './apiService';
import { syncCloudStudyTools } from './studyToolsSyncService';

export interface StudyDeckResult {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

/**
 * Safely extracts and parses JSON from LLM output (strips markdown codeblocks and artifacts)
 */
function extractJsonFromLlm(raw: string): any {
  if (!raw) return null;
  let text = raw.trim();

  // Strip ```json or ``` code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find outermost curly braces
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn('Direct JSON parse failed, trying sanitized recovery:', err);
    // Fallback: fix common JSON trailing commas
    const sanitized = text.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(sanitized);
    } catch (e2) {
      console.error('Failed to parse study deck JSON:', e2);
      return null;
    }
  }
}

/**
 * Generates an interactive flashcard set & practice quiz from a single AI message bubble (Targeted Micro-Drill)
 */
export async function generateStudyDeckFromMessage(
  message: Message,
  provider: string,
  model: string,
  userKeys: UserKeys
): Promise<StudyDeckResult> {
  const bubbleContext = `Target Question / High-Yield Explanation:
${message.content.slice(0, 3000)}`;

  const studyPrompt = `You are Prof. Joe, an expert Osmania University academic mentor.
Analyze the following high-yield academic response and extract key formulas, definitions, and exam concepts to generate:
1. Exactly 4 to 6 High-Yield Interactive Flashcards (Front: Question/Concept, Back: Clear concise answer or mathematical formula). Use standard LaTeX like $formula$ for all math/symbols.
2. Exactly 3 to 5 Multiple-Choice Exam Practice Questions (Question, 4 Options A-D, correct option index 0-3, and clear derivation/explanation). Use standard LaTeX like $formula$ for all equations and mathematical terms.

Strict Output Format: Respond ONLY with a valid JSON object matching this schema without preamble or markdown formatting:
{
  "flashcards": [
    { "id": "fc-1", "front": "Concept or Question", "back": "Clear concise answer/formula with $LaTeX$", "category": "High Yield" }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Clear Osmania exam question with $LaTeX$?",
      "options": ["Option A with $math$", "Option B with $math$", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct with mathematical derivation"
    }
  ]
}

Academic Material:
${bubbleContext}`;

  try {
    const res = await sendChatMessage(
      provider,
      model,
      [{ id: 'study-msg-req', role: 'user', content: studyPrompt, timestamp: Date.now() }],
      userKeys,
      false,
      'none',
      'You are a strict JSON generator. Return only raw JSON without code blocks or markdown commentary.'
    );

    const parsed = extractJsonFromLlm(res.content);

    if (parsed && Array.isArray(parsed.flashcards) && Array.isArray(parsed.quiz)) {
      return {
        flashcards: parsed.flashcards.map((fc: any, i: number) => ({
          id: fc.id || `fc-${Date.now()}-${i}`,
          front: fc.front || 'Concept',
          back: fc.back || 'Explanation',
          category: fc.category || 'High Yield',
          mastered: false
        })),
        quiz: parsed.quiz.map((q: any, i: number) => ({
          id: q.id || `q-${Date.now()}-${i}`,
          question: q.question || 'Exam Question',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || 'Correct solution derived from academic principles.'
        }))
      };
    }
  } catch (err) {
    console.warn('AI deck generation from message failed, using fallback:', err);
  }

  return {
    flashcards: [
      { id: 'fc-1', front: 'What is the primary theorem or concept explained in this note?', back: message.content.slice(0, 180) + '...', category: 'High Yield', mastered: false }
    ],
    quiz: [
      {
        id: 'q-1',
        question: 'Which core concept is central to this academic derivation?',
        options: ['Mathematical Optimization', 'Statistical Inference', 'Computational Complexity', 'Empirical Verification'],
        correctIndex: 1,
        explanation: 'The derivation applies fundamental principles of statistical inference.'
      }
    ]
  };
}

/**
 * Generates an interactive flashcard set & 5-question practice quiz based on active chat history
 */
export async function generateStudyDeckFromChat(
  messages: Message[],
  provider: string,
  model: string,
  userKeys: UserKeys
): Promise<StudyDeckResult> {
  // Filter user & assistant messages
  const convoContext = messages
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'Student' : 'Prof. Joe'}: ${m.content.slice(0, 1500)}`)
    .join('\n\n---\n\n');

  const studyPrompt = `You are Prof. Joe, an expert Osmania University academic mentor.
Analyze the following academic discussion and extract key formulas, definitions, and high-yield exam concepts to generate:
1. Exactly 6 to 8 High-Yield Interactive Flashcards (Front: Question/Concept, Back: Clear concise answer or mathematical formula). Use standard LaTeX like $formula$ or $$formula$$ for all math.
2. Exactly 5 Multiple-Choice Exam Practice Questions (Question, 4 Options A-D, correct option index 0-3, and clear derivation/explanation). Use standard LaTeX like $formula$ for all options and mathematical terms.

Strict Output Format: Respond ONLY with a valid JSON object matching this schema without preamble or markdown formatting:
{
  "flashcards": [
    { "id": "fc-1", "front": "Concept or Question with $math$", "back": "Clear concise answer/formula with $LaTeX$", "category": "High Yield" }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Clear Osmania exam question with $LaTeX$?",
      "options": ["Option A with $math$", "Option B with $math$", "Option C with $math$", "Option D with $math$"],
      "correctIndex": 0,
      "explanation": "Why this option is correct with mathematical derivation"
    }
  ]
}

Academic Discussion Excerpt:
${convoContext}`;

  const res = await sendChatMessage(
    provider,
    model,
    [{ id: 'study-req', role: 'user', content: studyPrompt, timestamp: Date.now() }],
    userKeys,
    false,
    'none',
    'You are a strict JSON generator. Return only raw JSON without code blocks or markdown commentary.'
  );

  const parsed = extractJsonFromLlm(res.content);

  if (parsed && Array.isArray(parsed.flashcards) && Array.isArray(parsed.quiz)) {
    return {
      flashcards: parsed.flashcards.map((fc: any, i: number) => ({
        id: fc.id || `fc-${Date.now()}-${i}`,
        front: fc.front || 'Concept',
        back: fc.back || 'Explanation',
        category: fc.category || 'High Yield',
        mastered: false
      })),
      quiz: parsed.quiz.map((q: any, i: number) => ({
        id: q.id || `q-${Date.now()}-${i}`,
        question: q.question || 'Exam Question',
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || 'Correct solution derived from academic principles.'
      }))
    };
  }

  // Fallback default sample deck if LLM produced unexpected output
  return {
    flashcards: [
      { id: 'fc-1', front: 'What are the criteria for a good estimator?', back: 'Unbiasedness, Consistency, Efficiency, and Sufficiency (Cramer-Rao theorem).', category: 'High Yield', mastered: false },
      { id: 'fc-2', front: 'State the Cramer-Rao Lower Bound formula', back: 'Var(T) >= 1 / I(theta), where I(theta) is Fisher Information.', category: 'Formulas', mastered: false },
      { id: 'fc-3', front: 'What is the Jackknife technique used for?', back: 'Bias reduction and non-parametric variance estimation by leave-one-out sampling.', category: 'Algorithms', mastered: false }
    ],
    quiz: [
      {
        id: 'q-1',
        question: 'An estimator is said to be unbiased if its expected value is equal to:',
        options: ['The true parameter θ', 'Zero', 'Sample mean', 'Sample variance'],
        correctIndex: 0,
        explanation: 'E[θ̂] = θ defines an unbiased estimator.'
      }
    ]
  };
}

/* =========================================================================
   💾 ZERO-TOKEN DECK PERSISTENCE HELPERS (LOCAL STORAGE & OFFLINE REPLAY)
   ========================================================================= */

const FLASHCARD_DECKS_PREFIX = 'chatterbot_flashcard_decks_';
const QUIZ_DECKS_PREFIX = 'chatterbot_quiz_decks_';

export function getSavedFlashcardDecks(username: string): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(`${FLASHCARD_DECKS_PREFIX}${username || 'guest'}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load flashcard decks:', e);
  }
  return [];
}

export function saveFlashcardDeck(username: string, deck: FlashcardDeck): FlashcardDeck[] {
  try {
    const existing = getSavedFlashcardDecks(username);
    const filtered = existing.filter(d => d.id !== deck.id);
    const updated = [deck, ...filtered];
    localStorage.setItem(`${FLASHCARD_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { flashcardDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to save flashcard deck:', e);
    return getSavedFlashcardDecks(username);
  }
}

export function deleteFlashcardDeck(username: string, deckId: string): FlashcardDeck[] {
  try {
    const existing = getSavedFlashcardDecks(username);
    const updated = existing.filter(d => d.id !== deckId);
    localStorage.setItem(`${FLASHCARD_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { flashcardDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to delete flashcard deck:', e);
    return getSavedFlashcardDecks(username);
  }
}

export function updateFlashcardMastery(
  username: string,
  deckId: string,
  cardId: string,
  mastered: boolean
): FlashcardDeck[] {
  try {
    const existing = getSavedFlashcardDecks(username);
    const updated = existing.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          lastStudiedAt: Date.now(),
          cards: deck.cards.map(c => c.id === cardId ? { ...c, mastered } : c)
        };
      }
      return deck;
    });
    localStorage.setItem(`${FLASHCARD_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { flashcardDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to update flashcard mastery:', e);
    return getSavedFlashcardDecks(username);
  }
}

export function getSavedQuizDecks(username: string): QuizDeck[] {
  try {
    const raw = localStorage.getItem(`${QUIZ_DECKS_PREFIX}${username || 'guest'}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load quiz decks:', e);
  }
  return [];
}

export function saveQuizDeck(username: string, deck: QuizDeck): QuizDeck[] {
  try {
    const existing = getSavedQuizDecks(username);
    const filtered = existing.filter(d => d.id !== deck.id);
    const updated = [deck, ...filtered];
    localStorage.setItem(`${QUIZ_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { quizDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to save quiz deck:', e);
    return getSavedQuizDecks(username);
  }
}

export function deleteQuizDeck(username: string, deckId: string): QuizDeck[] {
  try {
    const existing = getSavedQuizDecks(username);
    const updated = existing.filter(d => d.id !== deckId);
    localStorage.setItem(`${QUIZ_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { quizDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to delete quiz deck:', e);
    return getSavedQuizDecks(username);
  }
}

export function saveQuizAttemptScore(
  username: string,
  deckId: string,
  score: number,
  total: number
): QuizDeck[] {
  try {
    const existing = getSavedQuizDecks(username);
    const updated = existing.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          lastAttemptScore: { score, total, timestamp: Date.now() }
        };
      }
      return deck;
    });
    localStorage.setItem(`${QUIZ_DECKS_PREFIX}${username || 'guest'}`, JSON.stringify(updated));
    syncCloudStudyTools(username, { quizDecks: updated });
    return updated;
  } catch (e) {
    console.error('Failed to save quiz attempt score:', e);
    return getSavedQuizDecks(username);
  }
}
