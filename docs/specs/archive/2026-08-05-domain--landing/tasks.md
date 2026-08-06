# Tasks — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Status | Approved (Phase 3 gate 2026-08-05) |
| Execution log | `execution.md` (same folder; created by `/akili-execute`) |
| Requirements | `requirements.md` (Approved) |
| Design | `design.md` (Approved; post judgment fix-only) |
| Budget | 14 tasks · ~3 200–4 200 LOC · 16–20 review rounds |
| Directory rule | **`client/` only** — never `server/` |

## Dependency graph

```text
T001 → T002 → T003 → T004 → T005
                ↓
         T006 T007 T008 T009 T010   (Home; parallelizable after T005 in pairs)
                ↓
         T011 T012                  (deep pages; after T005; may parallel)
                ↓
              T013                  (sidenav + motion; needs Home sections)
                ↓
              T014                  (UX IA doc + a11y/responsive polish)
```

Soft ceiling: 2 concurrent workers; no heavy Lighthouse/E2E while a worker writes.

## Coverage matrix (clause → task)

| REQ / clause | Owner task(s) |
|--------------|---------------|
| REQ-001 multi-page shell + no Nest | T001, T005 |
| REQ-001 local `:4200` / NFR-006 | T001 |
| REQ-002 top nav pages | T004 |
| REQ-002 sidenav Home-only, no dark bar, scroll-spy, light ink / dark gold | T013 |
| REQ-002 deep pages no sidenav | T005, T013 |
| REQ-002 mobile drawer + Home section links when on `/` | T004 |
| REQ-002 touch ≥44×44; FAB not covering CTAs | T004, T014 |
| REQ-003 brand-first hero; no cards/stats | T006 |
| REQ-004 road 5 groups; expand; Más info → fragment | T007 |
| REQ-004 road progress; reduced-motion static | T007, T013 |
| REQ-005 Servicios anchors + subs | T012 |
| REQ-006 Sobre teaser + Quiénes somos leaders | T008, T011 |
| REQ-007 metrics; marquee fade on strip only; ~9s testimonials | T009 |
| REQ-007 reduced-motion static marquee/testimonials | T009, T013 |
| REQ-008 validation; handoff; no Nest; events; invalid no WA; FAB; states | T010 |
| REQ-009 ES/EN persist; preserve route+hash; layout parity; key-parity | T003, T010 (emit locale), T014 |
| REQ-010 reduced-motion gate | T013 |
| REQ-011 tokens; no purple | T002 |
| REQ-012 verification widths; road not hover-only | T007, T014 |
| REQ-013 keyboard/labels/focus/drawer | T004, T010, T014 |
| REQ-014 legal stubs | T005 |
| REQ-015 UX IA doc sync | T014 |
| NFR-001/002 perf tactics | T001, T005, T006 |
| NFR-004 analytics names | T010 |
| Defect visual fidelity | HITL in T006–T012, T014 — not unit-green alone |

---

## T001 — Scaffold Angular `client/` + scripts + fonts

- **Status:** [x]
- **Size:** L
- **Depends on:** none
- **Directory boundary:** `client/` (create); never `server/`
- **Recommended skills:** `angular-developer`
- **Design refs:** DD-012 · §1 Overview · §2 Container · Budget
- **Requirements:** REQ-001 (runnable local) · NFR-006 · NFR-001/002 (font-display)
- **Verification:** `cd client && npm install && npm start` → HTTP 200 at `http://localhost:4200`; `npm run lint -- --quiet`; `npm run test:agent` (may be empty suite green)
- **Evidence disqualifier:** Green lint without `test:agent` / `start` scripts defined; app not on `:4200`; any Nest/`server/` files added

### Scope
- `ng new` (or equivalent) **latest stable** into `client/` per DD-012
- Accept CLI default unit runner (Vitest or Jest); wrap lean reporter as `npm run test:agent`
- Define `start`, `lint`, `build`
- Load **Sora** + **DM Sans** with preconnect + `font-display: swap`
- Standalone app skeleton ready for feature folders

