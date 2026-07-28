# 🛡️ GLOBAL WORKFLOW & AGENT ALIGNMENT DIRECTIVES

---

## 1. 🌲 UNIVERSAL 3-TIER GIT BRANCHING & DEPLOYMENT PROTOCOL

Applicable to **ALL** project repositories and deployment platforms (Vercel, Streamlit, Hugging Face Spaces, Netlify, Render, AWS, GitHub Pages, etc.).

### 🌿 3-Tier Branching Hierarchy:
1. **`feature/<name>` or `test-<feature>`**:
   - Local experimental development and preliminary code drafting.
2. **`staging`**:
   - Staging preview deployment branch.
   - Pushed whenever code is ready for real-device testing (mobile/desktop). Generates preview URLs (Vercel Preview, Streamlit Staging, Hugging Face Space Preview).
3. **`main` (Production)**:
   - Live production release branch.
   - **STRICTLY RESTRICTED**: Merging/pushing to `main` is ONLY permitted after explicit user testing and approval on `staging`.

### 🤖 Agent Deployment Actions:
- **Automatic Branch Lifecycle Management**: Automatically handle branch creation, checkouts, and pushes without prompting for git commands.
- **Push Notification & Next Steps**: Whenever code is pushed to `staging` or `feature` branches, notify the user immediately with:
  - Branch name and commit hash.
  - Instructions/link for testing on mobile or desktop.
  - Explicit notification of the next logical step.

---

## 2. 🎯 STRICT CLARIFICATION-FIRST & ALIGNMENT GUARDRAIL

### 🛑 Zero Presumption & Anti-Premature Execution:
- **Never Assume Intent**: Never modify source code, edit markdown audit files, or alter project plans based on partial or ambiguous user prompts.
- **Clarification Priority**: If a user asks *"Can we do X?"*, *"What if we do Y?"*, or presents a loose idea/question, the agent's **VERY FIRST ACTION** must be to explain all angles/options, ask targeted clarifying follow-up questions, and ensure complete mutual understanding.
- **Explicit Approval Required**:
  - 🛑 **NO CODE EDITS** without explicit user instruction: *"Approved to implement"*.
  - 🛑 **NO MARKDOWN / AUDIT EDITS** without explicit user instruction: *"Approved to add to markdown"*.
- **Handling Multi-Part or Ambiguous Prompts**: If any part of a user's prompt is unclear or has multiple trade-offs, break down the technical options, highlight potential risks/benefits, and wait for user alignment before taking ANY action.

---

## 3. 🔑 SAFE API KEY PARSING & DYNAMIC MODEL MANAGEMENT INVARIANTS

### 🛡️ Defensive API Key Parsing
- **String Type Safety**: Never invoke `.split(',')` or `.trim()` on API key parameters without verifying or coercing `apiKey` to a string first:
  ```javascript
  const keyStr = typeof apiKey === 'string' ? apiKey : (apiKey ? String(apiKey) : '');
  if (keyStr) {
    const firstKey = keyStr.split(',')[0].trim();
    // Use firstKey...
  }
  ```
- **Fallback Guarantee**: Ensure React components (`ModelManagerTab`, `SettingsModal`, `App`) safely typecast key properties before passing them to serverless API routes.

### 🤖 Dynamic Model Management Standard (Option 2)
- **Dedicated Settings Tab**: Dynamic model catalog management must reside in a dedicated `🤖 Model Manager` workspace tab inside `SettingsModal.tsx`.
- **Serverless Fetch Proxy (`/api/models.js`)**: All live provider model queries (`/v1/models` or `/api/tags`) must pass through the backend proxy `/api/models.js` to avoid CORS issues and keep keys secure.
- **User Storage Persistence**: Custom enabled models must be saved under `chatterbot_user_models_${username}` in `localStorage` and fall back 100% cleanly to static `PROVIDERS` defaults when unset.
