# Design — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Status | **Approved** — specify complete (verification checklist 2026-08-05) |
| Depth | **Lite** |
| Tier impact | none — extends LITE client UI only |
| Requirements | `requirements.md` REQ-001…003 · NFR-001…003 |
| Visual SoT | `mockup/` v0.4 · HITL **8 · 300–560 · ~16s** |
| Kaizen applied | **KZ-001** (no control geometry edits) · **KZ-002** (no `body`/`html` visibility selectors) |

## Budget (Step 2.4)

| Signal | Estimate |
|--------|----------|
| Expected tasks | **2** |
| Expected LOC | **~180** (component + CSS + hero wire + specs) |
| Expected review rounds | **1–2** |

Depth check: Lite still fits (shared primitive + one consumer). Not `/akili-quick` — reusable contract + motion/a11y scenarios.

## 1. Overview

Build a standalone **AmbientOrbs** field in `client/src/app/core/ambient/` and mount it inside the Home hero parallax host, replacing the static dual-radial paint on `.parallax-layer` while keeping scroll parallax and `MotionService` gating.

## 2. Architecture Overview

```text
HeroSection
  ├─ .hero__bg          (unchanged atmosphere + grid)
  ├─ .parallax-layer    (scroll translate only — no dual radial paint)
  │    └─ <app-ambient-orbs>   ← NEW reusable field
  └─ content / CTAs / scroll cue
```

| Piece | Path |
|-------|------|
| AmbientOrbsComponent | `client/src/app/core/ambient/ambient-orbs/` |
| Hero consumer | `client/src/app/features/home/hero/` |
| Motion gate | existing `MotionService` |
| Server | N/A |

No C4 change. No new packages (CSS-only orbit — DD-005).

## 3. Data Model

N/A — no persistence. Runtime-only orb descriptor (size, color, origin, duration) generated in the component; not a shared domain model.

## 4. API Contracts

**None** — phase 1 client-only.

## 5. Frontend / UX Component Architecture

### Components

| Component | Role |
|-----------|------|
| `AmbientOrbsComponent` (`app-ambient-orbs`) | Spawns N soft circular orbs; applies orbital CSS animation; pauses under reduced-motion |
| `HeroSection` | Hosts field inside `#parallaxLayer`; passes HITL defaults; keeps parallax JS |

### Inputs (reuse contract)

| Input | Default (HITL) | Notes |
|-------|----------------|-------|
| `count` | `8` | Max practical blur budget for hero |
| `sizeMin` | `300` | px |
| `sizeMax` | `560` | px; clamp if min > max |
| `durationSec` | `16` | Mean orbit period; per-orb scatter ± |
| `colors` | optional | Default: gold / gold-soft / cool-ink rgba from tokens |

### Tokens

| Token / value | Use |
|---------------|-----|
| `--amd-gold` `#CFBB66` | Orb color stop (opacity) |
| `--amd-gold-soft` `#E5D59A` | Softer orb |
| Cool ink `rgba(45,58,70,…)` | Existing hero parallax ink (parity with shipped plate) |
| Motion class `ambient-orbit` | ~16s linear rotate — **not** UI chrome 200–400ms |

### Motion plan

| Effect | Approach | Reduced motion |
|--------|----------|----------------|
| Orbital drift | CSS `@keyframes` rotate around random `transform-origin` (Mamboleoo) | `animation-play-state: paused` or no animation + `MotionService` / media query |
| Soft disc | `border-radius: 50%` + radial-gradient + `filter: blur` | Static discs OK |
| Hero parallax | Unchanged `scrollY * 0.22` on parent | Unchanged clear transform |

**Clip rule:** do not `overflow: hidden` on the orb field in a way that squares soft glows (mock v0.3 lesson). Hero may keep overflow for layout; orbs use radial+blur so edges fade before hard clip.

### Composition / a11y

- Field `aria-hidden="true"`; `pointer-events: none`
- Behind content (`z-index` under `.hero__content`)
- No badges/chips (UX §6)

### i18n

None — decorative only.

## 6. Backend Design

**N/A — phase boundary.**

## 7. Design Decisions

| ID | Decision | Choice | Rejected | Why |
|----|----------|--------|----------|-----|
| DD-HFO-001 | Motion engine | CSS orbit (Mamboleoo) | GSAP wander; fixed translate loops | HITL preferred BxMQYQ; DD-005 CSS-first |
| DD-HFO-002 | Placement | `core/ambient/` shared | Hero-only private CSS | REQ-001 reuse |
| DD-HFO-003 | Glow rendering | Radial + blur | box-shadow only | Mock: box-shadow clipped → square |
| DD-HFO-004 | Reduced motion | Pause via class + `MotionService` / MQ | Destroy DOM | REQ-003; keep static atmosphere |
| DD-HFO-005 | Replace parallax-layer paint | Remove dual radial CSS | Keep both | Orbs supersede plate; `.hero__bg` still supplies base gold wash |

### Reversion challenge (Step 2.3) — DD-HFO-005

**Removing:** dual `radial-gradient` on `.parallax-layer`.

**What breaks?** No test asserts those backgrounds (hero specs only check transform / brand / CTAs). Base atmosphere remains on `.hero__bg`. Ambient orbs intentionally replace the plate. **Outcome:** safe reversion if orbs ship in same change; do not remove plate without mounting orbs.

## 8. NFR scenarios

| Attribute | Response |
|-----------|----------|
| a11y | Orbs never focusable; reduced-motion pauses orbit |
| Performance | Count default 8; blur soft; no GSAP; Lighthouse soft-check post-ship |
| Maintainability | One component + inputs for future sections |

## 9. Test plan hooks

| Suite | Cover |
|-------|-------|
| Unit `ambient-orbs.spec.ts` | Default count; size within min–max; `aria-hidden`; paused when `MotionService.reducedMotion()` true; inputs override |
| Unit `hero-section.spec.ts` | Field present inside parallax layer; parallax transform still applied; CTAs unchanged |
| HITL | Soft circular (not square); brand-first not overpowered |
| Manual | OS reduced-motion toggle |

**Presence ≠ behavior:** asserting a CSS class exists does not prove orbit or roundness — unit covers DOM contract + pause wiring; roundness/composition = HITL.

## 10. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Blur cost on low-end | Cap count via input; HITL max 8 |
| Square clip regression | Radial+blur; avoid overflow clip on field (**DD-HFO-003**) |
| KZ-001 | Tasks forbid editing CTA/nav/FAB sizes |
| “Empty decoration” | Soft opacity; brand atmosphere role documented in REQ |

## 11. Drop-in recipe (future sections)

1. Section `position: relative` (or absolute fill host).
2. Place `<app-ambient-orbs [count]="…" … />` behind content.
3. Optionally wrap in a parallax parent if scroll storytelling is desired.
4. Do not auto-mount — opt-in only (REQ-001).
