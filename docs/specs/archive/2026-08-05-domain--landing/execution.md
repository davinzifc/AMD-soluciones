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
2. ~~Testimonial dots 44×44 hit areas overlap — T014.~~ **Fixed** in HITL patch 2026-08-05 (non-overlapping 44×44 buttons + 8px `::before` pip).
3. Untokenized `#8a7630` metric gold — consider `--amd-gold-deep` at T014.
4. `aria-live` / opacity-0 quotes a11y — T014; unused `protected activeIndex`.

**Open HITL (carry forward):** Trust logo fade + metrics contrast visual check still owed before archive.

#### Final verification

117 tests green including 9s timer + reduced-motion paths; lint green.

## HITL patch — Hero first-viewport + testimonial dots (2026-08-05)

User compared live `#inicio` vs mockup before T010: hero copy too low / "Scroll" below the fold; testimonial dots required clicking left of the visual circle (first pip).

| Fix | Cause | Change |
|-----|-------|--------|
| Hero under sticky topnav | `100svh` hero sat *below* sticky nav → end-aligned content + Scroll past fold | `margin-top: -68px` + `padding-top: 68px` + `box-sizing: border-box`; content bottom pad `4.25rem`; Scroll `z-index: 1`, brighter, `bottom: 1.25rem`; mockup `.hero__bg::after` grid |
| Dot hit targets | overlapping `::after { inset: -18px }` 44×44 bulbs (~15px centers) — later sibling stole clicks | transparent 44×44 buttons, 8px visual via `::before` (no overlap) |

- Files: `features/home/hero/hero-section.css`, `features/home/trust/trust-section.css`
- Verification: `test:agent` 117/117; lint quiet
- **Human re-check owed:** first viewport (brand + CTAs + Scroll visible) + click each testimonial dot on the circle itself — then continue T010.

### Follow-up (same day) — hero vertical centering

User: still a huge empty band under the nav; ask to center the copy more.

- Change: `.hero` `align-items: end` → `center`; tighten `.hero__content` padding (`1.5rem 0 3.5rem`, mobile `1rem 0 3.25rem`) so the brand/CTA block sits mid-viewport; left text alignment kept (brand-first).
- File: `features/home/hero/hero-section.css`

### T010 — Home Contact form + handoff + analytics stub

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-008 · NFR-004 · REQ-013 (labels/errors) |
| Design refs | DD-003 · DD-009 · DD-011 · Form UX states · §3 ContactIntent |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer` (Reactive Forms override per DD-011), `error-handling-patterns`
- Effort: medium
- Files created: `core/contact/{contact.config,contact-intent.model,contact-handoff(+spec)}.ts`; `core/analytics/{analytics-port,console-analytics.service(+spec)}.ts`; `features/home/contact/contact-section.{ts,html,css,spec.ts}`
- Files modified: `whatsapp-fab.{ts,html,spec.ts}` (locale `waPrefill` + `whatsapp_click`); `home-page.{ts,html,css,spec.ts}` (stub → ContactSection); `app.routes.spec.ts`
- Verification: `test:agent` 22 files / 137 tests; lint quiet; build OK; `server/` untouched
- Assumptions: `CONTACT_MAILTO_INBOX` default `contacto@amdsoluciones.com` (DI-swappable; AMD confirm before archive)

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Invalid path asserts no `window.open` + no `contact_submit`; valid path asserts full `wa.me` URL decode (name/email/service/message/locale) + toast; analytics DI port asserted by exact event names (`contact_submit`, `whatsapp_click` with `source: form|fab`); Reactive Forms; no spinner/Nest/HttpClient in contact path; `#contacto` preserved. Disqualifiers not triggered. Leader re-ran 137/137 + lint quiet.

**ADVISORY** (non-gating → T014 / confirm):

1. Visible WA number in template hardcoded — derive from `WHATSAPP_NUMBER` if token overridden.
2. `SERVICE_GROUP_IDS` imported into `core/` from features — move tuple to `core/` later if value use risks chunk coupling.
3. Invalid submit: aria association OK; no focus-to-first-error / error summary — T014 a11y.
4. Toast `role="status"` mounted with `@if` — prefer persistent empty live region (T014).
5. No form reset / toast auto-dismiss after success — behavior decision.
6. Error colors off-token hex (`#f0a0a0` / `#e08080`) — `--amd-danger` at T014.
7. No regression test pinning “no Nest POST” — optional guard later.

**Open HITL (carry forward):** Contact section visual at 375/768/1024/1440; confirm real mailto inbox + WA number with AMD before archive.

