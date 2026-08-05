# Execution Log — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Started | 2026-08-05 |
| Approval Mode | gated |
| Leader session | `/akili-execute` |

## Document Control

| Field | Value |
|-------|-------|
| Spec | `requirements.md` + `design.md` + `tasks.md` (Approved) |
| Budget | 14 tasks · ~3 200–4 200 LOC · 16–20 review rounds |
| Directory rule | `client/` only — never `server/` |

## Task Execution History

### T001 — Scaffold Angular `client/` + scripts + fonts

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-001 (runnable local) · NFR-006 · NFR-001/002 (font-display via `display=swap`) |
| Design refs | DD-012 · §1 Overview · §2 Container |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: medium
- Files: full `client/` scaffold (Angular 22.1.x standalone); `package.json` scripts `start` / `build` / `lint` / `test:agent`; `index.html` Sora+DM Sans preconnect + Google Fonts `display=swap`; `styles.css` font CSS variables; minimal `app.*` skeleton; eslint via `@angular-eslint/schematics`
- Verification:
  - `npm install` → exit 0
  - `npm run lint -- --quiet` → exit 0
  - `npm run test:agent` → exit 0 (Vitest 4.1.10 · 1 file / 2 tests)
  - `npm run build` → exit 0
  - `npm start` → HTTP 200 at `http://localhost:4200`; server stopped after check
- No `server/` / Nest changes
- CLI default runner: Vitest via `@angular/build:unit-test`

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Conforms to DD-012 and REQ-001/NFR-006 — Angular 22.1.x standalone in `client/` only; required scripts present with lean `test:agent`; Sora + DM Sans with preconnect and `display=swap`; ADR-003 holds (no Nest/`server/`).

**ADVISORY** (4R, non-gating — recorded only; do not mint tasks):

1. Google Fonts stylesheet is render-blocking — revisit under NFR-001/002 in later polish (T002/T014), not now.
2. `app.spec.ts` asserts placeholder hero copy; T006 will replace hero — expect assertion rewrite then.
3. Font vars live in CLI-default `src/styles.css`; T002 owns relocating token SoT to `src/styles/tokens.css`.

#### Decisions

- Accepted CLI default Vitest (DD-012).
- Google Fonts CDN (not self-host) allowed by DD-012.
- Did not pre-create empty feature folders (out of T001 scope).

#### Issues encountered

None (PASS on first attempt).

#### Final verification

`lint --quiet`, `test:agent`, and HTTP 200 on `:4200` all green.

## Constitution Impact: T001

- **Module created:** top-level `client/` (Angular SPA package).
- **Child guides:** not required yet — conventions still match root `AGENTS.md` / `CLAUDE.md` until feature folders diverge; `/akili-archive` may add `client/AGENTS.md` if needed.
- **Parent index:** root `## Module Guides` remains empty until archive sync decides a child guide is warranted.
- **CodeGraph:** re-index pending when CLI is available (`codegraph init -i`); do not commit generated DB.

### T002 — Design tokens + PrimeNG theme

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-011 · NFR-003 |
| Design refs | §6 Design tokens · DD-002 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `client/src/styles/tokens.css` (AMD SoT); `client/src/styles/theme-primeng.ts` (Aura → gold primary + ink/mist); `styles.css` imports tokens; `app.config.ts` `providePrimeNG` + `provideAnimationsAsync`; deps `primeng`, `@primeuix/themes`, `@angular/cdk`, `@angular/animations`
- Verification: `npm run build` exit 0 (dist contains `--amd-gold:#CFBB66`); purple grep 0 matches; lint quiet pass

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: tokens.css matches UX §7 including `#CFBB66`; Aura preset seeded from gold with ink/mist surfaces; global import + `providePrimeNG`; no Zyro purples; ADR-003 intact.

**ADVISORY** (4R, non-gating):

