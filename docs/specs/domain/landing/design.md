# Design — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Status | Approved (Phase 2 gate 2026-08-05; post judgment fix-only) |
| Depth | **Standard** |
| Tier impact | none — extends existing **LITE** (TRD ADR-001–005); no ROBUST proposal |
| Requirements | `requirements.md` (Approved) |
| Visual SoT | `mockup/` v0.1 |
| Judgment | `judgment.md` — fix-only applied (no re-judge) |
| Skills applied | software-architect · ui-ux-pro-max · angular-developer · gsap-animation · stitch-design (interpret mockup; no Stitch MCP) |

## Budget (Step 2.4)

| Metric | Estimate | Tripwire for `/akili-execute` |
|--------|----------|-------------------------------|
| Expected tasks | **14** | Escalate if task graph grows past **17** without split/re-scope |
| Expected LOC | **~3 200–4 200** (greenfield `client/`; mockup SoT alone ≈2 143 lines before Angular split/tests) | Escalate if actual >> **~5 000** without scope change |
| Expected review rounds | **16–20** (≈1 PASS/task + HITL visual rework buffer) | Escalate if rework loops ≥3 on any single task |

Depth check: Standard matches — multi-surface UI + scaffold + motion/a11y; not Lite; not Full (no API/auth/migration).

**Task shape (budget basis):** scaffold+tooling · tokens/PrimeNG · i18n · shell chrome · routes/fragments/legal/404 · hero · services road · about teaser · trust · contact · quiénes-somos · servicios · sidenav/motion · UX-IA doc + a11y polish = **14**.

## Reversion challenges (Step 2.3)

**N/A — greenfield.** No shipped `client/` behavior to remove. Constitutional UX IA still describes scroll-only SPA; REQ-015 **updates docs**, it does not revert runtime behavior.

## 1. Overview

Build the Phase 1 marketing app entirely in `client/`: Angular standalone SPA with PrimeNG themed to AMD tokens, multi-route IA matching mockup v0.1, client-only contact handoff, and motion that honors `prefers-reduced-motion`.

Local contract (NFR-006 / REQ-001): after scaffold, `cd client && npm install && npm start` serves the app at `http://localhost:4200` per `docs/infrastructure.md`.

`server/` remains untouched (ADR-003).

## 2. Architecture Overview

### Decision spine (feature scale)

| NFR scenario (from TRD + REQ) | Tactic | Pattern / structure |
|-------------------------------|--------|---------------------|
| Mobile load → LCP/Lighthouse (NFR-001/002) | Lazy feature routes; defer below-fold; optimized static hero; font-display swap | Feature folders + route lazy-loading |
| Keyboard/a11y contact path (REQ-013) | Semantic structure, focus rings, labeled controls; touch ≥44×44 | Shared UI wrappers + form field pattern |
| Token/section change local (NFR-003) | Single theme file; section = feature | Design-token CSS variables + PrimeNG preset |
| Lead events without vendor (NFR-004) | Analytics port/stub with named events | `AnalyticsPort.track('contact_submit' \| 'whatsapp_click')` |
| No Nest attack surface (NFR-005) | Phase boundary | Contact handoff service → `wa.me` / `mailto` only |
| Reduced motion (REQ-010) | MatchMedia gate before any scroll/CSS motion | Motion facade: enable/disable animations |
| Local run (NFR-006) | Scaffold defines start/test/lint scripts | DD-012 |

**Tier:** LITE unchanged. Style: modular Angular feature folders inside one SPA deployable.

### C4 — Context (unchanged)

```text
[Visitor] → [AMD Landing SPA] → WhatsApp / mailto
            (fase 2) ──→ Nest API   ← out of scope
```

### C4 — Container (this spec)

| Container | Tech | Notes |
|-----------|------|-------|
| Web client | Angular **latest stable** via CLI into `client/` + PrimeNG | Only runtime in phase 1; see DD-012 |

### Feature map → requirements

Supersedes TRD §4 path names (`landing/hero`…) with multi-page layout below — same responsibilities, clearer route boundaries (DD-013).

