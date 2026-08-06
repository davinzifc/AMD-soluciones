# Proposal — Landing v1 (Phase 1)

Thin greenfield slice: bounds the approved PRD MVP for specification. Does **not** restate product intent — see `docs/prd.md`.

**Mockup v0.1 approved** (2026-08-05) — visual + IA locked for `/akili-specify`.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Slug | `landing` — greenfield first milestone from `/akili-propose` (no free-text argument) |
| Type | Change |
| Approval Mode | gated |
| Status | **Approved** — proposal + mockup **v0.1** (2026-08-05); ready for specify |
| Mockup version | `0.1` |
| Phase | 1-landing |
| Depends on | none |
| Parallel-safe | n/a (sole Phase 1 delivery unit) |
| Related | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/infrastructure.md` |

## Intent

Deliver the shippable Phase 1 marketing site in `client/`: brand-first bilingual **multi-page** experience (Home landing + deep pages) that converts visitors into contact leads (form + WhatsApp), without stuffing legal/deep content into a single scroll — within the LITE Angular + PrimeNG stack.

PRD anchors: [§5 Scope In](../../../prd.md) · [§6 User Stories](../../../prd.md) · [§7 Acceptance Criteria](../../../prd.md).

## Problem / Current Behavior

No application code yet (`client/` empty). Public presence today is the Zyrosite site — outside this repo. Constitution approved the problem and MVP; this proposal locks **what ships in the first execute cycle**, refined by client mockup feedback.

## Proposed Outcome

A local-runnable Angular app that matches **mockup v0.1**:

| Surface | Delivers |
|---------|----------|
| **Home** | Hero brand-first (**AMD Soluciones** + **Integrales S.A.S.**) → Servicios road → Sobre teaser → Confianza → Contacto |
| **Quiénes somos** | Misión, visión, 3 líderes (Ana María Daza, María Camila Sanchez, Leidy Yurani Villamil) |
| **Servicios** | 5 grupos + sub-servicios; deep-link desde Home (`#contabilidad` …) |
| **Legales** | Stub routes/links (Privacidad / Términos) — copy final lo provee AMD |
| **Chrome** | Top nav (páginas) + left float dots (solo Home, anclas) + WhatsApp FAB |
| **i18n** | ES ↔ EN en **toda** la app (Home + deep pages), locale persistente |
| **Handoff** | Formulario client-only + WhatsApp / mailto (sin Nest) |

## Scope

### Product / IA (locked by mockup v0.1)

| In | Detail | Source |
|----|--------|--------|
| Multi-page | Home · Quiénes somos · Servicios · legales stub | Cliente: legal + profundidad sin saturar landing |
| Top nav | Home · Quiénes somos · Servicios · ES/EN · CTA Contactar | Mockup v0.1 |
| Left float nav (Home only) | Dots + labels; **sin barra / fondo oscuro**; scroll-spy | Cliente |
| Left nav on light sections | Texto **y** círculos → `#0D141A` (mismo color); en dark → oro | Cliente |
| Hero | Brand-first: `AMD Soluciones` + línea `Integrales S.A.S.`; promesa + CTAs; sin cards/stats | UX + cliente |
| Servicios Home | Road/timeline scroll: **5 grupos** (Contabilidad, Gestión Administrativa, Sistemas de Riesgo, Asesoría, Marca); nodo clicable expande card; **Más info** → página Servicios | Cliente (vs listado estático Zyrosite) |
| Página Servicios | Grupos + sub-servicios (Contabilidad/Admin desde sitio actual; Riesgo/Marca placeholder a validar) | amdsoluciones.com + cliente |
| Sobre Home | Resumen + **Ver más** → Quiénes somos | Cliente |
| Confianza — logos | Marquee fluido lento en bucle; **difuminado solo en la franja de cards** (título legible) | Cliente |
| Confianza — testimonios | Crossfade con **pausa larga (~9s)** para leer (no marquee fluido) | Cliente |
| Contacto | Validación client-side + WhatsApp / mailto; select de línea de servicio = 5 grupos | PRD A2 · TRD ADR-003 |
| i18n | ES+EN en Home, Quiénes somos y Servicios (parity de layout) | PRD US-3 · mockup |
| Motion | Road progress + reveals + parallax ligero; `prefers-reduced-motion` | PRD · UX |
| Theme | Tokens AMD gold `#CFBB66` + ink/neutros; PrimeNG themed | UX §7 · TRD ADR-002 |
| Analytics stub | `contact_submit`, `whatsapp_click` | TRD §3 |
| Responsive | 375 / 768 / 1024 / 1440 | PRD §7 |

### Technical (for specify)

| In | Detail |
|----|--------|
| Stack | Angular `client/` + PrimeNG themed; **no** Nest en este spec |
| Routing | Multi-route Angular (no single-scroll-only SPA) |
| Scaffold | Post-specify / execute — aún no existe `client/` |

### Chunking decision (RICE / MoSCoW)

| Candidate | MoSCoW | Verdict |
|-----------|--------|---------|
| Specs por ruta | Should | Rejected v1 — theme/i18n/nav compartidos |
| **`domain/landing` (Home + deep pages)** | **Must** | **Chosen** |

