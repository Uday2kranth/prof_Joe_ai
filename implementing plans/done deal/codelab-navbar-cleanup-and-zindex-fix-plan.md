# 🎨 Code Lab Navigation Clean-up & Control Deck Sidebar Z-Index Fix Plan

> **Project:** Prof. Joe AI — Osmania Exam Mentor  
> **Surface:** Practical Academic Code Lab (`src/components/PracticalCodeLabView.tsx` & `src/components/CodeLabControlDeck.tsx`)  
> **Author:** Uday2kranth  
> **Date:** 2026-07-31  
> **Status:** ✅ **COMPLETED & DEPLOYED (DONE DEAL)**

---

## 📌 Architectural Overview

1. **Remove Inner Redundant `← Home Hub` Button**:
   - In `PracticalCodeLabView.tsx`, remove the inner sub-header `← Home Hub` button located next to `☰` hamburger button.
   - Preserves the global header's top-left `🏠 Home Hub` button as the single primary navigation action.

2. **Control Deck Sidebar Z-Index & Overlay Elevation**:
   - In `CodeLabControlDeck.tsx`, elevate container `zIndex` to `1500` and backdrop to `1400` so the sidebar drawer and backdrop sit completely above the global top app header (`CODE_LAB WORKSPACE`, `Home Hub`, etc.).
   - Eliminates text overlap and background header bleeding when the Control Deck sidebar is opened.

---

## 📋 Task Checklist

- [x] **Task 1: Remove Redundant Inner `← Home Hub` Button (`src/components/PracticalCodeLabView.tsx`)**  
  - Remove inner `← Home Hub` button adjacent to `☰` hamburger button.
  - Clean up unused `ArrowLeft` icon import if no longer needed elsewhere in component.

- [x] **Task 2: Elevate Control Deck Sidebar Z-Index & Overlay (`src/components/CodeLabControlDeck.tsx`)**  
  - Update backdrop `zIndex` to `1400` and sidebar container `zIndex` to `1500`.
  - Ensure solid background `rgba(2, 6, 23, 0.98)` with crisp backdrop blur `16px` to prevent background header bleed-through.

- [x] **Task 3: Production Build, Verification, & Staging Push (`npm run build`)**  
  - Run `npm run build` and ensure 0 compilation errors.
  - Push changes to `staging` branch per protocol.

---

## 🐾 Reference Note

> *"The things I do for love!"* — Courage, the Cowardly Dog 🐾  
> Moved to `implementing plans/done deal/codelab-navbar-cleanup-and-zindex-fix-plan.md`
