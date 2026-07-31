# 🎨 Practical Academic Code Lab — Top Navigation Bar & Control Deck Refactor Plan

> **Project:** Prof. Joe AI — Osmania Exam Mentor  
> **Surface:** Practical Academic Code Lab Navigation (`src/components/PracticalCodeLabView.tsx` & `src/components/CodeLabControlDeck.tsx`)  
> **Author:** Uday2kranth  
> **Date:** 2026-07-31  
> **Status:** ✅ **COMPLETED & DEPLOYED (DONE DEAL)**

---

## 📌 Architectural & Visual Design Overview

1. **Top Navigation Bar Restructure**:
   - **Hamburger Menu Button (`☰`)**: Insert a glassmorphic hamburger menu button on the far left of the Code Lab top bar (matching the Main Chat header). Clicking this button toggles the **Code Lab Control Deck Sidebar**.
   - **Removed Top Header Controls**:
     - ❌ **`📜 Lab History` Button**: Removed from top bar (history is accessed via `☰` hamburger menu).
     - ❌ **`🔄 Reset Session` Button**: Removed from top bar (moved inside sidebar's Command Controls).
   - **Retained Top Header Controls**:
     - `← Home Hub` button.
     - `Mode: [Preset Name]` active preset display badge.
     - Provider & Model selector dropdowns (`Ollama Cloud`, `Google Gemini`, etc.).
     - `⚡ Fast Preview / 💻 Full IDE` viewer toggle pill.
     - `🎛️ Change Lab Preset` button.

2. **Control Deck Sidebar Integration**:
   - Sidebar opened via `☰` hamburger button.
   - Houses:
     - Header: `🕒 Code Lab Deck` + Active Preset Badge + `X` Close Button.
     - `+ New [Preset Name] Session` primary gradient action button.
     - `⚡ Command Controls` (`🌐 Web Search` toggle, Active Model badge, `🔄 Reset Session Context` button triggering confirmation modal).
     - Real-time search bar `🔍 Search past [Preset] chats...`.
     - Segregated preset session cards list (with cyan left active border `3px solid #06b6d4`, message count badge, date, and `🗑️` delete icon).
     - Storage footer: `🟢 IndexedDB & MongoDB Cloud Sync Active`.

---

## 📋 Task Breakdown & Verification Checklist

- [x] **Task 1: Navigation Bar Layout Update (`src/components/PracticalCodeLabView.tsx`)**  
  - Add `☰` Hamburger Menu Icon Button next to `← Home Hub`.
  - Remove `📜 Lab History` button from top bar.
  - Remove `🔄 Reset Session` button from top bar.
  - Retain `Mode: [Preset Name]` active preset display badge.
  - Wire `☰` button to toggle `isHistoryDrawerOpen` (Code Lab Control Deck).

- [x] **Task 2: Control Deck Command Controls Audit (`src/components/CodeLabControlDeck.tsx`)**  
  - Ensure `🔄 Reset Session Context` button in sidebar opens `ResetSessionModal` warning modal cleanly.

- [x] **Task 3: Verification & Production Build (`npm run build`)**  
  - Run `npm run build` and ensure 0 compilation errors.
  - Push changes to `staging` branch per deployment protocol.

---

## 🐾 Reference Note

> *"The things I do for love!"* — Courage, the Cowardly Dog 🐾  
> Moved to `implementing plans/done deal/codelab-navbar-and-sidebar-refactor-plan.md`
