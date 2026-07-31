# Mobile Responsiveness & iPhone 14 Pro Max Layout Audit Master Plan

> **Project:** Prof. Joe AI — Osmania Exam Mentor  
> **Goal:** Section-by-section mobile responsiveness audit and UI optimization for mobile viewports (targeting iPhone 14 Pro Max 430px × 932px), ensuring zero horizontal scrolling, perfect button visibility, custom bento box scaling, and complete layout parity with desktop view.

---

## 🎯 Master Guidelines for Mobile Audits

1. **Viewport Targets**:
   - **Mobile Device Focus**: iPhone 14 Pro Max (`430px` width) & standard mobile (`375px` – `430px`).
   - **Desktop View Isolation**: Desktop styles (`min-width: 1025px`) must remain 100% unchanged. All mobile tweaks must be strictly scoped inside `@media (max-width: 768px)` or `@media (max-width: 480px)` CSS blocks.

2. **UI & Element Checks**:
   - **Headers & Navigation Bars**: All action buttons, dropdown pills, model pickers, and hamburger triggers must fit within `100vw` without overflowing.
   - **Sidebars & Drawers**: History drawers, bento drawers, and control decks must open smoothly within `100vw`.
   - **Bento Grids (Fun AI Personas Lounge)**: Scale down bento boxes on mobile so rows can accommodate 3 compact bento cards (desktop-style 3-column grid) cleanly.
   - **Button & Text Scaling**: Shorten verbose text (e.g., label -> icon + short label), shrink font sizes (`0.75rem`–`0.82rem`), and scale padding (`4px 8px`).

3. **Strict Constraints**:
   - 🛑 **Do NOT touch any API or backend code (`api/`, `local-server.js`)**.
   - 🛑 **Do NOT push any code to GitHub**.

---

## 📋 Section Checklist

- [ ] **Section 1**: Main Chat Workspace & Floating Input Dock
- [ ] **Section 2**: Practical Academic Code Lab & Split IDE
- [ ] **Section 3**: Kroki Diagram Studio Engine
- [ ] **Section 4**: OU Exam Prep & Question Bank
- [ ] **Section 5**: Fun AI Personas Lounge (3-Bento Row Scaling)
- [ ] **Section 6**: Document & Code Extractor Studio
- [ ] **Section 7**: 3D Physics Lab & Cubes Matrix
- [ ] **Section 8**: User Prompts Library & Template Hub
- [ ] **Section 9**: Settings & Model Manager Workspace
