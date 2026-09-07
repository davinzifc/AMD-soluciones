# Design — home-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Status | **Approved** — HITL 2026-09-06 |
| Depth | Standard |
| Tier impact | **none** — extiende LITE; sin ADR nuevo en el TRD |
| Stack verificado | Angular **22.1**, Vitest **4** + jsdom, PrimeNG themed |
| Related | `requirements.md` (mismo folder) · `docs/ux-ui/design.md` §2/§5/§7/§11 · `docs/trd/trd.md` §8/§12 |
| Kaizen aplicado | **KZ-002** (nada de selectores `body`/`html` para show/hide) · **KZ-003** (pipes i18n impuros) · **KZ-004** (asserts de ancestría al montar hijos) |

---

## 1. Overview

Todo el cambio vive en `client/`. Se reemplazan dos componentes entregados, se crean tres, se
modifican cuatro y se borra uno. No se toca `server/` (ADR-003), ni `/services`, ni el contrato de
formulario.

**El principio que ordena el diseño:** lo que se borra deja huecos que hay que rellenar a
propósito. El reto a las reversiones (§9) encontró cuatro comportamientos que desaparecerían sin
que ningún requisito los reclamara. Están todos convertidos en decisión.

---

## 2. Architecture Overview

Sin cambio de contenedores ni de tier. Cambia el árbol de componentes de la Home y se añade una
función pura compartida en `core/motion/`.

```text
client/
├── public/media/                       ← NUEVO (assets de runtime, fuera del bundle)
│   ├── line-01-contabilidad.webp … line-05-marca.webp
│   ├── about-asesoria.webp · manifiesto-poster.webp
│   ├── manifiesto.mp4                  (1.9 MB)
│   └── logos/*.webp                    (13 máscaras, 144 kB)
└── src/
    ├── styles/tokens.css               ← MOD (+ --amd-gold-ink, --amd-gold-ink-deep)
    └── app/
        ├── core/
        │   ├── motion/
        │   │   └── section-theme.ts    ← NUEVO (función pura)
        │   └── layout/
        │       ├── section-nav/        ← NUEVO   (sustituye al rail)
        │       ├── home-side-nav/      ← BORRADO
        │       ├── mobile-drawer/      ← MOD (+#cifras, etiquetas de sección)
        │       └── top-nav/            ← MOD (inversión sobre tramos claros)
        └── features/home/
            ├── ledger/                 ← NUEVO   (sustituye al camino)
            ├── services-road/          ← BORRADO
            ├── about-teaser/           ← MOD (→ Manifiesto, claro, con imagen)
            ├── figures/                ← NUEVO   (#cifras, banda de video)
            ├── clients/                ← NUEVO   (muro, hijo de Trust)
            ├── trust/                  ← MOD (rotación a 6 s con pausa, monta el muro)
            └── home-page/              ← MOD (orden de secciones)
```

### La pieza que casi se pierde

`HomeSideNav` no era sólo un rail: contenía **la única implementación en el repo** del algoritmo
*"qué fondo tengo debajo de mi propia posición vertical"* (`sectionAtY` + punto medio del propio
elemento). REQ-008 ahora lo necesita para **dos** barras —`TopNav` y `SectionNav`—, y borrar el
componente lo borraba con él.

Se extrae a `core/motion/section-theme.ts` como **función pura** que recibe una lista de
`{ id, top, bottom, isLight }` y una coordenada `y`, y devuelve la sección bajo esa `y`. La lectura
del DOM se queda en los componentes; la decisión, en la función. Así la lógica que hoy no tiene
test propio pasa a ser verificable en jsdom, que es exactamente donde el resto de este spec no
puede verificarse.

---

## 3. Data Model

Sin base de datos (fase 1). Tres estructuras nuevas en TypeScript:

