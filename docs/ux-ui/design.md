# UX/UI Design — AMD Soluciones (Landing)

Sistema visual y de interacción para la landing v1. Referencia de calidad: claridad y ritmo de [Stripe](https://stripe.com/). Identidad de color: **dorado AMD**, no el púrpura del builder actual.

## 1. Product Experience Principles

1. **Brand first** — el nombre/logo AMD domina el primer viewport; ningún headline lo apaga.
2. **One job per section** — una promesa, un CTA; sin dashboards ni clutter de stats en el hero.
3. **Motion with purpose** — parallax y reveals empujan al contacto; nunca decoración vacía.
4. **Trust before features** — prueba social y credibilidad B2B visibles temprano, sin saturar el hero.
5. **Glass + soft depth** — glass en chrome (nav/overlays); neumorphism ligero en cards/CTAs secundarios.
6. **Bilingual by default** — ES/EN con paridad de layout.

## 2. Information Architecture

**Multi-page** (shipped landing v1 — mockup v0.1 / `docs/specs/domain/landing` REQ-001/002/015; supersede any earlier scroll-only single-page reading of this section). Route path segments are **English** in both locales (DD-014); Home section anchors and Servicios group anchors stay as content-id fragments, never top-level routes.

| Route | Content | Sidenav |
|-------|---------|---------|
| `/` (Home) | Scroll chapters `#inicio → #servicios → #sobre-amd → #confianza → #contacto` | Left dot sidenav (§5), `≥1100px` |
| `/about-us` | Quiénes somos — misión, visión, líderes | None |
| `/services` | Servicios — 5 grupos + sub-servicios, anchors `#contabilidad … #marca` | None |
| `/privacy`, `/terms` | Legal stubs | None |
| `/**` | 404 — "Volver al inicio" | None |

Rutas futuras (fase 2+): `/admin`, APIs — fuera de este documento de experiencia pública.

## 3. Primary User Flows

### F1 — Discover → Contact (happy path)

1. Llega al hero → entiende oferta en <5s.
2. Scroll por servicios (CTA “Hablar con un asesor” / “Talk to an advisor”).
3. Social proof refuerza confianza.
4. Formulario o WhatsApp con contexto.

### F2 — Deep-link servicio → WhatsApp

1. Click en tarjeta de servicio.
2. CTA secundario abre WhatsApp con texto prefijado del servicio.

### F3 — Language switch

1. Toggle ES|EN en nav.
2. Copy UI y CTAs cambian; ancla de sección se mantiene.

## 4. Screen Inventory

| Pantalla / sección | Propósito | CTA primario |
|--------------------|-----------|--------------|
| Hero | Marca + promesa | Contactar / WhatsApp |
| Servicios | Portafolio agrupado | Ver detalle / Contactar |
| Sobre AMD | Credibilidad humana | Conocer más → Contacto |
| Confianza | Métricas, testimonios, logos | Contactar |
| Contacto | Conversión | Enviar / WhatsApp |
| 404 (mínimo) | Recuperación | Volver al inicio |

Ruta por fila (§2): Hero → `/` `#inicio`; Servicios → `/` `#servicios` (resumen) + `/services` (detalle); Sobre AMD → `/` `#sobre-amd` (teaser) + `/about-us` (detalle); Confianza/Contacto → `/`; 404 → `/**`.

## 5. Navigation Model

**Dual nav** (mockup v0.1 / REQ-002 — supersedes any single sticky-anchor-bar reading of this section):

| Nav | Dónde | Links | Breakpoint |
|-----|-------|-------|------------|
| Top nav | Todas las páginas | Brand · `/` · `/about-us` · `/services` · ES\|EN · Contactar | `<900px` colapsa a hamburguesa + drawer overlay |
| Sidenav flotante | Solo Home (`/`) | Dots + label por ancla (5 secciones) | Oculto `<1100px`; visible `≥1100px` |

- Top nav: sticky glass en toda ruta; nunca contiene las anclas de Home como links primarios.
- Sidenav: **sin barra opaca** — dots+labels flotan sobre el contenido; ink `#0D141A` en secciones claras, dorado/claro en oscuras (scroll-spy). Ausente en `/about-us` y `/services`.
- Drawer móvil (`<900px`): links de página siempre; anclas de sección de Home solo cuando la ruta activa es `/`.
- Sin mega-menús.

## 6. Layout Patterns

| Patrón | Uso |
|--------|-----|
| Full-bleed hero | Imagen/video de atmósfera edge-to-edge; copy en columna, no cards en hero |
| Chapter sections | max-width ~1120–1200px; ritmo vertical generoso |
| Bento / split | Servicios: grid 2–3 cols en desktop, stack en mobile |
| Soft cards | Solo donde hay interacción (servicio, testimonio, form shell) |
| Stripe-like whitespace | Una idea visual dominante por sección |

**Anti-patrones:** cards en hero; pills de stats en primer viewport; overlays/badges flotantes sobre media; purple gradients genéricos.

## 7. Design Tokens

### Color (oficial v1)

| Token | Valor | Uso |
|-------|-------|-----|
| `--amd-gold` | `#CFBB66` | Acento marca, CTAs, highlights |
| `--amd-gold-soft` | `#E5D59A` | Hover / glow suave |
| `--amd-ink` | `#0D141A` | Texto primario / fondos oscuros |
| `--amd-ink-soft` | `#1D1E20` | Superficies dark |
| `--amd-slate` | `#56585E` | Texto secundario |
| `--amd-mist` | `#F2F3F6` | Fondo light |
| `--amd-surface` | `#FFFFFF` | Superficies light |
| `--amd-border` | `rgba(13,20,26,0.08)` | Bordes sutiles |
| `--amd-glass` | `rgba(255,255,255,0.08)` | Fill glass (sobre dark) |
| `--amd-glass-border` | `rgba(255,255,255,0.18)` | Borde glass |

**Prohibido en UI:** púrpura Hostinger/Zyro (`#673de6`, `#5025d1`, `#8c85ff`) salvo assets históricos no usados.

### Tipografía

| Rol | Familia | Notas |
|-----|---------|-------|
| Display / H1–H2 | **Sora** | Geométrica, premium, no system-default |
| Body / UI | **DM Sans** | Legible, pareja con Sora |
| Mono (raro) | `ui-monospace` | Solo códigos/IDs si aplican |

Escala sugerida: H1 56–64 / 40 mobile; H2 36–40; body 16–18; line-height 1.5 body / 1.15 display.

### Elevación & efectos

| Token | Valor / regla |
|-------|----------------|
| `--radius-sm` | `8px` |
| `--radius-md` | `16px` |
| `--radius-lg` | `24px` |
| `--shadow-soft` | Neumorphism ligero: `8px 8px 20px rgba(13,20,26,0.08), -6px -6px 16px rgba(255,255,255,0.7)` (solo light cards) |
| `--glass-blur` | `backdrop-filter: blur(16px) saturate(140%)` |
| Motion | 200–400ms; easing `cubic-bezier(0.22, 1, 0.36, 1)` |
| Parallax | Factor bajo (0.15–0.35); desactivado si `prefers-reduced-motion: reduce` |

### Glass vs Neumorphism

| Técnica | Dónde sí | Dónde no |
|---------|----------|----------|
| Glassmorphism | Nav sticky, overlays, FAB chrome | Texto largo, formularios densos |
| Neumorphism | Cards de servicio, botones secundarios | Hero, media full-bleed, dark OLED pesado |

## 8. Component Inventory

PrimeNG como base; **theme override** vía tokens CSS (no look default Lara/Aura sin personalizar).

| Componente | Base PrimeNG | Notas AMD |
|------------|--------------|-----------|
| Button | `p-button` | Primario dorado; secundario ghost/glass |
| Input / Textarea | `p-inputtext`, `p-textarea` | Labels visibles; error inline |
| Select (servicio) | `p-select` / dropdown | Opcional en form |
| Dialog | `p-dialog` | Confirmación envío fase 1 |
| Toast | `p-toast` | Éxito / validación |
| Carousel | `p-carousel` | Testimonios (si aplica) |
| Menubar / custom nav | Custom Angular | Glass tokens |
| Language toggle | Custom | ES \| EN |
| WhatsApp FAB | Custom | Accesible, no tape CTAs |

Iconografía: SVG (Lucide/Heroicons), **sin emojis como iconos**.

## 9. Responsive Behavior

| Breakpoint | Comportamiento |
|------------|----------------|
| ≤375 | Hero tipografía reducida; parallax off o mínimo; nav compacta |
| 768 | Grids 2 cols servicios |
| 1024+ | Layout Stripe-like completo; parallax on |
| 1440 | Contenido centrado; hero full-bleed |

Touch targets ≥ 44×44px.

## 10. Accessibility Expectations

- Contraste texto normal ≥ 4.5:1 (dorado sobre dark: validar; si falla, usar dorado en UI chrome y texto `#F5E6B8` o ink sobre gold buttons).
- Focus visible en todos los interactivos.
- Orden de tab = orden visual.
- `aria-label` en icon-only (WhatsApp, menú).
- Form labels asociados.
- Respeto estricto a `prefers-reduced-motion`.

## 11. Dark Mode Behavior

- **Landing v1:** tema principal **dark premium** (ink + gold) con secciones light intercaladas para respiro (social proof / form).
- Toggle dark/light global: **no requerido en v1** (evitar scope creep).
- Si se añade después: tokens duales; gold se mantiene.

## 12. Design Decisions

| Decisión | Elección | Alternativa rechazada | Por qué |
|----------|----------|----------------------|---------|
| Referencia UX | Stripe (ritmo, claridad) | Clonar visual Stripe | Marca AMD debe ser reconocible |
| Acento | Dorado `#CFBB66` | Púrpura del sitio actual | Evidencia de marca en CSS actual (“Amarillo AMD”) |
| Motion stack (impl.) | CSS + Angular animations; GSAP/ScrollTrigger si hace falta parallax | Parallax CSS-only frágil | Control fino + reduced-motion |
| UI kit | PrimeNG themed | shadcn/React | Stack Angular acordado |
| Hero | Full-bleed atmósfera | Card inset / collage | Principio brand-first |

## 13. Open Gaps / Open Questions

- Brand book / vectores oficiales.
- Fotografía real del equipo vs stock (Sobre AMD).
- Tono de voz EN (formal vs cercano).
- Si el video del hero actual se reutiliza o se reemplaza.

## Checklist pre-implementación

- [ ] Tokens CSS definidos en theme Angular
- [ ] PrimeNG preset override aplicado
- [ ] Hero sin cards ni stats
- [ ] Glass nav + soft cards servicios
- [ ] Reduced-motion verificado
- [ ] ES/EN parity de layout