| Area | Path (target) | REQs |
|------|---------------|------|
| Scaffold + scripts + fonts | `client/` root | 001, NFR-001/002/006 |
| App shell / routes / fragments | `client/src/app/` | 001, 002, 014, 015 |
| Theme tokens + PrimeNG preset | `client/src/styles/` · theme | 011 |
| i18n | `client/src/assets/i18n/` + locale service | 009 |
| Chrome: topnav, drawer, FAB, sidenav | `core/layout/` · `shared/ui/` | 002, 012, 013 |
| Home sections | `features/home/{hero,services-road,about-teaser,trust,contact}/` | 003–004, 006–008, 010 |
| Quiénes somos | `features/about/` | 006 |
| Servicios | `features/services/` | 005 |
| Legal stubs | `features/legal/` | 014 |
| Contact handoff + analytics stub | `core/contact/` · `core/analytics/` | 008, NFR-004 |
| Motion | `core/motion/` | 004, 007, 010 |

```text
client/
├── public/                 # favicon, static atmosphere assets
├── src/
│   ├── index.html
│   ├── styles/
│   │   ├── tokens.css      # AMD CSS variables (SoT)
│   │   └── theme-primeng.* # PrimeNG preset mapping → tokens
│   ├── assets/i18n/
│   │   ├── es.json
│   │   └── en.json
│   └── app/
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── core/
│       │   ├── layout/           # shell: topnav, drawer, fab host, footer
│       │   ├── i18n/             # LocaleService + JSON loader
│       │   ├── contact/          # validation model + wa/mailto builder
│       │   ├── analytics/        # AnalyticsPort stub
│       │   └── motion/           # reduced-motion signal; scroll helpers
│       ├── shared/ui/            # button wrappers, section-head, etc.
│       └── features/
│           ├── home/
│           ├── about/
│           ├── services/
│           └── legal/
└── package.json              # start, lint, test:agent (DD-012)
```

## 3. Data Model

No database. TypeScript models only:

| Model | Fields | Used by |
|-------|--------|---------|
| `ContactIntent` | `fullName`, `email`, `message`, `serviceInterest?`, `locale: 'es'\|'en'` | Form + handoff |
| `ServiceGroupId` | `contabilidad` \| `administrativa` \| `riesgo` \| `asesoria` \| `marca` | Road, Servicios anchors, form select |
| `LocaleId` | `es` \| `en` | i18n persistence |
| `Leader` | `name`, `roleKey` (i18n) | Quiénes somos |
| `AnalyticsEvent` | `'contact_submit'` \| `'whatsapp_click'` | AnalyticsPort |
| Content catalogs | Static TS or JSON for sub-services / testimonials / sector pills | Features; swap assets later |

## 4. API Contracts

**None (phase 1).**

| Integration | Contract |
|-------------|----------|
| WhatsApp | `https://wa.me/573248805290?text=<urlencoded>` (number configurable) |
| Mailto | `mailto:<amd-inbox>?subject=&body=` (inbox configurable; fallback) |
| Nest `POST /api/v1/leads` | Documented in TRD only — **not implemented** |

## 5. Backend Design

**N/A — phase boundary (ADR-003).**

## 6. Frontend / UX Component Architecture

Derived from mockup v0.1 + `docs/ux-ui/design.md` tokens.

### Routes

| Route | Feature | Notes |
|-------|---------|-------|
| `/` | Home (composed sections) | Enables left sidenav |
| `/quienes-somos` | About deep | No sidenav |
| `/servicios` | Services deep | In-page anchors `#contabilidad`… via **fragment**, not child routes |
| `/privacidad`, `/terminos` | Legal stub | Placeholder copy |
| `/**` | Minimal **404 page** with “Volver al inicio” CTA | Not a silent redirect; UX §4 |

**Fragment / scroll contract (REQ-004/005/009):**

- Enable Angular `withInMemoryScrolling` (`anchorScrolling: 'enabled'`, `scrollPositionRestoration: 'enabled'`).
- Home “Más info” → navigate to `/servicios` with fragment = group id (e.g. `contabilidad`).
- Deep-page Contactar CTA → navigate to `/` with fragment `contacto` (single mechanism; no alternate undecided path).
- Locale switch updates copy in place — **must not** drop the current route or URL fragment.

**URL localization (DD-014):** path segments stay Spanish (`/quienes-somos`, `/servicios`, …) in both locales — matches mockup filenames; only UI strings flip.

### Shell & chrome