```text
LedgerLine                         (features/home/ledger/, derivada — no duplica el catálogo)
  id          ServiceGroupId       ← importado de features/services/services-page
  ordinal     string               ← '01'…'05', derivado del índice
  titleKey    string               ← g1Title…g5Title  (YA EXISTEN, compartidas con /services)
  summaryKey  string               ← g1Sum…g5Sum      (YA EXISTEN)
  bodyKey     string               ← g1Body…g5Body    (YA EXISTEN)
  count       number               ← SERVICE_GROUPS[i].subs.length — DERIVADO, nunca literal
  image       string               ← 'line-0N-<slug>.webp', nombre por ROL, no por contenido

ClientLogo                         (features/home/clients/client-logos.data.ts)
  slug        string               ← nombre de archivo de la máscara
  name        string               ← razón social, para el nombre accesible. NO va a i18n
  w, h        number               ← tamaño ÓPTICO ya equilibrado por el pipeline

SectionTone                        (core/motion/section-theme.ts)
  id          string
  top, bottom number
  isLight     boolean              ← leído del marcador .section--light
```

**Claves i18n.** Las cinco líneas **no necesitan copy nuevo**: `g*Title`, `g*Sum` y `g*Body` ya
existen con paridad ES/EN. Claves nuevas: encabezado del ledger, banda de Cifras (eyebrow, frase,
3 métricas), etiqueta del muro, y las etiquetas de sección del `SectionNav`.

**Claves que se retiran:** `sideHome`, `sideNavAria` (mueren con el rail) y `roadHint`. **No se
tocan `g*Title`** — las comparte `SERVICE_GROUPS` con `/services`, y borrarlas rompe esa página.

**Claves que cambian de valor:** `navServices` y `navAbout` pasan a "Líneas" / "Manifiesto"
(REQ-008: hoy `navServices` y `navServicesPage` valen ambas `'Servicios'`).

**Corregido 2026-09-06 (T015).** La versión anterior de este párrafo decía que `trustLead` «se
reescribe» porque su segunda mitad quedaba falsa «al retirar la auto-rotación». Las dos premisas
cayeron: la auto-rotación **no se retiró** (DD-034, revertido por HITL), y `trustLead` no se
reescribió sino que **se borró entera** de ambos diccionarios junto con `trustTitle`, `trustCta`,
`logosLabel` y `m1…m4`, al portar Confianza del mockup.

---

## 4. API Contracts

**None — phase boundary (ADR-003).** Sin endpoints. El único contrato externo es el deep-link
`/services#<id>`, que se preserva sin cambios.

---

## 5. Frontend Design

| Tema | Detalle |
|------|---------|
| **Secciones** | `#inicio` (intacta) · `#servicios` (ledger) · `#sobre-amd` (manifiesto) · `#cifras` (nueva) · `#confianza` (trust + muro) · `#contacto` (intacta) |
| **Componentes nuevos** | `LedgerSection`, `FiguresBand`, `ClientWall`, `SectionNav` |
| **Componentes borrados** | `ServicesRoadSection`, `HomeSideNav` |
| **Tokens** | Todos de `docs/ux-ui/design.md` §7 + **`--amd-gold-ink: #8a7a2e`** y **`--amd-gold-ink-deep: #6f6224`** (nuevos) |
| **Motion** | `onPassiveScroll` existente para el spine; CSS puro para el marquee; sin GSAP |
| **reduced-motion** | Vía `MotionService.reducedMotion()`, que ya está inyectado en cuatro componentes |

### 5.1 `LedgerSection`

Sustituye `ServicesRoadSection` conservando su contrato de interacción y **reimplantando los tres
gates que hoy protegen requisitos archivados y cerrados** (§9, reversión 3).

- Estado: un `signal<ServiceGroupId | null>` para la fila abierta (acordeón exclusivo) y un
  `signal<ServiceGroupId | null>` para la fila "caliente" (puntero o foco).
- Activación por `(click)` y `(keydown)` Enter/Espacio, **nunca por regla `:hover` de CSS** —
  puntero, teclado y táctil por el mismo camino. Se conserva el guard de `closest('a')` para que
  "Más info" navegue sin alternar el acordeón.
