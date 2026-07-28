# 🛰️ Cloud Architecture, UI Component & Feature Tracker (`secrets/tracker.md`)

This document maintains complete architectural context for all cloud storage synchronization, API key isolation, UI component design systems, AI provider integrations, and git deployment protocols in `prof-joe-ai`.

---

## 🗄️ 1. MongoDB Collections & Data Schema

| Collection Name | Key / Query Identifier | Description & Payload Schema |
| :--- | :--- | :--- |
| `user_chat_sessions` | `{ username }` | Stores isolated chat histories per user.<br>`{ username: string, sessions: ChatSession[], updatedAt: Date }` |
| `user_api_keys` | `{ username }` | Stores encrypted/isolated user API keys.<br>`{ username: string, keys: UserKeys, updatedAt: Date }` |
| `active_device_tokens` | `{ username }` | Single-device login token enforcement (non-admin roles).<br>`{ username: string, token: string, role: string, lastActive: Date }` |

---

## 🔒 2. Security & Key Isolation Rules

1. **Strict Account Isolation**:
   * Local storage keys are scoped per user: `chatterbot_user_keys_${currentUser}` and `chatterbot_sessions_${currentUser}`.
   * User A never sees User B's keys or chat sessions.

2. **Admin-Only Fallback Protocol**:
   * Server environment variables (`process.env.OPENROUTER_API_KEY`, `process.env.GEMINI_API_KEY`, etc.) are **strictly restricted to `Admin@uday` ONLY**.
   * Non-admin roles (`student`, `guest_student`, `guest`) must supply their own API keys in Settings (⚙️) or use Keyless Free providers.

3. **`isCloudSessionsLoaded` Guard Lock**:
   * Prevents local initial default states from overwriting MongoDB cloud history on initial load.

---

## 🤖 3. Registered AI Model Providers

| Provider Name | Identifier | Keyless / Keyed | Rate Limits / Notes |
| :--- | :--- | :--- | :--- |
| **Pollinations AI (Free)** | `pollinations-keyless` | Keyless (Free) | Unlimited free keyless router (`openai-fast`, `deepseek`, `mistral`, etc.) |
| **Pollinations AI (Keyed)** | `pollinations-keyed` | Keyed (Priority) | Unlocks user-supplied priority Pollinations API key (`POLLINATIONS_API_KEY`) |
| **HuggingFace** | `huggingface` | Free / Keyed | Free server fallback key included |
| **OpenCode AI** | `opencode` | Keyed (User Billing) | User billing tier models: `deepseek-v4-flash-free`, `laguna-s-2.1-free`, `ling-3.0-flash-free`, `mimo-v2.5-free`, `nemotron-3-ultra-free`, `north-mini-code-free` |
| **OpenRouter** | `openrouter` | Keyed | User-supplied key or Admin fallback |
| **Google Gemini** | `gemini` | Keyed | User-supplied key or Admin fallback |
| **Groq AI** | `groq` | Keyed | User-supplied key or Admin fallback |
| **Nvidia AI** | `nvidia` | Keyed | User-supplied key or Admin fallback |
| **Cerebras AI** | `cerebras` | Keyed | User-supplied key or Admin fallback |
| **Sambanova AI** | `sambanova` | Keyed | User-supplied key or Admin fallback |
| **Mistral AI** | `mistral` | Keyed | User-supplied key or Admin fallback |
| **NaraRouter** | `nararouter` | Keyed | User-supplied key or Admin fallback |
| **Ollama Local** | `ollama` | Local / Cloud | Local endpoint or Cloud key |

---

## 🎨 4. Modern UI Component Integrations & Design System

### 1. **Custom Dark Glassmorphic Provider & Model Dropdowns (`src/components/ChatWindow.tsx`, `src/components/FunPersonaChatView.tsx` & `src/index.css`)**
* **Replaced Native `<select>`**: Completely removed native OS browser unstyled dropdown popups across all views.
* **Glassmorphic Floating Popover**: Floating menu with `background: rgba(15, 23, 42, 0.96)`, `backdrop-filter: blur(20px)`, neon cyan borders, section headers (`AI PROVIDERS` & `{PROVIDER_NAME} MODELS`), checkmark highlights (✓), smooth hover transitions, and outside click listeners.

### 2. **KokonutUI Header Navigation Toolbar (`src/components/Toolbar.tsx` & `src/components/Header.tsx`)**
* **Source / Inspiration**: KokonutUI Figma-Inspired Spring Toolbar (`@kokonutui/toolbar`).
* **Desktop View ($> 768\text{px}$)**: Positioned at the **FAR RIGHT CORNER** of the top header bar (`margin-left: auto`).
* **Mobile View ($\le 768\text{px}$)**: Dedicated **Two-Row Stack Layout** (Row 1 has branding, Row 2 has 100% full-width touch-scrollable navigation bar).

