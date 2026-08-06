# Archive Summary — Landing v1 (Phase 1)

**Outcome:** Spec archived **WARN-accepted**. Phase-1 multi-page landing delivered in `client/`; no Nest. Automated gate green; visual HITL / E2E / Lighthouse remain follow-ups.

| Field | Value |
|-------|-------|
| Original path | `docs/specs/domain/landing/` |
| Archive date | 2026-08-05 |
| Final status | Execute **14/14 PASS** · Test **PASS** (unit) · Validate **WARN** (accepted) |
| Archive folder | `docs/specs/archive/2026-08-05-domain--landing/` |

## Requirements Delivered

| REQ | Delivered | Notes |
|-----|-----------|-------|
| REQ-001–015 | Yes (automated / documented) | Visual HITL still owed for several scenarios |
| Phase boundary | Yes | No `server/` / leads API (ADR-003) |
| Dual-nav + multi-page IA | Yes | UX `design.md` §2/§5 synced (REQ-015) |

## Files Changed Summary

From `execution.md` (high level):

| Area | Paths |
|------|--------|
| Scaffold / shell | `client/` Angular app, routes, top-nav, drawer, FAB, footer |
| Tokens / theme | `styles/tokens.css`, `theme-primeng.ts` |
| i18n | `core/i18n/`, `assets/i18n/{es,en}.json` |
| Home | hero, services-road, about-teaser, trust, contact |
| Deep pages | about, services (+ TOC), legal stubs, 404 |
| Motion / sidenav | `core/motion/`, `home-side-nav/` |
| Constitution UX | `docs/ux-ui/design.md` §2/§5 |
| HITL patches | sticky host, sidenav media query, ink canvas, TOC `routerLink`, road reveal |

Pivot: **DD-014** → English path segments (`/about-us`, `/services`, …). No TRD ADR overturned.

## Test Evidence Summary

| Suite | Status |
|-------|--------|
| Frontend unit | PASS (validate: **182**; test-report recorded 180) |
| Backend / API | N/A |
| E2E | BLOCKED (no runner — accepted) |
| PRODUCT_BUG | 0 |

## Validation Summary

| Verdict | Detail |
|---------|--------|
| Overall | **WARN** |
| FAIL count | **0** |
| Archive gate | Conditional → **accepted** via `/akili-archive` |

## Accepted Warnings Or Follow-Ups

| ID | Item | Disposition |
|----|------|-------------|
| R1 | HITL 375/768/1024/1440 vs mockup | Accepted follow-up (human) |
| R2 | Confirm mailto + WhatsApp with AMD | Accepted follow-up (human) |
| R3 | Lighthouse NFR-001 | Deferred (accepted at T014) |
| R4 | E2E runner | Future enhancement |
| R5 | `environments/*` gitignore / license stub | Dev hygiene follow-up |
| R6 | Done-when `[ ]` vs Status `[x]`; test-report count | Doc hygiene |
| R7 | Road CSS budget / shared chrome / deep-gold token | Polish enhancement |

## Historical Notes

- Reviewer rework: **T003** (impure i18n pipe + `whenReady`), **T013** (testimonial dots 44→15 restored).
- Post-execute HITL: sticky topnav, sidenav encapsulation, ink behind glass, Servicios TOC base-href, road IntersectionObserver reveal.
- Mockup under `mockup/` remains visual SoT; SPA routes no longer mirror Spanish mockup filenames.
- PrimeUI Community license lives in gitignored `client/src/environments/` (do not commit keys).

## Authorship

AKILI-SPECS `/akili-archive`. Methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com).