- Detalle colapsado marcado **`inert`**, para que el "Más info" de una fila cerrada no sea
  tabulable (REQ-002). Es la pieza que `ServicesRoadSection` ya resolvía.
- Acordeón sin medir alturas en JS: `grid-template-rows: 0fr → 1fr`.
- Spine: `onPassiveScroll` → altura en porcentaje. Bajo reduced-motion, al 100 % fijo.
- El contador sale de `SERVICE_GROUPS[i].subs.length`. Hoy da 16/4/4/4/3 = 31, idéntico al mockup;
  derivarlo evita que la Home diga 16 cuando `/services` diga 17.
- Raíz: `<section id="servicios" class="ledger section--light">` — el id lo afirma
  `home-page.spec.ts`, y el marcador lo lee el chrome para invertirse.

**Tres invariantes de CSS que no son cosméticas** (cada una costó un bug en el mockup):

1. `overflow: hidden` en el contenedor de la foto — el `<img>` se anima con `scale(1.06)` y sin
   recorte se desborda fuera del alcance de la viñeta.
2. La foto termina en el borde del **contenido** (`right: 0`), nunca en el de la ventana.
3. Un `<img>` con atributos `width`/`height` ignora `aspect-ratio` salvo que el CSS declare
   `height: auto`.

### 5.2 `FiguresBand` (`#cifras`)

Banda full-bleed nueva: video de fondo, scrim de tinta, eyebrow, frase y tres métricas con conteo
animado. `<video autoplay muted loop playsinline poster="…">`. Bajo reduced-motion no se reproduce
y las métricas muestran su valor final directamente. Marcada **sin** `.section--light` (es oscura).

### 5.3 `ClientWall`

Hijo de `TrustSection`. Carrusel infinito de 13 máscaras monocromas.

- Cada logo es un `<span>` con `mask-image` y `background: currentColor`: **una sola pieza sirve
  en claro y en oscuro**, y el hover es un cambio de color, no otro archivo.
- La cinta duplica el conjunto exactamente una vez; la copia va `aria-hidden="true"` y sin
  `role="img"` — el lector oye 13 empresas, no 26.
- **Sin `gap`: el aire va como `margin-inline` de cada elemento.** Con `gap`, desplazar el 50 % no
  cae en el mismo punto del patrón —queda desfasado medio hueco— y el bucle salta en cada vuelta.
  Medido en el mockup: costura de 0.00 px a 1440, −0.03 a 768, −0.13 a 375.
- Pausa en `:hover` y `:focus-within`.
- Bajo reduced-motion vuelve a **retícula estática** con los 13 visibles; detener la cinta sin más
  dejaría a la mayoría fuera de pantalla.
- Corre en sentido contrario al ticker de sectores: dos cintas en la misma dirección se leen como
  una repetición.

### 5.4 `SectionNav`

Sustituye al rail. Barra de 44 px bajo el nav, visible **desde 900 px**, que aparece al salir del
hero.

- Se oculta con una técnica que **retira los enlaces del orden de foco** (`display`/`visibility`),
  nunca con `opacity`/`transform` — el mockup tiene ese defecto y portarlo traería enlaces
  tabulables e invisibles.
- Publica `aria-current` sobre la sección activa: el rail lo hacía y nada lo reemplazaba.
- Decide su tema con `probeSectionThemeAt(y)` midiendo a **su propia** altura (100 px de scroll),
  mientras `TopNav` mide a la suya (40 px). Nunca un punto común.
- Etiquetas: "**Arriba** · Líneas · Manifiesto · Cifras · Confianza · Contacto". Ninguna repite las
  del menú de páginas — **corregido en T018**: la primera era "Inicio", que colisionaba con el enlace
  de página `/` en ES y con `"Home"` en EN, donde el drawer las muestra juntas.
- **KZ-002:** la visibilidad por ancho se resuelve con media query en el CSS del componente, nunca
  con un selector `body`/`html`, que la encapsulación de Angular hace que no case jamás.

