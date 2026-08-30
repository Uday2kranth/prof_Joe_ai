# Acceptance Gates: 21-Track Master Syllabus Web Verification & Grounding

## G1: Author 8 Math & Stats Track Markdown Files
- **Status:** MET
- **CHECK:** `Test-Path "secrets/syllabus/mathematics_and_statistics/08_stochastic_processes_sdes_and_random_matrices.md"`
- **EXPECT:** `True`
- **EVIDENCE:** All 8 Track Markdown files authored with MIT OCW / ISI Kolkata / Stanford benchmarks.

## G2: Author 7 AI & Machine Learning Track Markdown Files
- **Status:** MET
- **CHECK:** `Test-Path "secrets/syllabus/artificial_intelligence/07_agentic_ai_autonomous_workflows_and_alignment.md"`
- **EXPECT:** `True`
- **EVIDENCE:** All 7 Track Markdown files authored with Stanford CS229/CS231n/CS224n, PRML, and MCP benchmarks.

## G3: Author 6 Data Structures & Algorithms Track Markdown Files
- **Status:** MET
- **CHECK:** `Test-Path "secrets/syllabus/data_structures_and_algorithms/06_computational_complexity_p_vs_np_and_karp_reductions.md"`
- **EXPECT:** `True`
- **EVIDENCE:** All 6 Track Markdown files authored with CLRS, MIT 6.006/6.046, and Sipser TOC benchmarks.

## G4: Ground masterSyllabusData.ts with 21 Tracks
- **Status:** MET
- **CHECK:** `npm test`
- **EXPECT:** `136 passed`
- **EVIDENCE:** 26 test files / 136 tests passed (100%).

## G5: Typecheck and Linter Zero Errors
- **Status:** MET
- **CHECK:** `npm run verify`
- **EXPECT:** `0 errors`
- **EVIDENCE:** `tsc -b && oxlint` exited with 0 errors.

## G6: Production Bundle & Capacitor Android Sync
- **Status:** MET
- **CHECK:** `npx cap sync android`
- **EXPECT:** `Sync finished`
- **EVIDENCE:** Vite compiled cleanly, versionCode 256 / versionName 5.0.93 synced to Android assets.
