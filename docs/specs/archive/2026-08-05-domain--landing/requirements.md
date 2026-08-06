# Requirements — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Status | Approved (Phase 1 gate 2026-08-05) |
| Depth | **Standard** |
| Approval Mode | gated (from proposal) |
| Phase | 1-landing |
| Type | Change (greenfield) |
| Related PRD | `docs/prd.md` |
| Related UX | `docs/ux-ui/design.md` (IA to align with mockup v0.1) |
| Related TRD | `docs/trd/trd.md` |
| Visual SoT | `docs/specs/domain/landing/mockup/` **v0.1** (approved 2026-08-05) |
| Proposal | `proposal.md` (Approved) |

## 1. Context & Goal

Ship a local-runnable Angular marketing site that matches mockup **v0.1**: bilingual multi-page experience (Home scroll chapters + deep pages) that converts visitors via form and WhatsApp — **without** Nest/API in this phase.

## 2. Actors

| Actor | Role in this spec |
|-------|-------------------|
| P1 — Emprendedor / PYME (ES) | Primary visitor; discovers offer and contacts in Spanish |
| P2 — Founder / ops lead (EN) | Same journey in English |
| Equipo AMD | Content owners later; not a product actor in v1 UI |
| Agent / developer | Implements and verifies against these requirements |

## 3. Glossary

| Term | Meaning |
|------|---------|
| Home | Route `/` — scroll sections: Inicio, Servicios (road), Sobre, Confianza, Contacto |
| Deep page | Routed page outside Home scroll: Quiénes somos, Servicios, legal stubs |
| Dual nav | Top nav = site pages; left float dots = Home section anchors only |
| Service group | One of 5 lines: Contabilidad, Gestión Administrativa, Sistemas de Riesgo, Asesoría, Marca |
| Handoff | Phase-1 contact path: WhatsApp `wa.me` and/or `mailto:` after client validation |
| Mockup v0.1 | Approved HTML visual/IA contract under `mockup/` |

## 4. System Context & Scope

```text
[Visitor ES/EN] → [Angular SPA client/] → WhatsApp / mailto
                 ↘ (NOT this spec) Nest API
```

| In | Out |
|----|-----|
| `client/` Angular + PrimeNG themed + i18n ES/EN | `server/`, Nest, leads persistence, email SMTP |
| Multi-page routes + Home chapters | Admin, auth, pagos, CMS, blog |
| Client form + WhatsApp FAB | PROD deploy / cloud |
| Analytics event stub | Global dark/light toggle |
| Legal stub routes/links | Final signed legal copy; final client logo assets |

**Chunking:** Single spec `domain/landing` (proposal Option A). No split.

## 5. Defect classes & verification gates

| Defect class | Example failure | Gate that catches it |
|--------------|-----------------|----------------------|
| Routing / IA wrong | Deep page 404; sidenav on Servicios | Unit/router tests + manual route walk |
| Form / handoff logic | Invalid submit opens WA; missing required | Unit/component tests |
| i18n key missing / locale leak | EN page shows ES strings; locale lost on nav | Unit tests on locale service + key-parity check |
| a11y structural | Missing labels, broken focus, icon-only without name | Lint a11y + focused component tests |
| Motion ignores reduced-motion | Parallax/marquee still runs | CSS/media-query test or manual with OS setting |
| Visual / composition drift vs mockup | Hero has cards; sidenav dark bar; logos fade covers title | **No automated gate** → HITL visual review at pause; prefer **T6 Multimodal** if host supports vision |
| Contrast (gold on dark) | Text fails 4.5:1 | Partial axe; **HITL / T6** for gold-on-ink edge cases |
| Performance | LCP / Lighthouse &lt; 85 | Manual Lighthouse post-scaffold (not a green unit-test substitute) |
| Phase boundary leak | Nest code or API calls in phase 1 | Reviewer + directory-boundary check |

Accepted risk: rasterized atmosphere imagery alt-text truthfulness — acknowledge; human copy review.

## 6. Functional Requirements

### REQ-001 — Multi-page marketing shell

The system SHALL provide a multi-page public site with Home, Quiénes somos, Servicios, and stub legal surfaces, runnable locally per `docs/infrastructure.md` (`http://localhost:4200` post-scaffold).

#### Scenario: Navigate site pages

- GIVEN the app is running locally
- WHEN the visitor opens Home, Quiénes somos, or Servicios from the top nav
- THEN each surface loads as its own route (not only in-page scroll)
- AND IT MUST show shared chrome (brand, top nav, language, WhatsApp FAB)
- BUT it must NOT require any Nest/`server/` dependency

---

### REQ-002 — Dual navigation model

The system SHALL use top navigation for site pages and a left float section nav only on Home.

#### Scenario: Home dual nav

