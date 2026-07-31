# 🎨 Section-by-Section Light Theme Audit & Fix Master Plan

> **Location:** `implementing plans/about to be done/light-theme-section-by-section-audit-and-fix-plan.md`  
> **Goal:** Perform a systematic, section-by-section audit and remediation of Light Mode styling across the entire Prof. Joe AI application to ensure 100% visual consistency, crisp button outlines, harmonious glassmorphism, and zero dark artifacts in Light Mode.  
> **Status:** 🟡 **AWAITING USER ALIGNMENT & SECTION EXECUTION**

---

## 🛡️ STRICT API & BACKEND ISOLATION GUARDRAILS (CRITICAL)

> [!CAUTION]
> **ZERO BACKEND & API TOUCH PROTOCOL**
> 1. **DO NOT MODIFY** any server backend files (`api/chat.js`, `api/models.js`, `api/login.js`, `local-server.js`).
> 2. **DO NOT MODIFY** any API service data structures, header keys, or fetch parameters (`src/services/apiService.ts`).
> 3. **ALL EDITS ARE STRICTLY UI & CSS ONLY**: Only modify CSS rules (`src/index.css`), global CSS variables (`:root[data-theme="light"]`), and visual component styling/class names in JSX files.
> 4. **ZERO GIT PUSH**: All edits stay local for real-device testing until explicit user approval.

---

## 💡 STRATEGY & ANSWERS TO USER QUESTIONS

### Q1: Should we "Audit + Fix Section-by-Section" or "Audit All Sections First then Fix"?
- **Recommended Approach:** **Audit + Fix Section-by-Section**.
- **Why**: Auditing and fixing one workspace at a time allows us to inspect the live surface in the browser, eliminate every hardcoded dark style immediately, verify it under Light Mode, and guarantee 100% perfection before moving to the next surface. This prevents compounding visual regressions.

### Q2: Should I include `/impeccable` and `/full-autonomy` in the prompts?
- **Yes, Absolutely!**
  - `/impeccable` invokes top-tier design director standards (crisp hierarchy, cyan glass outlines, porcelain light backgrounds, zero eye fatigue).
  - `/full-autonomy` gives full agent autonomy to interact with the live browser, toggle Light Mode, verify element states, and capture screenshots without stopping for trivial confirmations.

---

## 🔄 REUSABLE DYNAMIC SECTION PROMPT TEMPLATE

Whenever you want to audit and fix a specific section, copy and paste this exact prompt template with the target section name:

```text
/full-autonomy /impeccable Please perform a Light Mode audit and fix for the [TARGET SECTION NAME] section according to the master plan at "implementing plans/about to be done/light-theme-section-by-section-audit-and-fix-plan.md". 

Instructions:
1. Open the browser to http://localhost:3000 and switch to Light Mode.
2. Navigate to [TARGET SECTION NAME].
3. Inspect every panel, button, border, card background, input field, hover state, and modal in this section.
4. Identify any hardcoded dark inline styles or dark outlines that do not match our signature Cyan & Porcelain Light Theme.
5. Replace hardcoded inline colors with theme CSS variables and clean [data-theme="light"] CSS rules.
6. Verify in the browser that [TARGET SECTION NAME] is 100% consistent with light mode, with zero dark artifacts and crisp cyan/blue button outlines.
7. Do NOT touch any API or backend code.
```

---

## 🗺️ SECTION AUDIT & FIX ROADMAP

### 📍 Section 1: Main Chat Workspace & Message Flow
- **Target Component:** `src/components/ChatWindow.tsx`, `src/components/ChatMessage.tsx`, `src/components/InputArea.tsx`
- **Audit Focus:**
  - Student prompt bubbles (`.user-bubble`) & Assistant AI response cards (`.assistant-bubble`).
  - Bottom input bar background, textarea, attachment buttons, send button.
  - Persona selector dropdowns & mode toggle pills (12 Marks / 2 Marks / General).
  - Web search toggle pill & Kroki diagram preview cards.

---