1. Hex duplicated between `tokens.css` and preset — drift risk vs NFR-003; prefer CSS vars where possible.
2. Surface ramp mixes AMD ink endpoints with zinc mid-steps.
3. `@angular/animations` may be unnecessary for PrimeNG 22 — revisit if unused by T013.
4. Build/lint results accepted as Implementer claims (static evidence consistent).

#### Final verification

Build green; gold present; no forbidden purples in `client/src`.

### T003 — i18n LocaleService + ES/EN dictionaries

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 2 |
| Requirements covered | REQ-009 (persist, lang, key-parity, bound-string updates via impure pipe + initializer) |
| Design refs | DD-004 · DD-014 · §6 i18n |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: medium
- Files: `core/i18n/*` (LocaleService, LocalizePipe pure:true, key-parity helper + specs); `assets/i18n/{es,en}.json` (161 keys parity); `angular.json` asset glob; `tsconfig.json` `resolveJsonModule`
- Verification: `test:agent` 4 files / 19 tests pass; lint pass; build emits i18n JSON
- Assumption: no app.html toggle — unit tests only

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: FAIL** — pure pipe memoizes constant-key bindings; no host reactivity test; no `whenReady` gate. Full FAIL text retained in session history / above block in prior draft; key findings: Done-when #1 broken; initial paint stuck on raw keys.

#### Attempt 2

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: high (bumped)
- Files: `localize.pipe.ts` → `pure: false`; `app.config.ts` → `provideAppInitializer(() => inject(LocaleService).whenReady())`; `localize.pipe.spec.ts` host-component ES→EN→ES DOM guard
- Verification: lint pass; build pass; `test:agent` 4 files / 20 tests pass

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: All three prior FAIL items closed — impure pipe updates bindings (verified vs Angular 22 source + zoneless reactive consumer); initializer gates empty dict; host test is a genuine attempt-1 regression guard. Persist/key-parity/no ngx-translate unchanged.

**ADVISORY** (4R, non-gating):

1. Fetch failure in initializer aborts bootstrap — soften later when T004 wires toggle.
2. Dictionary fetch is render-blocking for LCP — T014 polish candidate.
3. Host test uses manual `detectChanges`; `whenStable` could strengthen zoneless schedule proof later.
4. `tsconfig.json` lacks `"strict": true` — Leader checked: HEAD scaffold never had it; only `resolveJsonModule` added. No silent drop.
5. Impure pipe cost negligible at landing scale; revisit if binding count explodes.

#### Final verification

`test:agent` 20/20 green including template reactivity guard; lint/build green.

### T004 — App shell: TopNav, drawer, FAB, footer

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-002 (top nav, mobile drawer+Home anchors, touch, FAB) · REQ-013 (menu/FAB names, focus trap) |
| Design refs | §6 Shell · breakpoints · DD-007 (FAB/chrome; sidenav deferred) |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `core/layout/` — `drawer-state.service`, `top-nav`, `mobile-drawer`, `whatsapp-fab`, `site-footer` (+ specs); `app.{ts,html,css,spec.ts}` shell composition
- Verification: `test:agent` 9 files / 49 tests; lint quiet; build OK
- HITL: FAB vs Contactar at 375 deferred (no Home contact section yet; Contactar in top bar, FAB bottom-right)

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Glass sticky top nav with `<900px` hamburger; drawer page links + Home anchors on `/` only; focus trap + restore; labeled FAB; footer; real 44×44 CSS; no sidenav; no Nest. Disqualifiers do not fire.

**ADVISORY** (4R, non-gating — do not mint tasks):

1. Modal containment incomplete — topnav/FAB above drawer backdrop; consider `inert` later (T014).
2. Open drawer state survives ≥900px resize — matchMedia close candidate.
3. Focus-on-open effect vs hidden node — keyboard HITL in T014.
4. Duplicated `68px` topnav height / `.wrap` — prefer token (NFR-003).
5. FAB media-query comment vs rule mismatch — fix before/with T010.
6. `<nav aria-label="Sitio">` hardcoded ES — T014 i18n a11y sweep.
7. Home-anchor test asserts count not fragments — strengthen later optional.