### Done when
- [ ] Local start works per infrastructure contract
- [ ] Scripts exist and fail loudly on real errors
- [ ] No `server/` changes
- [ ] BUT it must NOT invent Nest stubs “for later”

---

## T002 — Design tokens + PrimeNG theme

- **Status:** [x]
- **Size:** M
- **Depends on:** T001
- **Directory boundary:** `client/src/styles/` (+ theme preset wiring)
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 Design tokens · DD-002 · REQ-011
- **Requirements:** REQ-011 · NFR-003
- **Verification:** `cd client && npm run build`; spot-check CSS variables present in built styles; grep confirms no `#673de6` / `#5025d1` / `#8c85ff` in `client/src`
- **Evidence disqualifier:** Build green while PrimeNG still uses unthemed default purple/Lara look as primary accent; tokens file missing gold `#CFBB66`

### Scope
- `tokens.css` with AMD variables from UX §7 / design §6
- PrimeNG preset mapped to tokens (primary gold, surfaces ink/mist)
- Global styles import tokens + theme

### Done when
- [ ] Primary CTA/accent reads AMD gold, not template purple
- [ ] Tokens centralized in one SoT file
- [ ] BUT it must NOT leave Hostinger/Zyro purples in chrome

---

## T003 — i18n LocaleService + ES/EN dictionaries

- **Status:** [x]
- **Size:** M
- **Depends on:** T001
- **Directory boundary:** `client/src/app/core/i18n/`, `client/src/assets/i18n/`
- **Recommended skills:** `angular-developer`
- **Design refs:** DD-004 · DD-014 · §6 i18n
- **Requirements:** REQ-009 (persist, parity foundation, no mixed chrome once wired)
- **Verification:** `cd client && npm run test:agent` — tests for persist, `documentElement.lang`, **key-parity** `es.json`↔`en.json`
- **Evidence disqualifier:** Key-parity test only checks file exists; missing keys in one locale still pass; locale lost after reload

### Scope
- Hand-rolled `LocaleService` + runtime JSON seeded from mockup `i18n.js` keys (expand as UI lands)
- Persist `amd.locale` (or agreed key); update `lang` attribute
- Pipe/directive for templates
- Unit: key-parity helper

### Done when
- [ ] Toggle ES↔EN updates bound strings
- [ ] Reload keeps locale
- [ ] Key-parity test fails if dictionaries diverge
- [ ] BUT it must NOT add `@ngx-translate` unless design is amended

---

## T004 — App shell: TopNav, drawer, FAB, footer

- **Status:** [x]
- **Size:** L
- **Depends on:** T002, T003
- **Directory boundary:** `client/src/app/core/layout/`, `shared/ui/` as needed
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 Shell · breakpoints · DD-007 (FAB/chrome only; sidenav = T013)
- **Requirements:** REQ-002 (top nav, mobile drawer+Home links, touch, FAB collision) · REQ-013 (menu/FAB names, focus trap)
- **Verification:** `cd client && npm run test:agent` (drawer open/close focus restore; FAB `aria-label`); `npm run lint -- --quiet`
- **Evidence disqualifier:** Presence of hamburger class without focus-trap test; touch targets asserted only in CSS comments; FAB overlaps Contactar at 375 without HITL note

### Scope
- Glass sticky top nav: brand, page links, lang toggle, Contactar, hamburger `<900px`
- Drawer: page links always; when URL is `/`, also Home section anchors
- WhatsApp FAB with accessible name; layout offset vs primary CTAs
- Footer chrome (links may stub until T005)
- Touch targets ≥44×44

### Done when
- [ ] Desktop/mobile chrome matches dual-nav top half of mockup
- [ ] Drawer focus trapped while open and restored on close
- [ ] BUT it must NOT implement Home sidenav here (T013)
- [ ] BUT it must NOT call Nest

---

## T005 — Routes, fragments, legal stubs, 404

