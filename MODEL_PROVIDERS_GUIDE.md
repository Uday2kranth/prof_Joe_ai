# 🌐 ChatterBot Model Pickers & Provider Architecture

## 1. 🎛️ Model Picker & UI Capabilities Matrix

In the ChatterBot application interface, the model selection system is composed of two synchronized controls in the top header drawer:
1. **Provider Selector (`#provider-select`)**: Switches between 12 distinct cloud API providers or keyless free gateways.
2. **Model Selector (`#model-select`)**: Dynamically populates available model options based on the active provider.

### 🏷️ Special Capability Indicators & Flags:
* **`[WS]` (Web Search Engine RAG)**: Indicates models supported with real-time Google search snippet injection for grounded citations (`webSearch: true`).
* **`Image` / `multimodal: true`**: Supports image attachment, OCR, and vision processing (`#img-upload-trigger`).
* **`Audio` / `voice: true`**: Supports speech audio file upload, voice analysis, and text-to-speech rendering (`#audio-upload-btn`).
* **`preferredVision: true`**: Automatically activates the multimodal image upload preview bar when selected.
* **`preferredVoice: true`**: Automatically enables audio recording and voice playback controls when selected.

---

## 2. ⚡ Provider Endpoints & Authentication Protocols

| Provider ID | Provider Name | Backend API Endpoint | Authentication Header | Key Requirement / Mode |
| :--- | :--- | :--- | :--- | :--- |
| `ollama` | **Ollama Cloud** | `https://ollama.com/api/chat` | `x-user-ollama-key` | Free Cloud & Local |
| `openrouter` | **OpenRouter** | `https://openrouter.ai/api/v1/chat/completions` | `x-user-openrouter-key` | Free Models Available |
| `nvidia` | **NVIDIA NIM Gateway** | `https://integrate.api.nvidia.com/v1/chat/completions` | `x-user-nvidia-key` | Keyed API |
| `omnirouter` | **OmniRouter** | `https://api.omnirouter.io/v1/chat/completions` | `x-user-omnirouter-key` | Enterprise Multi-LLM |
| `mistral` | **Mistral AI** | `https://api.mistral.ai/v1/chat/completions` | `x-user-mistral-key` | Keyed API |
| `cerebras` | **Cerebras Cloud** | `https://api.cerebras.ai/v1/chat/completions` | `x-user-cerebras-key` | Ultra-Fast Hardware |
| `groq` | **Groq Cloud** | `https://api.groq.com/openai/v1/chat/completions` | `x-user-groq-key` | High-Throughput LPU |
| `sambanova` | **SambaNova Cloud** | `https://api.sambanova.ai/v1/chat/completions` | `x-user-sambanova-key` | Reconfigurable Dataflow |
| `gemini` | **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | `x-user-gemini-key` | Keyed (Multimodal/Voice) |
| `nararouter` | **NaraRouter API** | `https://router.bynara.id/v1/chat/completions` | `x-user-nararouter-key` | Free Router |
| `huggingface` | **Hugging Face Hub** | `https://router.huggingface.co/v1/chat/completions` | `x-user-huggingface-key` | Open Source Hub |
| `pollinations-keyless` | **Pollinations (Free)** | `https://gen.pollinations.ai/v1/chat/completions` | `x-pollinations-subtype: keyless` | **100% Free & Keyless** |
| `pollinations-keyed` | **Pollinations (Keyed)** | `https://gen.pollinations.ai/v1/chat/completions` | `x-user-pollinations-key` | Optional Extended Tier |

---

## 3. 📋 Master Registry of Providers & Models (Copyable Code)

