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

export type ActiveViewType = 'chat' | 'prompts' | 'examprep' | 'system_prompts' | 'diagrams' | 'cubes' | 'fun_personas' | 'extractor_studio' | 'code_lab' | 'lecture_notes' | 'sandbox' | 'dsa_lab' | 'flashcards_studio' | 'quiz_arena' | 'pinned_archive' | 'settings' | 'test_diagrams' | 'deep_learning_studio' | 'master_syllabus';

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

export interface MainChatTuning {
  mode: 'auto' | '12marks' | '2marks' | '1marks' | 'general' | 'none';
  temperature: number;
  maxTokens: number;
  searchSourcesCount: number;
  deliveryPacing: 'instant' | 'fast' | 'smooth' | 'lecture';
}

export interface CodeDungeonTuning {
  strictCodeFirst: boolean;
  temperature: number;
  maxTokens: number;
  searchSourcesCount: number;
  deliveryPacing: 'instant' | 'fast' | 'smooth' | 'lecture';
  libraryDocsGrounding: boolean;
}

export interface FunPersonasTuning {
  temperature: number;
  maxTokens: number;
  deliveryPacing: 'instant' | 'fast' | 'smooth' | 'lecture';
  suppressDiagrams: boolean;
}

export interface LectureNotesTuning {
  notesDepth: 'comprehensive' | 'concise' | 'bullet_summary';
  temperature: number;
  maxTokens: number;
  includeLatexDerivations: boolean;
  deliveryPacing: 'instant' | 'fast' | 'smooth' | 'lecture';
}

export interface AiTuningConfig {
  temperature: number;
  maxTokens: number;
  deliveryPacing?: 'instant' | 'fast' | 'smooth' | 'lecture';
  searchDepth: 'fast' | 'deep' | number;
  searchSourcesCount?: number;
  streaming?: boolean;
  graderMode?: 'rigorous_12mark' | 'step_by_step' | 'compact';
  activeWorkspaceTuningTab?: 'main_chat' | 'code_dungeon' | 'fun_personas' | 'lecture_notes';
  mainChat?: MainChatTuning;
  codeDungeon?: CodeDungeonTuning;
  funPersonas?: FunPersonasTuning;
  lectureNotes?: LectureNotesTuning;
}

export const DEFAULT_MAIN_CHAT_TUNING: MainChatTuning = {
  mode: '12marks',
  temperature: 0.2,
  maxTokens: 4096,
  searchSourcesCount: 4,
  deliveryPacing: 'instant'
};

export const DEFAULT_CODE_DUNGEON_TUNING: CodeDungeonTuning = {
  strictCodeFirst: true,
  temperature: 0.15,
  maxTokens: 4096,
  searchSourcesCount: 3,
  deliveryPacing: 'instant',
  libraryDocsGrounding: true
};

export const DEFAULT_FUN_PERSONAS_TUNING: FunPersonasTuning = {
  temperature: 0.8,
  maxTokens: 3072,
  deliveryPacing: 'instant',
  suppressDiagrams: true
};

export const DEFAULT_LECTURE_NOTES_TUNING: LectureNotesTuning = {
  notesDepth: 'comprehensive',
  temperature: 0.2,
  maxTokens: 8192,
  includeLatexDerivations: true,
  deliveryPacing: 'instant'
};

export const DEFAULT_AI_TUNING: AiTuningConfig = {
  temperature: 0.2,
  maxTokens: 4096,
  deliveryPacing: 'instant',
  searchDepth: 4,
  searchSourcesCount: 4,
  activeWorkspaceTuningTab: 'main_chat',
  mainChat: DEFAULT_MAIN_CHAT_TUNING,
  codeDungeon: DEFAULT_CODE_DUNGEON_TUNING,
  funPersonas: DEFAULT_FUN_PERSONAS_TUNING,
  lectureNotes: DEFAULT_LECTURE_NOTES_TUNING
};

export type SupportedCodeTheme = 
  | 'onedark' 
  | 'vscode_dark' 
  | 'monokai' 
  | 'tokyo_night' 
  | 'github_light' 
  | 'neon' 
  | 'emerald_matrix' 
  | 'dracula' 
  | 'cyber_pink'
  | 'cobalt' 
  | 'solarized_amber';

export type WorkspaceAtmosphere =
  | 'cyber_osmania'
  | 'midnight_academy'
  | 'emerald_scholar'
  | 'royal_sapphire'
  | 'oceanic_teal'
  | 'sunset_coral'
  | 'imperial_gold'
  | 'amber_parchment'
  | 'crimson_rose'
  | 'sakura_pink'
  | 'electric_amethyst'
  | 'arctic_frost';

export type ChatBubbleStyle = 'cyan_glass' | 'velvet_indigo' | 'scholar_emerald' | 'obsidian_minimal' | 'clean_card';

export type CanvasAtmosphere =
  | 'deep_void'
  | 'blueprint_matrix'
  | 'academic_parchment'
  | 'oxford_daylight'
  | 'oled_black'
  | 'tokyo_synthwave'
  | 'emerald_matrix'
  | 'solar_amber'
  | 'nordic_aurora'
  | 'chalkboard_slate'
  | 'royal_nebula'
  | 'sakura_blossom';

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
  monacoThemeMode?: 'auto' | 'dark' | 'light';
}

export const DEFAULT_IDE_CONFIG: IdeConfig = {
  theme: 'onedark',
  fontSize: 13,
  minimap: false,
  tabSize: 2,
  wordWrap: 'on',
  lineNumbers: 'on',
  editorEngine: 'monaco',
  monacoThemeMode: 'auto'
};

export type CodeLabDeliveryFormat = 'lab_record' | 'interactive_learner' | 'pure_code';
export type CodeLabApproach = 'from_scratch' | 'standard_lib' | 'beginner_simple';