| Component | Behavior | Tokens / PrimeNG |
|-----------|----------|------------------|
| `TopNav` | Glass sticky; brand; page links; lang toggle; Contactar; hamburger below collapse breakpoint | `--amd-glass*`, custom + `p-button` |
| `MobileDrawer` | Overlay; focus trap while open; restore focus on close; **page links always**; **Home section anchors when route is `/`** | Glass |
| `HomeSideNav` | Dots + labels (labels revealed on hover / focus-visible / `aria-current` — mockup); **no bar background**; scroll-spy; light → ink `#0D141A` on text **and** circles; dark → gold/light treatment | Custom |
| `WhatsAppFab` | Persistent; `aria-label`; emits `whatsapp_click`; offset so it does not cover primary CTAs | Custom |
| `SiteFooter` | © + legal stub links + page links | — |

**Scroll-spy (conceptual, from mockup):** active section ≈ viewport line at `scrollY + innerHeight * 0.35`; `is-on-light` from the section under each dot’s midpoint.

**Touch:** interactive chrome targets ≥ **44×44px** (REQ-002, UX §9).

### Home sections (atomic)

| Section | Composition | Interaction |
|---------|-------------|-------------|
| `HeroSection` | Full-bleed bg + brand H1 + legal line + promise + CTA pair | Optional storytelling parallax; no cards |
| `ServicesRoadSection` | Axis + 5 alternating nodes/cards | Expand via click/tap **and** keyboard on node/card (Enter/Space); not hover-only; “Más info” → `/servicios` + fragment |
| `AboutTeaserSection` | Visual + short copy | “Ver más” → `/quienes-somos` |
| `TrustSection` | Metrics · logo marquee viewport · testimonial crossfade + dots | Marquee mask on viewport only; ~9s pause |
| `ContactSection` | Meta (Cali, WA) + form | Validate → toast + handoff; emit `contact_submit` |

### Deep pages

| Page | Blocks |
|------|--------|
| Quiénes somos | Page hero · misión/visión cards · 3 leaders |
| Servicios | Page hero · TOC · 5 `ServiceGroup` articles + sub-lists |
| Legal stub | Title + placeholder body + back link |
| 404 | Short message + link Home |

### Design tokens (implement from UX §7 / mockup `styles.css`)

| Token | Value | Role |
|-------|-------|------|
| `--amd-gold` | `#CFBB66` | Accent / primary CTA |
| `--amd-gold-soft` | `#E5D59A` | Hover / soft highlight |
| `--amd-ink` | `#0D141A` | Primary text / dark surfaces |
| `--amd-ink-soft` | `#1D1E20` | Dark panels |
| `--amd-slate` | `#56585E` | Secondary text |
| `--amd-mist` | `#F2F3F6` | Light section bg |
| `--amd-surface` | `#FFFFFF` | Cards / form shell |
| `--amd-border` | `rgba(13,20,26,0.08)` | Light borders |
| `--amd-glass` / `--amd-glass-border` | per UX | Nav / overlays |
| Radius / shadow / blur | UX §7 | Soft cards + glass |
| Fonts | **Sora** (display) · **DM Sans** (body) | DD-012 font loading |

**Forbidden:** Zyro/Hostinger purples (`#673de6`, `#5025d1`, `#8c85ff`) in UI chrome.

### Motion plan

| Effect | Default approach | Reduced motion |
|--------|------------------|----------------|
| Section reveals | CSS / Angular animations + IntersectionObserver | Instant visible / no opacity delay |
| Storytelling parallax (hero) | Factor **0.15–0.35** (UX §7); mockup hero ≈0.22 | Disabled |
| Road ambient deco parallax | Mockup factors **0.08–0.14** allowed as non-informational deco (DD-015) | Disabled |
| Road progress fill | **Passive scroll listener + CSS** (mockup-proven); GSAP ScrollTrigger only if HITL finds progress scrub inadequate (DD-005) | Static full or none |
| Logo marquee | CSS animation on track inside masked viewport | Static row; no loop animation |
| Testimonials | Timer ~9000ms + crossfade; dots | Show first quote or manual-only; no auto timer |
| Motion gate | `core/motion` MatchMedia; no GSAP registration unless DD-005 escalation fires | — |

Prefer CSS for simple transitions (200–400ms, UX easing `cubic-bezier(0.22, 1, 0.36, 1)`).

### i18n