```javascript
const PROVIDER_MODELS = {
  // 1. Ollama Cloud
  ollama: [
    { value: "gpt-oss:120b", name: "GPT-OSS 120B (Free Cloud)", webSearch: false, multimodal: false, voice: false },
    { value: "gemma4:31b", name: "Gemma 4 31B (Free Cloud)", webSearch: false, multimodal: true, preferredVision: true },
    { value: "gpt-oss:20b", name: "GPT-OSS 20B (Free Cloud)", webSearch: false, multimodal: false, voice: false },
    { value: "nemotron-3-nano:30b", name: "Nemotron 3 Nano 30B (Free Cloud)", webSearch: false, multimodal: false },
    { value: "nemotron-3-super", name: "Nemotron 3 Super 120B (Free Cloud)", webSearch: false, multimodal: false },
    { value: "nemotron-3-ultra", name: "Nemotron 3 Ultra 550B (Free Cloud)", webSearch: false, multimodal: false }
  ],

  // 2. OpenRouter
  openrouter: [
    { value: "openrouter/free", name: "Free Automated Router [WS]", webSearch: true, multimodal: false },
    { value: "nvidia/nemotron-3-ultra:free", name: "Nemotron 3 Ultra (Frontier Logic) [WS]", webSearch: true },
    { value: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super (Math/Logic) [WS]", webSearch: true },
    { value: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B (Low-Latency)", webSearch: false },
    { value: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B (Sub-Agent)", webSearch: false },
    { value: "poolside/laguna-m.1:free", name: "Laguna M.1 (Coding Agent)", webSearch: false },
    { value: "poolside/laguna-xs-2.1:free", name: "Laguna XS 2.1 (Coding)", webSearch: false },
    { value: "cohere/north-mini-code:free", name: "North Mini Code (Low-Latency)", webSearch: false },
    { value: "qwen/qwen3-coder:free", name: "Qwen 3 Coder (Repo-Scale)", webSearch: false },
    { value: "google/gemma-4-31b-it:free", name: "Gemma 4 31B (OCR/Vision)", webSearch: false, multimodal: true, preferredVision: true },
    { value: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B (Visual Instruction)", webSearch: false, multimodal: true, preferredVision: true },
    { value: "nvidia/nemotron-3-nano-omni:free", name: "Nemotron 3 Nano Omni (Multimodal)", webSearch: false, multimodal: true, voice: true, preferredVision: true, preferredVoice: true }
  ],

  // 3. NVIDIA NIM Gateway
  nvidia: [
    { value: "nvidia/nemotron-3-ultra", name: "Nemotron 3 Ultra (Frontier Reasoning) [WS]", webSearch: true },
    { value: "nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super (High-Throughput Math) [WS]", webSearch: true },
    { value: "openai/gpt-oss-120b", name: "GPT-OSS 120B (Open Weights)", webSearch: false },
    { value: "qwen/qwen3-32b", name: "Qwen 3 32B (Multilingual)", webSearch: false },
    { value: "nvidia/nemotron-3-nano-30b-a3b", name: "Nemotron 3 Nano 30B (Sub-Agent)", webSearch: false },
    { value: "poolside/laguna-m.1", name: "Laguna M.1 (Coding Agent)", webSearch: false },
    { value: "poolside/laguna-xs-2.1", name: "Laguna XS 2.1 (Developer)", webSearch: false },
    { value: "cohere/north-mini-code", name: "North Mini Code (Terminal/CLI)", webSearch: false },
    { value: "google/gemma-4-31b-it", name: "Gemma 4 31B (OCR/Layout)", webSearch: false, multimodal: true, preferredVision: true },
    { value: "nvidia/nemotron-3-nano-omni", name: "Nemotron 3 Nano Omni (Multimodal)", webSearch: false, multimodal: true, voice: true, preferredVision: true, preferredVoice: true }
  ],

  // 4. Google Gemini
  gemini: [
    { value: "gemini-3.6-flash", name: "Gemini 3.6 Flash [WS]", webSearch: true, multimodal: true, voice: true, preferredVision: true, preferredVoice: true },
    { value: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", webSearch: false, multimodal: true, voice: true, preferredVision: true, preferredVoice: true },
    { value: "gemini-3.5-flash", name: "Gemini 3.5 Flash [WS]", webSearch: true, multimodal: true, voice: true, preferredVision: true, preferredVoice: true },
    { value: "gemma-4-31b-it", name: "Gemma 4 31B (AI Studio) [WS]", webSearch: true, multimodal: true, preferredVision: true },
    { value: "gemma-4-26b-a4b-it", name: "Gemma 4 26B (AI Studio) [WS]", webSearch: true, multimodal: true, preferredVision: true }
  ],

  // 5. Pollinations AI (Keyless Free Tier)
  'pollinations-keyless': [
    { value: "openai-fast", name: "GPT-5 Nano / GPT-OSS 20B (Free Keyless) [WS]", webSearch: true },
    { value: "openai", name: "GPT-4o Mini / OpenAI (Free Keyless) [WS]", webSearch: true },
    { value: "deepseek", name: "DeepSeek V4 Flash (Free Keyless) [WS]", webSearch: true },
    { value: "llama", name: "Meta Llama 3.3 70B (Free Keyless) [WS]", webSearch: true },
    { value: "qwen-coder", name: "Qwen3 Coder 30B (Free Keyless) [WS]", webSearch: true },
    { value: "mistral", name: "Mistral Small 4 (Free Keyless) [WS]", webSearch: true }
  ],

  // 6. Pollinations AI (Keyed Tier)
  'pollinations-keyed': [
    { value: "YoannDev90/diffusiongemma-26b-a4b-it:free", name: "DiffusionGemma 26B A4B (Keyed) [WS]", webSearch: true, multimodal: true, preferredVision: true },
    { value: "YoannDev90/llama-3.1-8b-instant:free", name: "Llama 3.1 8B Instant (Keyed) [WS]", webSearch: true },
    { value: "YoannDev90/laguna-s-2.1:free(n2)", name: "Laguna S 2.1 N2 (Keyed) [WS]", webSearch: true }
  ],

  // 7. Groq Cloud
  groq: [
    { value: "openai/gpt-oss-120b", name: "GPT-OSS 120B (Reasoning)", webSearch: false },
    { value: "openai/gpt-oss-20b", name: "GPT-OSS 20B (Reasoning)", webSearch: false },
    { value: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile [WS]", webSearch: true },
    { value: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", webSearch: false }
  ],

  // 8. SambaNova Cloud
  sambanova: [
    { value: "DeepSeek-V3.1", name: "DeepSeek V3.1", webSearch: false },
    { value: "Meta-Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Instruct [WS]", webSearch: true },
    { value: "gpt-oss-120b", name: "GPT-OSS 120B", webSearch: false },
    { value: "DeepSeek-V3.2", name: "DeepSeek V3.2", webSearch: false },
    { value: "gemma-4-31b-it", name: "Gemma 4 31B it", webSearch: false, multimodal: true, preferredVision: true }
  ],

  // 9. Mistral AI
  mistral: [
    { value: "mistral-large-latest", name: "Mistral Large [WS]", webSearch: true },
    { value: "open-mixtral-8x22b", name: "Mixtral 8x22B [WS]", webSearch: true },
    { value: "codestral-latest", name: "Codestral", webSearch: false },
    { value: "open-mistral-nemo", name: "Mistral Nemo", webSearch: false },
    { value: "pixtral-12b-2409", name: "Pixtral 12B", webSearch: false, multimodal: true, preferredVision: true }
  ],

  // 10. NaraRouter API
  nararouter: [
    { value: "mistral-large", name: "Mistral Large (Free) [WS]", webSearch: true },
    { value: "mistral-medium-3-5", name: "Mistral Medium 3.5 (Free) [WS]", webSearch: true },
    { value: "tencent-hy3", name: "Tencent Hunyuan 3 (Free)", webSearch: false }
  ],

  // 11. Hugging Face Hub
  huggingface: [
    { value: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B Instruct (HF) [WS]", webSearch: true },
    { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", name: "DeepSeek R1 Distill Qwen 32B (HF)", webSearch: false },
    { value: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B Instruct (HF) [WS]", webSearch: true },
    { value: "google/gemma-2-9b-it", name: "Gemma 2 9B (HF) [WS]", webSearch: true, multimodal: true, preferredVision: true },
    { value: "microsoft/Phi-3.5-mini-instruct", name: "Phi 3.5 Mini Instruct (HF)", webSearch: false },
    { value: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B Beta (HF)", webSearch: false }
  ],

  // 12. OmniRouter
  omnirouter: [
    { value: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B (Omni)", webSearch: false },
    { value: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Omni) [WS]", webSearch: true, multimodal: true, voice: true, preferredVision: true, preferredVoice: true },
    { value: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (Omni)", webSearch: false }
  ]
};
```
