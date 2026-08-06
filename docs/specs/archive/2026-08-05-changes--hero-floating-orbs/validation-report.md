# Validation Report — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Date | 2026-08-05 |
| Auditor | `/akili-validate` (T3; session ≠ execute Implementer) |
| Spec status | Execute **2/2 PASS** · Test report **PASS** (frontend unit) |
| **Overall verdict** | **WARN** — archive-ready with accepted HITL / E2E gaps |

## Summary

Reusable `app-ambient-orbs` ships under `core/ambient/` and mounts inside the Home hero `.parallax-layer`, replacing the dual-radial plate (DD-HFO-005). Lint, **194** unit tests, and production build succeed. KZ-001 control geometry untouched. No Nest surface.

**FAIL blockers:** none.

**Why WARN (not clean PASS):** HITL visual gate (circular glow + brand-first) still open; E2E runner absent; Lighthouse soft gate deferred; optional Module Guides note for `core/ambient/` pending archive sync.

**Archive readiness:** **Yes** — user directed immediate archive accepting open HITL as documented follow-up.

```text
/akili-archive changes/hero-floating-orbs
```

---

## Task Completion

| Task | Status | Execution PASS | Verdict |
|------|--------|----------------|---------|
| T001 AmbientOrbs | `[x]` | **PASS** (1 attempt) | **PASS** |
| T002 Hero mount | `[x]` | **PASS** (2 attempts; attempt-1 FAIL remediated) | **PASS** |

| Check | Verdict | Notes |
|-------|---------|-------|
| Evidence before checkbox | PASS | `execution.md` T002 PASS written before Status `[x]` |
| Done-when / BUT boxes | PASS | Closed at T002 sign-off |

---

## File Existence

| Design path | Present | Verdict |
|-------------|---------|---------|
| `client/src/app/core/ambient/ambient-orbs/` | Yes (`ts`/`html`/`css`/`spec`) | **PASS** |
| Hero consumer under `features/home/hero/` | Yes (import + template + CSS plate removal + mount test) | **PASS** |
| `server/` Nest | Absent (expected) | **PASS** |
| Visual SoT `mockup/` v0.4 | Present under spec folder | **PASS** |

---

## Build Integrity

| Command | Result | Verdict |
|---------|--------|---------|
| `cd client && npm run lint -- --quiet` | All files pass | **PASS** |
| `cd client && npm run test:agent` | 26 files / **194** tests | **PASS** |
| `cd client && npm run build` | Success | **PASS** |
| Build warning | `services-road-section.css` > 4 kB budget | **WARN** — pre-existing; out of this spec’s directory boundary |
| Local env boot smoke | Not re-run | **WARN** — unit/build substitute; contract in `docs/infrastructure.md` |

---

## Requirement Coverage

Primary evidence: `test-report.md` matrix (reused). No `PRODUCT_BUG`.

| REQ | Scenarios / BUT / AND IT MUST | Automated | HITL / gap | Verdict |
|-----|-------------------------------|-----------|------------|---------|
| REQ-001 | HITL defaults; input overrides; no GSAP; drop-in / no auto-mount | unit + structural | Soft circular = HITL | **PASS** (HITL deferred) |
| REQ-002 | Mount in parallax; plate removed; parallax kept; no cards/badges; KZ-001 | unit + Reviewer diff | Brand-first composition = HITL | **PASS** (HITL deferred) |
| REQ-003 | Pause under reduced-motion; aria-hidden; no pointer capture | unit | OS MQ toggle = HITL | **PASS** (HITL deferred) |
| NFR-001 | Gold/ink tokens only | CSS review | — | **PASS** |
| NFR-002 | ambient-orbit ~16s | unit + CSS | Mean scatter wording advisory | **WARN** advisory only |
| NFR-003 | CSS/DOM only | structural | — | **PASS** |

Scenario-level orphans: none. Every `BUT` / `AND IT MUST` owned by T001 or T002.

---

## Linting & Code Quality

| Check | Verdict |
|-------|---------|
| ESLint quiet | **PASS** |
| 4R advisory (readability / reliability / resilience / risk) | **ADVISORY** — `durationSec` formula mean ≠ “~16s” label (mock parity); random reshuffle on input change; HITL clip risk at hero overflow (mock v0.3 mode) — carried from `execution.md`, non-gating |

---

## Design Conformance

| Decision | Implemented | Verdict |
|----------|-------------|---------|
| DD-HFO-001 CSS orbit (no GSAP) | `@keyframes ambient-orbit` | **PASS** |
| DD-HFO-002 `core/ambient/` shared | Path matches | **PASS** |
| DD-HFO-003 Radial + blur | Template + CSS | **PASS** |
| DD-HFO-004 Pause via MotionService + MQ | `is-paused` + media query | **PASS** |
| DD-HFO-005 Remove dual-radial plate | Gone from `.parallax-layer`; `.hero__bg` kept | **PASS** |
| Proposal Visual Reference (mock v0.4) | HITL defaults wired as inputs | **PASS** (visual parity = HITL) |
| Cross-doc figure check (8 · 300–560 · ~16s) | Consistent across requirements/design/tasks/code defaults | **PASS** (mean-scatter wording noted above) |

---

## Test Evidence Summary

| Source | Status |
|--------|--------|
| `test-report.md` | **PASS** — 194 unit; HITL/E2E accepted gaps |
| Execute Reviewer T001/T002 | Both **PASS** |
| Gap-fill | `durationSec` override test closed T001 advisory #5 |

---

## Agent Guide / Constitution Impact

| Note from `execution.md` | Status |
|--------------------------|--------|
| Module `core/ambient/` created; child guides not required yet | **WARN** — optional parent Module Guides index note pending `/akili-archive` Constitution sync |
| CodeGraph re-index | Pending archive (CLI optional / not installed) |

---

## Remediation

| Item | Severity | Action |
|------|----------|--------|
| HITL circular + brand-first | Accepted WARN | Visual check in browser; no code gate |
| Module Guides note for `core/ambient/` | Hygiene | Apply at archive Step 3 |
| durationSec wording | Advisory | Optional doc polish — do not mint task |
| E2E / Lighthouse | Accepted | Out of Lite scope |

**No FAIL remediation required before archive.**

---

## Archive Readiness Recommendation

| Criterion | Met |
|-----------|-----|
| All tasks `[x]` | Yes |
| No unresolved FAIL | Yes |
| WARN accepted or follow-up | Yes (user: archive immediately) |
| Key scenarios tested or gap documented | Yes |
| Drift reflected in docs | Yes |

**Ready to archive.**