### 3. **KokonutUI Exam Mode Dock (`src/components/ChatWindow.tsx`)**
* Dark glass capsule pill dock holding exam modes (`⚡ Auto`, `📄 12 Marks`, `☑️ 3-4 Marks`, `💬 General`).
* Positioned on the left side above the input textarea on the exact same horizontal row as the `🌐 RAG OFF / ON` button.

### 4. **Far-Right RAG Web Search Button (`src/components/ChatWindow.tsx`)**
* Anchored at the absolute far-right corner above the input textarea (`flex-wrap: nowrap; margin-left: auto`).

### 5. **KokonutUI Message Action Capsule Docks (`src/components/MessageItem.tsx`)**
* Individual chat bubble action buttons converted into animated glass capsule docks (`Copy`, `Download`, `Preview`, `Print`, `Listen`, `Edit`, `Retry`).
* Uses GPU max-width expansion on hover.

### 6. **Spinning Prof. Joe Dog Avatar (`src/components/Header.tsx`)**
* Animated Prof. Joe dog icon (`/joe-avatar.png`) with interactive click-to-spin toggle (`spin 1.2s linear infinite`).

---

## 🎭 5. Character Persona Prompt Pack & Isolation Architecture (`secrets/personas.md`)

The application supports 6 customizable AI character personas alongside the default academic engine:

1. 🍺 **Peter-Inspired** (`peter`): Sitcom dad analogies & childlike enthusiasm.
2. 👶 **Stewie-Inspired** (`stewie`): Sophisticated child genius & dry wit.
3. 🧪 **Rick-Inspired** (`rick`): Eccentric super-genius scientist.
4. 🧢 **Morty-Inspired** (`morty`): Relatable, encouraging teenager.
5. 🐶 **Courage-Inspired** (`courage`): Timid, loyal, protective step-by-step solver.
6. 🖥️ **Courage's Computer** (`computer`): Diagnostic expert, analytical, dry British wit.

### 🔒 Strict Persona Isolation & Memory Filtering Architecture
1. **Explicit Enable / Disable Toggle (`FunPersonaChatView.tsx`)**: Header pill toggle allowing users to instantly switch between `🎭 Personas ACTIVE` and `⏹️ Personas DISABLED`.
2. **Automated Main Chat View Guard (`App.tsx`)**: When navigating to Main Chat (`activeView === 'chat'`), the system unconditionally forces `effectivePersona = 'default'`. Main Chat is 100% immune to persona prompt bleed.
3. **One-Way Memory Payload Filter (`App.tsx`)**:
   * Messages generated during persona interactions are tagged (`personaTag`).
   * Main Chat & Exam Evaluators filter out persona-tagged messages, ensuring Osmania University Exam evaluations remain 100% clean and unpolluted.
   * Personas retain full history access in Personas View, allowing characters (e.g. Rick) to naturally reference study context when asked.

### 📊 Diagram Generation Policy
* **Enabled Modes**: Default Academic Engine, `computer` (Courage's Computer), and `courage` (Courage-Inspired).
* **Disabled Modes**: `peter`, `stewie`, `rick`, and `morty` focus strictly on text explanations without generating Kroki diagrams.

---

## 🌿 6. 3-Tier Git Branching & Deployment Protocol

* **Remote Repository**: `https://github.com/Uday2kranth/prof_Joe_ai.git`

### 🌿 Branch Hierarchy:
1. `feature/<name>` / `test-<feature>`: Local experimental development.
2. `staging`: Staging preview deployment branch (pushed for device testing).
3. `main`: Live production release branch (merged strictly from `staging` after approval).

### 🤖 Automatic Deployment Protocol:
* When code changes are verified locally, commits are automatically pushed to `staging` and merged/pushed to `main`.

---

## 📜 7. Audit Log Index (`changes/`)

| Audit Log File | Date | Description & Key Components |
| :--- | :--- | :--- |
| [`changes/mobile_and_pc_prompt_mode_buttons_clipping_fix.md`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/changes/mobile_and_pc_prompt_mode_buttons_clipping_fix.md) | 2026-07-28 | Fixed prompt mode buttons (`Auto`, `12 Marks`, `3-4 Marks`, `General`) edge clipping across Mobile and PC viewports. |
| [`changes/kroki_diagram_studio_and_multi_format_export.md`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/changes/kroki_diagram_studio_and_multi_format_export.md) | 2026-07-29 | Overhauled Kroki Studio with 2-column PC grid, mobile 100% SVG scaling, and 1-click High-DPI canvas exports for SVG, PNG, and JPEG. |
| [`changes/exam_prep_dropdown_and_gagan_topics_replication.md`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/changes/exam_prep_dropdown_and_gagan_topics_replication.md) | 2026-07-29 | Fixed Exam Prep paper selector dropdown positioning, and replicated Gagan's High-Yield Topics per subject for Sentiment Analysis & Web Mining. |

