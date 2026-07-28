# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University & college students across multiple syllabi and university exam patterns (including Osmania University B.Tech/Engineering and general academic curricula) needing structured, high-scoring exam preparation support under tight time constraints.

## Product Purpose

Prof. Joe AI provides exam-oriented AI assistance tailored for university evaluations. It enables students to generate structured 12-mark comprehensive answers, 3-4 mark concise summaries, architectural diagrams, and system prompts to achieve top academic performance.

## Positioning

Structured, exam-aligned multi-mode AI evaluation featuring automated Kroki diagram generation, strict mark-based context formatting (12-mark / 3-4 mark modes), multi-provider failover key rotation, and fun AI persona lounges.

## Operating Context

Late-night study sessions, exam revision, past question paper prep, diagram modeling, PDF session exports, and fast multi-device mobile/PC chat workflows.

## Capabilities and Constraints

- **Capabilities**: Multi-provider LLM support (Gemini, Groq, OpenRouter, Pollinations, OpenCode, NaraRouter, Mistral, Nvidia, etc.), Kroki Mermaid/Kroki architectural diagram rendering, 12-mark / 3-4 mark / Auto exam evaluation modes, Fun AI Personas lounge, PDF chat export & preview, multi-key rotation, single-device session locking.
- **Constraints**: Free keyless & priority keyed provider limits, browser-isolated localStorage session preservation, strict academic vs persona prompt isolation.

## Brand Commitments

- **Name**: Prof. Joe AI (Osmania & University Exam Mentor)
- **Tone**: Academic, supportive, authoritative, structured, with optional fun persona humor in designated lounges.
- **Assets**: Prof. Joe Spinning Dog Avatar, KokonutUI glassmorphic capsule docks, custom neon dark glass dropdown popups.

## Evidence on Hand

- `src/App.tsx`: Primary application orchestrator, routing, and user isolated session management.
- `src/constants.ts`: Provider definitions, model catalogs, and character persona prompt pack.
- `secrets/tracker.md`: Architecture tracker, MongoDB collections schema, and UI design system log.
- `secrets/FREE_PROVIDERS_GUIDE.md`: Free API tier token capacity and rate limits reference.

## Product Principles

1. **Exam First**: Prioritize structured, mark-aligned clarity and academic rigor over generic conversational fluff.
2. **Visual Evidence**: Support explanations with clean, auto-rendered Kroki diagrams whenever applicable.
3. **Resilient Compute**: Multi-provider key rotation and failover ensure zero downtime during study sessions.
4. **Zero Data Loss**: Preserve user sessions across devices, logins, and deployments.

## Accessibility & Inclusion

Dark glassmorphic high-contrast interface, mobile touch-scrolling toolbar layouts, responsive typography, and KaTeX math expression accessibility.
