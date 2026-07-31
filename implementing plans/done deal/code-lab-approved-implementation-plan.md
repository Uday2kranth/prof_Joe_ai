# 🚀 Practical Academic Code Lab — Final Approved Implementation Plan

> **Project:** Prof. Joe AI — Osmania Exam Mentor  
> **Surface:** Practical Academic Code Lab (`PracticalCodeLabView.tsx`)  
> **Author:** Uday2kranth  
> **Date:** 2026-07-31  
> **Status:** ✅ **100% COMPLETED & VERIFIED**

---

## 📌 Approved Dual-Mode Editor Toggle Architecture

Instead of locking users into a single editor engine, the Code Lab features an in-app **Dual-Mode Editor Mode Selector**:

```
 ⚡ Fast Light Preview (Instant 0ms)  │  💻 Powerful Interactive Editor (Monaco)
─────────────────────────────────────┼────────────────────────────────────────────
 • Default for fast viewing          │ • Full interactive VS Code typing
 • 48 KB micro-payload               │ • Autocomplete, minimap & inline editing
 • 0ms lag on any phone/device       │ • Lazy-loaded ONLY when selected by user
```

**Technical implementation:** Monaco Editor (`@monaco-editor/react`) is **dynamically imported (`React.lazy`)**. Users on "Fast Light Preview" never download the 5MB Monaco payload, keeping the app lightning-fast while giving power users full VS Code editing on demand!

---

## 📋 Comprehensive Feature Checklist

- [x] **Task 1: Tab Close Button (`×`) & In-Chat `👁️ View in IDE` Action**  
  - Add hover `×` button on IDE tabs.
  - Implement active index bounds clamp.
  - Add `👁️ View in IDE` button above chat code blocks.
  - Test opening, closing, and restoring tabs.

- [x] **Task 2: Tab Bar Overflow & Scroll Controls (`<` & `>`)**  
  - Add gradient fade masks on left/right edges of tab bar.
  - Add `<` and `>` scroll buttons when tabs overflow width.
  - Test smooth scrolling across multi-tab scenarios.

- [x] **Task 3: Smart Topic-Aware File Naming Engine**  
  - Parse explicit comments `// filename: ...`
  - Parse Java class names `public class ClassName`
  - Parse prompt topic keywords (e.g. `kmeans_clustering.py`)
  - Verify download button reflects smart file names.

- [x] **Task 4: Dual-Engine Code Viewer (Toggle System)**  
  - Header mode toggle: `⚡ Fast Preview` (Highlight.js) vs `💻 Full IDE` (Monaco).
  - Lazy load Monaco Editor component via `React.lazy`.
  - Test mode switching and editing in Monaco mode.

- [x] **Task 5: Code Lab Session History Sidebar & Web Search Toggle**  
  - Add `📜 Lab History` button in Code Lab header.
  - Create sliding history drawer filtered by active preset.
  - Integrate `🌐 Web Search` toggle inside drawer controls.
  - Test session saving, reloading, and deleting.

- [x] **Task 6: Download All Files as .ZIP**  
  - Install `jszip` client-side zipper.
  - Add `📦 Download All (.zip)` button in IDE toolbar.
  - Test zipping and downloading all open files into a single `.zip` file.
  - Test downloading multi-file projects as zip.

- [x] **Task 7: Reset Session Warning Confirmation Modal**  
  - Create `ResetSessionModal.tsx` dialog component.
  - Intercept `🔄 Reset Session` click with warning modal before executing reset.
  - Test cancel and reset confirmation flows.

- [x] **Task 8: Storage Engine (`IndexedDB`)**  
  - Create `indexedDbService.ts` for browser persistent storage.
  - Store and retrieve sessions by user and preset.
  - Verify persistence across browser reloads.

---

## 🎨 Detailed Task-by-Task Design & CSS Specifications

