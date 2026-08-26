import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChatSession, Message, UserKeys, ActiveViewType, UserCustomModels, PinnedItem, Flashcard, QuizQuestion, FlashcardDeck, QuizDeck } from './types';
import { ChatWindow } from './components/ChatWindow';
import { CheatSheetDrawer } from './components/CheatSheetDrawer';
import { FlashcardsModal } from './components/FlashcardsModal';
import { QuizModal } from './components/QuizModal';
import { 
  generateStudyDeckFromChat, 
  generateStudyDeckFromMessage, 
  saveFlashcardDeck, 
  saveQuizDeck,
  getSavedFlashcardDecks,
  getSavedQuizDecks
} from './services/studyToolsService';
import {
  getSavedPins,
  savePinsLocally,
  fetchCloudStudyTools,
  syncCloudStudyTools
} from './services/studyToolsSyncService';

// Code-Split Heavy Studio Views for Instant Initial App Load & Drastic Bundle Optimization
const PracticalCodeLabView = React.lazy(() => import('./components/PracticalCodeLabView').then(m => ({ default: m.PracticalCodeLabView })));
const LectureNotesStudioView = React.lazy(() => import('./components/LectureNotesStudioView').then(m => ({ default: m.LectureNotesStudioView })));
const ExamPrepView = React.lazy(() => import('./components/ExamPrepView').then(m => ({ default: m.ExamPrepView })));
const SystemPromptLibraryView = React.lazy(() => import('./components/SystemPromptLibraryView').then(m => ({ default: m.SystemPromptLibraryView })));
const PromptLibraryView = React.lazy(() => import('./components/PromptLibraryView').then(m => ({ default: m.PromptLibraryView })));
const FunPersonaChatView = React.lazy(() => import('./components/FunPersonaChatView').then(m => ({ default: m.FunPersonaChatView })));
const DiagramStudioView = React.lazy(() => import('./components/DiagramStudioView').then(m => ({ default: m.DiagramStudioView })));
const CubesPlaygroundView = React.lazy(() => import('./components/CubesPlaygroundView').then(m => ({ default: m.CubesPlaygroundView })));
const DocumentExtractorStudioView = React.lazy(() => import('./components/DocumentExtractorStudioView').then(m => ({ default: m.DocumentExtractorStudioView })));
const InteractiveSandboxView = React.lazy(() => import('./components/InteractiveSandboxView').then(m => ({ default: m.InteractiveSandboxView })));
const DsaLabView = React.lazy(() => import('./components/dsa/DsaLabView').then(m => ({ default: m.DsaLabView })));
const FlashcardsStudioView = React.lazy(() => import('./components/FlashcardsStudioView').then(m => ({ default: m.FlashcardsStudioView })));
const QuizArenaView = React.lazy(() => import('./components/QuizArenaView').then(m => ({ default: m.QuizArenaView })));
const PinnedNotesArchiveView = React.lazy(() => import('./components/PinnedNotesArchiveView').then(m => ({ default: m.PinnedNotesArchiveView })));
const SettingsStudioView = React.lazy(() => import('./components/SettingsStudioView').then(m => ({ default: m.SettingsStudioView })));
const TestDiagramsStudioView = React.lazy(() => import('./components/TestDiagramsStudioView').then(m => ({ default: m.TestDiagramsStudioView })));
const DeepLearningStudioView = React.lazy(() => import('./components/DeepLearningStudioView').then(m => ({ default: m.DeepLearningStudioView })));
import { ACADEMIC_PRESETS } from './components/CodeLabPresetDrawer';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { DemoLandingHub } from './components/DemoLandingHub';
import { DemoChatHistoryDrawer } from './components/DemoChatHistoryDrawer';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { printSessionToPdf } from './services/printPdfService';
import { pruneOldRenderCache } from './services/renderCacheService';
import { Home, Key, Moon, Sun, Menu, RotateCw, Settings } from 'lucide-react';
import { sendChatMessage, getApiUrl } from './services/apiService';
import { fetchCloudCodeLabPresetSessions, syncCodeLabPresetSessions } from './services/codelabSyncService';

const DEFAULT_KEYS: UserKeys = {
  ollama: '',
  openrouter: '',
  gemini: '',
  groq: '',
  mistral: '',
  nvidia: '',
  cerebras: '',
  sambanova: '',
  nararouter: '',
  huggingface: '',
  pollinations: '',
  opencode: '',
  poolside: '',
  local_endpoint: ''
};

const safeDecode = (b64Str: string): string => {
  try {
    return atob(b64Str);
  } catch (e) {
    return b64Str;
  }
};

const ADMIN_BUNDLED_SYSTEM_KEYS: UserKeys = {
  gemini: safeDecode("QVEuQWI4Uk42S2NRRFhsMXFycDRDdWdhVlJoem1GSjdrd0NaMVl6ZDdjREdKOFYxWkt3b1EsIEFRLkFiOFJONkpQcDdmMERaYkxSdklhVG5iTjU4YWdBZWJmc3gwekVWU3kwcXRRMXR4OFVnLCBBUS5BYjhSTjZKWEVxX3NwZHpYSTluLXZnQ0QzNjd1WngwS0pSeGpJRF8tMVZzRFNZSEVCQSwgQVEuQWI4Uk42TFJmZEM0VjRyQ0twWUtadE8zZmYwbFhKUVpoU3VUVnVJMGdFR28tdDJZblEsIEFRLkFiOFJONEloZUpEMmE1bm9VczI5TlMtOE9ZVFYxalZPVWVVNDVxV0w4TzZpY3VZOGx3LCBBSXphU3lBVEpnb21pdXdnYm9lNWttcGVWWVNJWmhhY0ptdUROT1EsIEFRLkFiOFJONElDeDQwOWZXZXdHX1duN3l3ZkpKMUNfRnJ4MHNkX2tNUjZERld2Y2s5LUVRLCBBUS5BYjhSTjZKRjJNSEFZZDVuSmE3QjQtd0VycnkyZDQycXkwOXZudFN5VlVQSFdYT2pGUQ=="),
  openrouter: safeDecode("c2stb3ItdjEtOWRhNjBjMjI4MmQ1NDA2NTk5ZDZjYWU0MmM3OWVlNDBlMTdlOGFhOTIyMTI2ZWFiM2M4Y2I1MDMyMDYxYzlhNCwgc2stb3ItdjEtYTJjMTE1OGZjYWRmZTlhNjE2NjVhYWVlYzlkODE4NzYxZmEzNDFlZDg0ZTI3MTE2ZmJkNmYwZWNhODg5MTBmMCwgc2stb3ItdjEtY2FiMTQ1MTAxOWIyZjZiYTY3MGRjODk4YmIxZjJkMjFkYjNkNjZiMzNmZDgzNjk1OTMyNWFjNWZjZjdjZGYzLCBzay1vci12MS1jZTRiNDliNmZlOWYwMjE1OTVjZjgyMGI1YTk0ZWU0ZTdkMmI0NDM1OTU0YTVlMjBiNGU5Njc2Nzc0ZWEsIHNrLW9yLXYxLTdiZTg4YzRhODc1MGZjOWQ0NDkxZTQyOTlhODY0MmNiMmEzMzYxNjIzOTJhYjc3ZjM4NTljMDMzOTA2YTYwMTc="),
  opencode: safeDecode("c2stanN3U2xuTDc4Y1g3VTExaHBZbndBZXhRd3F0RnB3SjcxeU5ZMmpJRlpOSWVOZDJGQUl6QUdEVXBibUNIbVREQ=="),
  poolside: safeDecode("c2t5X2N0bll1TEw4Lms2dUlKT1ZCcXpaNHNWb0pxcWJaUktzdDZLbDA0MFBi"),
  nvidia: safeDecode("bnZhcGktdjA2eWlVYWRYbEJzRFRJYXFSNmxsdEJacXdDWF9MeEpHeFJoeXF0Rk92TTdTMlhkMXBYWEdpb2p3eFB0Mm93RiwgbnZhcGktbXU2ZlVIWVFHQ1BwMF9KRTB0ME5uQWVsUTBBTG1oaDQtU1ZvWk1fMkFHY1lsNlBHTDI1VFo5MnZOSDJUdWdISA=="),
  groq: safeDecode("Z3NrX1g3TGhCZ0Vib3ByMjFIZG5rYXgzV0dkeWIzRllSN3pyMjBSY2NFNDU1S2s4WGI2ZUw3bUMsIGdza181Y0k2Ujc2d1hndVNrN1lUekVzR1dHZHliM0ZZZjdyS3ZTdFFYTENKYlVabTJWb2x4V1Fy"),
  mistral: safeDecode("OFc2YVNDWGI2UVBmdmpyTFhLNUtHUnVqS0pZQVo0WWM="),
  cerebras: safeDecode("Y3NrLWU0M2UyZmt3Zm1taDRyZjM4dDV0bTUzZmM2eTR5ZXQ4dm53a3hmOTJmeXZocmR5cg=="),
  sambanova: safeDecode("YzcyZDI0ZGUtZDQ0ZC00NWJiLWEzODktMmUxMzMwYmUyN2Iw"),
  nararouter: safeDecode("c2stbnJ5LUcxcXUtbThYQzRJWXpBWEZYa0Q1QnVkbERRcWdqNnBvNUkyUjkxLUFWMA=="),
  huggingface: safeDecode("aGZfRnB6em1WbE5nQ09EQ3ZDcmR1bXZjZm1Ua2RhZkJBV0pTZSwgaGZfU2NXcHFzbVlIaEJJUmVNQnpYWVZjcm1Mcm5wd1ZNT0pnYQ=="),
  pollinations: safeDecode("c2tfU1hTb1M4R0Fza3B3VTBTQ29XU003QXFtSndDY1FVWVg="),
  ollama: safeDecode("YmRiOGYxZWY2ODE5NDg1N2IwNzUxMWYzMjhmYWJjNzQudlJjWjRoTGU4M0RMU2Ixa3lFY3N4aGUsIDY2NjFiYzliN2U2YTQwMDVhNjZiOWZhZmM3OTVlYTU0LnB6SjlJR1hFUk5Pdlh5bHlITU5valp1cCwgNDc3MTk3NjQwODIyNDkxMDliM2YxMWZkNDMyNjM1YjYuNHNRZTVyLVUtTHI1SkpNd2NSdWxCdlM="),
  local_endpoint: ''
};