### 5.5 Cambios en componentes existentes

| Componente | Cambio |
|---|---|
| `TrustSection` | **Corregido (T018 · T019):** el `setInterval` y el export `TESTIMONIAL_PAUSE_MS` **se conservan** — la versión anterior de esta fila los daba por retirados, y la reversión HITL de DD-034 la dejó falsa. La constante pasa a **6 000 ms**. **Se conservan los cuatro testimonios.** Los puntos pasan de decoración a control primario: nombre accesible traducido (hoy `testimonialLabel()` devuelve `'Testimonio N'` en español fijo), estado programático, 44×44 px. Monta `ClientWall`. Pasa de mist a blanco |
| `AboutTeaserSection` | De `--amd-ink` a claro; entra la imagen, cuyo alto deriva del texto; recibe `.section--light` |
| `MobileDrawer` | Añade `#cifras`; las etiquetas de sección pasan a "Líneas"/"Manifiesto" — hoy muestra **"Servicios" dos veces** |
| `TopNav` | Empieza a invertirse sobre tramos claros; hoy nunca lo hace |
| `App` | Se retira el montaje del rail y la clase `body.has-side-nav` (que **no la estiliza nadie**); se monta `SectionNav`. `isHomeRoute()` sobrevive: es el único gate Home-vs-deep del shell |
| `tokens.css` | `--amd-gold-ink: #8a7a2e` · `--amd-gold-ink-deep: #6f6224` |

---

## 6. Backend Design

**N/A — phase boundary.** ADR-003: cero trabajo en `server/`.

---

## 7. Design Decisions

