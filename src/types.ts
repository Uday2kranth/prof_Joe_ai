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
  category?: string;
  franchise?: string;
  catchphrase?: string;
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

export type ActiveViewType = 'chat' | 'prompts' | 'examprep' | 'system_prompts' | 'diagrams' | 'cubes' | 'fun_personas' | 'extractor_studio' | 'code_lab' | 'lecture_notes' | 'sandbox' | 'dsa_lab' | 'flashcards_studio' | 'quiz_arena' | 'pinned_archive' | 'settings' | 'test_diagrams';

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

export interface AiTuningConfig {
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  searchDepth: 'fast' | 'deep';
  graderMode: 'rigorous_12mark' | 'step_by_step' | 'compact';
}

export const DEFAULT_AI_TUNING: AiTuningConfig = {
  temperature: 0.2,
  maxTokens: 4096,
  streaming: true,
  searchDepth: 'deep',
  graderMode: 'rigorous_12mark'
};

export type SupportedCodeTheme = 'onedark' | 'vscode_dark' | 'monokai' | 'tokyo_night' | 'github_light' | 'neon' | 'hc_black';

export type WorkspaceAtmosphere = 'cyber_osmania' | 'midnight_academy' | 'emerald_scholar' | 'obsidian_oled' | 'oxford_daylight' | 'amber_parchment';

export type ChatBubbleStyle = 'cyan_glass' | 'velvet_indigo' | 'scholar_emerald' | 'obsidian_minimal' | 'clean_card';

export type CanvasAtmosphere = 'deep_void' | 'blueprint_matrix' | 'academic_parchment' | 'oxford_daylight' | 'oled_black';

export interface CodeStyleConfig {
  codeTheme: SupportedCodeTheme;
  bubbleStyle?: ChatBubbleStyle;
  atmosphere?: WorkspaceAtmosphere;
  canvasAtmosphere?: CanvasAtmosphere;
  katexScale: 'compact' | 'standard' | 'large';
  equationCopyMode: 'latex' | 'unicode';
}

export const DEFAULT_CODE_STYLE: CodeStyleConfig = {
  codeTheme: 'onedark',
  bubbleStyle: 'cyan_glass',
  atmosphere: 'cyber_osmania',
  canvasAtmosphere: 'deep_void',
  katexScale: 'standard',
  equationCopyMode: 'latex'
};

export interface IdeConfig {
  theme: SupportedCodeTheme | 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize: number;
  minimap: boolean;
  tabSize: 2 | 4;
  wordWrap: 'on' | 'off';
  lineNumbers: 'on' | 'off';
  editorEngine?: 'monaco' | 'fast';
}

export const DEFAULT_IDE_CONFIG: IdeConfig = {
  theme: 'onedark',
  fontSize: 13,
  minimap: false,
  tabSize: 2,
  wordWrap: 'on',
  lineNumbers: 'on',
  editorEngine: 'monaco'
};


