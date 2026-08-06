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