Orden interno → `/akili-specify` → `tasks.md` (scaffold → chrome/i18n → Home → deep pages → motion/a11y).

## Non-Goals

| Out | Why |
|-----|-----|
| NestJS / `server/` / leads API / email persistente | Fase 2 |
| Admin, auth, roles, pagos, CMS, blog | Fase 3+ |
| Deploy PROD / cloud | Infra TBD; local-only |
| Toggle dark/light global | UX §11 |
| Copy legal firmado | Stub; AMD entrega texto |
| Logos vectoriales finales de clientes | Placeholders de sector hasta assets |
| Stitch MCP hi-fi | No disponible; HTML mockup es la referencia |

## Affected Users, Systems, And Specs

| Who / what | Impact |
|------------|--------|
| P1 Emprendedor ES · P2 Founder EN | Superficie digital v1 |
| `client/` only | Boundary fase 1 |
| `docs/specs/domain/landing/` | Spec activo |
| `docs/ux-ui/design.md` | Specify debe alinear IA (multi-page + dual nav) con mockup v0.1 |

## Visual Reference

| Field | Value |
|-------|-------|
| Source | Self-contained HTML mockup **v0.1** (approved) |
| Location | `docs/specs/domain/landing/mockup/` |
| Files | `index.html`, `quienes-somos.html`, `servicios.html`, `styles.css`, `landing.css`, `landing.js`, `i18n.js`, `README.md` |
| Notes | Dual nav; road 5 grupos; Ver más / Más info; logos fade-only-on-cards; testimonios ~9s; i18n persistente; hero con Integrales S.A.S.; sidenav sin barra oscura + `#0D141A` en light. **This is the visual source of truth for specify.** |

## Requirement Delta Preview

### ADDED Requirements

- Greenfield Phase 1 multi-page marketing site (no in-repo baseline to modify).
- Dual navigation model (top pages + Home section dots).
- Services taxonomy: 5 groups + sub-services + Home road teaser.
- Trust motion patterns (logo marquee vs paused testimonials).
- App-wide ES/EN with persisted locale.

### MODIFIED Requirements (vs original constitutional IA)

| Was (constitution) | Becomes (mockup v0.1) |
|--------------------|------------------------|
| Single SPA scroll-only IA | Multi-page + Home scroll chapters |
| Sticky top nav with section anchors | Top = pages; left float = Home anchors |
| Servicios as bento/grid of few items | Road of 5 groups → deep Servicios page |
| Sobre as in-page section only | Teaser + deep Quiénes somos |

### REMOVED Requirements

- None from PRD Phase 1 In (still landing-only, no Nest).

## Approach Options

| Option | Description | Trade-off |
|--------|-------------|-----------|
| **A — Single `domain/landing` spec** | One specify → execute for full Phase 1 | Larger tasks; one MVP |
| B — Split by route | Parallel pages | Extra gates; shared shell coupling |
| C — Re-propose | Unnecessary — v0.1 approved | Delay |

## Recommended Approach

**Option A** (unchanged). Mockup v0.1 is the approved visual contract; specify converts it into requirements/design/tasks without reopening IA unless AMD changes copy/assets.

## Risks, Dependencies, And Open Questions

| ID | Item | Mitigation |
|----|------|------------|
| R1 | Brand book / logo vectorial (PRD Q1) | Assets actuales; swap later |
| R2 | WhatsApp canónico (PRD Q2) | Default `324 8805290`; parametrizar |
| R3 | Dueño copy EN (PRD Q4) | Draft EN en mockup; validación comercial |
| R4 | Analytics provider (PRD Q3) | Stub events |
| R5 | Lighthouse ≥ 85 / hero media | Hero estático/optimizado; video diferido |
| R6 | UX constitution IA desactualizada vs mockup | Specify actualiza `docs/ux-ui/design.md` IA |
| R7 | Sub-servicios Riesgo / Marca incompletos | Placeholders; validar con AMD |
| R8 | Logos reales de clientes | Placeholders de sector hasta entrega |
| D1 | Sin scaffold `client/` | Primera tarea de execute |

## Success Criteria

- [ ] Comportamiento alineado a mockup **v0.1** + PRD §7 (fase 1)
- [ ] Multi-page + dual nav + i18n app-wide
- [ ] Road 5 grupos + deep Servicios; Ver más → Quiénes somos
- [ ] Logos marquee (fade solo cards); testimonios con pausa legible
- [ ] Sidenav sin barra oscura; light → `#0D141A` en texto y círculos
- [ ] Hero muestra AMD Soluciones + Integrales S.A.S.
- [ ] Cero Nest / `server/`
- [ ] `cd client && npm run lint -- --quiet` y `npm run test:agent` post-scaffold
- [ ] Local stack per `docs/infrastructure.md`

## Next Step

Proposal + mockup **v0.1** approved. In the next session:

```text
/akili-specify docs/specs/domain/landing
```

Specify must treat `docs/specs/domain/landing/mockup/` as the approved visual/IA reference and update constitutional UX IA where it diverges (multi-page, dual nav, services road, trust motion).
