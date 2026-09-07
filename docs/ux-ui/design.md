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

| Route | Content | Índice de secciones |
|-------|---------|---------|
| `/` (Home) | Scroll chapters `#inicio → #servicios → #sobre-amd → #cifras → #confianza → #contacto` | Sub-header `SectionNav` (§5), **desde 900 px** |
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
| Hero | Marca + promesa | Hablar con un asesor / Ver servicios |
| **Líneas** (ledger) | Portafolio agrupado como índice editorial de 5 líneas | Ver los N servicios → `/services` |
| **Manifiesto** | Por qué existimos + tres pilares | Conocer al equipo → `/about-us` |
| **Cifras** | Banda full-bleed con video de fondo y tres métricas | — *(sin CTA: es puntuación)* |
| Confianza | Testimonio + muro de clientes + sectores | — *(sin CTA: cierra con el ticker)* |
| Contacto | Conversión | Enviar por WhatsApp |
| 404 (mínimo) | Recuperación | Volver al inicio |

> **Actualizado por `changes/home-page-redesign` (2026-09-06).** «Servicios» en la Home pasa a ser el
> **ledger** de cinco líneas; entra **Cifras** como sección nueva; y **Confianza pierde sus cuatro
> tarjetas de métricas y su CTA final** (decisión HITL: el mockup no las tiene). El total de servicios
> del CTA del ledger se **deriva** de `SERVICE_GROUPS`, nunca se escribe (**DD-035**).

Ruta por fila (§2): Hero → `/` `#inicio`; Líneas → `/` `#servicios` (resumen) + `/services` (detalle);
Manifiesto → `/` `#sobre-amd` (teaser) + `/about-us` (detalle); Cifras/Confianza/Contacto → `/`;
404 → `/**`.

## 5. Navigation Model

**Dual nav** (mockup v0.1 / REQ-002 — supersedes any single sticky-anchor-bar reading of this section):

> **Actualizado por `changes/home-page-redesign` (2026-09-06).** El rail lateral de puntos queda
> **descartado** y lo sustituye un sub-header. Ver **DD-029**: dos piezas para la misma función son dos
> scroll-spies, dos temas y dos juegos de etiquetas que no pueden divergir — y el rail además dejaba
> **900–1099 px sin ningún índice**.

| Nav | Dónde | Links | Breakpoint |
|-----|-------|-------|------------|
| Top nav | Todas las páginas | Brand · Inicio · Nosotros · Servicios · ES\|EN · Contacto | `<900px` colapsa a hamburguesa + drawer overlay |
| `SectionNav` (sub-header) | Solo Home (`/`) | Las **seis** anclas: Arriba · Líneas · Manifiesto · Cifras · Confianza · Contacto | Oculto dentro del hero; visible **desde 900 px** al salir de él |

- Top nav: sticky glass en toda ruta; nunca contiene las anclas de Home como links primarios. Marca a
  la izquierda y enlaces **agrupados a la derecha** junto a ES\|EN y el CTA. El CTA se **oculta por
  debajo de 900 px**: no cabe, y el contacto sigue disponible por el drawer y por el FAB de WhatsApp.
- `SectionNav`: barra bajo el top nav, con `aria-current` en el ancla activa y **retirada del orden de
  foco** mientras está oculta (**DD-037** — no basta con `opacity`, que deja enlaces tabulables e
  invisibles). Invierte su tema midiendo el fondo **en su propia posición vertical**, no en un punto
  común con el top nav (**DD-030**).
- **Un solo índice de secciones por ancho** (REQ-008): sub-header desde 900 px, drawer por debajo.
- **Ninguna etiqueta se repite** entre el menú de páginas y el índice de secciones: por eso «Líneas» y
  «Manifiesto» en vez de «Servicios» y «Nosotros», y «Arriba» en vez de «Inicio».
- Drawer móvil (`<900px`): links de página siempre; las **seis** anclas de Home solo cuando la ruta
  activa es `/`.
