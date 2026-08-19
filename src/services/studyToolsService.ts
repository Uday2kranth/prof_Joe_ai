import type { Message, UserKeys, Flashcard, QuizQuestion } from '../types';
import { sendChatMessage } from './apiService';

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
1. Exactly 6 to 8 High-Yield Interactive Flashcards (Front: Question/Concept, Back: Clear concise answer or mathematical formula).
2. Exactly 5 Multiple-Choice Exam Practice Questions (Question, 4 Options A-D, correct option index 0-3, and clear derivation/explanation).

Strict Output Format: Respond ONLY with a valid JSON object matching this schema without preamble or markdown formatting:
{
  "flashcards": [
    { "id": "fc-1", "front": "Concept or Question", "back": "Clear concise answer/formula", "category": "High Yield" }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Clear Osmania exam question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct"
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