| ID | Decisión | Elección | Rechazado | Por qué |
|----|----------|----------|-----------|---------|
| **DD-028** | Ritmo claro/oscuro | Claro dominante; el oscuro es puntuación (hero, banda, cierre) | Oscuro dominante (v1 del mockup) | Medido: la v1 dejaba 68.2 % en tinta y 2.4 pantallas antes del primer respiro. El cliente la rechazó por eso. **Supersede `docs/ux-ui/design.md` §11** |
| **DD-029** | Índice de secciones | `SectionNav` único desde 900 px | Rail lateral ≥1100 px; mantener ambos | Dos piezas para la misma función son dos scroll-spies, dos temas y dos juegos de etiquetas que no pueden divergir. Además el rail dejaba **900–1099 px sin ningún índice**. **Supersede §2 y §5** |
| **DD-030** | El algoritmo de tema | Extraer `probeSectionThemeAt` a `core/motion/section-theme.ts` como función **pura** | Duplicarlo en `TopNav` y `SectionNav`; dejarlo morir con el rail | Es la única implementación del repo y REQ-008 la necesita para dos barras. Como función pura además pasa a ser testeable en jsdom, que es donde el resto del spec no llega |
| **DD-031** | Dorado sobre claro | **Dos** tokens de tinta: `--amd-gold-ink: #8a7a2e` (3.86:1) para relleno y texto grande, `--amd-gold-ink-deep: #6f6224` (5.49:1) para texto normal; `--amd-gold` sólo como relleno | Un solo token de tinta; usar `--amd-gold` como texto; aclarar el fondo | Medido: `#CFBB66` da 1.73:1 sobre mist, reprueba incluso en texto grande. **Corregido en la Pivot T001**: con un solo token a 3.86:1, tres de los cuatro usos del acento incumplen WCAG porque se renderizan a 12–18.4px, por debajo del piso de texto grande. **Ninguno de los dos es un color nuevo**: `#8a7a2e` estaba suelto en `.eyebrow--ink` y `#6f6224` en `home-redesign.css:187` y `:273` |
| **DD-032** | Logos de clientes | Máscaras monocromas de un canal + `mask-image` + `currentColor` | `<img>` en color; SVG por logo; dos juegos por tema | Los 13 originales traen ratios de 0.82 a 4.18, un JPG con fondo negro y uno rosa invisible sobre papel. El monocromo normaliza los cuatro problemas a la vez y **una pieza sirve en los dos temas** |
| **DD-033** | Cinta del muro | `margin-inline` por elemento y duración calculada en JS desde el ancho medido | `gap` + duración fija en CSS | Con `gap` el 50 % queda desfasado medio hueco y el bucle salta. Con duración fija la cinta acelera en móvil, justo donde cuesta más leerla |
| **DD-034** | Testimonios | **Rotación automática a ritmo de lectura (6 s — corregido en T019; el valor original de la reversión fue 9 s), con pausa en `:hover`/`:focus-within` y sin temporizador bajo reduced-motion**; **cuatro**, no tres; puntos como control explícito | Sin auto-rotación (elección original); rotar sin pausa al interactuar; reducir a tres como el mockup | **Revertido por HITL 2026-09-06:** el cliente pidió que los testimonios pasen solos. La objeción que motivó la elección original —sustituir texto que se está leyendo— se resuelve con la pausa al hover/foco, no renunciando a la rotación. El mockup no rota: esto va por encima del mockup. Reducir a tres seguiría siendo pérdida de contenido que ningún requisito pide. **El ritmo sale de medir el copy** (T019): el testimonio más largo son 16 palabras, ~6 s leyendo despacio; 9 s se sentían muertos |
| **DD-035** | Datos del ledger | Importar `SERVICE_GROUPS` de `features/services/services-page`; contador derivado de `subs.length` | Duplicar el catálogo en la Home; contador literal | Es la dirección de import que ya existe. Hoy ambos dan 31; derivarlo impide que se separen mañana |
| **DD-036** | Contenido colapsado | Detalle de fila cerrada marcado `inert` | Sólo `hidden` visual; nada | `ServicesRoadSection` ya lo resolvía. Cinco filas cerradas con su enlace dentro es la misma trampa WCAG |
| **DD-037** | Ocultado del `SectionNav` | Técnica que retira del orden de foco | `opacity` + `transform`, como el mockup | El mockup deja `display: block` y sólo baja la opacidad: enlaces tabulables e invisibles |
| **DD-038** | Gate de defectos visuales | **Playwright** con un script de medición que reporta números | Sólo `npm run test:agent`; sólo capturas; sólo revisión visual | jsdom no calcula layout ni compone `mask-image` ni evalúa contraste. El TRD §12 ya contempla Playwright para fase 1 tardía. Las capturas JPEG **inventaron** una costura inexistente durante el mockup |
| **DD-039** | Video de Cifras | Asset de runtime en `public/media/`, con `poster` | Inline; `<img>` fijo; lazy component | 1.9 MB no pueden entrar en el bundle inicial (budget de 1 MB). El póster cubre 3G y reduced-motion |
| **DD-040** | Spine del ledger | `onPassiveScroll` existente, una sola propiedad | GSAP ScrollTrigger | Es una única propiedad (`height`); GSAP no se justifica y añade peso (D-4) |
| **DD-041** | Marcador de tema | `.section--light` se conserva y **se añade a `#sobre-amd`** (que pasa a claro); `#cifras` no lo lleva | Un atributo nuevo; inferir el tono | Es el mecanismo que ya existe. Sin añadirlo a las secciones que cambian de tono, la inversión del chrome falla **en silencio** justo en las secciones nuevas |

Ningún DD supersede un ADR del TRD. `DD-028`, `DD-029` y `DD-031` superseden secciones de
`docs/ux-ui/design.md`, y REQ-014 exige editarlas.

---

## 8. NFR scenarios

Sólo lo que este spec altera respecto al TRD §3.

### Performance

| Field | Value |
|-------|-------|
| Stimulus | Carga de la Home en móvil 4G |
| Artifact | SPA + `public/media/` |
| Response | Hero usable de inmediato; el video de la banda llega después |
| **Measure** | Bundle inicial bajo el `maximumError` de 1 MB; CSS por componente bajo 32 kB; máscaras de logos ≤ 200 kB (medido: 144 kB); el video **no** en el bundle |
| Tactics | Asset de runtime, `poster`, `loading="lazy"` en las fotos below-fold |

