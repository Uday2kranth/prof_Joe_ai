import type { ProviderGroup, PersonaOption } from './types';

export const PROVIDERS: ProviderGroup[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { value: 'openrouter/free', name: 'Free Automated Router [WS]' },
      { value: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Free [WS]' },
      { value: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 / V4 Flash [WS]' },
      { value: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B [WS]' },
      { value: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Free [WS]' },
      { value: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Reasoning) [WS]' },
      { value: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking Free [WS]' },
      { value: 'nvidia/nemotron-3-ultra:free', name: 'Nemotron 3 Ultra (Frontier Logic) [WS]' },
      { value: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super (Math/Logic) [WS]' },
      { value: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B (Low-Latency)' },
      { value: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B (Sub-Agent)' },
      { value: 'poolside/laguna-m.1:free', name: 'Laguna M.1 (Coding Agent)' },
      { value: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 (Coding)' },
      { value: 'cohere/north-mini-code:free', name: 'North Mini Code (Low-Latency)' },
      { value: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder (Repo-Scale)' },
      { value: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B Ultra-Light Free [WS]' },
      { value: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B Light Free [WS]' },
      { value: 'qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5 7B Light Free [WS]' },
      { value: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini 128K Fast Free [WS]' },
      { value: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Light Free [WS]' },
      { value: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (OCR/Vision)' },
      { value: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B (Visual Instruction)' },
      { value: 'nvidia/nemotron-3-nano-omni:free', name: 'Nemotron 3 Nano Omni (Multimodal)' }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { value: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash [WS]' },
      { value: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash [WS]' },
      { value: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash [WS]' },
      { value: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite' },
      { value: 'gemma-4-21b', name: 'Gemma 4 21B (Multimodal)' },
      { value: 'gemma-4-30b', name: 'Gemma 4 30B (Frontier)' },
      { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash [WS]' },
      { value: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
      { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash [WS]' },
      { value: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash [WS]' },
      { value: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    models: [
      { value: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile [WS]' },
      { value: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Fast)' },
      { value: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B (Thinking/Reasoning)' },
      { value: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (Groq)' },
      { value: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B (Groq)' },
      { value: 'groq/compound', name: 'Groq Compound Agent' },
      { value: 'groq/compound-mini', name: 'Groq Compound Mini' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama Cloud (Online API)',
    models: [
      { value: 'gpt-oss:20b', name: 'GPT-OSS 20B (Ollama Cloud) [Free]' },
      { value: 'gpt-oss:120b', name: 'GPT-OSS 120B (Ollama Cloud) [Free]' },
      { value: 'gemma4:31b', name: 'Gemma 4 31B (Ollama Cloud) [Free]' },
      { value: 'nemotron-3-nano:30b', name: 'Nemotron 3 Nano 30B (Ollama Cloud) [Free]' },
      { value: 'nemotron-3-super', name: 'Nemotron 3 Super 120B (Ollama Cloud) [Free]' },
      { value: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra 550B (Ollama Cloud) [Free]' },
      { value: 'minimax-m3', name: 'MiniMax M3 (Ollama Cloud) [Free]' }
    ]
  },
  {
    id: 'local_endpoint',
    name: 'Local Device / Tunnel (Ollama)',
    models: [
      { value: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash (Local Device)' },
      { value: 'deepseek-v3', name: 'DeepSeek V3 (Local Device)' },
      { value: 'deepseek-r1', name: 'DeepSeek R1 (Local Device)' },
      { value: 'llama3.3', name: 'Llama 3.3 70B (Local Device)' },
      { value: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Local Device)' },
      { value: 'mistral-nemo', name: 'Mistral Nemo (Local Device)' },
      { value: 'phi4', name: 'Phi-4 (Local Device)' },
      { value: 'gemma2', name: 'Gemma 2 (Local Device)' }
    ]
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM Gateway',
    models: [
      { value: 'nvidia/nemotron-3-ultra:free', name: 'Nemotron 3 Ultra (NVIDIA Gateway) [WS]' },
      { value: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B [WS]' },
      { value: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B' },
      { value: 'nvidia/nemotron-3-nano-omni:free', name: 'Nemotron 3 Nano Omni' }
    ]
  },
  {
    id: 'poolside',
    name: 'Poolside AI (Code Engine)',
    models: [
      { value: 'poolside/laguna-m.1:free', name: 'Laguna M.1 Agent [WS]' },
      { value: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [WS]' }
    ]
  },
  {
    id: 'sambanova',
    name: 'SambaNova Cloud',
    models: [
      { value: 'MiniMax-M2.7', name: 'MiniMax M2.7 (SambaNova) [Free Quota]' },
      { value: 'gemma-4-31B-it', name: 'Gemma 4 31B (SambaNova) [Free Quota]' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { value: 'mistral-large-latest', name: 'Mistral Large [WS]' },
      { value: 'mistral-medium-latest', name: 'Mistral Medium 3.5 [WS]' },
      { value: 'mistral-small-latest', name: 'Mistral Small' },
      { value: 'codestral-latest', name: 'Codestral (Coding Specialist)' },
      { value: 'ministral-8b-latest', name: 'Ministral 8B (Fast)' },
      { value: 'ministral-3b-latest', name: 'Ministral 3B (Ultra-Fast)' },
      { value: 'devstral-medium-latest', name: 'Devstral Medium Agent' }
    ]
  },
  {
    id: 'nararouter',
    name: 'NaraRouter API',
    models: [
      { value: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash (NaraRouter) [Free Router]' },
      { value: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent (NaraRouter) [Free Router]' },
      { value: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash (NaraRouter) [Free Router]' },
      { value: 'tencent-hy3-free', name: 'Tencent Hunyuan 3 (NaraRouter) [Free Router]' }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Hub',
    models: [
      { value: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct (HF) [Free Router]' },
      { value: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B (HF) [Free Router]' },
      { value: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct (HF) [Free Router]' },
      { value: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct (HF) [Free Router]' }
    ]
  },
  {
    id: 'opencode',
    name: 'OpenCode AI (Free Tier)',
    models: [
      { value: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash (OpenCode) [WS]' },
      { value: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1 Agent (OpenCode)' },
      { value: 'ling-3.0-flash-free', name: 'Ling 3.0 Flash (OpenCode) [WS]' },
      { value: 'mimo-v2.5-free', name: 'Mimo V2.5 Reasoning (OpenCode)' },
      { value: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra 550B (OpenCode) [WS]' },
      { value: 'north-mini-code-free', name: 'North Mini Code Specialist (OpenCode)' }
    ]
  },
  {
    id: 'pollinations-keyed',
    name: 'Pollinations AI (Priority Keyed)',
    models: [
      { value: 'vendouple/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent (Pollinations) [Free]' },
      { value: 'YoannDev90/diffusiongemma-26b-a4b-it:free', name: 'Gemma 26B Instruction (Pollinations) [Free]' },
      { value: 'chirag-gamer/gpt-oss-120b', name: 'GPT-OSS 120B (Pollinations) [Free]' },
      { value: 'guus6457/solar-pro-4', name: 'Solar Pro 4 (Pollinations) [Free]' },
      { value: 'guus6457/ling-2.6-flash', name: 'Ling 2.6 Flash (Pollinations) [Free]' },
      { value: 'chigwell/llm7-fast', name: 'LLM7 Fast Router (Pollinations) [Free]' }
    ]
  }
];

export const PERSONAS: PersonaOption[] = [
  { id: 'default', name: 'Prof. Joe Academic (Default)', icon: '🎓', description: 'Exam prep engine with Kroki diagrams', allowDiagrams: true },
  { id: 'computer', name: "Courage's Computer 🖥️", icon: '🖥️', description: 'Diagnostic expert, dry British wit & kroki diagrams', allowDiagrams: true },
  { id: 'courage', name: 'Courage-Inspired 🐶', icon: '🐶', description: 'Timid, loyal step-by-step solver & kroki diagrams', allowDiagrams: true },
  { id: 'peter', name: 'Peter-Inspired 🍺', icon: '🍺', description: 'Enthusiastic sitcom dad analogies (Text Mode)', allowDiagrams: false },
  { id: 'stewie', name: 'Stewie-Inspired 👶', icon: '👶', description: 'Sophisticated child genius dry wit (Text Mode)', allowDiagrams: false },
  { id: 'rick', name: 'Rick-Inspired 🧪', icon: '🧪', description: 'Eccentric super-genius scientist (Text Mode)', allowDiagrams: false },
  { id: 'morty', name: 'Morty-Inspired 🧢', icon: '🧢', description: 'Kind-hearted & encouraging teenager (Text Mode)', allowDiagrams: false }
];