- **Status:** [x]
- **Size:** M
- **Depends on:** T004
- **Directory boundary:** `client/src/app/` routes · `features/legal/` · placeholder page components as needed
- **Recommended skills:** `angular-developer`
- **Design refs:** §6 Routes · fragment contract · DD-014
- **Requirements:** REQ-001 · REQ-002 (no sidenav on deep — shell flag) · REQ-014 · REQ-005/004 navigation targets prepared
- **Verification:** `cd client && npm run test:agent` — **router smoke**: `/`, `/about-us`, `/services`, `/privacy`, `/terms`, unknown → 404 component; fragment navigation to `/services#contabilidad` and `/#contacto` configured
- **Evidence disqualifier:** Test only checks `Routes` array length; 404 is redirect-to-home without page; `/services/:group` child route invented instead of fragment

### Scope
- Declare routes per design (English paths — DD-014 pivot)
- `withInMemoryScrolling` anchor + restoration
- Legal stub pages; minimal 404 with “Volver al inicio”
- Lazy-load deep features when folders exist (stubs OK until T011/T012)
- Shell knows Home vs deep for sidenav host (wire empty outlet until T013)

### Done when
- [ ] Multi-page navigation works without Nest
- [ ] Fragments use scroll API, not fake params
- [ ] BUT it must NOT list `/services#:group` as a path segment

---

## T006 — Home Hero (brand-first)

- **Status:** [x]
- **Size:** M
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/home/hero/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`, `frontend-design`
- **Design refs:** §6 HeroSection · REQ-003 · DD-015 (parallax factors later in T013)
- **Requirements:** REQ-003 · REQ-011 (uses tokens)
- **Verification:** `cd client && npm run test:agent -- hero` (or project equivalent filter); **HITL**: first viewport brand-first vs mockup
- **Evidence disqualifier:** Unit test passes while hero contains cards/stats/badges; HITL skipped and claimed done; brand line missing `Integrales S.A.S.`

### Scope
- Full-bleed atmosphere; `AMD Soluciones` + `Integrales S.A.S.`; promise; primary+secondary CTAs
- i18n-bound copy
- No cards, stats, floating badges

### Done when
- [ ] Brand dominates first viewport
- [ ] CTAs to `#contacto` / `#servicios`
- [ ] BUT it must NOT add hero clutter forbidden by REQ-003
- [ ] HITL visual check recorded in execution notes

---

## T007 — Home Services road (5 groups)

- **Status:** [x]
- **Size:** L
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/home/services-road/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 ServicesRoadSection · DD-006
- **Requirements:** REQ-004 · REQ-012 (no hover-only expand)
- **Verification:** `cd client && npm run test:agent` — expand/collapse; keyboard Enter/Space on card/node; “Más info” navigates to `/services` + correct fragment for all 5 ids
- **Evidence disqualifier:** Only mouse click tested; hover-only expand on desktop CSS without keyboard path; missing any of 5 group ids

### Scope
- Road UI for Contabilidad, Gestión Administrativa, Sistemas de Riesgo, Asesoría, Marca
- Expand detail + Más info deep-link
- Teaser copy only (full catalog = T012)
- Progress fill hook compatible with T013 motion (can be static until T013)

### Done when
- [ ] All five groups expandable via pointer and keyboard
- [ ] Deep-links hit correct fragments
- [ ] BUT it must NOT dump full sub-service lists on Home

---

## T008 — Home About teaser

- **Status:** [x]
- **Size:** S
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/home/about-teaser/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 AboutTeaserSection
- **Requirements:** REQ-006 (teaser half)
- **Verification:** `cd client && npm run test:agent` — “Ver más” → `/about-us`
- **Evidence disqualifier:** Link goes to `#sobre-amd` only; full misión/visión duplicated on Home as if deep page done

### Scope
- Short about + visual + Ver más / Contactar
- i18n

### Done when
- [ ] Ver más routes to Quiénes somos
- [ ] BUT it must NOT replace the deep about page

---

## T009 — Home Trust (metrics, marquee, testimonials)

