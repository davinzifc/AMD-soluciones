# Tasks — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Status | **Approved** — specify complete (verification checklist 2026-08-05) |
| Depth | **Lite** |
| Execution log | `execution.md` (created at `/akili-execute`) |
| Budget | 2 tasks · ~180 LOC · 1–2 review rounds (`design.md`) |
| Skills map | `angular-developer`, `ui-ux-pro-max` (visual/motion UX) — **no** `gsap-animation` |

## Coverage map (scenario / clause → task)

| Clause | Owner |
|--------|-------|
| REQ-001 Mount with HITL defaults (8 · 300–560 · ~16s) | T001 |
| REQ-001 inputs overridable | T001 |
| REQ-001 must NOT require GSAP | T001 |
| REQ-001 Drop-in non-hero (no HeroSection dependency) | T001 |
| REQ-001 must NOT auto-mount | T001 (component only; no global bootstrap) |
| REQ-002 Hero mounts field; parallax preserved | T002 |
| REQ-002 brand/CTAs only interactive job; no cards/badges | T002 |
| REQ-002 must NOT change control geometry (KZ-001) | T002 |
| REQ-003 reduced-motion pause/static | T001 (+ T002 smoke that hero still gates parallax) |
| REQ-003 aria-hidden / no pointer events | T001 |
| NFR-001 AMD token colors | T001 |
| NFR-002 ambient-orbit duration class | T001 |
| NFR-003 CSS-only | T001 |

## Dependency graph

```text
T001 → T002
```

---

## T001 — AmbientOrbs reusable component

- **Status:** [x]
- **Requirements:** REQ-001, REQ-003, NFR-001, NFR-002, NFR-003
- **Design refs:** DD-HFO-001…004 · §5 Frontend · mockup `ambient-orbs.*`
- **Exemplar:** `client/src/app/core/motion/motion.service.ts` (reduced-motion gate); mockup `mockup/ambient-orbs.js`
- **Verification:** `cd client && npm run test:agent -- ambient-orbs` then `cd client && npm run lint -- --quiet`
- **Evidence disqualifier:** Green tests that only assert a CSS class string exists without checking orb count / size bounds / `aria-hidden` / pause wiring do **not** count. jsdom cannot prove visual roundness — record that as HITL gap (accepted in requirements §5).
- **Presence-assertion limit:** Asserting `@keyframes` name in CSS does not prove orbit feels correct — behavior proof for pause is DOM/`animation-play-state` or paused class when `MotionService.reducedMotion()` is true.

### Scope

- Create standalone `AmbientOrbsComponent` (`app-ambient-orbs`) under `core/ambient/ambient-orbs/`.
- Inputs with HITL defaults: `count=8`, `sizeMin=300`, `sizeMax=560`, `durationSec=16`; optional `colors`.
- Spawn soft radial+blur discs; CSS orbital keyframes (Mamboleoo); random size ∈ [min, max].
- `aria-hidden="true"`; `pointer-events: none`.
- Pause orbit when `MotionService.reducedMotion()` (and CSS `@media` defense-in-depth).
- No GSAP dependency. No hero imports.

### Tests

- Defaults produce 8 orbs; sizes within [300, 560] when measurable from inline styles.
- Overriding inputs changes count.
- Host is `aria-hidden`; field does not use pointer events.
- When `MotionService` reports reduced motion → paused/static (class or play-state).
- Component file tree has no `gsap` import.

### Done when

- [x] Component builds and unit tests above pass
- [x] Lint quiet on touched files
- [x] Drop-in possible without `HeroSection` (no hero import)
- [x] KZ-002: no `body`/`html` ancestor selectors for show/hide

### BUT / AND IT MUST (from scenarios)

- [x] MUST expose overridable inputs
- [x] must NOT require GSAP
- [x] must NOT auto-mount globally
- [x] MUST pause under reduced-motion; MAY keep static glows
- [x] must NOT intercept pointer / must stay out of a11y tree

---

## T002 — Hero mounts AmbientOrbs; remove dual-radial plate

- **Status:** [x]
- **Size:** S (~60 LOC)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/hero/` only (+ import from `core/ambient`) — never touch nav/FAB geometry
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-002 (primary), REQ-003 smoke via existing parallax tests
- **Design refs:** DD-HFO-005 · §2 Architecture · reversion challenge
- **Exemplar:** current `hero-section.ts` parallax pattern
- **Verification:** `cd client && npm run test:agent -- hero-section` then `cd client && npm run lint -- --quiet`
- **Evidence disqualifier:** Passing tests after editing `.btn` / top-nav / FAB sizes — **FAIL** even if green (KZ-001). Diff must not change control min-width/height/padding of CTAs or chrome.
- **HITL (visual):** Confirm soft circular orbs (not square) and brand-first composition — not substitutable by unit green.

### Scope

- Import and place `<app-ambient-orbs>` inside `.parallax-layer` (HITL defaults).
- Remove dual `radial-gradient` paint from `.parallax-layer` CSS (keep transform/parallax rules).
- Keep `.hero__bg` atmosphere; keep `HERO_PARALLAX_FACTOR` scroll behavior + reduced-motion clear.
- Do **not** edit CTA/nav/FAB/scroll-cue control geometry.

### Tests

- `app-ambient-orbs` (or host marker) present under `.parallax-layer`.
- Existing parallax transform tests still pass.
- Brand / CTA assertions unchanged.
- Optionally assert `.parallax-layer` computed background no longer carries the old dual-circle plate (if reliably testable); else CSS review in Reviewer.

### Done when

- [x] Hero tests + lint pass
- [x] Dual-radial plate removed from parallax-layer CSS
- [x] Diff contains no KZ-001 geometry changes
- [x] HITL note prepared: circular glow + brand not overpowered

### BUT / AND IT MUST (from scenarios)

- [x] MUST keep brand/CTAs as only interactive first-viewport job
- [x] must NOT add cards/badges/chips/overlays
- [x] must NOT change nav/CTA/FAB control geometry (KZ-001)
- [x] Parallax contract preserved

---

## PR strategy

**Single PR** — ~180 LOC, two sequential tasks, one feature surface. No split needed.

## Estimated LOC

| Area | LOC |
|------|-----|
| AmbientOrbs component + CSS + spec | ~120 |
| Hero wire-up + CSS + spec tweaks | ~60 |
| **Total** | **~180** |

## First task

Start with **T001** (`AmbientOrbs` + tests).
