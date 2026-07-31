# 🏰 Code Dungeon Comprehensive Enhancements & Preset Expansion Plan

## 📌 Executive Summary
This implementation plan outlines the granular tasks required to upgrade **Code Dungeon** (`PracticalCodeLabView.tsx`) with rich Markdown & KaTeX mathematical parsing, real-time Kroki API vector SVG diagram rendering, a global base system prompt with strict diagram hierarchy rules (ERD → PlantUML → ASCII Trees), and three new academic/coding presets (**Rust Learner**, **Rust Architect**, and **OS & Shell Command Navigator**).

---

## 🛠️ Granular Task Breakdown

### 🟢 Task 1: Integrated Markdown & KaTeX Math Renderer in Chat Panel
* **File Target**: [`src/components/PracticalCodeLabView.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/PracticalCodeLabView.tsx)
* **Goal**: Replace unparsed plain text rendering (`msg.content`) with a full Markdown + KaTeX math renderer.
* **Dependencies**: None.

- [x] **Sub-task 1.1**: Import `marked` parser and `katex` renderer into `PracticalCodeLabView.tsx`.
- [x] **Sub-task 1.2**: Implement `renderMarkdownWithMath` helper function:
  - Extract block math `$$...$$` $\rightarrow$ render with `katex.renderToString(math, { displayMode: true })`.
  - Extract inline math `$....$` $\rightarrow$ render with `katex.renderToString(math, { displayMode: false })`.
  - Parse clean markdown tables, bold text, headers, and bullet lists using `marked.parse()`.
- [x] **Sub-task 1.3**: Update assistant message bubbles in `PracticalCodeLabView.tsx` to render formatted HTML safely.

---

### 🟢 Task 2: Kroki API Real-Time ERD & PlantUML Diagram Engine in Chat
* **File Target**: [`src/components/PracticalCodeLabView.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/PracticalCodeLabView.tsx)
* **Goal**: Render `erd`, `plantuml`, `d2`, `c4plantuml`, and `graphviz` code blocks as real-time interactive vector SVG diagrams inside chat message bubbles.
* **Dependencies**: **Connected to Task 1** (requires Markdown/HTML message structure).

- [x] **Sub-task 2.1**: Import `fetchKrokiSvg` from `../services/krokiService`.
- [x] **Sub-task 2.2**: Implement dynamic diagram detector regex to identify `erd`, `plantuml`, `d2`, `c4plantuml`, and `graphviz` code blocks in incoming messages.
- [x] **Sub-task 2.3**: Asynchronously fetch vector SVG markup from Kroki API and inject into the rendered chat message bubble.
- [x] **Sub-task 2.4**: Append a short CTA message beneath every rendered SVG diagram:
  > `📊 Diagram generated via Kroki. Check this diagram out in Diagram Studio for full editing.`
- [x] **Sub-task 2.5**: Ensure raw source files (`.erd`, `.puml`) continue to extract cleanly into IDE code tabs for editing and **ZIP** bundle export without conflicts.

---

### 🟢 Task 3: Code Dungeon Global Base System Instruction & Diagram Rules
* **File Target**: [`src/components/PracticalCodeLabView.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/PracticalCodeLabView.tsx)
* **Goal**: Define a master system prompt attached to all queries in Code Dungeon.
* **Dependencies**: **Connected to Task 2** (requires Kroki engine integration).

- [x] **Sub-task 3.1**: Define `CODE_DUNGEON_BASE_SYSTEM_PROMPT` constant in `PracticalCodeLabView.tsx`.
- [x] **Sub-task 3.2**: Enforce direct, concise technical answers without essay filler or long conversational fluff.
- [x] **Sub-task 3.3**: Enforce strict Diagram Preference Hierarchy:
  1. **Primary**: ERD (Entity-Relationship Diagrams) for database schemas and component relationships.
  2. **Fallback 1**: PlantUML Diagrams.
  3. **Fallback 2**: ASCII File Trees (`text` or `tree` blocks).
  4. *(Strict Rule: Never output `mermaid` diagrams)*.
- [x] **Sub-task 3.4**: Enforce code block filename annotations (` ```language filename: path/to/file.ext `).
- [x] **Sub-task 3.5**: Concatenate base system prompt with active Preset system instructions when transmitting prompts to the AI provider.

---

