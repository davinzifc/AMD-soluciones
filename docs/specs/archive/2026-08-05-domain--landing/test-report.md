# Test Report — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Date | 2026-08-05 |
| Overall status | **PASS** (automated frontend unit) · HITL / E2E gaps accepted |
| Leader | `/akili-test` |
| Testers spawned | 1 (frontend-unit, parallel N/A) |
| Inline suites | none |
| Skills (Tester) | `angular-developer`, `systematic-debugging` |
| Effort | high |

## Summary

Landing phase-1 is **client-only**. Automated proof lives in Angular Vitest (`npm run test:agent`).

| Suite | Status | Evidence |
|-------|--------|----------|
| Frontend unit | **PASS** | lint quiet · **180/180** tests · 25 files |
| Backend unit | **N/A** | No `server/` in phase 1 (ADR-003) |
| Integration (API) | **N/A** | No Nest/leads API |
| E2E | **BLOCKED** | No Playwright/Cypress (or other E2E) runner in `client/package.json` — not invented in this command |

**Harness:** 1 Tester (`gpt-5.6-sol-medium`, ≠ execute Implementer `sonnet`). Gap-fill added 4 high-value guards (brand-first DOM order, no fetch/XHR on contact path, synchronized EN chrome, provisional legal copy). No `PRODUCT_BUG`.

**Answer first:** Automated REQ coverage for jsdom-provable scenarios is green. Visual/responsive/OS-motion still need human HITL (already listed in `execution.md`). E2E needs a future scaffolding task before browser journeys can be automated.

---

## Backend Unit Tests

**N/A — phase 1.** Spec and TRD defer Nest. No backend test command required for this report.

---

## Frontend Unit Tests

### Commands

```text
cd client && npm run lint -- --quiet
cd client && npm run test:agent
```

### Results

| Command | Result |
|---------|--------|
| lint `--quiet` | PASS — All files pass linting |
| `test:agent` | PASS — 25 files / **180** tests (Leader re-run confirmed) |

### Added this run (gap-fill)

| File | Guard |
|------|--------|
| `hero-section.spec.ts` | Brand-first DOM order (REQ-003 structure) |
| `contact-section.spec.ts` | No `fetch`/`XMLHttpRequest` on handoff path (REQ-008 BUT no Nest) |
| `top-nav.spec.ts` | Synchronized EN chrome labels (REQ-009) |
| `legal-stub-page.spec.ts` | Provisional legal copy, not signed-off law (REQ-014) |

Author-era specs from `/akili-execute` were **cited, not rewritten** (routes, sidenav scroll-spy, road, trust 9s timer, contact validation, motion gate, i18n key-parity, drawer focus, etc.).

---

## Integration Tests

**N/A as a separate suite.** Cross-cutting behavior that exists (router + fragments + shell Home/deep flag + i18n) is covered inside frontend unit (`app.routes.spec.ts`, `app.spec.ts`, `locale.service.spec.ts`). No HTTP API boundary to integrate against in phase 1.

---

## E2E Tests

**BLOCKED — missing infrastructure.**

| Gap | Detail |
|-----|--------|
| No E2E runner | `client/package.json` has `test` / `test:agent` only — no Playwright/Cypress/etc. |
| AKILI rule | Choosing a runner is a TRD/stack decision; scaffolding is a spec task — Testers must not invent it mid-`/akili-test` |

**Remediation:** Add a small enhancement/bugfix or follow-on task to scaffold the chosen E2E tool + smoke journey (Home → Servicios fragment → Contact handoff stub), then re-run `/akili-test`.

**Manual substitute (until E2E exists):** HITL checklist in `execution.md` (T014) at 375 / 768 / 1024 / 1440.

---

