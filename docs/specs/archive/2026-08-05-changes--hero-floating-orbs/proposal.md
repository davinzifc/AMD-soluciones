# Proposal — Reusable ambient orbs (hero first)

Ship a **reusable ambient orb field** (Mamboleoo-style orbital bokeh) and apply it first on the Home hero so dark backgrounds can opt in later without re-implementing motion.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Slug | `hero-floating-orbs` |
| Type | Change |
| Approval Mode | gated |
| Status | **Approved** — specify complete; ready for `/akili-execute` |
| Phase | 1-landing (post-`domain/landing`) |
| Depends on | `archive/2026-08-05-domain--landing` (shipped hero + parallax) |
| Parallel-safe | yes — shared ambient component + hero consumer |
| Requirement source | Free-text + HITL mock |
| Related | `docs/prd.md` §6 US-5 · `docs/ux-ui/design.md` §1.3 / §7 · DD-005 / DD-015 |
| Kaizen | **KZ-001** — do not resize HITL controls while editing motion CSS |
| HITL defaults | **count 8 · sizeMin 300 · sizeMax 560 · baseDuration 16s** |

## Intent

Make the hero atmosphere feel alive with soft orbital orbs, and expose the same field as a **drop-in background decoration** for future dark sections — without GSAP and without hand-authored keyframes per orb.

## Problem / Current Behavior

| Today | Gap |
|-------|-----|
| Hero ambient = static dual radial on `.parallax-layer` | No independent drift at rest |
| Motion only via scroll parallax | First viewport feels static |
| No shared ambient primitive | Any future section would reinvent the effect |

## Proposed Outcome

1. **Reusable** `app-ambient-orbs` (Angular) with inputs: `count`, `sizeMin`, `sizeMax`, `durationSec` (+ optional colors).
2. **First consumer:** Home `HeroSection` — replace static dual-gradient plate; keep scroll parallax on a parent host.
3. Motion = Mamboleoo orbit (`rotate` + offset `transform-origin`) + soft radial discs (not clipped box-shadow squares).
4. HITL defaults: **8 orbs · 300–560px · ~16s**.
5. `prefers-reduced-motion` → pause/static; `aria-hidden`; no pointer events.

## Scope

| In | Out |
|----|-----|
| Shared ambient component under `client/src/app/core/ambient/` (or `shared/`) | Wiring every landing section in this change |
| Hero Home as first mount | Services-road `.road__deco` rewrite |
| CSS-only orbit (no GSAP) | New brand color tokens |
| Reduced-motion + KZ-001 discipline | Server / API |

**Chunking:** one spec — shared component + hero integration (Lite).

## Non-Goals

| Out | Why |
|-----|-----|
| Auto-apply to all sections | Opt-in per surface in later specs |
| Video / Lottie / particles / GSAP | LITE + DD-005 CSS-first |
| Floating badges / chips on hero | UX §6 / REQ-003 |
| Changing DD-015 parallax factor | Keep story parallax contract |

## Affected Users, Systems, And Specs

| Who / what | Impact |
|------------|--------|
| P1 / P2 on `/` hero | Ambient motion |
| Reduced-motion users | Static orbs |
| `core/ambient/` (new) | Reusable primitive |
| `features/home/hero/` | First consumer |
| Future dark sections | Can mount same component |

## Visual Reference

| Field | Value |
|-------|-------|
| Source | HTML mockup **v0.4** + [Mamboleoo BxMQYQ](https://codepen.io/Mamboleoo/pen/BxMQYQ) |
| Location | `docs/specs/changes/hero-floating-orbs/mockup/` |
| Files | `ambient-orbs.js`, `ambient-orbs.css`, `index.html`, `hero-orbs.*`, `README.md` |
| Notes | HITL locked **8 · 300–560 · ~16s**. API demo: `AmbientOrbs.mount(host, opts)`. Soft radial+blur (v0.3 box-shadow looked square when clipped). **Visual SoT for specify.** |

## Requirement Delta Preview

### ADDED Requirements

- Shared ambient-orbs component mountable on any positioned background host.
- Defaults: count 8, size ∈ [300, 560]px, mean orbit ~16s (HITL).
- Orbital bokeh while motion allowed; paused/static under `prefers-reduced-motion`.
- Non-interactive (`aria-hidden`).

### MODIFIED Requirements

- Hero ambient layer: static dual radial → parallax host + reusable ambient-orbs field.

### REMOVED Requirements

- None.

## Approach Options

| Option | Idea | Verdict |
|--------|------|---------|
| A — CSS translate loops | Mechanical | Rejected HITL |
| B — GSAP wander | Natural, heavier | Not needed after BxMQYQ |
| **C — Reusable Mamboleoo orbit field** ★ | `AmbientOrbs` / `<app-ambient-orbs>` | **Chosen** |

## Recommended Approach

1. Extract reusable styles/behavior (mock already: `ambient-orbs.js/css`).
2. Angular: standalone `AmbientOrbsComponent` with `@Input()` mirrors of HITL options; spawn orbs in `AfterViewInit` / on input changes; tear down on destroy.
3. Hero: empty host inside parallax parent; `<app-ambient-orbs>` with HITL defaults; remove dual-gradient plate.
4. Document drop-in recipe for future sections (host `position` + component).
5. No GSAP.

### Future drop-in (after ship)

```html
<section class="dark-section" style="position: relative">
  <app-ambient-orbs [count]="8" [sizeMin]="300" [sizeMax]="560" [durationSec]="16" />
  …
</section>
```

## Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|------|------------|
| UX “empty decoration” | Atmosphere = brand presence; keep soft opacity |
| Perf with 8 large blurs | Blur budget + reduced-motion; Lighthouse check |
| Filter cost on low-end | Cap count via input; HITL max 8 |
| KZ-001 | Tasks must not touch control geometry |
| Ambient duration vs UX 200–400ms tokens | Name class `ambient-orbit` in specify — not chrome motion tokens |

### Open questions for approver

1. **¿Apruebas propuesta + HITL 8 / 300–560 / ~16s?** (visual ya “me gustó”)
2. **¿Confirmamos CSS-only (sin GSAP)?**
3. First ship = shared component + hero only (otros fondos después) — ¿OK?

## Success Criteria

- [ ] Reusable ambient component documented and used on hero.
- [ ] HITL defaults applied (8 · 300–560 · ~16s).
- [ ] Soft circular glows (no square clip artifacts).
- [ ] Reduced-motion → static; parallax still DD-015 on hero parent.
- [ ] Drop-in recipe exists for future backgrounds.
- [ ] KZ-001 respected; lint/tests green on touched files.

## Next Step

```text
/akili-execute changes/hero-floating-orbs
```

Recommended depth: **Lite** (shared component + hero wire-up). Spec set approved 2026-08-05.
