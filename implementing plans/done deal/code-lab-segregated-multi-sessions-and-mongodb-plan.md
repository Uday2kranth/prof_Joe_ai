# 🚀 Practical Academic Code Lab — Preset-Segregated Multi-Sessions & MongoDB Cloud Sync Plan

> **Project:** Prof. Joe AI — Osmania Exam Mentor  
> **Surface:** Practical Academic Code Lab (`PracticalCodeLabView.tsx` & `api/codelab-sessions.js`)  
> **Author:** Uday2kranth  
> **Date:** 2026-07-31  
> **Status:** ✅ **COMPLETED & DEPLOYED (DONE DEAL)**

---

## 📌 Architecture Overview

1. **Preset-Segregated Multi-Sessions**:
   - Each preset (`Machine Learning & Data Science`, `Web Dev`, `Data Engineering`, `DSA in C++`, `SQL & DBMS`) maintains its own collection of distinct chat sessions (`Record<string, ChatSession[]>`).
   - When switching presets, the app automatically restores the most recent session for that preset.
   - Sessions never bleed across presets or into main persona chat history.

2. **Native Code Lab Control Deck Sidebar**:
   - Framed container matching Screenshot 2 layout.
   - Container Header: `🕒 Code Lab Deck — [Preset Name]` with `X` close button.
   - `+ New [Preset Name] Session` button.
   - Command controls (`🌐 Web Search Grounding` toggle, Model badge, `🔄 Reset Active Context`).
   - Search bar `🔍 Search past [Preset] chats...`.
   - List of session cards with active cyan left border `3px solid #06b6d4`, date, message count badge, and delete trash icon `🗑️`.
   - Storage footer: `🟢 IndexedDB & MongoDB Cloud Sync Active`.

3. **Dual Storage Engine**:
   - **IndexedDB**: Local 0ms instant offline cache.
   - **MongoDB Cloud Sync**: Synchronizes all preset sessions to MongoDB collection `user_codelab_sessions` under `prof_joe_ai` database via `api/codelab-sessions.js` endpoint across logins/devices.

---

## 📋 Task Checklist

- [x] **Task 1: MongoDB Cloud Backend Endpoint (`api/codelab-sessions.js`)**  
  - Create `api/codelab-sessions.js` supporting `GET` (fetch preset sessions) and `POST` (save preset sessions) in MongoDB.
  - Update `local-server.js` to route `/api/codelab-sessions`.

- [x] **Task 2: Dual Storage Cloud Sync Service (`src/services/codelabSyncService.ts`)**  
  - Build helper combining local IndexedDB caching and async MongoDB API sync.
  - Add hydration on login / app mount.

- [x] **Task 3: Native Code Lab Control Deck Sidebar (`src/components/CodeLabControlDeck.tsx`)**  
  - Create framed sidebar component matching Screenshot 2 design aesthetics.
  - Implement search filter, session card selection, session deletion, and new session creation.

- [x] **Task 4: Preset-Segregated Multi-Session State Integration (`App.tsx` & `PracticalCodeLabView.tsx`)**  
  - Update state in `App.tsx` and `PracticalCodeLabView.tsx` to handle `Record<string, ChatSession[]>`.
  - Connect `CodeLabControlDeck` sidebar into `PracticalCodeLabView.tsx`.
  - Ensure preset switching loads the most recent session of the chosen preset.

- [x] **Task 5: End-to-End Verification & Production Build (`npm run build`)**  
  - Run `npm run build` and verify clean output.
  - Verify desktop and mobile layout rendering without clipping.

---

## 🐾 Reference Note

> *"The things I do for love!"* — Courage, the Cowardly Dog 🐾  
> Moved to `implementing plans/done deal/code-lab-segregated-multi-sessions-and-mongodb-plan.md`