- GIVEN the visitor is on Home
- WHEN they view the page on desktop widths where sidenav is shown
- THEN top nav links to Home / Quiénes somos / Servicios (+ ES/EN + Contactar CTA)
- AND left float shows dots+labels for `#inicio`, `#servicios`, `#sobre-amd`, `#confianza`, `#contacto`
- AND IT MUST have no dark bar / opaque sidenav background (dots+labels only)
- BUT it must NOT place Home section anchors in the top nav as primary page links

#### Scenario: Deep page has no section sidenav

- GIVEN the visitor is on Quiénes somos or Servicios
- WHEN the page renders
- THEN the left Home section sidenav is absent
- AND top nav remains available

#### Scenario: Sidenav contrast on light sections

- GIVEN Home sidenav is visible
- WHEN the active/overlapping section is a light surface
- THEN sidenav label text and circles use ink `#0D141A`
- AND when over dark surfaces they use gold/light treatment consistent with mockup v0.1
- AND IT MUST update via scroll-spy as the visitor scrolls

#### Scenario: Mobile chrome

- GIVEN viewport ≤768 (approx.)
- WHEN the visitor opens the menu
- THEN a glass/overlay drawer exposes page links (and Home section links when on Home)
- AND touch targets are ≥ 44×44px
- BUT it must NOT leave the WhatsApp FAB covering primary CTAs unreadably

---

### REQ-003 — Brand-first Home hero

The Home hero SHALL present AMD brand as the dominant first-viewport signal, then promise and CTAs, on a full-bleed atmosphere plane.

#### Scenario: First viewport composition

- GIVEN a first-time visitor lands on Home
- WHEN the first viewport is visible
- THEN brand reads as `AMD Soluciones` with secondary line `Integrales S.A.S.`
- AND one promise sentence and a primary+secondary CTA group are present
- AND IT MUST keep brand visually dominant over the promise headline/copy
- BUT it must NOT include cards, stat strips, floating badges, or inset hero media cards in the first viewport

---

### REQ-004 — Home services road (5 groups)

Home SHALL present five service groups as an interactive scroll road/timeline with expand and deep-link to Servicios.

#### Scenario: Expand group and deep-link

- GIVEN the visitor is on Home `#servicios`
- WHEN they activate a road node/card for a group (e.g. Contabilidad)
- THEN the card expands to show a short detail and a “Más info” / “More info” control
- AND activating “Más info” navigates to the Servicios page anchored to that group (`#contabilidad` …)
- AND IT MUST cover all five groups: Contabilidad, Gestión Administrativa, Sistemas de Riesgo, Asesoría, Marca
- BUT it must NOT dump the full sub-service catalog into the Home road

#### Scenario: Road progress

- GIVEN reduced motion is not preferred
- WHEN the visitor scrolls through the services road
- THEN a progress/reveal treatment tracks scroll along the road axis (per mockup intent)
- BUT if `prefers-reduced-motion: reduce`, progress/parallax motion MUST be suppressed or static

---

### REQ-005 — Servicios deep page

The Servicios page SHALL list the five groups with sub-services and in-page TOC/anchors matching Home deep-links.

#### Scenario: Anchor from Home

- GIVEN the visitor clicks “Más info” for Sistemas de Riesgo on Home
- WHEN the Servicios page loads
- THEN the `#riesgo` (or equivalent) group is reachable/visible via the hash
- AND Contabilidad/Administrativa sub-services reflect current public offering content
- AND Riesgo/Marca MAY use validated placeholders until AMD finalizes copy
- BUT it must NOT omit any of the five group anchors expected by Home

---

### REQ-006 — Sobre teaser and Quiénes somos deep page

Home SHALL tease About; Quiénes somos SHALL carry misión, visión, and three leaders.

#### Scenario: Ver más

- GIVEN the visitor is on Home `#sobre-amd`
- WHEN they activate “Ver más” / “See more”
- THEN they navigate to Quiénes somos
- AND that page shows misión, visión, and leaders Ana María Daza, María Camila Sanchez, Leidy Yurani Villamil with roles
- BUT it must NOT require stuffing full legal/deep bios into the Home teaser

---

### REQ-007 — Trust: metrics, logo marquee, testimonials

Home Confianza SHALL show metrics, a looping logo/sector strip, and readable testimonials.

#### Scenario: Logo marquee fade scope

- GIVEN Confianza is visible and reduced motion is off
- WHEN logos/sectors animate in a continuous loop
- THEN edge fade/mask applies only to the card strip viewport
- AND IT MUST keep the section title/lead fully legible (no fade over the heading)
- BUT if `prefers-reduced-motion: reduce`, the strip MUST NOT keep fluid marquee motion (static or equivalent)

#### Scenario: Testimonials readable pause

