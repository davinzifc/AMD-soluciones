# Validation Report — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Date | 2026-08-05 |
| Auditor | `/akili-validate` (T3; session ≠ execute Implementer) |
| Spec status | Execute **14/14 PASS** · Test report **PASS** (frontend unit) |
| **Overall verdict** | **WARN** — shippable for archive with accepted gaps; HITL visual + E2E + Lighthouse not closed |

## Summary

Phase-1 landing in `client/` matches the approved multi-page + dual-nav spec for automated evidence. Lint, unit tests (182), and production build succeed. No Nest/`server/` surface. Constitutional UX IA (§2/§5) synced (REQ-015).

**Blockers to a clean PASS:** none at the FAIL level for required automated clauses.

**Why WARN (not FAIL):** open human HITL at verification widths; E2E runner absent (accepted); NFR-001 Lighthouse deferred (accepted at T014); CSS budget warning on road stylesheet; some `tasks.md` Done-when boxes still `[ ]` despite Status `[x]` + execution PASS; environments folder gitignore may break clean clones for PrimeUI license stub.

**Archive readiness:** **Conditional yes** — archive after you accept the WARN list (or finish the HITL checklist). Recommended next:

```text
/akili-archive docs/specs/domain/landing
```

…only if you accept open HITL / E2E / Lighthouse as documented follow-ups.

---

## Task Completion

| Task | Status | Execution PASS | Verdict |
|------|--------|----------------|---------|
| T001–T014 | all `[x]` | all **PASS** (T013 needed 2 attempts) | **PASS** |

| Check | Verdict | Notes |
|-------|---------|-------|
| Evidence before checkbox | PASS | `execution.md` entries precede Status `[x]` |
| HITL patches logged | PASS | sticky/sidenav, ink canvas, TOC+reveal |
| Done-when boxes vs Status | **WARN** | T001–T009 Done-when lines still mostly `[ ]` while Status `[x]` — hygiene debt, not missing work |

---

## File Existence

Design container map vs tree:

| Design path | Present | Verdict |
|-------------|---------|---------|
| `core/layout/` (topnav, drawer, FAB, sidenav, footer) | Yes | PASS |
| `core/motion/` | Yes | PASS |
| `core/contact/`, `core/analytics/`, `core/i18n/` | Yes | PASS |
| `features/home/{hero,services-road,about-teaser,trust,contact}/` | Yes | PASS |
| `features/about/`, `features/services/`, `features/legal/`, `features/not-found/` | Yes | PASS |
| `server/` Nest work | Absent (expected) | PASS |
| `shared/ui/` | Not as separate package | **WARN** — design listed it; chrome lives under `core/layout/` (acceptable DD-013 drift) |

Visual reference: mockup under `docs/specs/domain/landing/mockup/` present.

---

## Build Integrity

| Command | Result | Verdict |
|---------|--------|---------|
| `cd client && npm run lint -- --quiet` | All files pass linting | **PASS** |
| `cd client && npm run test:agent` | 25 files / **182** tests PASS | **PASS** |
| `cd client && npm run build` | Success | **PASS** |
| Build warning | `services-road-section.css` 4.83 kB > 4.00 kB budget | **WARN** (under error threshold 8 kB) |
| Local env boot smoke | Not re-run this validate | **WARN** — contract exists in `docs/infrastructure.md`; unit/build substitute used |

`test-report.md` recorded 180 tests; post-HITL suite is **182** — report slightly stale (**WARN** documentation).

---

## Requirement Coverage

Primary evidence: `test-report.md` matrix + this validate’s lint/test/build re-run. No `PRODUCT_BUG` in test report.

| REQ | Scenarios / BUT / AND IT MUST | Automated | HITL / gap | Verdict |
|-----|-------------------------------|-----------|------------|---------|
| REQ-001 | Multi-page; chrome; no Nest | routes + shell + contact no-fetch | — | **PASS** |
| REQ-002 | Dual-nav; no deep sidenav; scroll-spy; mobile | sidenav/drawer/app specs | no-dark-bar / ≥1100 visual | **WARN** |
| REQ-003 | Brand-first; no hero clutter | hero DOM order | visual dominance | **WARN** |
| REQ-004 | 5 groups; expand; deep-link; progress; no catalog dump | road specs + reveal IO | progress/parallax feel | **WARN** |
| REQ-005 | 5 anchors + subs | services-page specs; TOC routerLink fix | visual | **PASS**† |
| REQ-006 | Ver más; leaders | about + teaser specs | visual | **PASS**† |
| REQ-007 | Marquee reduce; 9s testimonials; fade scope | trust specs | fade/contrast pixels | **WARN** |
| REQ-008 | Validate; handoff; events; no Nest; fallback | contact + handoff + analytics | mailto/WA confirm w/ AMD | **WARN** |
| REQ-009 | ES/EN persist; parity; chrome sync | locale + key-parity + top-nav | — | **PASS** |
| REQ-010 | Reduced motion; content reachable | motion + consumers | OS toggle | **WARN** |
| REQ-011 | Gold; no purple | tokens/theme spot-check (no forbidden hex) | — | **PASS** |
| REQ-012 | Widths; road not hover-only | keyboard expand | 375–1440 layout | **WARN** |
| REQ-013 | Keyboard contact; drawer release | contact focus + drawer specs | real AT | **WARN** |
| REQ-014 | Legal stubs provisional | legal-stub + routes | final legal out of scope | **PASS** |
| REQ-015 | UX IA sync | `docs/ux-ui/design.md` §2/§5 | — | **PASS** |