- **Hand-rolled** `LocaleService` + runtime JSON (`es.json` / `en.json`) seeded from mockup `i18n.js` — **no** `@ngx-translate` unless a later enhancement needs it (DD-004).
- Locale signal persisted (`localStorage` key e.g. `amd.locale`).
- `document.documentElement.lang` updated on switch.
- Switch preserves route + fragment (see fragment contract).
- Layout parity: avoid fixed heights that clip EN.
- Deliverable includes **key-parity check** (every key in `es.json` exists in `en.json` and vice versa).

### Form UX states

| State | UI |
|-------|-----|
| Empty | Labels visible; optional service placeholder |
| Invalid | Inline errors under fields; no handoff |
| Submitting (optional brief) | Disable submit only; **must NOT** show a spinner that implies backend round-trip |
| Success | Toast/dialog; open WA and/or mailto; emit `contact_submit`; no “saved to server” copy |
| WA blocked | Contact meta + mailto still available |

Forms implementation: **Reactive Forms** for the contact form in v1 (DD-011). Signal Forms may be adopted later; not gated on scaffold sniffing.

### Breakpoints (chrome) vs verification widths

**Verification widths (REQ-012 / PRD):** 375 · 768 · 1024 · 1440 — always tested; not identical to chrome breakpoints.

**Chrome breakpoints (align mockup):**

| Breakpoint | Behavior |
|------------|----------|
| `< 900px` | Top nav links collapse to hamburger + drawer |
| `≥ 900px` | Top nav page links visible |
| `< 1100px` | Home sidenav hidden |
| `≥ 1100px` | Home sidenav visible (`body.has-side-nav`) |
| ≤375 / stack layouts | Compact hero; road stacks; marquee/parallax minimal |
| 1440 | Content max-width ~1120–1200 (`--max` ≈1160 in mockup); hero full-bleed |

## 7. Shared Contracts / Package Extensions

None across packages. Configurables in environment or `app.config`:

- WhatsApp E.164
- Mailto inbox
- Analytics stub enable flag

## 8. Design Decisions

| ID | Decision | Choice | Rejected | Why |
|----|----------|--------|----------|-----|
| DD-001 | App shape | Multi-route Angular SPA | Scroll-only single route | Mockup v0.1 / REQ-001–002 |
| DD-002 | UI kit | PrimeNG + CSS token override | Raw CSS-only; Angular Material | ADR-002 |
| DD-003 | Contact | Client validation + WA/mailto service | Nest leads now | ADR-003 · REQ-008 |
| DD-004 | i18n | Hand-rolled LocaleService + JSON | `@ngx-translate`; build-time-only `$localize` for v1 toggle | Two locales; instant switch; less deps (REQ-009) |
| DD-005 | Motion libs | CSS + scroll listener first; GSAP only on HITL failure of road scrub | GSAP in scaffold by default | Mockup already works without GSAP; protects NFR-001 |
| DD-006 | Services IA | Home road teaser + deep catalog | Full catalog on Home | Client feedback / REQ-004–005 |
| DD-007 | Sidenav | Float dots, no dark bar; ink on light; gold on dark | Sticky top section anchors; dark rail | Mockup lock |
| DD-008 | Trust motion | Logos marquee vs testimonials paused crossfade | Same treatment for both | Readability (REQ-007) |
| DD-009 | Analytics | Port + stub; events `contact_submit`, `whatsapp_click` | Vendor SDK in v1 | PRD open Q · NFR-004 · REQ-008 |
| DD-010 | UX doc | Patch `docs/ux-ui/design.md` IA in execute | Ignore constitution drift | Proposal R6 · REQ-015 |
| DD-011 | Forms API | **Reactive Forms** for contact v1 | Signal Forms gated on CLI version sniff | Stable test surface for REQ-008/013 |
| DD-012 | Scaffold | Latest stable Angular CLI → `client/`; Vitest **or** Jest = **whatever `ng new` defaults**; define `npm start`, `npm run lint`, `npm run test:agent` (lean reporter); fonts via preconnect + `font-display: swap` (Google or self-host) | Ad-hoc scripts; undefined runner | Closes A1; NFR-006; TRD §12 placeholders become real |
| DD-013 | Folder map vs TRD | `features/home/{…}` + deep features | Literal `landing/hero` paths from TRD §4 | Multi-page IA needs shared Home composition |
| DD-014 | URL locale | Spanish path segments for all locales | Localized path prefixes | Mockup parity; avoids duplicate route trees |
| DD-015 | Parallax ranges | Hero/story **0.15–0.35** (UX); road deco **0.08–0.14** (mockup) | Single blended 0.08–0.35 range | Resolves A2/B3 without inventing a hybrid |