- **Status:** [x]
- **Size:** M
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/home/trust/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 TrustSection · DD-008
- **Requirements:** REQ-007
- **Verification:** `cd client && npm run test:agent` — testimonial timer ~9000ms when motion allowed; reduced-motion path skips auto-advance; **HITL**: fade mask on logo viewport only (title sharp)
- **Evidence disqualifier:** Class `logos__viewport` present but mask missing in rendered CSS; timer test uses 100ms and claims ~9s without documenting test speed-up; HITL skipped for fade scope

### Scope
- Metrics row; sector/logo marquee with edge fade on strip only
- Testimonials crossfade ~9s + dots
- Respect reduced-motion input from motion service (stub OK until T013 wires real MatchMedia)

### Done when
- [ ] Marquee ≠ testimonials motion model
- [ ] Title not faded by logo mask
- [ ] BUT it must NOT run fluid marquee/auto-rotate under `prefers-reduced-motion: reduce`

---

## T010 — Home Contact form + handoff + analytics stub

- **Status:** [x]
- **Size:** L
- **Depends on:** T005, T003, T004
- **Directory boundary:** `client/src/app/features/home/contact/`, `core/contact/`, `core/analytics/`
- **Recommended skills:** `angular-developer`, `error-handling-patterns`
- **Design refs:** DD-003 · DD-009 · DD-011 · Form UX states · §3 models
- **Requirements:** REQ-008 · NFR-004 · REQ-013 (labels/errors)
- **Verification:** `cd client && npm run test:agent` — invalid submit no WA URL; valid builds `wa.me`/`mailto` with locale+optional service; emits `contact_submit` / FAB/`whatsapp_click`; no HTTP to Nest
- **Evidence disqualifier:** Toast success without handoff URL assertion; analytics “called” without event name check; spinner implies backend; `server/` touched

### Scope
- Reactive Forms: name, email, message, optional service (5 groups)
- Inline errors; success toast; WA + mailto builders; configurable number
- `AnalyticsPort` stub with `contact_submit` | `whatsapp_click`
- Wire FAB click to `whatsapp_click` if not done in T004
- Empty / invalid / success / WA-blocked states; no fake backend spinner

### Done when
- [x] Invalid path blocks handoff
- [x] Valid path handoff + named events
- [x] BUT it must NOT POST leads or add Nest
- [x] AND IT MUST keep mailto/number visible if popup blocked

---

## T011 — Quiénes somos deep page

- **Status:** [x]
- **Size:** M
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/about/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 Deep pages
- **Requirements:** REQ-006
- **Verification:** `cd client && npm run test:agent` — page renders misión/visión; leaders Ana María Daza, María Camila Sanchez, Leidy Yurani Villamil present; no Home sidenav host on this route
- **Evidence disqualifier:** Leaders names only in i18n files unused by template; sidenav still visible on about route

### Scope
- Page hero, misión/visión, 3 leaders + roles (i18n)
- Shared chrome; Contactar → `/#contacto`

### Done when
- [x] Content matches mockup structure
- [x] BUT it must NOT show Home section sidenav

---

## T012 — Servicios deep page

- **Status:** [x]
- **Size:** L
- **Depends on:** T005, T003
- **Directory boundary:** `client/src/app/features/services/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Design refs:** §6 Deep pages · content catalogs
- **Requirements:** REQ-005
- **Verification:** `cd client && npm run test:agent` — all 5 group ids in DOM; fragment scroll target ids match Home Más info; Contabilidad/Admin subs populated; Riesgo/Marca may be placeholders
- **Evidence disqualifier:** TOC links 200 but article `id`s mismatch Home fragments; only 4 groups

### Scope
- TOC + 5 groups + sub-services from mockup/public content
- Placeholders OK for incomplete Riesgo/Marca copy
- Contactar → `/#contacto`

### Done when
- [x] Anchors align with REQ-004/005 ids
- [x] BUT it must NOT omit a group Home can deep-link to

---

## T013 — Home sidenav + motion gate (+ optional road progress)