#### Final verification

137 tests green (invalid blocks handoff; valid wa.me + mailto + named events; FAB/form `whatsapp_click`); lint green; no Nest.

### T011 — Quiénes somos deep page

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-006 (deep half: misión, visión, 3 leaders + roles) |
| Design refs | §6 Deep pages · DD-014 `/about-us` |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`) — [T011 About](705539ac-1bbb-41d6-a456-1971c16fbf7a)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `features/about/about-page/*` — page hero, mv-cards, leaders grid (names literal in component), closing, CTAs; i18n keys already present (no dictionary edits)
- Verification: lint quiet; `test:agent` 22 files / 151 tests — leader names in DOM; CTAs `/#contacto`, `/services`, `/`; no `.sidenav-host` on route

**Reviewer** (T3 · `claude-opus-5-thinking-high`) — [T011 Review](d85e4ed1-8527-4f3c-b913-224fb14fc875)

- Verdict: **STATUS: PASS**
- Summary: REQ-006 blocks present and mockup-faithful; both evidence disqualifiers closed (names in DOM; sidenav absence proven at App shell); independent lint + 151/151 re-run green.

**ADVISORY** (4R, non-gating):

1. Untokenized `#8a7630` on `.mv-card h3` (~4.45:1) — same T009 precedent; `--amd-gold-deep` at T014.
2. Duplicated `.btn`/`.wrap` across deep pages — shared partial candidate at T014.
3. Hardcoded on-dark rgba — optional `--amd-on-dark` at T014.
4. HITL visual vs `quienes-somos.html` still owed (coverage matrix: not unit-green alone).

**Open HITL (carry forward):** Quiénes somos visual at verification widths before archive.

#### Final verification

151 tests green; lint green; leaders + misión/visión asserted; no Nest.

### T012 — Servicios deep page

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-005 · REQ-004 group id alignment |
| Design refs | §6 Deep pages · ServiceGroupId · fragment contract · DD-014 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`) — [T012 Services](bac8d185-09b5-4f28-9bf1-98262890295f)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `features/services/services-page/*` — hero + TOC + 5 `article[id]` groups; Contabilidad 16 / Admin 4 / Asesoría 4 real subs; Riesgo/Marca placeholder notes; `SERVICE_GROUP_IDS` export unchanged
- Verification: lint quiet; `test:agent` 22 files / 151 tests — TOC + article ids for all 5 groups; CTA `/#contacto`

**Reviewer** (T3 · `claude-opus-5-thinking-high`) — [T012 Review](c967abe8-6e3d-4d9a-b7bc-fa4cb463cbfa)

- Verdict: **STATUS: PASS**
- Summary: Five groups share one `SERVICE_GROUP_IDS` constant with Home road; disqualifiers closed; i18n keys independently verified in both locales; independent 151/151 + lint re-run green.

**ADVISORY** (4R, non-gating):

1. `.svc-note` ~3.6:1 contrast — raise alpha at T014 a11y.
2. `:host` restates app-shell ink — about-page inherits instead; align later.
3. Duplicated deep-page chrome CSS with About — T014 shared partial candidate.
4. Dead `stubPending` key after stub removal — sweep later.
5. HITL visual vs `servicios.html` still owed.

**Open HITL (carry forward):** Servicios visual + fragment landings (`/services#riesgo` etc.) at verification widths before archive.

#### Final verification

151 tests green; lint green; 5 anchors + catalogs; no Nest.

*Parallel wave:* T011 + T012 executed concurrently (disjoint dirs `features/about/` · `features/services/`).

### T013 — Home sidenav + motion gate (+ optional road progress)

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 2 |
| Requirements covered | REQ-002 (sidenav) · REQ-004 progress · REQ-007 reduce · REQ-010 |
| Design refs | DD-005 · DD-007 · DD-015 · HomeSideNav · Motion plan · scroll-spy |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`) — [T013 Impl](a8d72f7a-7dc1-4b36-83ac-3b86f18e78ba)

- Skills: `angular-developer`, `ui-ux-pro-max` (no `gsap-animation` — DD-005)
- Effort: medium
- Files: `core/motion/{motion.service,scroll-listener}`; `core/layout/home-side-nav/*`; app shell mount; hero parallax 0.22; road deco + progress; Trust → `MotionService` (deleted `TrustMotionQuery`); i18n `sideNavAria`
- Verification: lint quiet; `test:agent` 25 files / 174 tests; build OK (CSS budget warn only)
- HITL: deferred honestly (no dark bar; ≥1100; contrast; OS reduce; parallax feel)

**Reviewer** (T3 · `claude-opus-5-thinking-high`) — [T013 Review FAIL](dcf099ae-3a19-4084-807a-a0ef85ab5f70)

- Verdict: **STATUS: FAIL**
- Issue: silent shrink of `.testimonial-dots button` 44×44 → 15×15 (reverts HITL 2026-08-05; violates REQ-002/013 touch ≥44; stale comment). Rest of T013 (no GSAP, behavioral scroll-spy tests, motion gate) audited clean.

#### Attempt 2

**Implementer** (T2 · `claude-sonnet-5-thinking-high`) — [T013 Rework](f6f63d61-fc74-4278-aa7c-418136ae25d2)

- Effort: **high** (bump after FAIL)
- Fix: pure restore `width/height: 44px` on `.testimonial-dots button`; comment already accurate
- Verification: lint quiet; 174/174

**Reviewer** (T3 · `claude-opus-5-thinking-high`) — [T013 Review PASS](b9688330-d609-4eb9-917e-f684295849dd)

- Verdict: **STATUS: PASS**
- Summary: FAIL closed — dots 44×44 at HEAD/index/disk; net trust CSS staged diff is comment-only (no geometry regression); attempt-1 15px gone.

**ADVISORY** (4R, non-gating — from attempts 1–2):

1. `HomeSideNav` hand-rolls scroll vs `onPassiveScroll` helper — unify later.
2. Three un-throttled scroll handlers — consider rAF coalesce (NFR-001).
3. Road deco `[attr.class]` → prefer `[class]` idioms.
4. Confirm `.parallax-layer` z-index vs hero bg during HITL.
5. Duplicated `isHomeRoute` App/MobileDrawer — T014 candidate.
6. Review scratch `.tmp-t013*.diff` must not be committed (deleted by Leader).

**Open HITL (carry forward):** no dark sidenav bar · dots+label reveal · sidenav ≥1100px · gold/ink contrast · live OS reduce toggle · parallax/progress feel · prior About/Services/Contact/Hero visual items.

#### Final verification

174 tests green; lint green; no GSAP; scroll-spy behavior tested; dots 44×44 preserved; no Nest.

## Constitution Impact: T013

- New modules: `client/src/app/core/motion/`, `client/src/app/core/layout/home-side-nav/`
- Child `client/AGENTS.md` not required yet (conventions still match root)
- Root `## Module Guides` unchanged
- CodeGraph re-index pending at archive (graph not initialized)

## HITL patch — sticky topnav + sidenav visibility (2026-08-05)

User compared live Home vs mockup before T014: (1) topnav scrolled away; (2) left section sidenav invisible at desktop widths; (3) header appeared to change color across pages / sections.

| Fix | Cause | Change |
|-----|-------|--------|
| Sticky topnav | `position: sticky` lived on inner `.topnav` inside a short `app-top-nav` host — sticky cannot outlive that parent, so the whole chrome scrolled away (mockup sticks because `.topnav` is a direct `body` child) | Move `position: sticky; top: 0; z-index: 50` to `:host`; keep dark glass on `.topnav` for every route |
| Missing sidenav | Component CSS used `body.has-side-nav .sidenav`; Angular emulated encapsulation rewrites to `body.has-side-nav[_ngcontent] .sidenav[_ngcontent]`, which never matches → sidenav stuck at `display: none` | Show `.sidenav { display: flex }` under `@media (min-width: 1100px)` only; Home-only mount stays in `app.html` |
| Header color | Not a separate palette bug — non-sticky nav + translucent glass over light sections made chrome look inconsistent; mockup keeps the same dark glass on all pages; only sidenav uses `is-on-light` ink/gold | No per-page topnav theme; sidenav contrast unchanged |

- Files: `core/layout/top-nav/top-nav.css`, `core/layout/home-side-nav/{home-side-nav.css,home-side-nav.ts}`
- Verification: lint quiet; `test:agent` (re-run after patch)
- **Human re-check owed:** sticky topnav while scrolling Home + deep pages; sidenav visible ≥1100px on `/` with hover label reveal + ink on light sections (`#servicios` / `#confianza`); sidenav absent on `/about-us` and `/services`.

### Follow-up (same day) — canvas ink behind glass topnav

User: on Quiénes somos / Servicios the glass looks right, but a light/white band shows behind the sticky header.

- Cause: `html`/`body` kept the browser default white canvas; translucent topnav (`rgba(13,20,26,0.78)` + blur) composited over that white. Mockup already sets `body { background: var(--amd-ink) }`.
- Change: `client/src/styles.css` — `html, body { background: var(--amd-ink); color: #f5f6f8; min-height: 100%; }` (parity with mockup).
- Note: mist/light *sections* scrolling under the glass will still tint it slightly — that is intentional glass, not the canvas bug.

### T014 — UX IA doc sync + a11y/responsive polish

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-015 · REQ-012/013 residuals · residual REQ-002 touch notes via prior coverage |
| Design refs | DD-010 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`) — [T014 Impl](51580e01-ba3b-4826-bdea-8a588dbdd275)

- Skills: `cognitive-doc-design`, `ui-ux-pro-max`, `angular-developer`
- Effort: medium
- Docs: `docs/ux-ui/design.md` §2/§5 (+ §4 route-mapping line) — multi-page + dual-nav; §1/§7 untouched
- Client: road collapsed `[inert]`; contact focus-first-invalid; i18n `navSiteAria` / `testimonialDotsAria` / `heroScroll`; `scroll-behavior: smooth` + reduce → `auto`
- Verification: lint quiet; `test:agent` 25 files / 176 tests

**Reviewer** (T3 · `claude-opus-5-thinking-high`) — [T014 Review](937ef785-49f7-45b7-8b8b-7a9f3b4c7de5)

- Verdict: **STATUS: PASS**
- Summary: REQ-015 verified (no surviving scroll-only current IA); breakpoints match code; a11y tests real; no Nest/PROD; no fake Lighthouse/375 claims; HITL honesty OK.

**ADVISORY** (4R, non-gating):

1. Untokenized `#8a7630` / error hexes — token hygiene at archive (T014 correctly avoided rewriting §7).
2. Drawer modal containment (topnav/FAB above backdrop) still open.
3. Hardcoded Spanish route `title`s — cosmetic.
4. `es.json` `q2` still English copy — pre-existing.
5. Smooth scroll also affects router restoration — verify in HITL.

#### HITL checklist (attached — Done when)

| Check | Width/condition | Status |
|-------|-----------------|--------|
| Layout/usability | 375px | **Owed** |
| Layout/usability | 768px | **Owed** |
| Layout/usability | 1024px | **Owed** |
| Layout/usability | 1440px | **Owed** |
| Home sidenav visible, no dark bar | ≥1100px | Partially verified by unit |
| Road detail unreachable by Tab when collapsed | keyboard | Partially verified by unit (`inert`) |
| `prefers-reduced-motion` OS toggle | Home motion | Partially verified by unit |
| Contact: fail submit → focus first invalid + AT | keyboard | Partially verified by unit |
| Mobile drawer trap / Escape / restore | <900px | Partially verified by unit |
| Visual vs mockup v0.1 | all widths | **Owed** |
| EN aria-labels via screen reader | EN locale | Partially verified by unit |

**NFR-001 Lighthouse:** **Accepted deferral** — no Lighthouse ≥85 claim in this task; optional smoke deferred to archive / deploy prep. Do not treat unit-green as Performance ≥85.

**Open HITL (carry to archive / `/akili-validate`):** verification-width visual pass; prior Hero/Trust/Contact/About/Services/sidenav items; confirm mailto + WA with AMD; optional Lighthouse run.

#### Final verification

176 tests green; lint green; UX IA synced; no Nest.

## HITL patch — Servicios TOC + road scroll reveal (2026-08-05)

User after `/akili-test`: (1) Servicios TOC chips navigated to Home; (2) Home timeline lacked scroll-in / parallax feel vs mockup.

| Fix | Cause | Change |
|-----|-------|--------|
| TOC → Home | Bare `href="#id"` + `<base href="/">` resolves to `/#id` | `routerLink="/services" [fragment]="id"`; spec asserts `/services#…` |
| Road no scroll animation | Mockup `IntersectionObserver` → `.is-in` never ported; items always opaque | Reveal CSS + observer (threshold 0.18); reduce → instant `is-in`; progress axis `z-index` for gold fill visibility |

- Files: `services-page.{html,ts,spec.ts}`; `services-road-section.{ts,html,css,spec.ts}`
- Verification: lint quiet; `test:agent` 182/182
- **Human re-check:** TOC chips stay on `/services` and scroll to group; road cards fade/slide in on scroll; gold progress fills; deco circles drift (≥900px).

## Summary — Landing v1 Phase 1 tasks

All **14/14** tasks **PASS** (T001–T014). Spec ready for `/akili-test` and/or `/akili-validate` once HITL visual checklist is human-signed; `/akili-archive` after validation.