#### Final verification

49 tests green including drawer focus trap + FAB aria-label; lint/build green.

### T005 — Routes, fragments, legal stubs, 404

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-001 · REQ-002 (Home-vs-deep shell flag) · REQ-014 · fragment targets for REQ-004/005 |
| Design refs | §6 Routes · fragment contract · DD-014 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: medium
- Files: `app.routes.ts` (lazy Spanish paths + wildcard 404); `app.config.ts` `withInMemoryScrolling`; Home/About/Services/Legal/NotFound stubs; `app.routes.spec.ts` router smoke; shell `isHomeRoute` + empty `.sidenav-host`; i18n stub/404 keys
- Verification: `test:agent` 15 files / 72 tests; lint quiet; build OK with lazy chunks

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Routes + scrolling contract match design; 404 is a real page not redirect; servicios has zero children; smoke tests resolve components and DOM anchors for `/servicios#contabilidad` and `/#contacto`; no Nest.

**ADVISORY** (4R, non-gating):

1. Hardcoded Spanish route `title`s — fold into T014 i18n.
2. Stub CTAs use encapsulated `.btn` from top-nav — unstyled/undersized until T011–T014.
3. `isHomeRoute` duplicated in App + MobileDrawer — extract in T013.
4. Consider `pathMatch: 'full'` on `path: ''`.
5. `angular.json` `analytics: false` CLI opt-out — harmless.
6. Stub CSS hex not purple — REQ-011 OK.

#### Final verification

72 tests green including router smoke + fragment DOM anchors; lint/build green.

