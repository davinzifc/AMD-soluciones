# Archive Summary — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Original path | `docs/specs/changes/hero-floating-orbs/` |
| Archive date | 2026-08-05 |
| Final status | **Shipped** — execute PASS · test PASS · validate **WARN** (accepted HITL) |
| Depth | Lite |
| Commits | `869e168` (T001) · `c54cdf8` (T002) · archive commit |

## Requirements Delivered

| ID | Delivered |
|----|-----------|
| REQ-001 | Reusable `AmbientOrbsComponent` in `core/ambient/` with HITL defaults + inputs |
| REQ-002 | Hero mounts field inside `.parallax-layer`; dual-radial plate removed |
| REQ-003 | Reduced-motion pause + `aria-hidden` + `pointer-events: none` |
| NFR-001…003 | Gold/ink colors · ambient-orbit ~16s · CSS-only (no GSAP) |

## Files Changed Summary

| Area | Change |
|------|--------|
| `client/src/app/core/ambient/ambient-orbs/` | New component + CSS + 12+ unit tests |
| `client/src/app/features/home/hero/` | Mount + plate removal + mount assertion |
| Spec folder | proposal → requirements/design/tasks/execution/mockup/test/validation |

## Test Evidence Summary

- `test-report.md`: **PASS** — 194 unit tests; HITL/E2E accepted gaps
- Gap-fill: `durationSec` override assertion

## Validation Summary

- `validation-report.md`: **WARN** — no FAIL; archive-ready with accepted HITL visual + E2E absence
- Build/lint/tests green

## Accepted Warnings Or Follow-Ups

| Item | Disposition |
|------|-------------|
| HITL circular glow + brand-first | Accepted — manual browser check |
| OS reduced-motion toggle | Accepted — manual |
| E2E runner | Deferred — no scaffold |
| Lighthouse soft gate | Deferred |
| `durationSec` mean wording vs formula | Advisory — optional doc polish |
| CodeGraph re-index | Recommended if CLI installed |

## Historical Notes

- Escalated from informal `/akili-quick` (orbital CSS after GSAP/CSS keyframe rejects; Mamboleoo BxMQYQ reference).
- Visual SoT: `mockup/` v0.4 · HITL **8 · 300–560px · ~16s**.
- T002 required one Reviewer rework (missing `.parallax-layer` mount test) → **KZ-004**.