const sanitizeSystemPrompt = (prompt?: string): string | undefined => {
  if (!prompt || typeof prompt !== 'string') return undefined;
  const lines = prompt.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('3) KROKI DIAGRAM ENGINE') || trimmed.startsWith('3) DIAGRAM & GRAPH CAPABILITIES') || trimmed.startsWith('2. KROKI DIAGRAM ENGINE')) return false;
    if (trimmed.includes('```kroki-') || trimmed.includes('```functionplot') || trimmed.includes('```mermaid')) return false;
    if (/kroki diagram|mermaid diagram|kroki-mermaid|kroki-plantuml/i.test(trimmed)) return false;
    return true;
  });
  const res = filtered.join('\n').trim();
  return res || undefined;
};

const mergeSessions = (local: ChatSession[], cloud: ChatSession[]): ChatSession[] => {
  const map = new Map<string, ChatSession>();
  for (const s of local) {
    if (s.id) map.set(s.id, s);
  }
  for (const s of cloud) {
    if (!s.id) continue;
    const existing = map.get(s.id);
    if (!existing || ((s.updatedAt || 0) > (existing.updatedAt || 0))) {
      map.set(s.id, s);
    } else if (existing && (s.updatedAt || 0) === (existing.updatedAt || 0)) {
      if ((s.messages?.length || 0) > (existing.messages?.length || 0)) {
        map.set(s.id, s);
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

export const App: React.FC = () => {
  const [isCloudSessionsLoaded, setIsCloudSessionsLoaded] = useState<boolean>(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_sessions_${activeUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to parse sessions from localStorage', e);
        }
      }
    }
    return [
      {
        id: `session-${Date.now()}`,
        title: 'New Chat Session',
        provider: 'OpenRouter',
        model: 'openrouter/free',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activeSessionIdState, setActiveSessionIdState] = useState<string>(() => {
    return sessions[0]?.id || 'default-session-1';
  });

  // 🎭 Isolated Persona Sessions State (Zero Bleed into Main Chat History)
  const [personaSessions, setPersonaSessions] = useState<ChatSession[]>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_persona_sessions_${activeUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to parse persona sessions', e);
        }
      }
    }
    return [
      {
        id: `persona-session-${Date.now()}`,
        title: 'Fun Persona Chat',
        provider: 'OpenRouter',
        model: 'openrouter/free',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activePersonaSessionIdState, setActivePersonaSessionIdState] = useState<string>(() => {
    return personaSessions[0]?.id || 'default-persona-session-1';
  });

  const activeSession = sessions.find(s => s.id === activeSessionIdState) || sessions[0];
  const activePersonaSession = personaSessions.find(s => s.id === activePersonaSessionIdState) || personaSessions[0];

  const [isDemoChatDrawerOpen, setIsDemoChatDrawerOpen] = useState<boolean>(false);
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState<boolean>(false);
  const [isCodeLabDrawerOpen, setIsCodeLabDrawerOpen] = useState<boolean>(false);
  const [isLectureDrawerOpen, setIsLectureDrawerOpen] = useState<boolean>(false);
  const [isDemoPdfPreviewOpen, setIsDemoPdfPreviewOpen] = useState<boolean>(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    return getSavedPins(activeUser);
  });

  const pinnedMessageIds = useMemo(() => new Set(pinnedItems.map(p => p.id)), [pinnedItems]);

  const handleTogglePin = (msg: Message) => {
    setPinnedItems(prev => {
      let updated: PinnedItem[];
      if (prev.some(p => p.id === msg.id)) {
        updated = prev.filter(p => p.id !== msg.id);
      } else {
        let currentWorkspace: 'chat' | 'code_lab' | 'persona' = 'chat';
        let currentSessionId = activeSession?.id || 'chat-session';
        let currentSessionTitle = activeSession?.title || 'Academic Discussion';

        if (activeHubWorkspace === 'code_lab') {
          currentWorkspace = 'code_lab';
          currentSessionId = activeCodeLabSession?.id || `codelab-${activeCodeLabPresetId}`;
          currentSessionTitle = activeCodeLabSession?.title || 'Code Lab Session';
        } else if (activeHubWorkspace === 'fun_personas') {
          currentWorkspace = 'persona';
          currentSessionId = activePersonaSessionIdState || 'persona-session';
          currentSessionTitle = activePersonaSession?.title || `${selectedPersona || 'Character'} Chat`;
        }

        const newItem: PinnedItem = {
          id: msg.id,
          sessionId: currentSessionId,
          sessionTitle: currentSessionTitle,
          workspace: currentWorkspace,
          content: msg.content,
          modelUsed: msg.modelUsed || selectedModel,
          createdAt: Date.now()
        };
        updated = [newItem, ...prev];
      }
      const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
      savePinsLocally(userKey, updated);
      syncCloudStudyTools(userKey, { pins: updated });
      return updated;
    });
  };

  const handleDeletePin = (id: string) => {
    setPinnedItems(prev => {
      const updated = prev.filter(p => p.id !== id);
      const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
      savePinsLocally(userKey, updated);
      syncCloudStudyTools(userKey, { pins: updated });
      return updated;
    });
  };

  const handleClearAllPins = () => {
    setPinnedItems([]);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    savePinsLocally(userKey, []);
    syncCloudStudyTools(userKey, { pins: [] });
  };

  const handleOpenFlashcards = async () => {
    const currentMsgs = activeSession ? activeSession.messages : [];
    const topic = activeSession?.title || 'Academic Concept Synthesis';
    // Instant open with high-yield deck
    const baseCards: Flashcard[] = [
      { id: 'fc-1', front: 'What is the core principle of the Likelihood Ratio Test $\\lambda(x)$?', back: 'Comparing maximum likelihood under null hypothesis $H_0$ vs full unrestricted parameter space:\n$$\\lambda(x) = \\frac{\\sup_{\\theta \\in \\Omega_0} L(\\theta)}{\\sup_{\\theta \\in \\Omega} L(\\theta)}$$', category: 'High Yield', mastered: false },
      { id: 'fc-2', front: 'State Wilks’ Theorem asymptotic distribution for $-2 \\log \\lambda(X)$', back: '$$-2 \\log \\lambda(X) \\xrightarrow{d} \\chi^2_\\nu$$\nwhere degrees of freedom $\\nu = \\dim(\\Omega) - \\dim(\\Omega_0)$.', category: 'Theorems', mastered: false },
      { id: 'fc-3', front: 'What are the regularity conditions for Wilks’ Theorem?', back: '1. Identifiability of parameter $\\theta$\n2. True parameter is an interior point of $\\Omega$\n3. Thrice differentiable log-likelihood $\\ell(\\theta)$\n4. Positive-definite Fisher Information matrix $I(\\theta)$.', category: 'Conditions', mastered: false }
    ];
    setFlashcards(baseCards);
    setIsFlashcardsOpen(true);

    const initialDeck: FlashcardDeck = {
      id: `fc-deck-${activeSession?.id || Date.now()}`,
      sourceType: 'session',
      sourceId: activeSession?.id || 'session',
      topic,
      categoryTag: activeSession?.tags?.[0] || 'High-Yield',
      createdAt: Date.now(),
      cards: baseCards
    };
    saveFlashcardDeck(currentUser, initialDeck);

    if (currentMsgs.length > 0) {
      generateStudyDeckFromChat(currentMsgs, selectedProvider, selectedModel, userKeys)
        .then(deck => {
          if (deck && deck.flashcards && deck.flashcards.length > 0) {
            setFlashcards(deck.flashcards);
            saveFlashcardDeck(currentUser, {
              ...initialDeck,
              cards: deck.flashcards
            });
          }
        })
        .catch(err => console.warn('Could not refresh custom flashcards deck:', err));
    }
  };

  const handleOpenQuiz = async () => {
    const currentMsgs = activeSession ? activeSession.messages : [];
    const topic = activeSession?.title || 'Academic Concept Assessment';
    // Instant open with high-yield exam quiz questions
    const baseQuestions: QuizQuestion[] = [
      {
        id: 'q-1',
        question: 'Under Wilks’ Theorem, what is the asymptotic distribution of the test statistic $-2 \\log \\lambda(X)$?',
        options: ['Standard Normal $\\mathcal{N}(0, 1)$', 'Student’s $t$-distribution', 'Chi-Square distribution $\\chi^2_\\nu$', '$F$-distribution'],
        correctIndex: 2,
        explanation: 'Under null hypothesis $H_0$ regularity conditions, $-2 \\log \\lambda(X)$ asymptotically follows a Chi-square distribution $\\chi^2_\\nu$ with degrees of freedom $\\nu = \\dim(\\Omega) - \\dim(\\Omega_0)$.'
      },
      {
        id: 'q-2',
        question: 'In Bayesian point estimation under Squared Error Loss, which optimal estimator is selected?',
        options: ['Posterior Mode', 'Posterior Median', 'Posterior Mean $\\mathbb{E}[\\theta | x]$', 'Posterior Variance $\\text{Var}(\\theta | x)$'],
        correctIndex: 2,
        explanation: 'Mathematically, the posterior mean $\\delta^*(x) = \\mathbb{E}[\\theta | X=x]$ uniquely minimizes the expected squared error risk $\\mathbb{E}[(\\theta - d)^2 | x]$.'
      },
      {
        id: 'q-3',
        question: 'What is the upper bound on the Likelihood Ratio Test statistic $\\lambda(x)$?',
        options: ['$0$', '$1$', '$\\infty$', 'Sample size $n$'],
        correctIndex: 1,
        explanation: 'Since the numerator maximizes over a restricted subset $\\Omega_0$ while the denominator maximizes over the entire space $\\Omega$, $\\lambda(x)$ is naturally bounded in $[0, 1]$.'
      }
    ];
    setQuizQuestions(baseQuestions);
    setIsQuizOpen(true);

    const initialQuizDeck: QuizDeck = {
      id: `quiz-deck-${activeSession?.id || Date.now()}`,
      sourceType: 'session',
      sourceId: activeSession?.id || 'session',
      topic,
      categoryTag: activeSession?.tags?.[0] || 'Exam Mock',
      createdAt: Date.now(),
      questions: baseQuestions
    };
    saveQuizDeck(currentUser, initialQuizDeck);

    if (currentMsgs.length > 0) {
      generateStudyDeckFromChat(currentMsgs, selectedProvider, selectedModel, userKeys)
        .then(deck => {
          if (deck && deck.quiz && deck.quiz.length > 0) {
            setQuizQuestions(deck.quiz);
            saveQuizDeck(currentUser, {
              ...initialQuizDeck,
              questions: deck.quiz
            });
          }
        })
        .catch(err => console.warn('Could not refresh custom quiz questions:', err));
    }
  };

  const handleGenerateMessageFlashcards = async (message: Message) => {
    const previewTopic = (activeSession?.title || 'Academic Concept') + ' • Targeted Question Drill';
    const initialCards: Flashcard[] = [
      {
        id: `fc-m-${Date.now()}-0`,
        front: 'What is the core takeaway or formula in this note?',
        back: message.content.slice(0, 300) + '...',
        category: 'Targeted Drill',
        mastered: false
      }
    ];
    setFlashcards(initialCards);
    setIsFlashcardsOpen(true);

    const newDeck: FlashcardDeck = {
      id: `fc-deck-msg-${message.id}`,
      sourceType: 'message',
      sourceId: message.id,
      topic: previewTopic,
      categoryTag: 'Drill',
      createdAt: Date.now(),
      cards: initialCards
    };
    saveFlashcardDeck(currentUser, newDeck);

    generateStudyDeckFromMessage(message, selectedProvider, selectedModel, userKeys)
      .then(res => {
        if (res && res.flashcards && res.flashcards.length > 0) {
          const finalDeck: FlashcardDeck = {
            ...newDeck,
            cards: res.flashcards
          };
          saveFlashcardDeck(currentUser, finalDeck);
          setFlashcards(res.flashcards);
        }
      })
      .catch(err => console.warn('Could not complete micro-drill flashcards:', err));
  };

  const handleGenerateMessageQuiz = async (message: Message) => {
    const previewTopic = (activeSession?.title || 'Academic Concept') + ' • Targeted MCQ Drill';
    const initialQuestions: QuizQuestion[] = [
      {
        id: `q-m-${Date.now()}-0`,
        question: 'Which key principle or formula is established in this note?',
        options: ['Theoretical Property', 'Operational Bound', 'Computational Derivation', 'Statistical Inference'],
        correctIndex: 0,
        explanation: message.content.slice(0, 200) + '...'
      }
    ];
    setQuizQuestions(initialQuestions);
    setIsQuizOpen(true);

    const newQuiz: QuizDeck = {
      id: `quiz-deck-msg-${message.id}`,
      sourceType: 'message',
      sourceId: message.id,
      topic: previewTopic,
      categoryTag: 'Drill',
      createdAt: Date.now(),
      questions: initialQuestions
    };
    saveQuizDeck(currentUser, newQuiz);

    generateStudyDeckFromMessage(message, selectedProvider, selectedModel, userKeys)
      .then(res => {
        if (res && res.quiz && res.quiz.length > 0) {
          const finalQuiz: QuizDeck = {
            ...newQuiz,
            questions: res.quiz
          };
          saveQuizDeck(currentUser, finalQuiz);
          setQuizQuestions(res.quiz);
        }
      })
      .catch(err => console.warn('Could not complete micro-drill quiz:', err));
  };

  const handleToggleSessionTag = (sessionId: string, tag: string) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const currentTags = s.tags || [];
          const nextTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
          return { ...s, tags: nextTags, updatedAt: Date.now() };
        }
        return s;
      });
      if (currentUser) {
        localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const [isPersistentWebSearch, setIsPersistentWebSearch] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_persistent_websearch') === 'true';
  });

  const handleTogglePersistentWebSearch = () => {
    setIsPersistentWebSearch(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_persistent_websearch', String(next));
      return next;
    });
  };

  const [isDiagramsEnabled, setIsDiagramsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_diagrams_enabled') === 'true';
  });

  const handleToggleDiagrams = () => {
    setIsDiagramsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_diagrams_enabled', String(next));
      return next;
    });
  };

  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_beginner_friendly') === 'true';
  });

  const handleToggleBeginnerFriendly = () => {
    setIsBeginnerFriendly(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_beginner_friendly', String(next));
      return next;
    });
  };

  const handleClearActiveSession = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleNativePrintPdf = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    printSessionToPdf(activeSession.messages, activeSession.title || 'Prof. Joe AI Chat Session');
  };

  const handleNewPersonaSession = () => {
    const newSession: ChatSession = {
      id: `persona-session-${Date.now()}`,
      title: 'New Persona Chat',
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newSession, ...personaSessions];
    setPersonaSessions(updated);
    setActivePersonaSessionIdState(newSession.id);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(updated));
    }
  };

  const handleDeletePersonaSession = (id: string) => {
    const filtered = personaSessions.filter(s => s.id !== id);
    const final = filtered.length > 0 ? filtered : [{
      id: `persona-session-${Date.now()}`,
      title: 'Fun Persona Chat',
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }];
    setPersonaSessions(final);
    setActivePersonaSessionIdState(final[0].id);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(final));
    }
  };

  // 🌿 Option C: Hierarchical Sub-Branch Tree Indexing (e.g. 🌿 #1 Title -> 🌿 #1.1 Title -> 🌿 #1.2 Title)
  const generateBranchTitle = (activeTitle: string, allSessions: ChatSession[]): string => {
    const currentTitle = (activeTitle || 'Chat Session').trim();
    
    // Check if current title is already an indexed branch: e.g. "🌿 #1 Calculus" or "🌿 #1.2 Calculus" or legacy "🌿 Calculus (Branch)"
    const branchMatch = currentTitle.match(/^🌿\s*(?:#([0-9.]+)\s+)?(.*?)(?:\s*\(Branch(?:\s*\d+)?\))?$/i);
    
    let baseTitle = currentTitle;
    let currentBranchNum = '';
    
    if (branchMatch) {
      currentBranchNum = branchMatch[1] || '';
      baseTitle = (branchMatch[2] || currentTitle).trim();
    }
    
    if (!baseTitle) baseTitle = 'Chat Session';

    if (!currentBranchNum) {
      // Branching from Root Session -> Create top-level branch index "#1", "#2", etc.
      const topLevelNums: number[] = [];
      allSessions.forEach(s => {
        if (!s.title) return;
        const m = s.title.match(/^🌿\s*#(\d+)(?:\.|\s|$)/);
        if (m && s.title.toLowerCase().includes(baseTitle.toLowerCase())) {
          topLevelNums.push(parseInt(m[1], 10));
        }
      });
      const nextNum = topLevelNums.length > 0 ? Math.max(...topLevelNums) + 1 : 1;
      return `🌿 #${nextNum} ${baseTitle}`;
    } else {
      // Branching from an existing Branch (e.g. "#1" or "#1.2") -> Create sub-branch "#1.1" or "#1.2.1"
      const prefixPattern = new RegExp(`^🌿\\s*#${currentBranchNum.replace(/\./g, '\\.')}\\.(\\d+)(?:\\.|\\s|$)`, 'i');
      const subNums: number[] = [];
      allSessions.forEach(s => {
        if (!s.title) return;
        const m = s.title.match(prefixPattern);
        if (m && s.title.toLowerCase().includes(baseTitle.toLowerCase())) {
          subNums.push(parseInt(m[1], 10));
        }
      });
      const nextSub = subNums.length > 0 ? Math.max(...subNums) + 1 : 1;
      return `🌿 #${currentBranchNum}.${nextSub} ${baseTitle}`;
    }
  };

  // 🌿 Main Chat Branching: Fork exact conversation history up to selected turn
  const handleBranchSession = (targetMsg: Message) => {
    if (!activeSession || !activeSession.messages.length) return;
    const targetIdx = activeSession.messages.findIndex(m => m.id === targetMsg.id);
    if (targetIdx === -1) return;

    const rawSliced = activeSession.messages.slice(0, targetIdx + 1);
    const slicedMessages: Message[] = JSON.parse(JSON.stringify(rawSliced));
    const newTitle = generateBranchTitle(activeSession.title || 'Chat Session', sessions);
    const newBranchId = `session-branch-${Date.now()}`;

    const newBranchSession: ChatSession = {
      id: newBranchId,
      title: newTitle,
      provider: activeSession.provider || selectedProvider,
      model: activeSession.model || selectedModel,
      messages: slicedMessages,
      systemPrompt: activeSession.systemPrompt || persistentMainSystemPrompt?.prompt,
      systemPromptTitle: activeSession.systemPromptTitle || persistentMainSystemPrompt?.title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newBranchSession, ...sessions];
    setSessions(updated);
    setActiveSessionIdState(newBranchId);
    if (currentUser) {
      localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(updated));
      fetch(getApiUrl('/api/sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions: updated })
      }).catch(err => console.warn('Could not sync branch to cloud immediately:', err));
    }
  };

  // 🌿 Persona Chat Branching: Fork exact persona conversation history up to selected turn
  const handleBranchPersonaSession = (targetMsg: Message) => {
    if (!activePersonaSession || !activePersonaSession.messages.length) return;
    const targetIdx = activePersonaSession.messages.findIndex(m => m.id === targetMsg.id);
    if (targetIdx === -1) return;

    const rawSliced = activePersonaSession.messages.slice(0, targetIdx + 1);
    const slicedMessages: Message[] = JSON.parse(JSON.stringify(rawSliced));
    const newTitle = generateBranchTitle(activePersonaSession.title || 'Persona Chat', personaSessions);
    const newBranchId = `persona-branch-${Date.now()}`;

    const newBranchSession: ChatSession = {
      id: newBranchId,
      title: newTitle,
      provider: activePersonaSession.provider || selectedProvider,
      model: activePersonaSession.model || selectedModel,
      messages: slicedMessages,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newBranchSession, ...personaSessions];
    setPersonaSessions(updated);
    setActivePersonaSessionIdState(newBranchId);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(updated));
      fetch(getApiUrl('/api/persona-sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions: updated })
      }).catch(err => console.warn('Could not sync persona branch to cloud immediately:', err));
    }
  };

  // 🌿 Code Lab Branching: Fork exact code lab preset conversation history up to selected turn
  const handleBranchCodeLabSession = (targetMsg: Message) => {
    if (!activeCodeLabSession || !activeCodeLabSession.messages.length) return;
    const targetIdx = activeCodeLabSession.messages.findIndex(m => m.id === targetMsg.id);
    if (targetIdx === -1) return;

    const rawSliced = activeCodeLabSession.messages.slice(0, targetIdx + 1);
    const slicedMessages: Message[] = JSON.parse(JSON.stringify(rawSliced));
    const currentList = codeLabPresetSessions[activeCodeLabPresetId] || [];
    const newTitle = generateBranchTitle(activeCodeLabSession.title || 'Code Lab Session', currentList);
    const newBranchId = `codelab-branch-${activeCodeLabPresetId}-${Date.now()}`;

    const newBranchSession: ChatSession = {
      id: newBranchId,
      title: newTitle,
      provider: activeCodeLabSession.provider || selectedProvider,
      model: activeCodeLabSession.model || selectedModel,
      messages: slicedMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      presetId: activeCodeLabPresetId
    };

    setCodeLabPresetSessions(prev => {
      const list = prev[activeCodeLabPresetId] || [];
      const updatedList = [newBranchSession, ...list];
      const next = { ...prev, [activeCodeLabPresetId]: updatedList };
      syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, newBranchSession, next);
      return next;
    });

    setActiveCodeLabSessionIds(prev => ({ ...prev, [activeCodeLabPresetId]: newBranchId }));
  };

  // Perform hard legacy key cache wipe on app startup
  // Android: Push WebView below the native status bar so header buttons are accessible
  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0b0f19' }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    }).catch(() => {});
  }, []);

  const IS_ADMIN_BUILD = import.meta.env.MODE === 'admin' || import.meta.env.VITE_ENABLE_ADMIN_KEYS === 'true';

  const [userKeys, setUserKeys] = useState<UserKeys>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'Guest_Student';
    const isAuthorizedAdmin = (activeUser === 'Admin@uday' || activeUser === 'Uday@joe') && IS_ADMIN_BUILD;
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;

    const savedKeys = localStorage.getItem(`chatterbot_user_keys_${activeUser}`)
      || localStorage.getItem('chatterbot_user_keys')
      || localStorage.getItem('prof_joe_user_keys');

    if (savedKeys) {
      try {
        return { ...baseFallback, ...JSON.parse(savedKeys) };
      } catch (e) {
        console.error('Failed to parse userKeys', e);
      }
    }
    return baseFallback;
  });

  const [customModels, setCustomModels] = useState<UserCustomModels>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const savedModels = localStorage.getItem(`chatterbot_user_models_${activeUser}`) || localStorage.getItem('chatterbot_user_models_global');
    if (savedModels) {
      try {
        return JSON.parse(savedModels);
      } catch (e) {
        console.error('Failed to parse custom models', e);
      }
    }
    return {};
  });

  const handleSaveCustomModels = (newCustomModels: UserCustomModels) => {
    setCustomModels(newCustomModels);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_user_models_${userKey}`, JSON.stringify(newCustomModels));
    localStorage.setItem('chatterbot_user_models_global', JSON.stringify(newCustomModels));
  };

  const DEFAULT_FREE_PROVIDER = 'OpenRouter';
  const DEFAULT_FREE_MODEL = 'openrouter/free';

  const [activeView, setActiveViewState] = useState<ActiveViewType>(() => {
    const saved = localStorage.getItem('chatterbot_active_view');
    return (saved && ['chat', 'exam_prep', 'system_prompts', 'prompts', 'diagram_studio', 'cubes', 'fun_personas', 'text_extractor', 'code_lab'].includes(saved))
      ? (saved as ActiveViewType)
      : 'chat';
  });

  const setActiveView = (view: ActiveViewType) => {
    setActiveViewState(view);
    localStorage.setItem('chatterbot_active_view', view);
  };

  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('chatterbot_username') || '');
  const [userRole, setUserRole] = useState<string>(() => localStorage.getItem('chatterbot_role') || 'student');
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('chatterbot_token') || '');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(() => !localStorage.getItem('chatterbot_token'));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
      if (codeStyleSaved) {
        const parsed = JSON.parse(codeStyleSaved);
        if (parsed.atmosphere) {
          if (parsed.atmosphere === 'oxford_daylight' || parsed.atmosphere === 'amber_parchment') {
            return 'light';
          }
        }
      }
      const savedAtmo = localStorage.getItem('chatterbot_atmosphere') || '';
      if (savedAtmo === 'oxford_daylight' || savedAtmo === 'amber_parchment') return 'light';
      const savedTheme = localStorage.getItem('chatterbot_theme') || localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch {}
    return 'dark';
  });

  // 📌 Main Chat Persistent System Prompt (Persists across New Chat and Branching until explicitly disabled)
  const [persistentMainSystemPrompt, setPersistentMainSystemPrompt] = useState<{ title: string; prompt: string } | null>(() => {
    try {
      const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
      const saved = localStorage.getItem(`chatterbot_main_system_prompt_${activeUser}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const activeUser = currentUser || 'guest';
      const saved = localStorage.getItem(`chatterbot_main_system_prompt_${activeUser}`);
      setPersistentMainSystemPrompt(saved ? JSON.parse(saved) : null);
    } catch {
      setPersistentMainSystemPrompt(null);
    }
  }, [currentUser]);

  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_provider_${activeUser}`) || localStorage.getItem('chatterbot_provider_global');
    if (saved) return saved;
    return DEFAULT_FREE_PROVIDER;
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_model_${activeUser}`) || localStorage.getItem('chatterbot_model_global');
    if (saved) return saved;
    return DEFAULT_FREE_MODEL;
  });

  // Dedicated Preset-Segregated Multi-Sessions for Practical Code Lab Workspace
  const [activeCodeLabPresetId, setActiveCodeLabPresetId] = useState<string>('stat_inference_lab');
  const [activeCodeLabSessionIds, setActiveCodeLabSessionIds] = useState<Record<string, string>>({});
  
  const [codeLabPresetSessions, setCodeLabPresetSessions] = useState<Record<string, ChatSession[]>>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_codelab_preset_sessions_v2_${activeUser}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local codeLabPresetSessions', e);
      }
    }
    return {};
  });

  // Cloud Hydration from MongoDB & 14-day LRU Cache Pruning on mount
  useEffect(() => {
    pruneOldRenderCache(14);
    const activeUser = localStorage.getItem('chatterbot_username');
    const token = localStorage.getItem('chatterbot_token') || undefined;
    if (activeUser) {
      fetchCloudCodeLabPresetSessions(activeUser, token).then(cloudPresetSessions => {
        if (cloudPresetSessions && Object.keys(cloudPresetSessions).length > 0) {
          setCodeLabPresetSessions(prev => ({
            ...cloudPresetSessions,
            ...prev
          }));
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(
      `chatterbot_codelab_preset_sessions_v2_${currentUser || 'guest'}`, 
      JSON.stringify(codeLabPresetSessions)
    );
  }, [codeLabPresetSessions, currentUser]);

  // Derive active session for current preset
  const presetSessionsList = codeLabPresetSessions[activeCodeLabPresetId] || [];
  const currentActiveSessionId = activeCodeLabSessionIds[activeCodeLabPresetId] || (presetSessionsList[0]?.id || '');

  const activeCodeLabSession = presetSessionsList.find(s => s.id === currentActiveSessionId) || presetSessionsList[0] || {
    id: `codelab-session-${activeCodeLabPresetId}-${Date.now()}`,
    title: `Code Lab Session`,
    provider: selectedProvider,
    model: selectedModel,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    presetId: activeCodeLabPresetId
  };

  const handleSelectCodeLabPresetId = (newPresetId: string) => {
    setActiveCodeLabPresetId(newPresetId);
    const existingList = codeLabPresetSessions[newPresetId] || [];
    if (existingList.length === 0) {
      const initialSession: ChatSession = {
        id: `codelab-session-${newPresetId}-${Date.now()}`,
        title: `${ACADEMIC_PRESETS.find(p => p.id === newPresetId)?.name || 'Code Lab'} Session`,
        provider: selectedProvider,
        model: selectedModel,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        presetId: newPresetId
      };
      setCodeLabPresetSessions(prev => {
        const next = { ...prev, [newPresetId]: [initialSession] };
        syncCodeLabPresetSessions(currentUser || 'guest', newPresetId, initialSession, next);
        return next;
      });
      setActiveCodeLabSessionIds(prev => ({ ...prev, [newPresetId]: initialSession.id }));
    } else if (!activeCodeLabSessionIds[newPresetId]) {
      setActiveCodeLabSessionIds(prev => ({ ...prev, [newPresetId]: existingList[0].id }));
    }
  };

  const handleNewCodeLabSession = (presetId: string) => {
    const newSession: ChatSession = {
      id: `codelab-session-${presetId}-${Date.now()}`,
      title: `${ACADEMIC_PRESETS.find(p => p.id === presetId)?.name || 'Code Lab'} Session`,
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      presetId: presetId
    };

    setCodeLabPresetSessions(prev => {
      const list = prev[presetId] || [];
      const updatedList = [newSession, ...list];
      const next = { ...prev, [presetId]: updatedList };
      syncCodeLabPresetSessions(currentUser || 'guest', presetId, newSession, next);
      return next;
    });

    setActiveCodeLabSessionIds(prev => ({ ...prev, [presetId]: newSession.id }));
  };

  const handleDeleteCodeLabSession = (presetId: string, sessionId: string) => {
    setCodeLabPresetSessions(prev => {
      const list = prev[presetId] || [];
      const updatedList = list.filter(s => s.id !== sessionId);
      const next = { ...prev, [presetId]: updatedList };
      if (updatedList.length > 0) {
        syncCodeLabPresetSessions(currentUser || 'guest', presetId, updatedList[0], next);
      }
      return next;
    });

    setActiveCodeLabSessionIds(prev => {
      const list = codeLabPresetSessions[presetId] || [];
      const remaining = list.filter(s => s.id !== sessionId);
      return { ...prev, [presetId]: remaining[0]?.id || '' };
    });
  };

  const handleResetCodeLabPresetSession = (presetId: string) => {
    handleNewCodeLabSession(presetId);
  };

  const [selectedPersona, setSelectedPersona] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_persona_${activeUser}`);
      if (saved) return saved;
    }
    return 'default';
  });

  const [promptMode, setPromptModeState] = useState<any>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_prompt_mode_${activeUser}`);
      if (saved && ['auto', '12marks', '2marks', '1marks', 'general'].includes(saved)) {
        return saved;
      }
    }
    return 'auto';
  });

  const handlePromptModeChange = (newMode: string) => {
    setPromptModeState(newMode);
    if (currentUser) {
      localStorage.setItem(`chatterbot_prompt_mode_${currentUser}`, newMode);
    }
  };

  const [isPersonaEnabled, setIsPersonaEnabled] = useState<boolean>(true);

  const handleTogglePersonaEnabled = () => {
    setIsPersonaEnabled(prev => !prev);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [activeHubWorkspace, setActiveHubWorkspaceState] = useState<'landing' | ActiveViewType>(() => {
    const saved = localStorage.getItem('chatterbot_active_hub_workspace');
    return (saved && ['landing', 'chat', 'prompts', 'examprep', 'system_prompts', 'diagrams', 'test_diagrams', 'deep_learning_studio', 'cubes', 'fun_personas', 'extractor_studio', 'code_lab', 'lecture_notes', 'settings', 'dsa_lab', 'flashcards_studio', 'quiz_arena', 'pinned_archive', 'sandbox'].includes(saved))
      ? (saved as 'landing' | ActiveViewType)
      : 'landing';
  });

  const setActiveHubWorkspace = (ws: 'landing' | ActiveViewType) => {
    setActiveHubWorkspaceState(ws);
    localStorage.setItem('chatterbot_active_hub_workspace', ws);
  };

  const [prefilledChatPrompt, setPrefilledChatPrompt] = useState<string>('');

  // Android Native Hardware Back Button Listener (Navigates back to Landing Hub instead of closing app)
  useEffect(() => {
    let sub: any = null;
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', () => {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (activeHubWorkspace !== 'landing') {
          setActiveHubWorkspace('landing');
          return;
        }
        CapApp.minimizeApp();
      }).then(l => { sub = l; });
    }).catch(() => {});

    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, [activeHubWorkspace, isSettingsOpen]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_provider_${userKey}`, provider);
    localStorage.setItem('chatterbot_provider_global', provider);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, provider, updatedAt: Date.now() } : s
      )
    );
    if (activeHubWorkspace === 'fun_personas' && activePersonaSession) {
      setPersonaSessions(prev =>
        prev.map(s => s.id === activePersonaSession.id ? { ...s, provider, updatedAt: Date.now() } : s)
      );
    }
    if (activeHubWorkspace === 'code_lab' && activeCodeLabSession) {
      setCodeLabPresetSessions(prev => {
        const list = prev[activeCodeLabPresetId] || [];
        const updatedList = list.map(s => s.id === activeCodeLabSession.id ? { ...s, provider, updatedAt: Date.now() } : s);
        return { ...prev, [activeCodeLabPresetId]: updatedList };
      });
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_model_${userKey}`, model);
    localStorage.setItem('chatterbot_model_global', model);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, model, updatedAt: Date.now() } : s
      )
    );
    if (activeHubWorkspace === 'fun_personas' && activePersonaSession) {
      setPersonaSessions(prev =>
        prev.map(s => s.id === activePersonaSession.id ? { ...s, model, updatedAt: Date.now() } : s)
      );
    }
    if (activeHubWorkspace === 'code_lab' && activeCodeLabSession) {
      setCodeLabPresetSessions(prev => {
        const list = prev[activeCodeLabPresetId] || [];
        const updatedList = list.map(s => s.id === activeCodeLabSession.id ? { ...s, model, updatedAt: Date.now() } : s);
        return { ...prev, [activeCodeLabPresetId]: updatedList };
      });
    }
  };

  const handleSelectActiveModel = (providerId: string, modelId: string) => {
    handleProviderChange(providerId);
    handleModelChange(modelId);
  };

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_${currentUser}`, persona);
    }
  };

  const createFreshDefaultSession = (): ChatSession => ({
    id: `session-${Date.now()}`,
    title: 'New Chat Session',
    provider: selectedProvider,
    model: selectedModel,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const handleLoginSuccess = async (username: string, token: string, role: string) => {
    setIsCloudSessionsLoaded(false);
    setCurrentUser(username);
    setUserRole(role);
    setAuthToken(token);
    localStorage.setItem('chatterbot_username', username);
    localStorage.setItem('chatterbot_token', token);
    localStorage.setItem('chatterbot_role', role);
    setIsLoginOpen(false);

    // Dynamic API Key Loading: Gated strictly for Admin@uday & Uday@joe
    const isAuthorizedAdmin = username === 'Admin@uday' || username === 'Uday@joe';
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;
    const savedKeysStr = localStorage.getItem(`chatterbot_user_keys_${username}`);
    let loadedKeys = baseFallback;
    if (savedKeysStr) {
      try {
        loadedKeys = { ...baseFallback, ...JSON.parse(savedKeysStr) };
      } catch (e) {
        console.error('Failed to parse saved user keys on login', e);
      }
    }

    // Fetch user-isolated cloud API keys immediately on login for multi-device sync
    try {
      const keysRes = await fetch(getApiUrl(`/api/user-keys?username=${encodeURIComponent(username)}`));
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        if (keysData.success && keysData.keys && Object.keys(keysData.keys).length > 0) {
          loadedKeys = { ...loadedKeys, ...keysData.keys };
          localStorage.setItem(`chatterbot_user_keys_${username}`, JSON.stringify(loadedKeys));
        }
      }
    } catch (kErr) {
      console.warn('Could not fetch cloud user keys on login:', kErr);
    }
    setUserKeys(loadedKeys);

    // Restore user-specific provider & model preference or default to Keyless Free AI
    const savedProv = localStorage.getItem(`chatterbot_provider_${username}`) || DEFAULT_FREE_PROVIDER;
    const savedMod = localStorage.getItem(`chatterbot_model_${username}`) || DEFAULT_FREE_MODEL;
    setSelectedProvider(savedProv);
    setSelectedModel(savedMod);

    // Restore saved local sessions for this user first
    let localSaved: ChatSession[] = [];
    const savedLocalStr = localStorage.getItem(`chatterbot_sessions_${username}`);
    if (savedLocalStr) {
      try {
        const parsed = JSON.parse(savedLocalStr);
        if (Array.isArray(parsed) && parsed.length > 0) localSaved = parsed;
      } catch (e) {
        console.error('Failed to parse saved local sessions on login', e);
      }
    }

    // Restore saved local persona sessions for this user
    let localPersonaSaved: ChatSession[] = [];
    const savedPersonaLocalStr = localStorage.getItem(`chatterbot_persona_sessions_${username}`);
    if (savedPersonaLocalStr) {
      try {
        const parsed = JSON.parse(savedPersonaLocalStr);
        if (Array.isArray(parsed) && parsed.length > 0) localPersonaSaved = parsed;
      } catch (e) {
        console.error('Failed to parse saved local persona sessions on login', e);
      }
    }

    // Fetch user-isolated cloud sessions immediately on login
    try {
      const response = await fetch(getApiUrl(`/api/sessions?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`));
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const merged = localSaved.length > 0 ? mergeSessions(localSaved, data.sessions) : data.sessions;
          setSessions(merged);
          localStorage.setItem(`chatterbot_sessions_${username}`, JSON.stringify(merged));
          setActiveSessionIdState(merged[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud sessions on login:', err);
    }

    // Fetch user-isolated cloud persona sessions immediately on login
    try {
      const personaRes = await fetch(getApiUrl(`/api/persona-sessions?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`));
      if (personaRes.ok) {
        const pData = await personaRes.json();
        if (pData.success && Array.isArray(pData.sessions) && pData.sessions.length > 0) {
          const mergedPersona = localPersonaSaved.length > 0 ? mergeSessions(localPersonaSaved, pData.sessions) : pData.sessions;
          setPersonaSessions(mergedPersona);
          localStorage.setItem(`chatterbot_persona_sessions_${username}`, JSON.stringify(mergedPersona));
          setActivePersonaSessionIdState(mergedPersona[0].id);
        }
      }
    } catch (pErr) {
      console.warn('Could not fetch cloud persona sessions on login:', pErr);
    }

    // Fallback: If cloud returned 0 sessions, use localSaved if available, otherwise fresh default
    if (localSaved.length > 0) {
      setSessions(localSaved);
      localStorage.setItem(`chatterbot_sessions_${username}`, JSON.stringify(localSaved));
      setActiveSessionIdState(localSaved[0].id);
    }
    setIsCloudSessionsLoaded(true);
  };

  const handleLogout = () => {
    setIsCloudSessionsLoaded(false);
    // Keep chatterbot_sessions_${currentUser} intact in localStorage so offline history is NEVER lost!
    setCurrentUser('');
    setAuthToken('');
    setUserKeys(DEFAULT_KEYS);
    localStorage.removeItem('chatterbot_username');
    localStorage.removeItem('chatterbot_token');
    localStorage.removeItem('chatterbot_role');
    const fresh = [createFreshDefaultSession()];
    setSessions(fresh);
    setActiveSessionIdState(fresh[0].id);
    setIsLoginOpen(true);
  };

  // Save sessions to localStorage & Cloud Storage ONLY AFTER cloud history has finished loading!
  useEffect(() => {
    if (!currentUser || !isCloudSessionsLoaded) return;

    localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(sessions));

    if (sessions && sessions.length > 0) {
      fetch(getApiUrl('/api/sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions })
      }).catch(err => console.warn('Could not sync sessions to cloud:', err));
    }
  }, [sessions, currentUser, isCloudSessionsLoaded]);

  // Save Persona sessions to localStorage & Cloud Storage (MongoDB)
  useEffect(() => {
    if (!currentUser || !isCloudSessionsLoaded) return;

    localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(personaSessions));

    if (personaSessions && personaSessions.length > 0) {
      fetch(getApiUrl('/api/persona-sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions: personaSessions })
      }).catch(err => console.warn('Could not sync persona sessions to cloud:', err));
    }
  }, [personaSessions, currentUser, isCloudSessionsLoaded]);

  // 🔄 Hybrid Real-Time Cloud Sync Handler (Multi-Device Live Sync)
  const handleSyncSessions = useCallback(async () => {
    if (!currentUser) return;
    try {
      const queryToken = authToken ? `&token=${encodeURIComponent(authToken)}` : '';
      const response = await fetch(getApiUrl(`/api/sessions?username=${encodeURIComponent(currentUser)}${queryToken}`));
      
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.displaced) {
          alert('⚠️ Logged out: Your account was logged in on another device.');
          handleLogout();
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (data.displaced) {
          alert('⚠️ Logged out: Your account was logged in on another device.');
          handleLogout();
          return;
        }
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          setSessions(prev => mergeSessions(prev, data.sessions));
          localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(data.sessions));
          if (data.sessions[0]?.id) {
            setActiveSessionIdState(prev => prev || data.sessions[0].id);
          }
        }
      }

      // Also fetch cloud persona sessions
      const personaRes = await fetch(getApiUrl(`/api/persona-sessions?username=${encodeURIComponent(currentUser)}${queryToken}`));
      if (personaRes.ok) {
        const pData = await personaRes.json();
        if (pData.success && Array.isArray(pData.sessions) && pData.sessions.length > 0) {
          setPersonaSessions(prev => mergeSessions(prev, pData.sessions));
          localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(pData.sessions));
          if (pData.sessions[0]?.id) {
            setActivePersonaSessionIdState(prev => prev || pData.sessions[0].id);
          }
        }
      }

      // Also fetch cloud study tools (pins, flashcards, quizzes)
      const studyData = await fetchCloudStudyTools(currentUser, authToken);
      if (studyData) {
        if (Array.isArray(studyData.pins)) {
          setPinnedItems(prev => {
            const map = new Map<string, PinnedItem>();
            studyData.pins!.forEach(p => { if (p && p.id) map.set(p.id, p); });
            prev.forEach(p => { if (p && p.id) map.set(p.id, p); });
            const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            savePinsLocally(currentUser, merged);
            return merged;
          });
        }
        if (Array.isArray(studyData.flashcardDecks) && studyData.flashcardDecks.length > 0) {
          const local = getSavedFlashcardDecks(currentUser);
          const map = new Map<string, FlashcardDeck>();
          studyData.flashcardDecks.forEach(d => { if (d && d.id) map.set(d.id, d); });
          local.forEach(d => { if (d && d.id) map.set(d.id, d); });
          const merged = Array.from(map.values());
          localStorage.setItem(`chatterbot_flashcard_decks_${currentUser}`, JSON.stringify(merged));
        }
        if (Array.isArray(studyData.quizDecks) && studyData.quizDecks.length > 0) {
          const local = getSavedQuizDecks(currentUser);
          const map = new Map<string, QuizDeck>();
          studyData.quizDecks.forEach(d => { if (d && d.id) map.set(d.id, d); });
          local.forEach(d => { if (d && d.id) map.set(d.id, d); });
          const merged = Array.from(map.values());
          localStorage.setItem(`chatterbot_quiz_decks_${currentUser}`, JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn('Could not sync sessions from cloud storage:', err);
    } finally {
      setIsCloudSessionsLoaded(true);
    }
  }, [currentUser, authToken]);

  // Fetch Cloud Sessions when currentUser logs in or opens app & setup Real-Time Multi-Device Sync
  useEffect(() => {
    if (!currentUser) return;

    // Initial mount sync
    handleSyncSessions();

    // 1. Desktop & Web: Focus & Visibility Change Listener
    const handleFocusCheck = () => {
      if (document.visibilityState === 'visible') {
        handleSyncSessions();
      }
    };
    window.addEventListener('visibilitychange', handleFocusCheck);
    window.addEventListener('focus', handleFocusCheck);

    // 2. Android Capacitor: Native App Resume Listener (Runs immediately when phone is unlocked/resumed)
    let capAppSub: any = null;
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          handleSyncSessions();
        }
      }).then(sub => { capAppSub = sub; });
    }).catch(() => {});

    // 3. Screen-On 15-Second Heartbeat (Only active while user is viewing the screen)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSyncSessions();
      }
    }, 15000);

    return () => {
      window.removeEventListener('visibilitychange', handleFocusCheck);
      window.removeEventListener('focus', handleFocusCheck);
      clearInterval(intervalId);
      if (capAppSub && capAppSub.remove) {
        capAppSub.remove();
      }
    };
  }, [currentUser, authToken, handleSyncSessions]);

  // Fetch & Load Account API Keys safely when currentUser logs in or opens app
  useEffect(() => {
    if (!currentUser) {
      setUserKeys(DEFAULT_KEYS);
      return;
    }

    const isAuthorizedAdmin = currentUser === 'Admin@uday' || currentUser === 'Uday@joe';
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;

    // 1. Immediately load local storage keys for this user
    let currentLocalKeys = baseFallback;
    const savedLocal = localStorage.getItem(`chatterbot_user_keys_${currentUser}`);
    if (savedLocal) {
      try {
        currentLocalKeys = { ...baseFallback, ...JSON.parse(savedLocal) };
        setUserKeys(currentLocalKeys);
      } catch (e) {
        console.error('Failed to parse local userKeys', e);
      }
    } else {
      setUserKeys(baseFallback);
    }

    // 2. Sync with cloud MongoDB user_api_keys collection
    const fetchCloudKeys = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/user-keys?username=${encodeURIComponent(currentUser)}`));
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.keys && Object.keys(data.keys).length > 0) {
            const merged = { ...currentLocalKeys, ...data.keys };
            localStorage.setItem(`chatterbot_user_keys_${currentUser}`, JSON.stringify(merged));
            setUserKeys(merged);
          }
        }
      } catch (err) {
        console.warn('Could not sync keys from cloud storage:', err);
      }
    };

    fetchCloudKeys();
  }, [currentUser]);

  // Update pinned items when active user changes
  useEffect(() => {
    const activeUser = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    setPinnedItems(getSavedPins(activeUser));
  }, [currentUser]);

  const handleSaveUserKeys = async (newKeys: UserKeys) => {
    setUserKeys(newKeys);
    const activeUser = currentUser || localStorage.getItem('chatterbot_username') || 'Guest_Student';
    localStorage.setItem(`chatterbot_user_keys_${activeUser}`, JSON.stringify(newKeys));
    localStorage.setItem('chatterbot_user_keys', JSON.stringify(newKeys));
    localStorage.setItem('prof_joe_user_keys', JSON.stringify(newKeys));

    if (currentUser) {
      try {
        await fetch(getApiUrl('/api/user-keys'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser, keys: newKeys })
        });
      } catch (err) {
        console.error('Failed to backup keys to cloud storage:', err);
      }
    }
  };

  const [atmosphere, setAtmosphere] = useState<string>(() => {
    try {
      const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
      if (codeStyleSaved) {
        const parsed = JSON.parse(codeStyleSaved);
        if (parsed.atmosphere) return parsed.atmosphere;
      }
      const saved = localStorage.getItem('chatterbot_atmosphere');
      if (saved) return saved;
    } catch {}
    return 'cyber_osmania';
  });

  const [bubbleStyle, setBubbleStyle] = useState<string>(() => {
    try {
      const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
      if (codeStyleSaved) {
        const parsed = JSON.parse(codeStyleSaved);
        if (parsed.bubbleStyle) return parsed.bubbleStyle;
      }
      const saved = localStorage.getItem('chatterbot_bubble_style');
      if (saved) return saved;
    } catch {}
    return 'cyan_glass';
  });

  const [canvasAtmosphere, setCanvasAtmosphere] = useState<string>(() => {
    try {
      const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
      if (codeStyleSaved) {
        const parsed = JSON.parse(codeStyleSaved);
        if (parsed.canvasAtmosphere) return parsed.canvasAtmosphere;
      }
      const saved = localStorage.getItem('chatterbot_canvas_atmosphere');
      if (saved) return saved;
    } catch {}
    return 'deep_void';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-atmosphere', atmosphere);
    document.documentElement.setAttribute('data-bubble-style', bubbleStyle);
    document.documentElement.setAttribute('data-canvas-atmosphere', canvasAtmosphere);
  }, [theme, atmosphere, bubbleStyle, canvasAtmosphere]);

  useEffect(() => {
    const handleAtmosphereUpdate = () => {
      try {
        let atmoToSet = '';
        let bubbleToSet = '';
        let canvasAtmoToSet = '';
        const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
        if (codeStyleSaved) {
          const parsed = JSON.parse(codeStyleSaved);
          if (parsed.atmosphere) atmoToSet = parsed.atmosphere;
          if (parsed.bubbleStyle) bubbleToSet = parsed.bubbleStyle;
          if (parsed.canvasAtmosphere) canvasAtmoToSet = parsed.canvasAtmosphere;
        }
        if (!atmoToSet) {
          atmoToSet = localStorage.getItem('chatterbot_atmosphere') || '';
        }
        if (atmoToSet) {
          setAtmosphere(atmoToSet);
          document.documentElement.setAttribute('data-atmosphere', atmoToSet);
          const isLight = atmoToSet === 'oxford_daylight' || atmoToSet === 'amber_parchment';
          const newTheme = isLight ? 'light' : 'dark';
          setTheme(newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('chatterbot_theme', newTheme);
          localStorage.setItem('theme', newTheme);

          // Android Capacitor: Sync native status bar icon contrast
          import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
            StatusBar.setStyle({ style: newTheme === 'light' ? Style.Light : Style.Dark }).catch(() => {});
            StatusBar.setBackgroundColor({ color: newTheme === 'light' ? '#f8fafc' : '#0b0f19' }).catch(() => {});
          }).catch(() => {});
        }
        if (bubbleToSet) {
          setBubbleStyle(bubbleToSet);
          document.documentElement.setAttribute('data-bubble-style', bubbleToSet);
        }
        if (!canvasAtmoToSet) {
          canvasAtmoToSet = localStorage.getItem('chatterbot_canvas_atmosphere') || '';
        }
        if (canvasAtmoToSet) {
          setCanvasAtmosphere(canvasAtmoToSet);
          document.documentElement.setAttribute('data-canvas-atmosphere', canvasAtmoToSet);
        }
      } catch {}
    };
    window.addEventListener('chatterbot_code_style_updated', handleAtmosphereUpdate);
    window.addEventListener('chatterbot_atmosphere_updated', handleAtmosphereUpdate);
    window.addEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
    window.addEventListener('storage', handleAtmosphereUpdate);
    return () => {
      window.removeEventListener('chatterbot_code_style_updated', handleAtmosphereUpdate);
      window.removeEventListener('chatterbot_atmosphere_updated', handleAtmosphereUpdate);
      window.removeEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
      window.removeEventListener('storage', handleAtmosphereUpdate);
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      const nextAtmo = nextTheme === 'light' ? 'oxford_daylight' : 'cyber_osmania';
      setAtmosphere(nextAtmo);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.setAttribute('data-atmosphere', nextAtmo);
      localStorage.setItem('chatterbot_theme', nextTheme);
      localStorage.setItem('chatterbot_atmosphere', nextAtmo);
      try {
        const codeStyleSaved = localStorage.getItem('chatterbot_code_style');
        const parsed = codeStyleSaved ? JSON.parse(codeStyleSaved) : {};
        localStorage.setItem('chatterbot_code_style', JSON.stringify({ ...parsed, atmosphere: nextAtmo }));
      } catch {}

      // Android Capacitor: Sync native status bar
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: nextTheme === 'light' ? Style.Light : Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: nextTheme === 'light' ? '#f8fafc' : '#0b0f19' }).catch(() => {});
      }).catch(() => {});

      window.dispatchEvent(new Event('chatterbot_code_style_updated'));
      window.dispatchEvent(new Event('chatterbot_atmosphere_updated'));
      return nextTheme;
    });
  };

  const handleNewSession = () => {
    const customTitle = prompt('Enter title for new chat session:', `Chat Session ${sessions.length + 1}`);
    const finalTitle = customTitle && customTitle.trim() ? customTitle.trim() : `Chat Session ${sessions.length + 1}`;

    const newSess: ChatSession = {
      id: `session-${Date.now()}`,
      title: finalTitle,
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      systemPrompt: persistentMainSystemPrompt?.prompt,
      systemPromptTitle: persistentMainSystemPrompt?.title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newSess, ...sessions];
    setSessions(updated);
    setActiveSessionIdState(newSess.id);
    if (currentUser) {
      localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(updated));
    }
    setActiveView('chat');
    setActiveHubWorkspace('chat');
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      const fallbackSess: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New Chat Session',
        provider: selectedProvider,
        model: selectedModel,
        messages: [],
        systemPrompt: persistentMainSystemPrompt?.prompt,
        systemPromptTitle: persistentMainSystemPrompt?.title,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setSessions([fallbackSess]);
      if (currentUser) {
        localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify([fallbackSess]));
      }
      return;
    }

    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentUser) {
      localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(filtered));
    }
    if (activeSessionIdState === id) {
      setActiveSessionIdState(filtered[0].id);
    }
  };

  const handleClearChat = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleSendMessage = async (
    prompt: string,
    webSearch: boolean,
    modeOrPersona: 'auto' | '12marks' | '2marks' | 'general' | 'none' | string = 'auto',
    personaArg?: string
  ) => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess) return;

    let effectiveMode: 'auto' | '12marks' | '2marks' | 'general' | 'none' = 'auto';
    let effectivePersona = 'default';

    if (['auto', '12marks', '2marks', 'general', 'none'].includes(modeOrPersona)) {
      effectiveMode = modeOrPersona as any;
    }

    // Personas are active when in 'fun_personas' view AND isPersonaEnabled is true
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = personaArg || selectedPersona || 'default';
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      personaTag: effectivePersona
    };

    const updatedMessages = [...currentSess.messages, userMsg];
    const newTitle = currentSess.messages.length === 0
      ? (prompt.slice(0, 32) + (prompt.length > 32 ? '...' : ''))
      : currentSess.title;

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, title: newTitle, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updatedMessages);
    setIsLoading(true);

    // Context Isolation for API payload
    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updatedMessages.filter(m => !m.personaTag || m.personaTag === 'default')
      : updatedMessages;

    // Injected system prompt calculation (preset system instruction for Code Lab)
    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? (personaArg || activePresetObj?.systemInstruction)
      : (isPersonaWorkspace
          ? sanitizeSystemPrompt(currentSess.systemPrompt)
          : sanitizeSystemPrompt(currentSess.systemPrompt || persistentMainSystemPrompt?.prompt));

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        webSearch || isPersistentWebSearch,
        effectiveMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastAssistantMessage = async () => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess || currentSess.messages.length === 0 || isLoading) return;

    let updated = [...currentSess.messages];
    if (updated[updated.length - 1].role === 'assistant') {
      updated.pop();
    }
    if (updated.length === 0) return;

    let effectivePersona = 'default';
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = selectedPersona || 'default';
    }

    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? activePresetObj?.systemInstruction
      : (isPersonaWorkspace
          ? sanitizeSystemPrompt(currentSess.systemPrompt)
          : sanitizeSystemPrompt(currentSess.systemPrompt || persistentMainSystemPrompt?.prompt));

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updated);
    setIsLoading(true);

    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updated.filter(m => !m.personaTag || m.personaTag === 'default')
      : updated;

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        isPersistentWebSearch,
        promptMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updated, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLastUserMessage = async (newText: string) => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess || currentSess.messages.length === 0 || !newText.trim()) return;

    // Find index of the last user message
    const lastUserIdx = currentSess.messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIdx < 0) return;

    let effectivePersona = 'default';
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = selectedPersona || 'default';
    }

    // Truncate messages array up to lastUserIdx (removing that user turn and any following assistant response)
    const rolledBackMessages = currentSess.messages.slice(0, lastUserIdx);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: newText.trim(),
      timestamp: Date.now(),
      personaTag: effectivePersona
    };

    const updated = [...rolledBackMessages, userMessage];

    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? activePresetObj?.systemInstruction
      : (isPersonaWorkspace
          ? sanitizeSystemPrompt(currentSess.systemPrompt)
          : sanitizeSystemPrompt(currentSess.systemPrompt || persistentMainSystemPrompt?.prompt));

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updated);
    setIsLoading(true);

    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updated.filter(m => !m.personaTag || m.personaTag === 'default')
      : updated;

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        isPersistentWebSearch,
        promptMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updated, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPromptToChat = (promptText: string) => {
    setPrefilledChatPrompt(promptText);
    setActiveHubWorkspace('chat');
    setActiveView('chat');
  };

  const handleApplySystemPrompt = (title: string, promptText: string) => {
    const promptData = { title, prompt: promptText };
    setPersistentMainSystemPrompt(promptData);
    const user = currentUser || 'guest';
    localStorage.setItem(`chatterbot_main_system_prompt_${user}`, JSON.stringify(promptData));

    const currentSess = activeSession || sessions[0];
    if (currentSess) {
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, systemPrompt: promptText, systemPromptTitle: title, updatedAt: Date.now() };
          }
          return s;
        });
        if (currentUser) {
          localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(updated));
        }
        return updated;
      });
    }
    setActiveView('chat');
    setActiveHubWorkspace('chat');
  };

  const handleClearSystemPrompt = () => {
    setPersistentMainSystemPrompt(null);
    const user = currentUser || 'guest';
    localStorage.removeItem(`chatterbot_main_system_prompt_${user}`);

    const currentSess = activeSession || sessions[0];
    if (currentSess) {
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, systemPrompt: undefined, systemPromptTitle: undefined, updatedAt: Date.now() };
          }
          return s;
        });
        if (currentUser) {
          localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  if (!authToken || !currentUser) {
    return (
      <LoginModal
        isOpen={true}
        preventClose={true}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Hub Landing View
  if (activeHubWorkspace === 'landing') {
    return (
      <div className="app-container" data-theme={theme} data-atmosphere={atmosphere} data-bubble-style={bubbleStyle}>
        <DemoLandingHub
          onSelectWorkspace={(ws) => setActiveHubWorkspace(ws as ActiveViewType)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSettingsStudio={() => setActiveHubWorkspace('settings')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          userRole={userRole}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userKeys={userKeys}
          onSaveKeys={handleSaveUserKeys}
          customModels={customModels}
          onSaveCustomModels={handleSaveCustomModels}
          activeProvider={selectedProvider}
          activeModel={selectedModel}
          onSelectActiveModel={handleSelectActiveModel}
        />
        <LoginModal
          isOpen={isLoginOpen}
          preventClose={false}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Full-Bleed Dedicated Workspace View inside Hub Demo
  return (
      <div className="app-container" data-theme={theme} data-atmosphere={atmosphere} data-bubble-style={bubbleStyle}>
        <div className="app-main-viewport" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Top Home Navigation Breadcrumb Bar */}
          <div className="demo-workspace-header">
            <div className="demo-header-toolbar-dock">
              {/* 1. Return to Home Hub */}
              <button 
                type="button" 
                onClick={() => setActiveHubWorkspace('landing')}
                className="demo-home-breadcrumb-btn"
                title="Return to Home Hub"
              >
                <Home size={16} />
                <span>Home Hub</span>
              </button>

              {/* 2. Control Deck Drawer Button */}
              {activeHubWorkspace === 'chat' && (
                <button
                  type="button"
                  onClick={() => setIsDemoChatDrawerOpen(true)}
                  className="demo-view-toggle-btn"
                  title="Open Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'fun_personas' && (
                <button
                  type="button"
                  onClick={() => setIsPersonaDrawerOpen(true)}
                  className="demo-view-toggle-btn"
                  title="Open Fun Persona Deck & Character Selector"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'code_lab' && (
                <button
                  type="button"
                  onClick={() => setIsCodeLabDrawerOpen(true)}
                  className="demo-view-toggle-btn"
                  title="Open Code Lab Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'lecture_notes' && (
                <button
                  type="button"
                  onClick={() => setIsLectureDrawerOpen(true)}
                  className="demo-view-toggle-btn"
                  title="Open Lecture Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {/* 3. Refresh App */}
              <button 
                type="button" 
                onClick={() => window.location.reload()} 
                className="demo-icon-btn"
                title="Refresh App"
              >
                <RotateCw size={16} />
              </button>

              {/* 4. Theme Toggle */}
              <button 
                type="button" 
                onClick={handleToggleTheme} 
                className="demo-icon-btn"
                title="Toggle Dark/Light Theme"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} style={{ color: 'var(--accent-cyan)' }} />}
              </button>

              {/* 5. Quick API Keys & Model Selector (Key Symbol) */}
              <button 
                type="button" 
                onClick={() => setIsSettingsOpen(true)} 
                className="demo-quick-key-btn"
                title="Quick API Keys & Model Selector"
                aria-label="Quick API Keys & Model Selector"
                style={{ width: '34px', height: '34px' }}
              >
                <Key size={16} className="key-bounce-on-hover" />
              </button>

              {/* 6. Universal Settings & Print Studio 3D Gear Button */}
              <button 
                type="button" 
                onClick={() => setActiveHubWorkspace('settings')} 
                className="demo-settings-gear-btn"
                title="Open Universal Settings & Print Studio"
                aria-label="Universal Settings & Print Studio"
                style={{ width: '34px', height: '34px' }}
              >
                <Settings size={16} className="gear-spin-on-hover" />
              </button>
            </div>

            <div className="demo-header-middle-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="portal-tag" style={{ textTransform: 'uppercase' }}>
                {activeHubWorkspace === 'code_lab'
                  ? 'CODE DUNGEON WORKSPACE 🏰'
                  : activeHubWorkspace === 'extractor_studio'
                  ? 'TEXTRACTOR WORKSPACE ⚡'
                  : activeHubWorkspace === 'test_diagrams'
                  ? 'MAFS • JSXGRAPH • PLOTLY • MATHBOX STUDIO 📐'
                  : activeHubWorkspace === 'deep_learning_studio'
                  ? 'DEEP LEARNING & NEURAL NETWORK STUDIO 🧠'
                  : `${activeHubWorkspace} Workspace`}
              </span>
            </div>
          </div>

          <main className="app-main" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <React.Suspense fallback={<div className="flex items-center justify-center h-full p-8 text-cyan-400 font-semibold gap-2">⏳ Loading Studio Workspace...</div>}>
            {activeHubWorkspace === 'chat' && (
              <>
                <DemoChatHistoryDrawer
                  isOpen={isDemoChatDrawerOpen}
                  onClose={() => setIsDemoChatDrawerOpen(false)}
                  sessions={sessions}
                  activeSessionId={activeSessionIdState}
                  onSelectSession={setActiveSessionIdState}
                  onNewSession={handleNewSession}
                  onDeleteSession={handleDeleteSession}
                  isPersistentWebSearch={isPersistentWebSearch}
                  onTogglePersistentWebSearch={handleTogglePersistentWebSearch}
                  isDiagramsEnabled={isDiagramsEnabled}
                  onToggleDiagrams={handleToggleDiagrams}
                  isBeginnerFriendly={isBeginnerFriendly}
                  onToggleBeginnerFriendly={handleToggleBeginnerFriendly}
                  onOpenPdfPreview={() => setIsDemoPdfPreviewOpen(true)}
                  onNativePrintPdf={handleNativePrintPdf}
                  onClearActiveSession={handleClearActiveSession}
                  onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
                  onOpenFlashcards={handleOpenFlashcards}
                  onOpenQuiz={handleOpenQuiz}
                  onToggleSessionTag={handleToggleSessionTag}
                  onSyncSessions={handleSyncSessions}
                />
                <ChatWindow
                  messages={activeSession ? activeSession.messages : []}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                  onProviderChange={handleProviderChange}
                  onModelChange={handleModelChange}
                  onRetry={handleRetryLastAssistantMessage}
                  onEditUserMessage={handleEditLastUserMessage}
                  onBranchMessage={handleBranchSession}
                  onPinMessage={handleTogglePin}
                  pinnedMessageIds={pinnedMessageIds}
                  onGenerateFlashcards={handleGenerateMessageFlashcards}
                  onGenerateQuiz={handleGenerateMessageQuiz}
                  activeSystemPromptTitle={activeSession?.systemPromptTitle || persistentMainSystemPrompt?.title}
                  onClearSystemPrompt={handleClearSystemPrompt}
                  customModels={customModels}
                  promptMode={promptMode}
                  onPromptModeChange={handlePromptModeChange}
                  isDemoView={true}
                  onOpenCommandDeck={() => setIsDemoChatDrawerOpen(true)}
                  prefilledPrompt={prefilledChatPrompt}
                  onClearPrefilledPrompt={() => setPrefilledChatPrompt('')}
                />

                {isDemoPdfPreviewOpen && activeSession && (
                  <PdfPreviewModal
                    isOpen={isDemoPdfPreviewOpen}
                    onClose={() => setIsDemoPdfPreviewOpen(false)}
                    content={activeSession.messages.map(m => `### ${m.role === 'user' ? '👤 User' : `🎓 Prof. Joe (${m.modelUsed || selectedModel})`}\n${m.content}`).join('\n\n---\n\n')}
                    modelUsed={selectedModel}
                    docTitle={`ProfJoe_Chat_${activeSession.title ? activeSession.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Session'}_${new Date().toISOString().split('T')[0]}`}
                    renderedHtml={activeSession.messages.map(m => `<div class="msg-block"><h4>${m.role === 'user' ? '👤 User' : `🎓 Prof. Joe (${m.modelUsed || selectedModel})`}</h4><p>${m.content}</p></div>`).join('<hr/>')}
                  />
                )}
              </>
            )}

            {activeHubWorkspace === 'examprep' && (
              <ExamPrepView onLoadQuestionToChat={(prompt) => {
                setActiveHubWorkspace('chat');
                handleLoadPromptToChat(prompt);
              }} />
            )}

            {activeHubWorkspace === 'system_prompts' && (
              <SystemPromptLibraryView
                onUsePrompt={(prompt) => {
                  setActiveHubWorkspace('chat');
                  handleLoadPromptToChat(prompt);
                }}
                onApplyPrompt={handleApplySystemPrompt}
              />
            )}

            {activeHubWorkspace === 'prompts' && (
              <PromptLibraryView onUsePrompt={(prompt) => {
                setActiveHubWorkspace('chat');
                handleLoadPromptToChat(prompt);
              }} />
            )}

            {activeHubWorkspace === 'diagrams' && (
              <DiagramStudioView
                userKeys={userKeys}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                customModels={customModels}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
              />
            )}

            {activeHubWorkspace === 'cubes' && (
              <CubesPlaygroundView />
            )}

            {activeHubWorkspace === 'sandbox' && (
              <InteractiveSandboxView />
            )}

            {activeHubWorkspace === 'dsa_lab' && (
              <DsaLabView />
            )}

            {activeHubWorkspace === 'lecture_notes' && (
              <LectureNotesStudioView
                userKeys={userKeys}
                customModels={customModels}
                currentUser={currentUser}
                isDemoView={true}
                isExternalDrawerOpen={isLectureDrawerOpen}
                onCloseExternalDrawer={() => setIsLectureDrawerOpen(false)}
              />
            )}

            {activeHubWorkspace === 'fun_personas' && (
              <FunPersonaChatView
                messages={activePersonaSession ? activePersonaSession.messages : []}
                isLoading={isLoading}
                onSendMessage={(prompt, webSearch, mode, persona) => {
                  handleSendMessage(prompt, webSearch, mode, persona);
                }}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                selectedPersona={selectedPersona}
                isPersonaEnabled={isPersonaEnabled}
                onTogglePersonaEnabled={handleTogglePersonaEnabled}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                onPersonaChange={handlePersonaChange}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                onBranchMessage={handleBranchPersonaSession}
                onPinMessage={handleTogglePin}
                pinnedMessageIds={pinnedMessageIds}
                personaSessions={personaSessions}
                activePersonaSessionId={activePersonaSessionIdState}
                onSelectPersonaSession={setActivePersonaSessionIdState}
                onNewPersonaSession={handleNewPersonaSession}
                onDeletePersonaSession={handleDeletePersonaSession}
                isDemoView={true}
                isExternalDrawerOpen={isPersonaDrawerOpen}
                onCloseExternalDrawer={() => setIsPersonaDrawerOpen(false)}
              />
            )}
            {activeHubWorkspace === 'extractor_studio' && (
              <DocumentExtractorStudioView
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onSendToChat={() => {
                  setActiveHubWorkspace('chat');
                }}
              />
            )}
            {activeHubWorkspace === 'code_lab' && (
              <PracticalCodeLabView
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onSendMessage={(prompt, webSearch, mode) => {
                  handleSendMessage(prompt, webSearch, mode);
                }}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                onBranchMessage={handleBranchCodeLabSession}
                onPinMessage={handleTogglePin}
                pinnedMessageIds={pinnedMessageIds}
                onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
                pinnedCount={pinnedItems.length}
                isLoading={isLoading}
                messages={activeCodeLabSession ? activeCodeLabSession.messages : []}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                customModels={customModels}
                activePresetId={activeCodeLabPresetId}
                onSelectPresetId={handleSelectCodeLabPresetId}
                onResetPresetChat={handleResetCodeLabPresetSession}
                presetSessions={presetSessionsList}
                activeSessionId={activeCodeLabSession.id}
                onSelectSession={(sessionId) => {
                  setActiveCodeLabSessionIds(prev => ({
                    ...prev,
                    [activeCodeLabPresetId]: sessionId
                  }));
                }}
                onNewSession={() => handleNewCodeLabSession(activeCodeLabPresetId)}
                onDeleteSession={(sessionId) => handleDeleteCodeLabSession(activeCodeLabPresetId, sessionId)}
                isExternalDrawerOpen={isCodeLabDrawerOpen}
                onCloseExternalDrawer={() => setIsCodeLabDrawerOpen(false)}
              />
            )}

            {activeHubWorkspace === 'flashcards_studio' && (
              <FlashcardsStudioView
                currentUser={currentUser}
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onNavigateToChat={() => setActiveHubWorkspace('chat')}
              />
            )}

            {activeHubWorkspace === 'quiz_arena' && (
              <QuizArenaView
                currentUser={currentUser}
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onNavigateToChat={() => setActiveHubWorkspace('chat')}
              />
            )}

            {activeHubWorkspace === 'pinned_archive' && (
              <PinnedNotesArchiveView
                currentUser={currentUser}
                pinnedItems={pinnedItems}
                onDeletePin={handleDeletePin}
                onClearAllPins={handleClearAllPins}
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onNavigateToChat={() => setActiveHubWorkspace('chat')}
              />
            )}

            {activeHubWorkspace === 'settings' && (
              <SettingsStudioView
                onBack={() => setActiveHubWorkspace('chat')}
                currentUser={currentUser}
                userRole={userRole}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                userKeys={userKeys}
                onSaveKeys={handleSaveUserKeys}
                customModels={customModels}
                onSaveCustomModels={handleSaveCustomModels}
                activeProvider={selectedProvider}
                activeModel={selectedModel}
                onSelectActiveModel={handleSelectActiveModel}
                onClearHistory={handleClearChat}
                onLogout={handleLogout}
              />
            )}

            {activeHubWorkspace === 'test_diagrams' && (
              <TestDiagramsStudioView />
            )}

            {activeHubWorkspace === 'deep_learning_studio' && (
              <DeepLearningStudioView />
            )}
            </React.Suspense>
          </main>
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userKeys={userKeys}
          onSaveKeys={handleSaveUserKeys}
          customModels={customModels}
          onSaveCustomModels={handleSaveCustomModels}
          activeProvider={selectedProvider}
          activeModel={selectedModel}
          onSelectActiveModel={handleSelectActiveModel}
        />
          <LoginModal
            isOpen={isLoginOpen}
            preventClose={false}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />

        <CheatSheetDrawer
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
          pinnedItems={pinnedItems}
          currentSessionId={activeHubWorkspace === 'code_lab' ? activeCodeLabSession?.id : activeHubWorkspace === 'fun_personas' ? activePersonaSession?.id : activeSession?.id}
          currentWorkspace={activeHubWorkspace === 'code_lab' ? 'code_lab' : activeHubWorkspace === 'fun_personas' ? 'persona' : 'chat'}
          onDeletePin={handleDeletePin}
          onClearAllPins={handleClearAllPins}
          onOpenArchive={() => {
            setIsCheatSheetOpen(false);
            setActiveHubWorkspace('pinned_archive');
          }}
        />

        <FlashcardsModal
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
          flashcards={flashcards}
          sessionTitle={activeSession?.title}
        />

        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          questions={quizQuestions}
          sessionTitle={activeSession?.title}
        />
      </div>
  );
};

export default App;
