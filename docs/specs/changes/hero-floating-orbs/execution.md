# Execution — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Started | 2026-08-05 |
| Leader | Cursor Agent (T1) |
| Approval Mode | gated |
| Budget | 2 tasks · ~180 LOC · 1–2 review rounds |

## Task Execution History

### T001 — AmbientOrbs reusable component

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements | REQ-001, REQ-003, NFR-001…003 |
| Decisions | CSS-only Mamboleoo orbit; host `aria-hidden` + pointer-events; dual pause (MotionService + MQ) |
| Issues | Filtered `test:agent -- ambient-orbs` unsupported by ng builder — full suite used (stronger). No `node:fs` gsap-import test — Reviewer discharged structurally |

#### Attempt 1

| Role | Result |
|------|--------|
| Implementer | Created `core/ambient/ambient-orbs/*` (ts/html/css/spec). Verification: `npm run test:agent` 26 files / 192 tests pass; `npm run lint -- --quiet` pass |
| Reviewer | **STATUS: PASS** — Independently re-verified build/tests/lint. All T001 clauses hold |

**ADVISORY (non-gating, recorded only — no new tasks minted):**
1. `durationSec` wording vs formula mean (~25s at default 16) — mockup parity correct; doc wording follow-up optional
2. `computed()` + `Math.random()` reshuffles all orbs on any input change — matches mockup rebuild
3. `DEFAULT_COLORS` literal rgba vs CSS vars — NFR-001 allows opacities
4. `AmbientOrbsComponent` suffix vs repo `HeroSection` naming — design.md named it
5. `durationSec` override untested
6. `@akili-spec` sole instance in client — intentional for this ship

#### Constitution Impact: T001

- Module created: `client/src/app/core/ambient/`
- Child `AGENTS.md` / `CLAUDE.md`: not required yet (conventions match root)
- Parent Module Guides index: optional note at archive that `core/ambient/` exists
- CodeGraph re-index: pending at archive

---

### T002 — Hero mounts AmbientOrbs; remove dual-radial plate

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 2 |
| Requirements | REQ-002 (primary), REQ-003 smoke via parallax tests |
| Decisions | Default `<app-ambient-orbs />` inside `.parallax-layer`; dual-radial plate removed in same change (DD-HFO-005); KZ-001 clean |
| Issues | Attempt 1 FAIL — missing mount test under `.parallax-layer` |

#### Attempt 1

| Role | Result |
|------|--------|
| Implementer | Wired AmbientOrbs into hero; removed dual-radial CSS. Tests/lint green but no new hero mount assertion |
| Reviewer | **STATUS: FAIL** — Missing `hero-section.spec.ts` assertion that `app-ambient-orbs` is under `.parallax-layer` (tasks.md T002 Tests + design.md §9) |

#### Attempt 2

| Role | Result |
|------|--------|
| Implementer | Added scoped mount test (`.parallax-layer app-ambient-orbs` + live `span.orb`). Verification: `npm run test:agent` 193 passed; lint pass |
| Reviewer | **STATUS: PASS** — Independently re-verified 193/193 tests + lint. Prior FAIL remediated; REQ-002 / DD-HFO-005 / KZ-001 hold |

**ADVISORY (non-gating, recorded only — no new tasks minted):**
1. HITL visual gate still open — confirm soft circular (not square) orbs + brand-first; watch clip at hero overflow edges (mock v0.3 failure mode)
2. Bookkeeping: close T002 Done when / BUT checkboxes at sign-off

#### Constitution Impact: T002

- No new module; hero is first consumer of `core/ambient/`
- No Module Guides / AGENTS.md change required
- CodeGraph re-index: pending at archive

---