† Visual fidelity still HITL; automated clauses satisfied.

Negative constraints checked: no Nest/HttpClient leads path; no GSAP dependency; no purple chrome tokens; no Home sidenav on deep pages; no full catalog on Home road.

---

## Linting & Code Quality

| Check | Verdict |
|-------|---------|
| ESLint quiet | **PASS** |
| Forbidden purple accents in `client/src` | **PASS** (none found) |
| Nest / HttpClient leads | **PASS** (none) |
| GSAP in package | **PASS** (absent) |

### 4R advisory (non-gating — carried + fresh)

1. Untokenized `#8a7630` / error hexes — token hygiene.
2. Duplicated `.btn`/`.wrap` across deep pages.
3. Drawer modal containment (topnav/FAB above backdrop).
4. Hardcoded Spanish route `title`s; `es.json` `q2` English copy.
5. CSS budget warn on road section.
6. `client/src/environments/*` gitignored — PrimeUI license file ignored; clean clone may miss stub (**WARN** for onboarding). Prefer committed empty stub + gitignored `*.local.ts`.
7. E2E absent; Lighthouse deferred.

---

## Design Conformance

| Area | Verdict | Notes |
|------|---------|-------|
| Multi-page + DD-014 English paths | **PASS** | `/`, `/about-us`, `/services`, legal, 404 |
| Dual-nav DD-007 | **PASS** (code) / **WARN** (HITL bar absence) | sticky host + sidenav ≥1100 |
| Motion plan DD-005/015 | **PASS** | scroll+CSS; reveals added post-HITL; no GSAP |
| Contact DD-003/011 | **PASS** | Reactive Forms; WA/mailto; analytics names |
| Tokens / no purple | **PASS** | |
| UX constitution IA | **PASS** | REQ-015 done |
| Proposal intent / mockup | **PASS** with HITL WARN | TOC Home-jump fixed; road reveal added |
| Phase boundary ADR-003 | **PASS** | |

Cross-doc figures: 5 service groups / 5 Home anchors / 14 tasks — consistent across requirements, design, tasks, code.

---

## Test Evidence Summary

| Suite | Status | Source |
|-------|--------|--------|
| Frontend unit | PASS (182 now) | validate re-run + `test-report.md` |
| Backend / API | N/A | phase 1 |
| E2E | BLOCKED | no runner — accepted gap |
| HITL checklist | Owed / partial | `execution.md` T014 + patches |

---

## Agent Guide / Constitution Impact

| Note | Verdict |
|------|---------|
| T001 Constitution Impact (new `client/`) | **WARN** — no `client/AGENTS.md`; root Module Guides still empty (explicitly deferred until divergence) — OK to sync at archive |
| T013 Constitution Impact (`core/motion`, sidenav) | **PASS** — child guide not required per execution note |
| CodeGraph | **WARN** — not initialized; pending archive recommendation |

---

## Remediation

| ID | Severity | Action | Owner |
|----|----------|--------|-------|
| R1 | WARN | Complete HITL checklist at 375/768/1024/1440 vs mockup | Human |
| R2 | WARN | Confirm mailto inbox + WA number with AMD | Human |
| R3 | WARN | Optional Lighthouse mobile run or keep deferral | Human / archive |
| R4 | WARN | Scaffold E2E runner in a follow-up task if browser journeys required | New enhancement |
| R5 | WARN | Fix environments gitignore: commit license stub template; ignore only `*.local.ts` | Dev |
| R6 | Advisory | Sync Done-when checkboxes T001–T009; refresh test-report count 182 | Dev / archive |
| R7 | Advisory | Road CSS budget / shared chrome CSS / token deep-gold | Polish enhancement |

**No FAIL items requiring code change before archive** if WARNs are accepted.

---

## Archive Readiness Recommendation

| Criterion | Met? |
|-----------|------|
| All tasks `[x]` | Yes |
| No unresolved FAIL | Yes |
| WARN accepted or follow-up owned | **Pending your acceptance** |
| Key REQ scenarios tested or gap documented | Yes |
| Drift reflected in docs/execution | Yes (HITL patches, UX IA) |
| User reviewed validation | **Pending** |

**Recommendation:** Spec is **archive-ready with accepted WARN**, or hold archive until R1 HITL sign-off if visual fidelity is a hard gate for your release bar.

```text
/akili-archive docs/specs/domain/landing
```

---

## Authorship

AKILI-SPECS `/akili-validate`. Methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com).