- El alto del chrome vive en **una sola función** (`core/layout/chrome-offset.ts`) que consumen el
  offset de anclaje y el umbral de visibilidad del sub-header: son el mismo número y no pueden
  separarse.
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
| `--amd-gold-soft` | `#E5D59A` | Hover / glow suave — **sobre claro, sólo relleno** (1.32:1) |
| `--amd-gold-ink` | `#8a7a2e` | Dorado de tinta: relleno y **texto grande** sobre claro (3.86:1) |
| `--amd-gold-ink-deep` | `#6f6224` | Dorado de tinta: **texto normal** sobre claro (5.49:1) |
| `--amd-ink` | `#0D141A` | Texto primario / fondos oscuros |
| `--amd-ink-soft` | `#1D1E20` | Superficies dark |
| `--amd-slate` | `#56585E` | Texto secundario |
| `--amd-mist` | `#F2F3F6` | Fondo light |
| `--amd-surface` | `#FFFFFF` | Superficies light |
| `--amd-border` | `rgba(13,20,26,0.08)` | Bordes sutiles |
| `--amd-glass` | `rgba(255,255,255,0.08)` | Fill glass (sobre dark) |
| `--amd-glass-border` | `rgba(255,255,255,0.18)` | Borde glass |

**Prohibido en UI:** púrpura Hostinger/Zyro (`#673de6`, `#5025d1`, `#8c85ff`) salvo assets históricos no usados.

#### El dorado de marca no es texto sobre claro (REQ-009 · DD-031)

Medido: `--amd-gold` da **1.73:1** sobre `--amd-mist` y `--amd-gold-soft` **1.32:1**. Los dos
reprueban WCAG **incluso en tamaño grande**. Sobre tramos claros el dorado de marca sólo puede ser
**relleno** — spine, subrayado, anillo del `+`, punto activo, contorno de foco.

Como **texto** sobre claro hay dos tokens, y **el reparto lo decide el tamaño computado**, no la
intuición:

| Tamaño del texto | Token |
|---|---|
| ≥ 24 px, **o** ≥ 18.66 px en negrita | `--amd-gold-ink` (3.86:1 — piso de texto grande) |
| Cualquier otro caso | `--amd-gold-ink-deep` (5.49:1) |

> **Por qué son dos y no uno.** Con un solo token a 3.86:1, tres de los cuatro usos del acento
> incumplían WCAG porque se renderizan a 12–18.4 px. Se descubrió tarde, en la Pivot T001, después de
> haber aprobado un token único. **El mockup incumple esta regla**: pinta los acentos con `#8a7a2e`
> literal en sitios donde el texto es de 12 px, así que **portar su CSS al pie de la letra reintroduce
> el defecto**.

El gate de medición en navegador (**DD-038**, `npm run verify:visual`) barre **por familia de tokens**
—los cuatro— y elige el umbral a partir del `fontSize` y `fontWeight` **computados**. Un barrido que
sólo mirase los dos tokens correctos no podría detectar el defecto que busca, que es alguien usando el
dorado equivocado.

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
| Testimonios | **Custom Angular** (no `p-carousel`) | Rotación propia a **6 s**, con **pausa en `:hover`/`:focus-within`** y sin temporizador bajo reduced-motion. Puntos de 44×44 px con `aria-current` |
| Muro de clientes | **Custom** `ClientWall` | Cinta infinita de 13 máscaras monocromas (`mask-image` + `currentColor`). **Sin `gap`**: el aire va como `margin-inline` |
| Ticker de sectores | **Custom** | Texto plano en cinta continua, **sentido contrario** al muro de clientes |
| Menubar / custom nav | Custom Angular | Glass tokens |
| Language toggle | Custom | ES \| EN |
| WhatsApp FAB | Custom | Accesible, no tape CTAs |

Iconografía: SVG (Lucide/Heroicons), **sin emojis como iconos**.

## 9. Responsive Behavior

