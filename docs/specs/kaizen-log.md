# Kaizen Log

Continuous-improvement record for this project, updated automatically by
`/akili-archive` (Kaizen Retrospective, powered by the `kaizen` skill).
Other AKILI commands read only the `## Active Lessons` table below —
keep it at 10 rows or fewer.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-001 | Do not change HITL-approved control geometry (e.g. ≥44px targets) unless the task Done-when names that control | domain/landing | Medium | Product | — (proposed `.agents/implementer.md`) | Deferred |
| KZ-002 | Never use `body`/`html` ancestor selectors in Angular emulated component CSS for show/hide — prefer media queries + mount scope | domain/landing | Medium | Product | — (proposed `.agents/implementer.md`) | Deferred |
| KZ-003 | i18n pipes that read locale service state must be impure (or signal-driven); `pure: true` memoizes constant keys and freezes UI | domain/landing | Medium | Product | — (proposed `.agents/implementer.md`) | Deferred |

## Entries

### 2026-08-05 — domain/landing

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 | tasks.md |
| Reviewer FAIL rework attempts | 2 (T003 ×1, T013 ×1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (DD-014 English URL paths) | execution.md — ## Pivot Record: DD-014 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 0 carried into validate FAIL | judgment.md / validation-report.md |
| Validation FAIL / WARN | 0 / multiple (HITL, E2E, Lighthouse, hygiene) | validation-report.md |
| `/akili-quick` escalation | none | (no quick-log) |

**Lessons**

- **KZ-001 — HITL-frozen touch targets resized in an unrelated motion task.** (Product, Medium)
  - Root cause: T013 motion/trust CSS edit silently shrank `.testimonial-dots button` 44×44 → 15×15, undoing prior HITL and failing REQ touch size.
  - Evidence: `execution.md` — T013 Attempt 1 Reviewer FAIL; Attempt 2 restore.
  - Standardization: append to `.agents/implementer.md` Scope Discipline: *Do not change control geometry (≥44px / HITL-approved sizes) unless the task Done-when names that control.* → **Deferred** (archive default; no High severity)

- **KZ-002 — `body.has-side-nav` selectors broke under Angular encapsulation.** (Product, Medium)
  - Root cause: Component CSS targeting `body…` was rewritten with `_ngcontent` on `body`, so the rule never matched; sidenav stayed `display: none` until HITL.
  - Evidence: `execution.md` — HITL patch sticky topnav + sidenav visibility.
  - Standardization: append to `.agents/implementer.md`: *Never use `body`/`html` ancestor selectors in emulated component CSS for visibility; use `@media` + App mount scope.* → **Deferred**

- **KZ-003 — Pure localize pipe frozen locale switches.** (Product, Medium)
  - Root cause: `LocalizePipe` with `pure: true` memoized constant translation keys; locale changes did not refresh bindings until impure + `whenReady` gate.
  - Evidence: `execution.md` — T003 Attempt 1 Reviewer FAIL; Attempt 2 `pure: false` + initializer.
  - Standardization: append to `.agents/implementer.md` (i18n note): *Pipes that depend on locale service state must be impure or signal-driven.* → **Deferred**
