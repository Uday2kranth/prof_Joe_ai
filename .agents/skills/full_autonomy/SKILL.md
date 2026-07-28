---
name: full-autonomy
description: Fully autonomous hands-free execution mode. Pre-authorizes terminal commands, browser subagents, JS script evaluation, self-healing debugging, git staging pushes, change audit logging, and Impeccable design polish loops.
version: 1.0.0
---

# 🤖 Full Autonomy Skill: Hands-Free Execution Protocol

When this skill is invoked (`/full-autonomy` or `@full-autonomy`), the AI agent operates under **100% pre-approved autonomous authority**. The agent will execute tasks completely hands-free from start to finish without pausing to ask the user for permission.

---

## 🛡️ Master 9-Point Pre-Approved Authorization Directives

### 1. JS Script Evaluation & Browser DevTools (`chrome-devtools-mcp`)
* **100% Pre-Approved**: Authorized to run `evaluate_script`, inspect browser console logs (`get_console_message`), monitor network requests (`get_network_request`), and execute DOM interactions (`click`, `type_text`, `fill_form`, `wait_for`) hands-free.

### 2. Autonomous Visual & Layout Control (`browser_subagent`)
* **100% Pre-Approved**: Authorized to spin up subagent browser instances, interact with live UI elements, toggle viewports, capture proof screenshots, and record WebP video walkthroughs.

### 3. Dual Viewport Iterative Testing (PC & Mobile)
* **Mandatory Requirement**: Must iteratively test all UI changes across both:
  * **Desktop PC Viewport**: 1920x1080 (with sidebar open and collapsed).
  * **Mobile Touch Viewport**: 430x932 (verifying 0 button clipping or text truncation).

### 4. Terminal Commands & Task Management (`run_command`, `manage_task`)
* **100% Pre-Approved**: Authorized to run compilers (`npm run build`), linters, dev servers (`npx vite`), background processes, and git staging commands without user prompt.

### 5. File System Modifications (`write_to_file`, `replace_file_content`, `multi_replace_file_content`)
* **100% Pre-Approved**: Authorized to create new files, refactor existing code, and update styles (`.tsx`, `.ts`, `.css`, `.js`, `.json`, `.md`) within the workspace.

### 6. Self-Healing & Automated Debugging
* **100% Pre-Approved**: If a build fails or runtime tracebacks occur, the AI must read full un-truncated logs, diagnose the root cause, fix the issue, and re-test independently.

### 7. Refined Impeccable Design Audit Loop (`/impeccable`)
* **Conditional Refinement Rule**: Use `/impeccable` design rules **ONLY IF** the existing design is bland, unpolished, or can be meaningfully improved. If already top quality, do not change it unnecessarily.
* **Post-Feature Design Audit Loop**: After verifying basic working functionality, run an Impeccable Design Audit to inspect all modified buttons/sections, generate design pointers, and execute visual refinements.

### 8. Change Audit Logging (`changes/` Directory)
* **Automatic Mandatory Rule**: Automatically write a detailed log in `changes/<feature_name>.md` detailing file paths, line numbers, modified functions, before/after logic, and test results.

### 9. Git Deployment Guardrails
* 🛑 **`main` Branch**: NEVER push to `main` under any circumstances.
* 🌿 **`staging` Branch**: Authorized to commit & push to `origin/staging` when all tests pass.
* 💻 **Local**: Keep changes local if tests fail.
