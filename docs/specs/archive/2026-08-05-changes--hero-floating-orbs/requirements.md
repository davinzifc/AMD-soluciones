# Requirements — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Status | **Approved** — specify complete (verification checklist 2026-08-05) |
| Depth | **Lite** |
| Approval Mode | gated (from proposal) |
| Phase | 1-landing |
| Type | Change |
| Related PRD | `docs/prd.md` (US-5 reduced-motion; premium atmosphere) |
| Related UX | `docs/ux-ui/design.md` §1.3 Motion · §6 Hero · §7 tokens |
| Related TRD | `docs/trd/trd.md` (LITE client; DD-005 CSS-first from landing) |
| Visual SoT | `mockup/` **v0.4** + HITL **8 · 300–560px · ~16s** |
| Proposal | `proposal.md` |
| Kaizen | **KZ-001** (no control-geometry churn) |

## 1. Context & Goal

Ship a **reusable soft-orbit ambient orb field** and mount it on the Home hero so the first viewport has living brand atmosphere without competing with CTAs — and so future dark backgrounds can opt in without reimplementing motion.

## 2. Actors

| Actor | Role |
|-------|------|
| P1 / P2 visitors | See soft orbital atmosphere on Home hero |
| Reduced-motion visitors | See static orbs; no orbit animation |
| Implementer | Builds shared component + hero wire-up |

## 3. Glossary

| Term | Meaning |
|------|---------|
| Ambient orbs | Soft circular glows that drift slowly behind section content |
| Orbital bokeh | Motion via CSS rotation around an offset origin (Mamboleoo-style) |
| Host | Positioned container that fills a section background |
| HITL defaults | count **8**, sizeMin **300px**, sizeMax **560px**, mean duration **~16s** |

## 4. System Context & Scope

```text
[Visitor] → Home hero → reusable ambient-orbs field (CSS orbit)
                      ↘ future dark sections MAY mount same field (not this ship)
```

| In | Out |
|----|-----|
| Shared ambient-orbs primitive in `client/` | Auto-wiring all landing sections |
| Hero as first consumer | Services-road deco rewrite |
| CSS-only orbit; AMD gold/ink colors | GSAP / Lottie / particles |
| Reduced-motion pause/static | New brand hex tokens; Nest |

## 5. Defect classes & verification gates

| Defect class | Example failure | Gate |
|--------------|-----------------|------|
| Motion ignores reduced-motion | Orbs still orbit | Unit/DOM assert pause class or animation-play-state + manual OS toggle |
| Non-circular / clipped square glow | Hard rectangular edges | **HITL visual** (mock proved box-shadow clip failure) — no reliable unit gate |
| Hero interaction regression | CTAs/nav hit targets changed (**KZ-001**) | Reviewer + existing hero tests; task must forbid geometry edits |
| Reuse contract missing | Only hero-hardcoded; cannot mount elsewhere | Unit: component accepts inputs; design documents drop-in |
| Brand color drift | Purple / non-token colors | CSS review vs `--amd-gold` / ink rgba |
| Perf / blur overload | Hero Lighthouse collapse | Manual Lighthouse after ship (accepted soft gate); count capped at HITL max |

Accepted risk: subjective “naturalness” of orbit — HITL already preferred mock v0.4 defaults.

## 6. Functional Requirements

### REQ-001 — Reusable ambient orb field

The system SHALL provide a reusable ambient orb field that any positioned background host can mount, with configurable count, size range, and orbit duration.

#### Scenario: Mount with HITL defaults

```text
GIVEN a positioned host in a dark section
WHEN the ambient field mounts with default inputs
THEN it SHALL render 8 soft circular orbs
AND each orb size SHALL fall within 300px–560px
AND orbit mean duration SHALL be approximately 16s
AND IT MUST expose inputs so callers can override count, sizeMin, sizeMax, and duration
BUT it must NOT require a second motion library (e.g. GSAP) for this behavior
```

#### Scenario: Drop-in on a non-hero host

```text
GIVEN a future dark section with a positioned host
WHEN that section mounts the same ambient field component
THEN the field SHALL render without depending on HeroSection internals
BUT it must NOT auto-mount on sections that did not opt in
```

### REQ-002 — Home hero consumes ambient orbs

The Home hero SHALL use the reusable ambient field behind brand/CTAs, replacing the static dual-radial ambient plate, while preserving existing scroll parallax behavior on the ambient host parent.

#### Scenario: First viewport atmosphere

```text
GIVEN a visitor opens Home `/` with motion allowed
WHEN the hero first viewport is shown
THEN soft orbital orbs SHALL be visible behind the brand and CTAs
AND scroll parallax on the ambient parent SHALL continue to behave within the existing hero parallax contract
AND IT MUST keep brand and CTAs as the only interactive jobs of the first viewport
BUT it must NOT add cards, badges, chips, or overlays on hero media
AND IT MUST NOT change nav/CTA/FAB control geometry (KZ-001)
```

### REQ-003 — Reduced motion and non-interactivity

Ambient orbs SHALL respect `prefers-reduced-motion` and SHALL NOT capture pointer or keyboard interaction.

#### Scenario: Reduced motion

```text
GIVEN the user prefers reduced motion
WHEN the ambient field is visible
THEN orb orbit animation SHALL be paused or absent
AND orbs MAY remain visible as static soft glows
AND IT MUST leave content readable and CTAs usable
```

#### Scenario: Decorative only

```text
GIVEN ambient orbs are rendered
WHEN the user tabs or clicks through the hero
THEN focus and clicks SHALL reach brand CTAs and chrome as before
AND the orb field SHALL be hidden from assistive tech (`aria-hidden` or equivalent)
BUT it must NOT intercept pointer events
```

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | Colors SHALL use approved AMD gold/ink tokens (or opacities thereof) — no new brand hex. |
| NFR-002 | Motion class is ambient-orbit (~16s), distinct from UI chrome 200–400ms tokens. |
| NFR-003 | Implementation SHALL stay CSS/DOM-based (DD-005 CSS-first); no GSAP for this ship. |

## 8. Non-goals

- Applying orbs to services-road, trust, or every dark section in this change
- GSAP / canvas / WebGL particle systems
- Changing hero parallax factor ranges (DD-015)
- Altering HITL-approved control sizes (KZ-001)

## 9. Traceability

| REQ | UX / prior | Notes |
|-----|------------|-------|
| REQ-001 | Proposal reusable outcome | Mock `AmbientOrbs.mount` |
| REQ-002 | UX §6 Hero; landing hero parallax | First consumer |
| REQ-003 | PRD US-5; UX §1.3 / reduced-motion | a11y |
| NFR-* | UX §7 tokens; DD-005 | |

## 10. Open Questions

None blocking — HITL defaults and CSS-only approach taken from approved mock preference. Formal proposal approval implied by `/akili-specify` start; confirm at Phase 1 gate below.
