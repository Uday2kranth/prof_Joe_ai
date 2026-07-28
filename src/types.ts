export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  personaTag?: string;
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
  local_endpoint: string;
}

export type ActiveViewType = 'chat' | 'prompts' | 'examprep' | 'system_prompts' | 'diagrams' | 'cubes' | 'fun_personas';