### 1. Task 1: Tab Close Button (`×`) & In-Chat `👁️ View in IDE` Action
* **Tab Close (`×`) Styling:**
  - Placed inside `.code-lab-tab-item` right after file name text.
  - Uses Lucide `X` icon (`size={12}`).
  - Style: `display: inline-flex`, `align-items: center`, `justify-content: center`, `margin-left: 6px`, `padding: 2px`, `border-radius: 4px`, `opacity: 0.5`, `transition: all 0.15s ease`.
  - Hover state: `opacity: 1.0`, `background: rgba(239, 68, 68, 0.25)`, `color: #f87171`, `border: 1px solid rgba(239, 68, 68, 0.4)`.
* **In-Chat `👁️ View in IDE` Button Styling:**
  - Placed in message header next to `Copy` button above code blocks.
  - Uses Lucide `Eye` icon (`size={13}`).
  - Style: `background: rgba(6, 182, 212, 0.15)`, `border: 1px solid rgba(6, 182, 212, 0.4)`, `color: #38bdf8`, `font-size: 0.74rem`, `font-weight: 700`, `padding: 4px 10px`, `border-radius: 8px`, `cursor: pointer`.
  - Hover state: `background: rgba(6, 182, 212, 0.3)`, `box-shadow: 0 0 12px rgba(6, 182, 212, 0.3)`.

---

### 2. Task 2: Tab Bar Overflow & Scroll Controls (`<` & `>`)
* **Tab Bar Container Styling:**
  - Class `.code-lab-tab-bar` with `position: relative`, `overflow: hidden`.
  - Inner list `.code-lab-tabs-list` with `overflow-x: auto`, `scrollbar-width: thin`, `scroll-behavior: smooth`.
* **Gradient Edge Masks:**
  - Left fade mask: `position: absolute`, `left: 0`, `top: 0`, `bottom: 0`, `width: 24px`, `background: linear-gradient(to right, #020617, transparent)`, `pointer-events: none`, `z-index: 2`.
  - Right fade mask: `position: absolute`, `right: 48px`, `top: 0`, `bottom: 0`, `width: 24px`, `background: linear-gradient(to left, #020617, transparent)`, `pointer-events: none`, `z-index: 2`.
* **Scroll Arrows (`<` & `>`):**
  - Placed at right end of tab list. Uses Lucide `ChevronLeft` and `ChevronRight` (`size={14}`).
  - Style: `background: rgba(15, 23, 42, 0.9)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `border-radius: 8px`, `color: #94a3b8`, `padding: 4px 6px`, `cursor: pointer`.
  - Hover state: `color: #38bdf8`, `border-color: rgba(6, 182, 212, 0.4)`.

---

### 3. Task 3: Smart Topic-Aware File Naming Engine
* **Tab Label Formatting:**
  - Font: `font-family: 'Fira Code', Consolas, monospace`, `font-size: 0.78rem`, `font-weight: 600`.
  - Icon: Lucide `FileCode` (`size={13}`, color `#38bdf8`).
* **Download Button Header Display:**
  - Class `.extractor-btn-primary` (`background: linear-gradient(135deg, #06b6d4, #3b82f6)`), text color `#f8fafc`.
  - Button text: `<Download size={13} /> Download [SmartFileName]`. (e.g., `Download IrisClassifier.java` or `Download classification_kmeans.py`).

---

### 4. Task 4: Dual-Engine Code Viewer (Toggle System)
* **Header Mode Toggle Pill:**
  - Container: `display: flex`, `align-items: center`, `background: rgba(15, 23, 42, 0.9)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `border-radius: 20px`, `padding: 2px`.
  - Mode Options:
    - `⚡ Fast Preview` (`Zap` size 12)
    - `💻 Full IDE` (`Code` size 12)
  - Selected Option Style: `background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))`, `border: 1px solid #06b6d4`, `color: #38bdf8`, `border-radius: 16px`, `padding: 4px 10px`, `font-size: 0.74rem`, `font-weight: 700`, `box-shadow: 0 0 10px rgba(6, 182, 212, 0.3)`.