- **Status:** [x]
- **Size:** L
- **Depends on:** T006, T007, T008, T009, T010
- **Directory boundary:** `client/src/app/core/motion/`, `core/layout/` sidenav
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`, `gsap-animation` (only if DD-005 escalation)
- **Design refs:** DD-005 · DD-007 · DD-015 · scroll-spy · Motion plan
- **Requirements:** REQ-002 (sidenav scenarios) · REQ-004 progress · REQ-007 reduce · REQ-010
- **Verification:** `cd client && npm run test:agent` — sidenav absent off Home; `is-on-light` toggles; reduced-motion disables marquee timer/parallax/progress animation; **HITL**: no dark sidenav bar; dots+label reveal per mockup; sidenav visible ≥1100px
- **Evidence disqualifier:** GSAP added without HITL justification (violates DD-005); unit tests claim contrast OK (jsdom cannot prove gold/ink); class present without scroll-spy behavior test

### Scope
- Home-only float sidenav: 5 anchors; no opaque bar; light ink / dark gold; scroll-spy per design
- `MotionService` from `prefers-reduced-motion`
- Wire hero/story parallax 0.15–0.35; road deco 0.08–0.14; road progress via scroll listener+CSS
- Kill/disable trust autoplay & marquee animation when reduce
- **Do not** add GSAP unless road progress fails HITL

### Done when
- [x] Dual-nav complete vs mockup
- [x] Reduced-motion path keeps content reachable without motion
- [x] BUT it must NOT ship GSAP by default
- [x] HITL sidenav + motion checks noted in execution

---

## T014 — UX IA doc sync + a11y/responsive polish

- **Status:** [x]
- **Size:** M
- **Depends on:** T011, T012, T013
- **Directory boundary:** `docs/ux-ui/design.md` (IA sections only) + `client/` polish only as needed
- **Recommended skills:** `cognitive-doc-design`, `ui-ux-pro-max`, `angular-developer`
- **Design refs:** DD-010 · REQ-015 · REQ-012 · REQ-013 · NFR-001 smoke
- **Requirements:** REQ-015 · REQ-012 · REQ-013 · residual REQ-002 touch/FAB
- **Verification:** Diff/`docs/ux-ui/design.md` IA describes multi-page + dual nav + road + trust motion; `cd client && npm run lint -- --quiet && npm run test:agent`; **HITL** pass at 375/768/1024/1440; optional Lighthouse note (not a unit substitute)
- **Evidence disqualifier:** UX doc updated but still says scroll-only single-page as current IA; “responsive done” without checking 375; Lighthouse skipped silently claimed ≥85 without run or accepted deferral note

### Scope
- Patch UX §2/§5 (and related) to match mockup v0.1 IA — do not rewrite tokens/principles
- Fix remaining a11y/responsive gaps (focus order, drawer, FAB, road on small screens)
- Confirm locale switch preserves route+hash across pages
- Record visual HITL vs mockup for closure

### Done when
- [x] REQ-015 satisfied in constitution UX IA
- [x] Critical keyboard path works end-to-end
- [x] BUT it must NOT expand scope into Nest, admin, or PROD deploy
- [x] HITL checklist attached to execution log

---

## PR strategy recommendation

| Estimate | Guidance |
|----------|----------|
| LOC ~3 200–4 200 | **Two PRs** preferred over one mega-PR |

| PR | Contains | Review first |
|----|----------|--------------|
| **PR1** | T001–T005 (scaffold, tokens, i18n, shell, routes) | Scripts, theme tokens, router/fragment contract, no `server/` |
| **PR2** | T006–T014 (Home sections, deep pages, motion, UX doc) | Visual vs mockup, form handoff, sidenav, REQ-015 doc diff |

PR descriptions: state out-of-scope (Nest, PROD), link previous/next PR, point reviewers at HITL checklist for visual classes.

**Single PR** only if the team explicitly wants one review cycle — expect heavier review load.

## Estimated LOC (whole spec)

~3 200–4 200 (aligned with design budget; tripwire ~5 000).

## Recommended first task

**T001** — Scaffold Angular `client/` + scripts + fonts.