## Coverage & Traceability

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|-------------|----------|-----------|----------------------|--------|--------------|
| REQ-001 | Navigate site pages; shared chrome; no Nest | frontend unit | `app.routes.spec.ts`, `app.spec.ts`, `contact-section.spec.ts` | PASS | |
| REQ-002 | Home dual-nav anchors | frontend unit | `home-side-nav.spec.ts`, `top-nav.spec.ts` | PASS | No opaque bar = HITL |
| REQ-002 | Deep page no sidenav | frontend unit | `app.spec.ts`, `about-page.spec.ts` | PASS | |
| REQ-002 | Sidenav contrast / scroll-spy | frontend unit | `home-side-nav.spec.ts` | PASS | Class/`aria-current` behavior; gold/ink pixels = HITL |
| REQ-002 | Mobile chrome / FAB | frontend unit | `mobile-drawer.spec.ts`, `whatsapp-fab.spec.ts` | PASS | FAB vs CTA collision at 375 = HITL |
| REQ-003 | Brand-first first viewport | frontend unit | `hero-section.spec.ts` | PASS | DOM structure; visual dominance = HITL |
| REQ-004 | Expand + deep-link; 5 groups; no full catalog | frontend unit | `services-road-section.spec.ts` | PASS | |
| REQ-004 | Road progress + reduce | frontend unit | `services-road-section.spec.ts` | PASS | Feel vs mock = HITL |
| REQ-005 | Anchor from Home; 5 ids | frontend unit | `services-page.spec.ts`, `app.routes.spec.ts` | PASS | |
| REQ-006 | Ver más; leaders on deep page | frontend unit | `about-teaser-section.spec.ts`, `about-page.spec.ts` | PASS | |
| REQ-007 | Marquee reduce; fade scope | frontend unit | `trust-section.spec.ts` | PASS | Visual fade quality = HITL |
| REQ-007 | ~9s testimonials | frontend unit | `trust-section.spec.ts` | PASS | Fake timers; no advance before 9000ms |
| REQ-008 | Invalid / valid handoff; events; no Nest | frontend unit | `contact-section.spec.ts`, `contact-handoff.spec.ts`, analytics specs | PASS | |
| REQ-009 | Locale persist; parity; chrome sync | frontend unit | `locale.service.spec.ts`, `i18n-key-parity.spec.ts`, `top-nav.spec.ts` | PASS | |
| REQ-010 | Reduced motion; content reachable | frontend unit | `motion.service.spec.ts`, hero/road/trust specs | PASS | OS toggle E2E = HITL |
| REQ-011 | Tokens; no purple | frontend unit / static | `tokens.css`, `theme-primeng.ts` (spot-check) | PASS | |
| REQ-012 | Road not hover-only | frontend unit | `services-road-section.spec.ts` | PASS | Width layouts = HITL |
| REQ-013 | Keyboard contact; drawer release | frontend unit | `contact-section.spec.ts`, `mobile-drawer.spec.ts`, `drawer-state.service.spec.ts` | PASS | Real AT = HITL |
| REQ-014 | Legal stubs provisional | frontend unit | `app.routes.spec.ts`, `legal-stub-page.spec.ts` | PASS | |
| REQ-015 | UX IA doc sync | doc / prior execute | `docs/ux-ui/design.md` + T014 execution | PASS (doc) | Not a unit scenario |

**Negative / strict highlights proven in unit:** no Nest/`fetch` on contact path; no sidenav on deep routes; no full Home catalog; invalid submit no handoff; reduced-motion clears motion consumers; forbidden purple absent from theme SoT.

---

## Remediation

| Item | Action | Owner |
|------|--------|-------|
| E2E infrastructure | Scaffold chosen runner + smoke journey; re-run `/akili-test` | New task / TRD note |
| HITL visual widths | Human pass 375/768/1024/1440 vs mockup | User / `/akili-validate` |
| NFR-001 Lighthouse | Run or keep accepted deferral (already in T014 execution) | Archive / deploy prep |
| Timeline entrance reveals | Optional enhancement (deferred from T013/T014 motion HITL) | Enhancement spec if desired |

No failing product defects from this run — nothing to fix before marking automated suite green.

---

## Accepted Gaps

| Gap | Reason |
|-----|--------|
| No backend / API integration suites | Phase-1 constitutional boundary (ADR-003) |
| No E2E automation | Runner not in stack; AKILI forbids inventing it inside `/akili-test` |
| Visual brand dominance, sidenav bar absence, fade/contrast pixels | jsdom cannot prove; HITL in `execution.md` |
| Responsive layout at verification widths | HITL (REQ-012) |
| Real OS `prefers-reduced-motion` toggle | Unit stubs `matchMedia`; OS path = HITL |
| Screen-reader announcement quality | Partial unit; AT = HITL |
| Final legal copy | Out of scope (REQ-014) |
| Lighthouse ≥85 | Accepted deferral recorded at T014 — not claimed here |

---

## Authorship

AKILI-SPECS `/akili-test` — Leader aggregate of Tester suite report. Methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com).
