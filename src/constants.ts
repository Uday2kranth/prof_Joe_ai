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
      { value: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (Reasoning)' },
      { value: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B (Reasoning)' },
      { value: 'qwen-2.5-32b', name: 'Qwen 2.5 32B (Groq)' },
      { value: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
      { value: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile [WS]' },
      { value: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama Cloud',
    models: [
      { value: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash (Ollama Cloud)' },
      { value: 'deepseek-v3', name: 'DeepSeek V3 (Ollama Cloud)' },
      { value: 'deepseek-r1', name: 'DeepSeek R1 (Ollama Cloud)' },
      { value: 'deepseek-r1:70b', name: 'DeepSeek R1 70B (Ollama Cloud)' },
      { value: 'llama3.3', name: 'Llama 3.3 70B (Ollama Cloud)' },
      { value: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Ollama Cloud)' },
      { value: 'mistral-nemo', name: 'Mistral Nemo (Ollama Cloud)' },
      { value: 'phi4', name: 'Phi-4 (Ollama Cloud)' },
      { value: 'gemma2', name: 'Gemma 2 (Ollama Cloud)' }
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
    id: 'cerebras',
    name: 'Cerebras Cloud (Ultra-Fast)',
    models: [
      { value: 'llama-3.3-70b', name: 'Llama 3.3 70B (Ultra-Fast 2000+ t/s) [WS]' },
      { value: 'llama3.1-70b', name: 'Llama 3.1 70B (Ultra-Fast 1800+ t/s) [WS]' },
      { value: 'llama3.1-8b', name: 'Llama 3.1 8B (Instant 2000+ t/s)' },
      { value: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Reasoning)' }
    ]
  },
  {
    id: 'sambanova',
    name: 'SambaNova Cloud',
    models: [
      { value: 'DeepSeek-V3.1', name: 'DeepSeek V3.1' },
      { value: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct [WS]' },
      { value: 'gpt-oss-120b', name: 'GPT-OSS 120B' },
      { value: 'DeepSeek-V3.2', name: 'DeepSeek V3.2' },
      { value: 'gemma-4-31b-it', name: 'Gemma 4 31B it' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { value: 'mistral-large-latest', name: 'Mistral Large [WS]' },
      { value: 'open-mixtral-8x22b', name: 'Mixtral 8x22B [WS]' },
      { value: 'codestral-latest', name: 'Codestral' },
      { value: 'open-mistral-nemo', name: 'Mistral Nemo' },
      { value: 'pixtral-12b-2409', name: 'Pixtral 12B' }
    ]
  },
  {
    id: 'nararouter',
    name: 'NaraRouter API',
    models: [
      { value: 'mistral-large', name: 'Mistral Large (Free) [WS]' },
      { value: 'mistral-medium-3-5', name: 'Mistral Medium 3.5 (Free) [WS]' },
      { value: 'tencent-hy3', name: 'Tencent Hunyuan 3 (Free)' },
      { value: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B (Omni)' },
      { value: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash (Omni) [WS]' },
      { value: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Omni)' }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Hub',
    models: [
      { value: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct (HF) [WS]' },
      { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', name: 'DeepSeek R1 Distill Qwen 32B (HF)' },
      { value: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B Instruct (HF) [WS]' },
      { value: 'google/gemma-2-9b-it', name: 'Gemma 2 9B (HF) [WS]' },
      { value: 'microsoft/Phi-3.5-mini-instruct', name: 'Phi 3.5 Mini Instruct (HF)' },
      { value: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta (HF)' }
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