| Breakpoint | Comportamiento |
|------------|----------------|
| ≤375 | Hero tipografía reducida; parallax off o mínimo; nav compacta |
| **<900** | **Hamburguesa** como único índice de secciones; **CTA del top-nav oculto** (no cabe); Manifiesto apilado con el **texto antes de la foto**, que recupera `aspect-ratio: 4/3` |
| **≥900** | **Sub-header `SectionNav`** como único índice; Manifiesto en dos columnas, la foto derivando su alto del texto **sin `aspect-ratio`** |
| 1024+ | Layout completo; parallax on |
| 1440 | Contenido centrado; hero full-bleed |

Touch targets ≥ 44×44px — **incluidos** los puntos de testimonio y el enlace «Scroll» del hero.

**Sin scroll horizontal en ningún ancho.** Verificado por el gate de DD-038 a 375 · 768 · 900 · 1200 ·
1600 · 1920 px; es la medición que destapó los 97 px que desbordaba el top-nav a 375.

## 10. Accessibility Expectations

- Contraste texto normal ≥ 4.5:1 (dorado sobre dark: validar; si falla, usar dorado en UI chrome y texto `#F5E6B8` o ink sobre gold buttons).
- Focus visible en todos los interactivos.
- Orden de tab = orden visual.
- `aria-label` en icon-only (WhatsApp, menú).
- Form labels asociados.
- Respeto estricto a `prefers-reduced-motion`.

## 11. Dark Mode Behavior

- **Landing v1 (actualizado 2026-09-06, `changes/home-page-redesign` · DD-028):** el ritmo es
  **claro dominante**; el oscuro es **puntuación**, no el tema base — hero (entrada), banda de Cifras
  (golpe) y Contacto (cierre). Supersede la lectura anterior de «tema dark premium con secciones light
  intercaladas».
  > **Medido, y por eso cambió:** la v1 oscura dejaba **68.2 % de la página en tinta** y **2.4
  > pantallas** antes del primer respiro claro. El cliente la rechazó por eso. Hoy el gate de DD-038
  > mide **39.40 % de tinta** y el primer tramo claro a **1.00 vh**, con umbrales de 35–45 % y ≤ 1.2 vh.
- Las secciones claras se marcan con **`.section--light`**, que es lo que el chrome lee para
  invertirse. Sin ese marcador la inversión falla **en silencio** justo en la sección que cambia de
  tono.
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
| **Ritmo claro/oscuro** | Claro dominante; oscuro como puntuación | Oscuro dominante | Medido: la v1 dejaba 68.2 % en tinta y 2.4 pantallas sin respiro. El cliente la rechazó (**DD-028**) |
| **Índice de secciones** | Sub-header único desde 900 px | Rail lateral de puntos ≥1100 px | Dos piezas para la misma función divergen, y el rail dejaba 900–1099 px sin índice (**DD-029**) |
| **Dorado sobre claro** | Dos tokens de tinta, repartidos **por tamaño** | Un solo token; usar `--amd-gold` como texto | `#CFBB66` da 1.73:1 sobre claro. Con un token único, tres de los cuatro usos incumplían por renderizarse a 12–18.4 px (**DD-031**) |
| **Testimonios** | Rotación automática a **6 s**, con pausa al cursor/foco | Sin rotación (elección original); rotar sin pausa | **Revertido por HITL 2026-09-06**: el cliente pidió que pasen solos. La objeción original —sustituir texto que se está leyendo— se resuelve con la pausa, no renunciando a la rotación (**DD-034**). El ritmo sale de medir el copy: el testimonio más largo son 16 palabras, ~6 s leyendo despacio |
| **Verificación visual** | Playwright que **reporta números** (`verify:visual`) | Sólo tests unitarios; comparar capturas | jsdom no calcula layout ni compone máscaras ni evalúa contraste. Y las capturas JPEG del mockup **inventaron una costura inexistente** y ocultaron las reales (**DD-038**) |

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