### Accessibility

| Field | Value |
|-------|-------|
| Stimulus | Recorrido completo por teclado y lector de pantalla |
| Artifact | Ledger, `SectionNav`, muro, puntos de testimonio |
| **Measure** | Contraste ≥ 4.5:1 en texto normal; ningún control alcanzable sólo por puntero; ningún enlace tabulable dentro de contenido oculto; 13 nombres anunciados en el muro, no 26 |
| Tactics | `inert` en colapsado, `aria-current` en el nav, `aria-expanded` sincronizado, nombre accesible traducido |

---

## 9. Reto a las reversiones (Step 2.3)

Tres decisiones retiran comportamiento **ya entregado y en producción**. Un revisor independiente
respondió, para cada una, *"¿qué rompe quitar esto?"*. Encontró cuatro pérdidas que ningún
requisito reclamaba. **Las cuatro están ahora cubiertas.**

| Reversión | Qué rompía de verdad | Cómo queda cubierto |
|---|---|---|
| **Retirar `HomeSideNav`** | Se llevaba la única implementación del algoritmo de tema, que REQ-008 necesita para dos barras. Perdía `aria-current`. Las claves `sideHome`/`sideNavAria` quedaban huérfanas sin ningún gate que lo detecte | **DD-030** (extracción a función pura), **DD-037**, escenarios nuevos de `aria-current` y de ocultado en REQ-008, y REQ-011 exige retirar las claves huérfanas |
| **Quitar la auto-rotación** | `trust-section.spec.ts` **no compila** (importa `TESTIMONIAL_PAUSE_MS`). Un test de reduced-motion queda como **falso verde**: pasa sin probar nada. El requisito archivado REQ-007 no estaba en `Supersedes`. Y mi REQ-006 decía "tres testimonios" cuando producción sirve cuatro | **DD-034**, `Supersedes` corregido, escenario de "sin temporizador" con 15 s, y la tabla de clases de defecto incorpora *"un test que ya no puede fallar se borra, no se conserva en verde"* |
| **Sustituir `ServicesRoadSection`** | Se llevaba ~30 tests, tres de los cuales son **gates declarados de requisitos archivados y cerrados** (los 5 ids, los 5 deep-links, el guard de "Más info"). Y el test de `inert` en colapsado, **que ningún requisito nuevo mencionaba** | **DD-035**, **DD-036**, escenario nuevo de fila-cerrada-no-tabulable en REQ-002, y los tres gates ahora nombrados por nombre en la tabla de clases de defecto |

**Beneficio colateral confirmado:** `services-road-section.css` era el fichero que excedía el aviso
de `anyComponentStyle` (828 bytes, documentado en la validación del spec de `/services`). Su
retirada cierra ese aviso.

**Sorpresa que cambió el alcance:** hoy hay un agujero entre **900 y 1099 px sin ningún índice de
secciones** — el drawer se oculta desde 900 px y el rail sólo aparecía desde 1100 px. Retirar el
rail no abre un hueco: cierra uno que ya existía.

---

## 10. Budget (Step 2.4)

| Señal | Estimación | **Real (cerrado 2026-09-06)** |
|---|---|---|
| **Tareas** | **13** | **20** (T001–T020) |
| **LOC neto** | **~1 900** (≈ +2 400 añadidas, ≈ −500 borradas con `services-road/` y `home-side-nav/`) | **+3 838** en `client/` (+6 081 / −2 243) |
| **Rondas de revisión** | **3** esperadas (el ledger y el `SectionNav` son las candidatas) | 1–2 por tarea · 1 Pivot (T001) · 0 HALT |