* **Monaco Component Directives:**
  - Theme: `vs-dark`.
  - Options: `{ automaticLayout: true, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }`.
* **Fast Preview Component Directives:**
  - Theme: Tokyo Night Dark (`#1a1b26`).
  - Gutter line numbers + Prism/Highlight syntax token colors.

---

### 5. Task 5: Code Lab Session History Sidebar & Web Search Toggle
* **Header `📜 Lab History` Button:**
  - Class `.extractor-btn-secondary`, `background: rgba(30, 41, 59, 0.8)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `color: #cbd5e1`, `font-size: 0.78rem`, `padding: 6px 12px`.
  - Hover: `border-color: rgba(6, 182, 212, 0.4)`, `color: #38bdf8`.
* **Sliding History Drawer:**
  - Matches `DemoChatHistoryDrawer.tsx` design language.
  - Position: `fixed`, `left: 0`, `top: 0`, `bottom: 0`, `width: 320px`, `background: rgba(2, 6, 23, 0.95)`, `border-right: 1px solid rgba(255, 255, 255, 0.1)`, `backdrop-filter: blur(16px)`, `z-index: 100`.
  - Active Session Card: `border-left: 3px solid #06b6d4`, `background: rgba(15, 23, 42, 0.9)`, `color: #f8fafc`.
* **Sidebar `🌐 Web Search` Toggle:**
  - Pill button inside sidebar footer: `background: rgba(15, 23, 42, 0.9)`, `border: 1px solid rgba(6, 182, 212, 0.4)`, `color: #06b6d4`, `padding: 6px 12px`, `border-radius: 12px`, `font-size: 0.78rem`, `font-weight: 700`.

---

### 6. Task 6: Download All Files as .ZIP
* **Action Toolbar Button:**
  - Secondary glass button: `.extractor-btn-secondary`, `font-size: 0.74rem`, `padding: 4px 12px`.
  - Icon: Lucide `Package` (`size={13}`).
  - Text: `Download All (.zip)`.
  - Hover state: `border-color: rgba(168, 85, 247, 0.4)`, `color: #c084fc`, `background: rgba(168, 85, 247, 0.15)`.

---

### 7. Task 7: Reset Session Warning Confirmation Modal
* **Modal Overlay:**
  - `position: fixed`, `inset: 0`, `background: rgba(2, 6, 23, 0.8)`, `backdrop-filter: blur(8px)`, `z-index: 200`, `display: flex`, `align-items: center`, `justify-content: center`.
* **Modal Body Card:**
  - `background: #0f172a`, `border: 1px solid rgba(6, 182, 212, 0.4)`, `border-radius: 16px`, `box-shadow: 0 0 30px rgba(6, 182, 212, 0.25)`, `padding: 24px`, `max-width: 420px`, `width: 90%`.
  - Header Icon: Lucide `RefreshCw` (`size={28}`, color `#38bdf8`, glowing animation).
  - Title: `font-size: 1.05rem`, `font-weight: 800`, `color: #f8fafc`.
  - Warning Text: `font-size: 0.84rem`, `color: #94a3b8`, `line-height: 1.5`.
  - Action Buttons: `Cancel` (`.extractor-btn-secondary`) + `Confirm Reset` (`.extractor-btn-primary`).

---

### 8. Task 8: Storage Engine (`IndexedDB`)
* **Service Architecture:**
  - Transparent helper module `src/services/indexedDbService.ts`.
  - Zero UI footprint; fully async read/write for session data.
  - Scoped storage keys: `user_${username}_preset_${presetId}_sessions`.

---

## 🐾 Reference Note

> *"The things I do for love!"* — Courage, the Cowardly Dog 🐾  
> Transferred to `implementing plans/done deal/code-lab-approved-implementation-plan.md`
