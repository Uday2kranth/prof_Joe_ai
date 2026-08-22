export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  personaTag?: string;
  isStreaming?: boolean;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  provider: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  systemPrompt?: string;
  systemPromptTitle?: string;
  presetId?: string;
  tags?: string[];
}

export interface ModelOption {
  value: string;
  name: string;
  multimodal?: boolean;
  webSearch?: boolean;
}

export interface ProviderGroup {
  id: string;
  name: string;
  models: ModelOption[];
}

export interface PersonaOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  allowDiagrams: boolean;
}

export interface UserKeys {
  ollama: string;
  openrouter: string;
  gemini: string;
  groq: string;
  mistral: string;
  nvidia: string;
  cerebras: string;
  sambanova: string;
  nararouter: string;
  huggingface: string;
  pollinations: string;
  opencode?: string;
  poolside?: string;
  local_endpoint: string;
}

export type ActiveViewType = 'chat' | 'prompts' | 'examprep' | 'system_prompts' | 'diagrams' | 'cubes' | 'fun_personas' | 'extractor_studio' | 'code_lab' | 'lecture_notes' | 'sandbox' | 'dsa_lab' | 'flashcards_studio' | 'quiz_arena' | 'pinned_archive';

export interface CustomModel {
  id: string;
  name: string;
  enabled: boolean;
  isFree?: boolean;
  contextLength?: number;
}

export interface UserCustomModels {
  [providerId: string]: CustomModel[];
}

export type PromptMode = 'auto' | '12marks' | '2marks' | '1marks' | 'general';

export interface PinnedItem {
  id: string;
  sessionId: string;
  sessionTitle?: string;
  workspace?: 'chat' | 'code_lab' | 'persona';
  content: string;
  modelUsed?: string;
  createdAt: number;
  note?: string;
  tag?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  sourceType: 'message' | 'session' | 'manual';
  sourceId: string;
  topic: string;
  categoryTag?: string;
  createdAt: number;
  lastStudiedAt?: number;
  cards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizDeck {
  id: string;
  sourceType: 'message' | 'session' | 'manual';
  sourceId: string;
  topic: string;
  categoryTag?: string;
  createdAt: number;
  lastAttemptScore?: {
    score: number;
    total: number;
    timestamp: number;
  };
  questions: QuizQuestion[];
}