- GIVEN Confianza testimonials are rotating and reduced motion is off
- WHEN a quote is shown
- THEN it remains visible long enough to read (~9s pause before advance, per mockup)
- AND rotation uses crossfade (not a fluid horizontal marquee of quotes)
- AND IT MUST expose controls or dots for manual selection where mockup provides them
- BUT it must NOT advance so fast that quotes are unreadable

---

### REQ-008 — Contact form and messaging handoff

The system SHALL validate contact input client-side and hand off via WhatsApp and/or mailto — no server persistence in phase 1.

#### Scenario: Successful handoff

- GIVEN valid full name, email, message (service interest optional among the 5 groups)
- WHEN the visitor submits the form
- THEN validation errors are cleared and a success affordance appears (toast/dialog)
- AND a WhatsApp and/or mailto handoff opens with context (including optional service + locale)
- AND IT MUST emit analytics stub event `contact_submit`
- BUT it must NOT call a Nest leads API or persist to a database

#### Scenario: Invalid submit

- GIVEN required fields are empty or email is invalid
- WHEN the visitor submits
- THEN inline field errors are shown
- AND IT MUST keep focus management usable (errors associated with fields)
- BUT it must NOT open WhatsApp/mailto as if success occurred

#### Scenario: WhatsApp FAB / prefills

- GIVEN the visitor clicks the floating WhatsApp control (or form WhatsApp action)
- WHEN the chat URL opens
- THEN it uses the canonical number (default `+57 324 880 5290`, parametrized)
- AND message text MAY include selected service context
- AND IT MUST emit analytics stub event `whatsapp_click`
- BUT it must NOT hard-fail the page if the popup is blocked — number/mailto fallback remains visible

#### Scenario: Empty / loading / success UI states

- GIVEN the contact form
- WHEN idle, invalid, or post-success
- THEN empty state shows labels and optional service placeholder
- AND error state shows inline messages
- AND success state shows confirmation without implying server storage
- BUT it must NOT show a spinner that implies backend round-trip in phase 1 (optional brief UI only)

---

### REQ-009 — App-wide i18n ES ↔ EN

The system SHALL provide Spanish and English UI copy across Home and deep pages with persisted locale.

#### Scenario: Language switch preserves context

- GIVEN the visitor is mid-page (e.g. Home `#confianza` or Servicios `#asesoria`)
- WHEN they switch ES ↔ EN
- THEN visible UI copy and CTAs update to the selected locale
- AND the section/route context is preserved (same page + hash where applicable)
- AND IT MUST persist locale so a subsequent page navigation keeps the choice
- BUT it must NOT leave mixed-locale chrome (nav in one language, body in another)

#### Scenario: Layout parity

- GIVEN EN strings that are longer than ES
- WHEN either locale is active
- THEN layout remains usable without clipping primary CTAs or nav
- AND IT MUST cover Home, Quiénes somos, and Servicios strings (legal stubs may be minimal)

---

### REQ-010 — Motion and reduced-motion

Decorative and storytelling motion SHALL enhance scroll journey and MUST respect `prefers-reduced-motion`.

#### Scenario: Reduced motion

- GIVEN the OS/browser preference `prefers-reduced-motion: reduce`
- WHEN Home loads and the visitor scrolls
- THEN parallax, logo marquee, road progress animation, and auto-rotating testimonial motion are disabled or replaced with static equivalents
- AND IT MUST keep all content and CTAs reachable
- BUT it must NOT rely on motion alone to convey required information

---

### REQ-011 — Visual theme and brand tokens

The UI SHALL use AMD gold + ink/neutral tokens and PrimeNG themed to match UX constitution and mockup v0.1.

#### Scenario: Brand colors present; template purple absent

- GIVEN any primary marketing surface
- WHEN styles are applied
- THEN accent usage centers on gold `#CFBB66` (and soft variant) with ink/mist neutrals
- AND typography uses expressive display + body pairing consistent with UX (Sora + DM Sans)
- BUT it must NOT use Hostinger/Zyro purple accents (`#673de6`, `#5025d1`, `#8c85ff`) in UI chrome

---

### REQ-012 — Responsive behavior

The experience SHALL remain usable at 375, 768, 1024, and 1440 widths.

#### Scenario: Breakpoint sanity

- GIVEN each target width
- WHEN the visitor completes Discover → Contact
- THEN hero typography and nav adapt; services road stacks/readable on small screens; contact form usable
- AND IT MUST keep primary CTAs reachable without horizontal page scroll
- BUT it must NOT require desktop-only hover to expand essential service info on mobile (keyboard/touch equivalent required)

---

### REQ-013 — Accessibility baseline

Critical flows (nav, language, form, FAB) SHALL meet WCAG 2.2 AA expectations for structure, focus, and labels.

#### Scenario: Keyboard contact path