## 9. NFR scenarios (this spec)

| Attribute | Measure (from TRD / REQ) | Tactic in this delivery |
|-----------|--------------------------|-------------------------|
| Performance | Lighthouse Performance ≥ 85 (mobile, static hero) | Lazy deep routes; no autoplay video default; deferred non-critical JS |
| LCP | ≤ 2.5s mid-tier mobile (target) | Optimized hero media; font-display swap |
| a11y | WCAG 2.2 AA on critical flows; contrast ≥ 4.5:1 | Focus rings; labels; named icon-only; road keyboard/touch |
| Modifiability | Token/section change stays local | `tokens.css` + feature folders |
| Security | No secrets beyond public IDs; no Nest surface | WA/mailto only |
| Observability | Events `contact_submit`, `whatsapp_click` invocable | AnalyticsPort stub |
| Local run | `npm install && npm start` → HTTP 200 at `:4200` | DD-012 |
| Availability / scale | N/A (static SPA) | — |

## 10. Test plan hooks

| Suite | Covers |
|-------|--------|
| Unit / component (`npm run test:agent` — defined in DD-012) | Locale persist; **ES/EN key-parity**; form validation; handoff URL builder; sidenav light/dark class logic; service anchor/fragment ids; **router smoke** (declared routes resolve) |
| Lint (`npm run lint -- --quiet`) | TS + template a11y rules where configured |
| Manual / HITL | Visual vs mockup; gold contrast; verification widths; reduced-motion OS toggle; sidenav at ≥1100; drawer &lt;900 |
| Lighthouse | Post-scaffold smoke (NFR-001) — not a unit-test substitute |
| E2E Playwright | Optional late; not required to close every task |

Presence of CSS classes alone ≠ proof of marquee fade scope or sidenav contrast — those need rendered/HITL checks (see requirements defect table).

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Visual drift from mockup | Keep mockup path as SoT; HITL/T6 review before archive |
| Accidental GSAP weight | DD-005: no GSAP until HITL escalates road scrub |
| EN copy overflow | Review strings at 375 width; flex-wrap CTAs |
| Incomplete Riesgo/Marca copy | Placeholders labeled; content swap without structural change |
| UX constitution stale mid-execute | DD-010 / REQ-015 as dedicated task |
| CLI default test runner unfamiliar | DD-012: accept `ng new` default; wrap with `test:agent` script — do not dual-maintain Jest+Vitest |

## 12. Alignment notes

- Stays within proposal Option A and mockup v0.1.
- Supersedes constitutional UX **IA diagrams only** via REQ-015 — does **not** supersede TRD ADRs (parallax **story** range still UX §7; deco exception is DD-015 only).
- Judgment fix-only (2026-08-05): closed A1, B1, and confirmed WARNING themes; no re-judge.
- No kaizen-log Active Lessons file present — none cited.

## 13. Judgment fix map

| Finding | Resolution in this doc |
|---------|------------------------|
| A1 scaffold | DD-012 + Overview local run + §9 NFR-006 |
| B1 / A6 budget | Budget → 14 tasks · 16–20 rounds · LOC 3200–4200 |
| A2 / B3 parallax | DD-015 + Motion plan split ranges |
| A3 / B7 fragments | Routes table + fragment contract; 404 page not redirect |
| A4 / B10 analytics names | `AnalyticsEvent` + DD-009 + Form/FAB emit |
| A5 LOC | Raised band + mockup baseline note |
| A7 / coverage touch-road-drawer | Shell + ServicesRoad + Touch row |
| A8 / B11 / NFR-006 | §9 measure + tactic columns |
| B2 breakpoints | Chrome vs verification widths table |
| B4 GSAP | DD-005 mockup-first |
| B5 / A9 forms | DD-011 Reactive Forms pinned |
| B6 test hooks | Router + key-parity in §10 |
| B8 i18n lib | DD-004 hand-rolled |
| A10–A12 / B9 / B12 / B13 | TRD map DD-013; URL DD-014; sidenav reveal + dark gold; scroll-spy; drawer Home anchors |