### 📍 Section 2: Practical Academic Code Lab & Split IDE
- **Target Component:** `src/components/PracticalCodeLabView.tsx`, `src/components/CodeLabControlDeck.tsx`
- **Audit Focus:**
  - Left chat panel empty state, prompt bubbles & preset quick buttons.
  - Right IDE code viewer canvas (`.code-lab-editor-area`, `.code-lab-ide-panel`).
  - File tab bar (`.code-lab-tab-item`, `.code-lab-tab-item.active`).
  - Action buttons (`Copy`, `Download file`, `Download All .zip`).
  - Fast Preview vs Full IDE toggle pill.
  - Control Deck sidebar drawer (`CodeLabControlDeck.tsx`).

---

### 📍 Section 3: Diagram Studio & Kroki Workspace
- **Target Component:** `src/components/DiagramStudioView.tsx`, `src/components/KrokiDiagramModal.tsx`
- **Audit Focus:**
  - Diagram canvas background (ensure light white/porcelain canvas).
  - Code editor panel & syntax preview.
  - Export action buttons (SVG / PNG / Copy Mermaid code).
  - Template preset gallery cards & search input.

---

### 📍 Section 4: Exam Prep & Practice Test Hub
- **Target Component:** `src/components/ExamPrepView.tsx`
- **Audit Focus:**
  - Subject selector cards & Osmania syllabus module list.
  - Practice test question cards & option radio buttons.
  - Answer evaluation score badges & detailed explanation cards.
  - Timer pill & test progress bar.

---

### 📍 Section 5: Physics & Visual Simulations Lab
- **Target Component:** `src/components/PhysicsPlaygroundView.tsx`
- **Audit Focus:**
  - Interactive Canvas simulation view (ensure light/white background).
  - Physics parameter control panel (mass, gravity, friction sliders).
  - Simulation preset selection cards & play/pause control buttons.

---

### 📍 Section 6: Settings, Model Manager & API Credentials Modal
- **Target Component:** `src/components/SettingsModal.tsx`, `src/components/ModelManagerTab.tsx`
- **Audit Focus:**
  - Modal container overlay (`.modal-backdrop`, `.settings-modal-card`).
  - Credentials tab & API key input fields (ensure light background & dark text).
  - Model Manager provider selection dropdown & Fetch Models button.
  - Model checklist items (`.model-checkbox-card`) & filter pills.

---

### 📍 Section 7: Document & Paper OCR Extractor Studio
- **Target Component:** `src/components/ExtractorStudioView.tsx`, `src/components/QuickExtractionModal.tsx`
- **Audit Focus:**
  - File upload drag-and-drop zone (`.extractor-dropzone`).
  - PDF/Image preview pane & page pagination controls.
  - Extracted text result editor & copy/send-to-chat action buttons.

---

### 📍 Section 8: Main Navigation Headers, Dock & Drawers
- **Target Component:** `src/components/Header.tsx`, `src/components/DemoLandingHub.tsx`, `src/components/Sidebar.tsx`
- **Audit Focus:**
  - Top header action buttons (`Classic View`, `🔑 Settings`, Moon/Sun Theme Toggle, User Profile Avatar).
  - App mode view switcher & active view title badge.
  - Bottom KokonutUI animated toolbar dock & tab icons.
  - Collapsible sidebar drawer container & navigation link items.

---

## 🧪 VERIFICATION CHECKLIST PER SECTION

For every section completed:
1. [ ] **Light Mode Active**: Toggle theme to Light (`[data-theme="light"]`).
2. [ ] **No Black Boxes**: Zero hardcoded dark slate (`#0f172a` / `#020617`) background patches.
3. [ ] **Signature Outlines**: Header and action buttons feature cyan/blue borders (`border: 1px solid rgba(6, 182, 212, 0.4)`).
4. [ ] **High Contrast Text**: All labels, tabs, and messages are dark slate (`#0f172a` / `#334155`) with 100% legibility.
5. [ ] **Build Check**: Run `npm run build` to confirm zero TypeScript / Vite compilation errors.
6. [ ] **API Protection**: Verify backend chat & API keys function with 0 modifications.