- GIVEN keyboard-only use
- WHEN the visitor opens nav, switches language, and completes or fails the contact form
- THEN focus order follows visual order; focus is visible; icon-only controls have accessible names
- AND form fields have associated labels and error text
- BUT it must NOT trap focus in the mobile drawer after close

---

### REQ-014 — Legal stubs

Footer (and routes as designed) SHALL expose Privacidad and Términos as stubs until AMD supplies final copy.

#### Scenario: Stub legal

- GIVEN the visitor opens Privacidad or Términos
- WHEN the stub surface loads
- THEN a placeholder page/state is reachable without breaking navigation
- BUT it must NOT invent final legal obligations as if signed off

---

### REQ-015 — Constitutional UX IA alignment

Specification/implementation work SHALL update `docs/ux-ui/design.md` Information Architecture where constitution still describes scroll-only single-page IA, so docs match mockup v0.1 (multi-page, dual nav, services road, trust motion).

#### Scenario: Doc sync

- GIVEN mockup v0.1 is the approved IA
- WHEN this spec is executed
- THEN UX IA sections that contradict multi-page + dual nav are revised
- BUT it must NOT rewrite unrelated UX principles (brand-first, tokens, a11y)

---

## 7. Non-Functional Requirements

| ID | NFR | Measure / expectation |
|----|-----|------------------------|
| NFR-001 | Performance | Lighthouse Performance ≥ 85 on mobile profile with static/optimized hero (no heavy autoplay video as default) |
| NFR-002 | LCP | Hero usable; target LCP ≤ 2.5s mid-tier mobile when measured |
| NFR-003 | Modifiability | Design tokens centralized; sections/features in clear folders under `client/` |
| NFR-004 | Observability | Stub events `contact_submit`, `whatsapp_click` invocable without a chosen vendor |
| NFR-005 | Security (phase 1) | No secrets in client beyond public IDs; no server attack surface introduced |
| NFR-006 | Local run | `cd client && npm install && npm start` per infrastructure contract |

## 8. Non-goals

- NestJS, leads API, email persistence, Docker full-stack
- Admin, auth, roles, payments
- Production deploy
- Global theme toggle
- Final legal copy; final client logo vectors
- Pixel-perfect clone of Stripe; Stitch MCP hi-fi

## 9. Traceability

| REQ | Proposal / mockup | UX | TRD / PRD |
|-----|-------------------|----|-----------|
| REQ-001 | Proposed Outcome · Scope multi-page | §2 IA (to update) | PRD §5 In · ADR-001/002 |
| REQ-002 | Dual nav · sidenav rules | §5 Nav (to update) | — |
| REQ-003 | Hero brand-first | §1 · §6 · §12 | PRD US-1 |
| REQ-004–005 | Road + Servicios page | §2 · §4 | PRD US-2 |
| REQ-006 | Sobre + Quiénes somos | §4 | — |
| REQ-007 | Trust motion | §4 | PRD metrics |
| REQ-008 | Contact handoff | §3 F1/F2 | ADR-003 · PRD A2 |
| REQ-009 | i18n app-wide | §1.6 · §3 F3 | PRD US-3 |
| REQ-010 | Motion | §7 tokens · §10 | PRD US-5 |
| REQ-011 | Tokens | §7 | ADR-002 |
| REQ-012 | Responsive | §9 | PRD §7 |
| REQ-013 | a11y | §10 | TRD a11y NFR |
| REQ-014 | Legal stubs | — | Proposal Non-Goals |
| REQ-015 | Doc sync R6 | whole IA | Proposal R6 |

## 10. Requirement ID Index

| ID | Title |
|----|-------|
| REQ-001 | Multi-page marketing shell |
| REQ-002 | Dual navigation model |
| REQ-003 | Brand-first Home hero |
| REQ-004 | Home services road (5 groups) |
| REQ-005 | Servicios deep page |
| REQ-006 | Sobre teaser and Quiénes somos |
| REQ-007 | Trust: metrics, marquee, testimonials |
| REQ-008 | Contact form and messaging handoff |
| REQ-009 | App-wide i18n ES ↔ EN |
| REQ-010 | Motion and reduced-motion |
| REQ-011 | Visual theme and brand tokens |
| REQ-012 | Responsive behavior |
| REQ-013 | Accessibility baseline |
| REQ-014 | Legal stubs |
| REQ-015 | Constitutional UX IA alignment |
| NFR-001–006 | Performance, LCP, modifiability, analytics stub, security boundary, local run |

## 11. Open Questions (non-blocking for specify)

Carried from PRD/proposal — do not block requirements approval; parametrize or placeholder:

1. Official brand book / vector logo (use current assets).
2. WhatsApp number confirmation (default `324 8805290`).
3. Analytics vendor (stub only).
4. EN copy commercial validation (draft from mockup).
5. Final Riesgo/Marca sub-service copy; real client logos.