### 🟢 Task 4: Add New Preset — Rust Learner & Pathfinder 🦀
* **File Target**: [`src/components/CodeLabPresetDrawer.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/CodeLabPresetDrawer.tsx)
* **Goal**: Add a dedicated beginner preset for learning Rust fundamentals.
* **Dependencies**: None.

- [x] **Sub-task 4.1**: Add `rust_learner` preset definition to `ACADEMIC_PRESETS` array.
- [x] **Sub-task 4.2**: Configure preset properties:
  - **ID**: `rust_learner`
  - **Name**: `Rust Learner & Pathfinder 🦀`
  - **Badge**: `RUST & CARGO`
  - **Icon**: `Terminal`
  - **Libraries**: `Cargo`, `Ownership`, `Borrow Checker`, `Traits`, `Option/Result`, `Pattern Matching`
  - **System Instruction**: Teaches memory ownership, borrowing rules, lifetimes, pattern matching, `Option`/`Result`, and Cargo project structures step-by-step with beginner-friendly mental models.

---

### 🟢 Task 5: Add New Preset — Rust Code Architect & Explainer 🦀
* **File Target**: [`src/components/CodeLabPresetDrawer.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/CodeLabPresetDrawer.tsx)
* **Goal**: Add an advanced preset for deep Rust architecture breakdown and production code generation.
* **Dependencies**: **Connected to Task 4** (shares Rust ecosystem domain).

- [x] **Sub-task 5.1**: Add `rust_architect` preset definition to `ACADEMIC_PRESETS` array.
- [x] **Sub-task 5.2**: Configure preset properties:
  - **ID**: `rust_architect`
  - **Name**: `Rust Code Architect & Explainer 🦀`
  - **Badge**: `SYSTEMS ARCHITECTURE`
  - **Icon**: `Cpu`
  - **Libraries**: `Tokio`, `Serde`, `Anyhow`, `Unsafe Rust`, `Concurrency`, `Rayon`
  - **System Instruction**: Deep Rust code analysis, zero-cost abstractions, lifetime debugging, async `tokio` runtime, unsafe Rust safety checks, AND provides full production-ready runnable Rust files when requested.

---

### 🟢 Task 6: Add New Preset — OS & Shell Command Navigator 💻
* **File Target**: [`src/components/CodeLabPresetDrawer.tsx`](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/prof-joe-ai/src/components/CodeLabPresetDrawer.tsx)
* **Goal**: Add a specialized preset for Windows PowerShell, Linux Bash, and macOS terminal commands.
* **Dependencies**: **Connected to Task 3** (leverages global system prompt structure).

- [x] **Sub-task 6.1**: Add `shell_commands` preset definition to `ACADEMIC_PRESETS` array.
- [x] **Sub-task 6.2**: Configure preset properties:
  - **ID**: `shell_commands`
  - **Name**: `OS & Shell Command Navigator 💻`
  - **Badge**: `BASH & POWERSHELL`
  - **Icon**: `Terminal`
  - **Libraries**: `Bash`, `PowerShell 7`, `Zsh`, `Windows CMD`, `Linux CLI`, `macOS Terminal`
  - **System Instruction**: Teaches practical everyday and advanced terminal commands. Includes explicit **OS Clarification Protocol**: If a prompt is ambiguous about the target environment, it asks the user for their specific OS (Windows, Linux, macOS) and shell version before providing exact, version-accurate commands.

---

### 🟢 Task 7: Build Verification & End-to-End Testing
* **Goal**: Ensure clean TypeScript compilation and verify runtime functionality across all updated components.
* **Dependencies**: **Connected to Tasks 1 through 6**.

- [x] **Sub-task 7.1**: Run `npm run build` to verify zero TypeScript errors and a clean Vite build bundle.
- [x] **Sub-task 7.2**: Verify KaTeX math equation rendering in chat bubbles.
- [x] **Sub-task 7.3**: Verify Kroki API ERD SVG rendering and CTA link in chat bubbles.
- [x] **Sub-task 7.4**: Verify selection and system prompt execution for all 3 new presets (`rust_learner`, `rust_architect`, `shell_commands`).
- [x] **Sub-task 7.5**: Confirm mobile responsive layout and tab toggling function cleanly with zero regressions.

---

## 🔍 Verification Commands
```bash
# Build verification
npm run build
```