### T006 — Home Hero (brand-first)

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-003 · REQ-011 (tokens) |
| Design refs | §6 HeroSection · DD-015 parallax deferred to T013 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`, `frontend-design`
- Effort: medium
- Files: `features/home/hero/*`; wired into `home-page` replacing `#inicio` stub only
- Verification: `test:agent` 16 files / 79 tests; lint quiet; build OK (`-- hero` filter unsupported by ng wrapper — full suite used)
- HITL: no browser in Implementer sandbox — structural/CSS parity vs mockup only; **human/T6 visual sign-off still owed** (not claimed done)

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Markup/CSS faithful to mockup `#inicio`; brand-first with `Integrales S.A.S.` via `brandSub`; CTAs `/#contacto` + `/#servicios`; no cards/stats/badges; HITL recorded-as-deferred (disqualifier does not fire).

**ADVISORY** (4R, non-gating):

1. Missing mockup `.hero__bg::after` grid texture — check in real HITL.
2. `z-index: -1` vs mockup `-2` — restore layering when T013 adds parallax.
3. `.wrap`/`.btn` re-declared; hardcoded 1160px — shared primitive at T014.
4. Hardcoded English "Scroll" cue — T014 i18n sweep.
5. Above-fold CTAs at 375/768 — confirm in T014 HITL (REQ-012).
6. Anti-pattern test is class-substring heuristic only.
7. Motion duration token 200ms vs mockup 220ms — token preferred.

**Open HITL (carry forward):** First-viewport visual brand-first check at 375/768/1024/1440 still owed before T014 closure / archive — do not treat unit green as visual sign-off.

#### Final verification

79 tests green including hero anti-pattern + CTA fragment asserts; lint/build green.

## Pivot Record: DD-014 URL paths (user HITL 2026-08-05)

| Field | Value |
|-------|-------|
| Trigger | User: routes must be English (`quienes-somos` → `about-us`, and likewise for all page routes) before continuing to T007 |
| Supersedes | DD-014 Spanish path segments / mockup filename parity |
| New decision | English path segments for all locales: `/`, `/about-us`, `/services`, `/privacy`, `/terms` |
| Unchanged | Home section fragments (`#inicio`…`#contacto`); Servicios group fragments (`#contabilidad`…); ES/EN UI copy via LocaleService |
| Spec sweep | `design.md` Routes table + DD-014 row; `tasks.md` T005/T007/T008 verification paths |
| Code | Migrated in follow-up Implementer pass; router smoke + all `routerLink`s |

Affected ADR: none in TRD (DD-014 is design-level). Mockup HTML filenames remain historical visual SoT; SPA routes no longer mirror those filenames.

### T007 — Home Services road (5 groups)

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-004 · REQ-012 (keyboard expand, not hover-only) |
| Design refs | §6 ServicesRoadSection · DD-006 · DD-014 English `/services` |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `features/home/services-road/*`; wired into `home-page` replacing `#servicios` stub
- Verification: `test:agent` 17 files / 98 tests; lint quiet; build OK (soft style budget warn)
- Más info → `/services#contabilidad|administrativa|riesgo|asesoria|marca` via shared `SERVICE_GROUP_IDS`

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Five groups; signal-driven expand with click+Enter/Space on node/pill/card; English `/services#` deep-links; teaser only; static `#road-progress` for T013.

**ADVISORY** (4R, non-gating):

1. Collapsed detail leaves Más info in tab order (invisible focus) — T014 a11y (`inert`/`hidden`).
2. `role="button"` card with nested `<a>`; pill name is bare number — T014.
3. `.btn` duplicated across components — hoist to global styles.
4. Test count bookkeeping 21 vs 19 — coverage adequate.

#### Final verification

98 tests green including keyboard expand + all five `/services#` hrefs; lint/build green.

### T008 — Home About teaser

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-006 (teaser half) |
| Design refs | §6 AboutTeaserSection · DD-014 `/about-us` |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `features/home/about-teaser/*`; wired into `home-page` replacing `#sobre-amd` stub
- Verification: lint quiet; `test:agent` 18 files / 104 tests — Ver más → `/about-us`; Contactar → `/#contacto`; no mission/vision/leaders dump

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Teaser-only About section; Ver más is real `/about-us` link (not `#sobre-amd`); deep about page untouched for T011; tokens OK.

**ADVISORY** (4R, non-gating):

1. `aria-hidden` on figure also hides visible "Cali · Colombia" caption — T014 a11y.
2. Visual fidelity vs mockup remains HITL.
3. (resolved by this entry) execution.md needed T008 log.

#### Final verification

104 tests green including `/about-us` href assert; lint green.

### T009 — Home Trust (metrics, marquee, testimonials)

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-007 (fade scope, ~9s testimonials, reduced-motion) · DD-008 |
| Design refs | §6 TrustSection · Motion plan stub |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `features/home/trust/*` (`TrustMotionQuery`, `TrustSection`); wired into `home-page` replacing `#confianza`; `#contacto` stub left for T010
- Verification: lint quiet; `test:agent` 117/117 — `TESTIMONIAL_PAUSE_MS=9000` with fake timers (no shortened prod interval); reduce skips auto-advance; fade structural test
- HITL: no browser — structural/CSS fade scope only; **visual sign-off still owed**

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Separate marquee vs crossfade models; mask only on `.logos__viewport`; title sibling proven; reduced-motion double-gated; timer honesty OK; HITL deferred honestly.

**ADVISORY** (4R, non-gating):

1. Visual HITL fade/contrast at verification widths — carry forward (with T006).
2. Testimonial dots 44×44 hit areas overlap — T014.
3. Untokenized `#8a7630` metric gold — consider `--amd-gold-deep` at T014.
4. `aria-live` / opacity-0 quotes a11y — T014; unused `protected activeIndex`.

**Open HITL (carry forward):** Trust logo fade + metrics contrast visual check still owed before archive.

#### Final verification

117 tests green including 9s timer + reduced-motion paths; lint green.
