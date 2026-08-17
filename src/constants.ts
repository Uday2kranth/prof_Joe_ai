import type { ProviderGroup, PersonaOption } from './types';

export const PROVIDERS: ProviderGroup[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { value: 'openrouter/free', name: 'Free Automated Router [Free]' },
      { value: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B [Free]' },
      { value: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B [Free]' },
      { value: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B [Free]' },
      { value: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]' },
      { value: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]' }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { value: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash [Free]' },
      { value: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash [Free]' },
      { value: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash [Free]' },
      { value: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite [Free]' },
      { value: 'gemma-4-31b-it', name: 'Gemma 4 31B [Free]' },
      { value: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B [Free]' },
      { value: 'gemini-flash-latest', name: 'Gemini Flash Latest [Free]' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    models: [
      { value: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B [Free]' },
      { value: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B Reasoning [Free]' },
      { value: 'groq/compound', name: 'Groq Compound Agent [Free]' },
      { value: 'groq/compound-mini', name: 'Groq Compound Mini [Free]' },
      { value: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B [Free]' },
      { value: 'allam-2-7b', name: 'Allam 2 7B [Free]' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama Cloud (Online API)',
    models: [
      { value: 'gpt-oss:20b', name: 'GPT-OSS 20B [Free]' },
      { value: 'gpt-oss:120b', name: 'GPT-OSS 120B [Free]' },
      { value: 'gemma4:31b', name: 'Gemma 4 31B [Free]' },
      { value: 'nemotron-3-nano:30b', name: 'Nemotron 3 Nano 30B [Free]' },
      { value: 'nemotron-3-super', name: 'Nemotron 3 Super 120B [Free]' },
      { value: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra 550B [Free]' },
      { value: 'minimax-m3', name: 'MiniMax M3 [Free]' }
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
      { value: 'nvidia/nemotron-3-ultra:free', name: 'Nemotron 3 Ultra [Free]' },
      { value: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B [Free]' },
      { value: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B [Free]' },
      { value: 'nvidia/nemotron-3-nano-omni:free', name: 'Nemotron 3 Nano Omni [Free]' }
    ]
  },
  {
    id: 'poolside',
    name: 'Poolside AI (Code Engine)',
    models: [
      { value: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent [Free]' },
      { value: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]' },
      { value: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]' }
    ]
  },
  {
    id: 'sambanova',
    name: 'SambaNova Cloud',
    models: [
      { value: 'MiniMax-M2.7', name: 'MiniMax M2.7 [Free Quota]' },
      { value: 'gemma-4-31B-it', name: 'Gemma 4 31B [Free Quota]' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { value: 'mistral-large-latest', name: 'Mistral Large [Free]' },
      { value: 'mistral-medium-latest', name: 'Mistral Medium 3.5 [Free]' },
      { value: 'mistral-small-latest', name: 'Mistral Small [Free]' },
      { value: 'codestral-latest', name: 'Codestral Coding Specialist [Free]' },
      { value: 'ministral-8b-latest', name: 'Ministral 8B [Free]' },
      { value: 'ministral-3b-latest', name: 'Ministral 3B [Free]' },
      { value: 'devstral-medium-latest', name: 'Devstral Medium Agent [Free]' }
    ]
  },
  {
    id: 'nararouter',
    name: 'NaraRouter API',
    models: [
      { value: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent [Free]' },
      { value: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash [Free]' },
      { value: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash [Free]' },
      { value: 'mistral-large', name: 'Mistral Large [Free]' },
      { value: 'mistral-medium-3-5', name: 'Mistral Medium 3.5 [Free]' },
      { value: 'qwen-3.8-max-free', name: 'Qwen 3.8 Max [Free]' }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Hub',
    models: [
      { value: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct [Free]' },
      { value: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B [Free]' },
      { value: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct [Free]' },
      { value: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct [Free]' },
      { value: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 [Free]' },
      { value: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 Reasoning [Free]' }
    ]
  },
  {
    id: 'opencode',
    name: 'OpenCode AI (Free Tier)',
    models: [
      { value: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash [Free]' },
      { value: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1 Agent [Free]' },
      { value: 'ling-3.0-flash-free', name: 'Ling 3.0 Flash [Free]' },
      { value: 'mimo-v2.5-free', name: 'Mimo V2.5 Reasoning [Free]' },
      { value: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra 550B [Free]' },
      { value: 'north-mini-code-free', name: 'North Mini Code Specialist [Free]' }
    ]
  },
  {
    id: 'pollinations-keyed',
    name: 'Pollinations AI (Priority Keyed)',
    models: [
      { value: 'vendouple/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent [Free]' },
      { value: 'chigwell/llm7-fast', name: 'LLM7 Fast Router [Free]' }
    ]
  }
];

export const PERSONAS: PersonaOption[] = [
  { id: 'default', name: 'Prof. Joe Academic (Default)', icon: '🎓', description: 'Exam prep engine with Kroki diagrams', allowDiagrams: true },
  { id: 'fools_gold_mds203', name: 'MDS-203 Optimization Mentor', icon: '📈', description: 'Simplex, Duality, Transport & PERT/CPM with Kroki', allowDiagrams: true },
  { id: 'fools_gold_mds302', name: 'MDS-302 Computer Networks Mentor', icon: '🌐', description: 'OSI/TCP-IP, Routing, Protocols & Packet Diagrams', allowDiagrams: true },
  { id: 'fools_gold_mds204t', name: 'MDS-204-T Software Eng Mentor', icon: '⚙️', description: 'SDLC, Agile, SQA, Testing & UML Diagrams', allowDiagrams: true },
  { id: 'fools_gold_mds104t', name: 'MDS-104-T Stat Inference Mentor', icon: '📊', description: 'Estimation, Hypotheses, LRT & Bayes Distributions', allowDiagrams: true },
  { id: 'computer', name: "Courage's Computer 🖥️", icon: '🖥️', description: 'Diagnostic expert, dry British wit & kroki diagrams', allowDiagrams: true },
  { id: 'courage', name: 'Courage-Inspired 🐶', icon: '🐶', description: 'Timid, loyal step-by-step solver & kroki diagrams', allowDiagrams: true },
  { id: 'peter', name: 'Peter-Inspired 🍺', icon: '🍺', description: 'Enthusiastic sitcom dad analogies (Text Mode)', allowDiagrams: false },
  { id: 'stewie', name: 'Stewie-Inspired 👶', icon: '👶', description: 'Sophisticated child genius dry wit (Text Mode)', allowDiagrams: false },
  { id: 'rick', name: 'Rick-Inspired 🧪', icon: '🧪', description: 'Eccentric super-genius scientist (Text Mode)', allowDiagrams: false },
  { id: 'morty', name: 'Morty-Inspired 🧢', icon: '🧢', description: 'Kind-hearted & encouraging teenager (Text Mode)', allowDiagrams: false }
];