**El cable trampa saltó, y se escaló como debía.** Las siete tareas de más (T014–T020) no salieron de
una descomposición mal hecha: salieron de **KZ-007** —una tarea escrita como *delta de comportamiento*
no porta el diseño, y la revisión no lo detecta— y de **cuatro pasadas de revisión HITL en navegador**,
cada una aprobada explícitamente. T012 y T020 son el gate de medición y el defecto preexistente que
destapó. La estimación no estaba mal calibrada para el trabajo que el spec describía; lo que el spec
no describía era el porte visual del mockup, que es lo que costó las seis tareas de corrección.

> La estimación inicial fue 12; la descomposición de la Fase 3 dio **13**. Se corrige la cifra en
> vez de forzar la partición: la tarea de más es la sincronización de `docs/ux-ui/design.md`
> (REQ-014), que no puede colgar de otra porque depende de que el nav y el ledger ya existan.

Estas cifras son un **cable trampa**, no un techo de calidad: `/akili-execute` compara los reales
contra ellas y **para y escala** si los excede. La profundidad `Standard` sigue siendo la correcta
—no hay datos, ni API, ni auth, ni migración—, pero el volumen está en el extremo alto de su rango
y por eso §11 recomienda partir en tres PR.

---

## 11. Test plan hooks

| Suite | Cubre |
|---|---|
| `frontend-unit` (Vitest + jsdom) | Acordeón exclusivo y `aria-expanded`; `inert` en colapsado; contador derivado de `subs.length`; los 5 ids y los 5 deep-links; guard de "Más info"; duplicación y `aria-hidden` del muro; `probeSectionThemeAt` como función pura; **rotación de testimonios contra `TESTIMONIAL_PAUSE_MS` con timers falsos, pausa por hover/foco y ausencia de temporizador bajo reduced-motion**; paridad de claves i18n; cálculo de contraste sobre los tokens |
| **`browser-measure` (Playwright, DD-038)** | Proporción de tinta y posición del primer tramo claro; ausencia de scroll horizontal en 6 anchos; costura del carrusel ≤ 0.5 px; velocidad constante ±10 %; un solo índice por ancho; pausa del marquee |
| `build` | Budgets de `angular.json`; el video fuera del bundle inicial |
| **Revisión visual HITL** | Encuadre de las fotos; veracidad de los textos alternativos; fidelidad al mockup |

**Descalificador que aplica a toda medición en navegador:** forzar scroll instantáneo, esperar
`document.fonts.ready`, y repetir la lectura. Si dos lecturas consecutivas difieren más que el
efecto medido, el resultado es **INCONCLUSO** — nunca PASS por código de salida 0.

---

## 12. Risks & mitigations

| Riesgo | Mitigación |
|---|---|
| El borrado de dos componentes deja la suite **sin compilar** (imports de `TESTIMONIAL_PAUSE_MS`, `ROAD_DECO_FACTORS`, `HomeSideNav`) | La tarea de borrado incluye los `.spec.ts` y las cuentas rígidas (`expect(anchors.length).toBe(7)`). El gate es que **la suite entera compile**, no que pasen los tests nuevos |
| Tests que quedan en falso verde al desaparecer su sujeto (`about-page.spec.ts` afirmando la ausencia de un rail que ya no existe en ninguna ruta) | Se borran, no se conservan. Está en la tabla de clases de defecto |
| `mask-image` sin soporte deja el muro **invisible** — no hay degradación elegante posible | Fallback declarado con `@supports`: el nombre de la empresa en texto. La retícula pierde el logo, no al cliente |
| Añadir Playwright es una dependencia nueva | Ya contemplada por el TRD §12 para fase 1 tardía. Se instala sólo como devDependency y no toca el bundle |
| El video de 1.9 MB en 3G | `poster` inmediato; el video es fondo, nunca contenido crítico |
| SK Glam se amplía 1.49× y sale blando | Aceptado. Se pedirá el vectorial; no bloquea |
| Cambiar el valor de `navServices`/`navAbout` afecta también al drawer | Es deseable: hoy el drawer muestra "Servicios" dos veces. La misma tarea corrige ambos |
