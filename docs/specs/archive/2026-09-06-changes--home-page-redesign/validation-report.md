# Validation Report — home-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Fecha | 2026-09-06 |
| Auditor | Claude Code `opus` (T3) — **autor ≠ auditor** ✅ (implementación delegada a Antigravity `gemini-3.8-flash-high`) |
| Baseline commit | `f891716` |
| HEAD validado | `020d3ea` |
| Árbol de trabajo | limpio |
| Veredicto | **PASS** — ninguna FAIL. 8 WARN levantadas, **6 resueltas en la misma sesión**, 2 aceptadas |
| Remediación | Aplicada 2026-09-06 tras la validación (ver §10). Gates re-corridos en verde después |
| Archive readiness | **Listo para `/akili-archive`** |

---

## 1. Summary

**La implementación satisface los catorce requisitos.** Los tres gates automáticos están en verde y
son falsables: 322 tests unitarios, las 13 mediciones en navegador de DD-038, y el build con sus
budgets. Las cuatro clases de defecto que jsdom no puede ver —contraste, layout, costura del
carrusel y fidelidad al mockup— están cubiertas por el gate de navegador, tal como el spec declaró
en su §5 «Clases de defecto y su gate».

**Todo lo que falla es documental, no de comportamiento.** Ocho WARN, y siete de ellas son la misma
raíz: **las seis tareas de corrección HITL (T014–T020) no barrieron hacia atrás los documentos del
spec**. `design.md` sigue diciendo que los testimonios *no rotan* en cuatro sitios y que rotan *a 9 s*
en un quinto — dentro del mismo documento y contra el código, que rota a **6 s**. La baseline
constitucional (`docs/ux-ui/design.md`) sí quedó correcta: dice 6 s. Es el spec el que se quedó atrás,
no el producto.

| Fase | Resultado |
|---|---|
| 1 · Task completion | **PASS** (20/20) · 1 WARN de bookkeeping |
| 2 · File existence | **PASS** |
| 3 · Build integrity | **PASS** (test 322/322 · lint limpio · build sin avisos · visual 13/13) |
| 4 · Requirement coverage | **PASS** (14/14) · 2 WARN de trazabilidad |
| 5 · Quality audit | **PASS** · 1 WARN de contenido · 14 advisories arrastradas |
| 6 · Design conformance | **PASS en producto** · 4 WARN de deriva documental |
| 10 · Agent guides | **WARN** — índice de Module Guides sin las superficies compartidas nuevas |

---

## 2. Task Completion

| Señal | Valor |
|---|---|
| Tareas declaradas en `design.md` §10 | 13 |
| Tareas ejecutadas | **20** (T001–T020) |
| `Status: [x]` | **20/20** |
| Rondas de revisión (presupuestadas: 3) | 2+2+2+2+2+1×… — ver `execution.md` |
| Pivots | 1 (Pivot T001 — dos tokens de tinta) |
| HALT / FATAL_FAIL | 0 |

Todas las tareas llevan notas de ejecución con Implementer, Reviewer, Orca run/task/dispatch,
requisitos cubiertos y evidencia. La trazabilidad de ejecución es la parte más fuerte del spec.

**W-1 · WARN — T013 tiene `Status: [x] PASS` con sus tres «Done when» sin marcar.**
`tasks.md:1267-1269`. El trabajo **sí está hecho** y lo verifiqué de forma independiente:
`docs/ux-ui/design.md` §2 y §5 describen el sub-header desde 900 px, §7 declara los dos tokens con
la tabla de reparto por tamaño computado, §11 describe el ritmo claro dominante, y `grep -n "sidenav\|1100px"`
no devuelve nada. Es un fallo de anotación, no de ejecución.

---

## 3. File Existence

Contrastado contra el árbol de `design.md` §2. **Sin desviaciones.**

| Esperado | Estado |
|---|---|
| `public/media/` — 7 imágenes + `manifiesto.mp4` | ✅ 7 `.webp` + `manifiesto.mp4` (1.94 MB) |
| `public/media/logos/` — 13 máscaras | ✅ 13 `.webp` = **147 618 bytes** (techo 200 kB) |
| `core/motion/section-theme.ts` (NUEVO) | ✅ + `.spec.ts` |
| `core/layout/section-nav/` (NUEVO) | ✅ |
| `core/layout/home-side-nav/` (BORRADO) | ✅ ausente |
| `features/home/ledger/` (NUEVO) | ✅ |
| `features/home/services-road/` (BORRADO) | ✅ ausente |
| `features/home/figures/`, `clients/` (NUEVOS) | ✅ |
| `styles/tokens.css` (MOD) | ✅ los dos tokens de tinta |

Extra no previsto en el árbol pero justificado por T018: `core/layout/chrome-offset.ts` — fuente
única del alto del chrome, consumida por `app.config.ts` y `SectionNav`.

---

## 4. Build Integrity

Todos los comandos con **Node v24.20.0** (el `v22.18.0` del PATH por defecto está por debajo del
mínimo que exige Angular CLI 22 — ver W-8).

| Gate | Comando | Resultado |
|---|---|---|
| Unit | `npm run test:agent` | **33 ficheros · 322 tests · 322 passed** |
| Lint | `npm run lint -- --quiet` | **All files pass linting** |
| Build | `npm run build` | **Sin avisos de budget.** Initial 452.47 kB (`maximumError` 1 MB) |
| Visual | `npm run verify:visual` | **13 PASS · 0 FAIL · 0 INCONCLUSO** |

### El gate de navegador, medición a medición (DD-038)

| # | Medición | Valor | Umbral | Estado |
|---|---|---|---|---|
| 01 | Proporción de tinta a 1440 px | 39.40 % | 35–45 % | PASS |
| 02 | Primer tramo claro | 1.00 vh | ≤ 1.20 vh | PASS |
| 03 | Sin scroll horizontal (6 anchos) | 0.00 px | ≤ 1.00 px | PASS |
| 04 | Índices de sección por ancho | 1 exacto | exactamente 1 | PASS |
| 05 | Costura del carrusel | **−0.50 px** | \|≤ 0.50\| | PASS *(en el límite — W-7)* |
| 06 | Velocidad entre anchos | ±0.74 % | ±10 % | PASS |
| 07 | Pausa en hover | paused/running | paused/running | PASS |
| 08 | Foto del ledger dentro del contenedor | 0.00 px | ≤ 1.00 px | PASS |
| 09 | Contraste dorado sobre claro | mín 3.86:1 | ≥4.5 normal / ≥3 grande | PASS |
| 10 | Alineación izquierda del hero | 0.00 px | ≤ 2.00 px | PASS |
| 11 | Enlaces del top-nav a la derecha | 494 vs 24 px | izq ≫ der | PASS |
| 12 | «Scroll» revela el sub-header | is-on visible | is-on tras click | PASS |
| 13 | Ticker vs muro en sentidos opuestos | reverse/normal | opuestos | PASS |

El video sale como asset de runtime: `dist/client/browser/media/manifiesto.mp4`, **fuera** del
bundle inicial (REQ-013 ✅).

---

## 5. Requirement Coverage

**No existe `test-report.md`** — `/akili-test` no se corrió; los tests se escribieron dentro de cada
tarea de `/akili-execute`. La cobertura se verificó por tanto **directamente contra el código y los
gates**, no reutilizando evidencia. Ver W-6.

| REQ | Veredicto | Evidencia verificada de forma independiente |
|---|---|---|
| REQ-001 Ritmo claro/oscuro | **PASS** | Orden y tono confirmados en `home-page.html` + los cinco marcadores `.section--light`; medición 01 = 39.40 %, medición 02 = 1.00 vh |
| REQ-002 Ledger | **PASS** | `ledger-section.html`: ordinal, título, resumen, contador `{{ line.count }}`, `.line__plus` en CSS; sin emojis ni tarjetas; acordeón exclusivo por signal; `[inert]="!isOpen(...)"` en el detalle; contador de `SERVICE_GROUPS[i].subs.length` vía `buildLedgerLines`; medición 08 confirma el recorte de la foto |
| REQ-003 Deep-links y anclas | **PASS** | `routerLink="/services" [fragment]="line.id"` × 5; guard `closest('a')`; las seis anclas en el DOM (`home-page.spec.ts`) |
| REQ-004 Manifiesto | **PASS** | Sin `aspect-ratio` en la regla base (sólo dentro de `@media (max-width:…)`, que es lo que pide la baseline §9); CTA a `/about-us` intacto |
| REQ-005 Cifras | **PASS** | `<video muted loop playsinline poster preload="none">` sin `controls`; `play()` nunca se invoca bajo reduced-motion; métricas nacen en su valor final |
| REQ-006 Confianza | **PASS** | 4 testimonios (`q1…q4`); `TESTIMONIAL_PAUSE_MS = 6000`; pausa reactiva por `hover`+`focusin/out`; sin temporizador bajo reduced-motion; puntos 44×44 px con `aria-selected` + `aria-current` y `testimonialDotLabel` traducido; sin fotos de personas |
| REQ-007 Muro de clientes | **PASS** | 13 `role="img"` + 13 copias `aria-hidden` sin rol; `margin-inline`, **cero `gap`** en la cinta; duración calculada en JS; retícula estática bajo reduced-motion; mediciones 05/06/07/13 |
| REQ-008 Un índice por ancho | **PASS** | Medición 04 = exactamente 1 en los seis anchos; ocultado por `visibility:hidden` + `[inert]` + `tabindex="-1"` (DD-037, **no** opacity); `aria-current` en el ancla activa; drawer con 3 + 6 = 9 enlaces incl. `#cifras`; `probeSectionThemeAt` a 100 px (SectionNav) vs 40 px (TopNav) |
| REQ-009 Dorado sobre claro | **PASS** | Los dos tokens en `tokens.css`; **cero** `#8a7a2e`/`#6f6224` fuera de tokens y specs; medición 09 mín 3.86:1 con el umbral elegido por tamaño computado; el ordinal baja a `--amd-gold-ink-deep` bajo 900 px |
| REQ-010 A11y y movimiento | **PASS** | Activación por click **y** keydown; `inert` en colapsado; ocho bloques `prefers-reduced-motion` cubren marquee, ticker, spine, conteo y video |
| REQ-011 Paridad bilingüe | **PASS** (con W-5) | 208 = 208 claves, cero huérfanas en ambos sentidos; `sideHome`, `sideNavAria`, `roadHint`, `m1…m4`, `trustTitle`, `trustLead`, `trustCta`, `logosLabel`, `fNote` retiradas; `testimonialLabel()` ya no devuelve español fijo |
| REQ-012 Sin desbordamiento | **PASS** (con W-3) | Medición 03 = 0.00 px en los seis anchos; el reapilado bajo 900 px existe (`grid-template-areas: 'ord count plus' / 'text text text'`) |
| REQ-013 Presupuesto de medios | **PASS** | Initial 452.47 kB; máscaras 147 618 B; mayor CSS de componente 11 677 B; video fuera del bundle |
| REQ-014 Baseline sincronizada | **PASS** | `docs/ux-ui/design.md` §2/§5/§7/§11 verificadas leyendo el documento entero, no el grep de la tarea |

### Cláusulas negativas y validaciones estrictas — barrido explícito

Las cláusulas `BUT it must NOT` / `AND IT MUST` son las que el comando exige comprobar una a una.
Todas verificadas:

| Cláusula | Estado |
|---|---|
| REQ-002 *NOT* emojis ni tarjetas | ✅ iconografía en CSS (`.line__plus`), lista `<ol>` |
| REQ-002 *NOT* depender de `:hover` para abrir | ✅ `(click)` + `(keydown)`; `:hover` sólo pinta `is-hot` |
| REQ-002 *NOT* alcanzar «Más info» de una fila cerrada | ✅ `[inert]` |
| REQ-002 *NOT* listar sub-servicios en la Home | ✅ sólo `bodyKey` |
| REQ-003 *NOT* alternar el acordeón al pulsar «Más info» | ✅ guard `closest('a')` |
| REQ-004 *NOT* declarar `aspect-ratio` que se imponga | ✅ ausente en la base |
| REQ-005 *NOT* audio, controles ni bloqueo del render | ✅ `muted`, sin `controls`, `preload="none"` |
| REQ-006 *NOT* rotar bajo reduced-motion | ✅ `restartTimer()` sale temprano |
| REQ-007 *NOT* usar `gap` en la cinta | ✅ `margin-inline` (el `row-gap` sólo vive en la retícula de reduced-motion, otro layout) |
| REQ-007 *NOT* limitarse a detener la cinta | ✅ retícula con los 13 visibles |
| REQ-007 *NOT* fijar la duración en el CSS | ✅ `--marquee-dur` calculada en JS y recalculada en `resize` y `fonts.ready` |
| REQ-008 *NOT* rail lateral en ningún ancho | ✅ componente borrado; medición 04 |
| REQ-008 *NOT* ocultar sólo con opacity/transform | ✅ `visibility` + `inert` + `tabindex` |
| REQ-008 *NOT* repetir «Servicios» ni «Nosotros» en el panel | ✅ `navServices`="Líneas", `navAbout`="Manifiesto" |
| REQ-008 *NOT* medir el tema en un punto común | ✅ 100 px vs 40 px |
| REQ-009 *NOT* `--amd-gold` **ni `--amd-gold-soft`** como `color:` sobre claro | ✅ aserto línea a línea en `ledger` y `trust`; medición 09 |
| REQ-009 *NOT* `#8a7a2e`/`#6f6224` hardcodeados | ✅ cero fuera de `tokens.css` |
| REQ-011 *NOT* literal de copy en plantilla **ni en código** | ✅ `testimonialDotLabel` interpolado |
| REQ-012 *AND* reapilado bajo 900 px | ✅ implementado — pero sin gate propio (W-3) |
| REQ-014 *NOT* referencia al rail en la baseline | ✅ las tres menciones supervivientes son **columnas de alternativa rechazada** y notas de supersesión; ningún documento describe el rail como existente |

---

## 6. Linting & Code Quality

`ng lint --quiet` limpio. Ninguna violación de arquitectura: nada toca `server/` (ADR-003), la
dirección de import `home → services-page` es la que ya existía (DD-035), y no hay estado global
nuevo (TRD §8).

### 4R — advisory (no son violaciones de spec; informan remediación futura)

Barrido propio más las **14 ADVISORY** que `execution.md` registró y que morirían en el audit trail
si no se arrastraran aquí. Las que siguen vivas:

| # | Lente | Hallazgo | Origen |
|---|---|---|---|
| A-1 | Legibilidad | `core/motion/motion.service.ts:8` cita «services-road deco parallax + progress fill», componente inexistente desde T007. Dueña natural declarada: T013 — **no se hizo** | ADVISORY T007 |
| A-2 | Legibilidad | `trust-section.ts:46` dice «4 dots and **9s** auto-advance» tras T019 bajarlo a 6 s | propio |
| A-3 | Fiabilidad | `FiguresBand` lee `reducedMotion()` **una sola vez** en `ngAfterViewInit`: cambiar la preferencia a mitad de sesión no reconfigura la banda. Es **deriva de todo el proyecto** (mismo patrón en `ledger-section`), no defecto de T009 | ADVISORY T009 |
| A-4 | Resiliencia | Reduced-motion en `ClientWall` está implementado por **tres vías** a la vez (`@media`, clase `.is-reduced-motion`, bindings `[style]`). Ninguna es incorrecta; tres mecanismos para un comportamiento decaen | ADVISORY T010 |
| A-5 | Riesgo | **Tres copias independientes** de los seis ids de ancla: `SECTION_NAV_ANCHORS`, `top-nav.ts:10 SECTION_ANCHOR_IDS` y `mobile-drawer.html`. Nada las case entre sí | ADVISORY T003 · T004 |
| A-6 | Riesgo | El orden **renderizado** del ledger no se asevera: un `.reverse()` en el `@for` dejaría los 25 tests en verde pese a REQ-002 («el mismo orden que `SERVICE_GROUP_IDS`») | ADVISORY T005 |
| A-7 | Riesgo | `parseTokensCss` es un regex global sin conciencia de scope; el día que entre un `@media (prefers-color-scheme: dark)` medirá el token equivocado | ADVISORY T001 |
| A-8 | Legibilidad | `.eyebrow` base declara un `color` muerto, redundante con `.eyebrow--ink` | ADVISORY T014 |
| A-9 | Fidelidad | `margin-block: -1.75rem` del mockup (la foto un poco más alta que el texto) no se portó — diferencia visual deliberada | ADVISORY T008 |

Ninguna bloquea el archivado. A-5 y A-6 son las dos que más merecen una tarea de seguimiento: son
las únicas donde un cambio futuro puede romper un requisito **sin que ningún gate muerda**.

---

## 7. Design Conformance

El **producto** conforma con `design.md`, con la baseline constitucional y con el mockup (13/13 en el
gate + cuatro pasadas de revisión HITL en navegador, que son las que produjeron T014–T020).

Lo que no conforma es el **documento de diseño del propio spec**.

### W-2 · WARN — `design.md` se contradice a sí mismo sobre los testimonios, y contradice al código

`docs/ux-ui/design.md` (la baseline) dice **6 s** en §8 y §12. El código dice **6 s**. `tasks.md` T019
lo justifica midiendo el copy. Pero el `design.md` **del spec** dice cinco cosas distintas:

| Sitio | Dice | Realidad |
|---|---|---|
| §2 árbol, línea 56 | `trust/ ← MOD (sin auto-rotación…)` | rota |
| §3 Data Model, línea 110 | «`trustLead` … queda falsa **al retirar la auto-rotación**» | rota; y `trustLead` se **borró** entera en T015 |
| §5.5 tabla, línea 202 | «Se retira `setInterval` y el export `TESTIMONIAL_PAUSE_MS`» | ambos existen |
| **DD-034**, línea 227 | «Rotación automática a ritmo de lectura (**9 s**)» | **6 s** |
| §11 Test plan hooks, línea 311 | «**ausencia de temporizador** en testimonios» | el test asevera lo contrario |

Es un fallo de **correction closure**, y de libro: T018 revirtió la decisión y actualizó DD-034 y
REQ-006, pero **no barrió los otros cuatro sitios**; T019 cambió 9→6 y **no barrió DD-034**. Una
corrección cuyo barrido no corrió no está aplicada, sólo reubicada.

**No es FAIL** porque el comportamiento entregado es el correcto y está justificado por tres
documentos concordantes (baseline, `tasks.md` T019, `execution.md`). Es el spec el que quedó atrás.

### W-3 · WARN — `tasks.md` § Cierre de cobertura quedó congelado en T013

La tabla afirma literalmente: *«Las etiquetas de esta tabla **citan el nombre del escenario** en
`requirements.md`, no lo parafrasean, para que el cierre se pueda auditar comparando las dos listas»*.
Auditadas las dos listas:

- **REQ-006 → «Testimonio no rota solo | T011»**. Ese escenario **ya no existe**: `requirements.md:238`
  se llama «el testimonio rota a ritmo de lectura y se detiene al leerlo», y su dueño real es T018+T019.
- **REQ-012 segunda cláusula** («el ledger reordenarse a ordinal + contador + control arriba y título
  + resumen debajo por debajo de 900 px») **no tiene fila propia**. La única fila de REQ-012 es «Sin
  scroll horizontal | T012». Verifiqué el código: la cláusula **está implementada** correctamente
  (`ledger-section.css:415-418`), pero **ningún test ni medición la cubre** — jsdom no aplica media
  queries y el gate de navegador sólo mide desbordamiento a esos anchos, no el reapilado. Su
  verificación descansa por entero en la revisión HITL.
- **T014–T020 no aparecen** ni en la tabla de cobertura ni en el grafo de dependencias.

### W-4 · WARN — el presupuesto de `design.md` §10 se excedió y no se corrigió

| Señal | Presupuesto | Real | Δ |
|---|---|---|---|
| Tareas | 13 | **20** | +54 % |
| LOC neto en `client/` | ~1 900 | **+3 838** (6 081 / −2 243) | +102 % |

§10 declara estas cifras «un **cable trampa**, no un techo: `/akili-execute` compara los reales
contra ellas y **para y escala** si los excede». La escalada **sí ocurrió**, y por la mejor vía
posible: las siete tareas extra nacieron de KZ-007 y de cuatro pasadas de revisión HITL en navegador,
cada una aprobada explícitamente. Lo que falta es cerrar el bucle: §10 sigue diciendo 13.

### W-5 · WARN — `q2` y `q2By` están en inglés dentro de `es.json`

```
q2   ES: "Needed bilingual support for our ops setup in Colombia. Smooth and professional."
q2   EN: "Needed bilingual support for our ops setup in Colombia. Smooth and professional."
```

**Es preexistente** y REQ-011 no lo cubre (compara *claves*, no valores; y `q2` no es clave nueva de
este spec). Pero este spec **empeora su exposición**: antes había que pulsar un punto para llegar al
segundo testimonio; ahora la rotación automática de 6 s se lo pone delante a todo visitante
hispanohablante. Necesita traducción o una decisión explícita de dejarlo verbatim.

### Cross-document figure check

Contrastadas todas las cifras que los documentos afirman, contra la prosa de los demás:

| Cifra | Concordancia |
|---|---|
| 31 servicios (5 líneas) | ✅ derivada de `subs.length`, nunca literal |
| 13 logos · 147 618 B ≤ 200 kB | ✅ medido |
| 4 testimonios | ✅ `q1…q4` |
| 6 anclas de Home | ✅ en `SECTION_NAV_ANCHORS`, drawer y DOM |
| 9 enlaces del drawer (3+6) | ✅ |
| 9 sectores → 18 elementos | ✅ |
| 39.40 % de tinta (banda 35–45 %) | ✅ medido |
| **6 s de rotación** | ⚠️ **W-2** — `design.md` DD-034 dice 9 s |
| **13 tareas** | ⚠️ **W-4** — son 20 |
| Bundle 451.35 kB (T012) | ⚠️ hoy 451.46 / 452.47 kB total — deriva de 1 kB, inocua |

---

## 8. Test Evidence Summary

| Suite declarada (`design.md` §11) | Existe | Resultado |
|---|---|---|
| `frontend-unit` (Vitest + jsdom) | ✅ | 33 ficheros · **322/322** |
| `browser-measure` (Playwright, DD-038) | ✅ | **13/13 PASS · 0 INCONCLUSO** |
| `build` (budgets de `angular.json`) | ✅ | sin avisos |
| Revisión visual HITL | ✅ | **4 pasadas** en navegador; produjeron T014–T020 |

**W-6 · WARN — no existe `test-report.md`.** `/akili-test` no se corrió como fase separada; los tests
se escribieron dentro de cada tarea de `/akili-execute` con Reviewer independiente. La evidencia
existe y es más fuerte que la media (cada tarea lleva su *Evidence disqualifier* y prueba de
falsabilidad), pero **no hay matriz requisito↔test consolidada**, así que esta validación la derivó
de cero en vez de auditarla. No bloquea; sí encarece cualquier auditoría futura.

**W-7 · WARN — la costura del carrusel pasa exactamente en el límite.** Medición 05 = **−0.50 px**
contra un umbral de \|≤ 0.50\|. El mockup medía 0.00 / −0.03 / −0.13 px. Pasa, pero sin margen: en
CI, un redondeo distinto la vuelve roja. Conviene confirmar si es efecto real o artefacto de la
medición antes de fiarse del número.

Ningún `PRODUCT_BUG` abierto. El único FAIL que el gate produjo en su vida —los **+97 px** de
desborde del top-nav a 375 px— era un defecto **preexistente** que el gate destapó, se aisló en T020
y hoy mide **0.00 px**. Eso es exactamente lo que un gate debe hacer.

---

## 9. Agent Guide / Constitution Impact

`execution.md` **no contiene** una sección `## Constitution Impact`, así que no hay nada declarado
que verificar. Pero el spec sí movió superficies compartidas:

**W-8 · WARN — el índice de `## Module Guides` no nombra las dos superficies compartidas nuevas.**
`CLAUDE.md` y `AGENTS.md` describen `client/` mencionando sólo «Shared ambient field at `core/ambient/`».
Este spec añadió dos piezas transversales con más de un consumidor:

- `core/motion/section-theme.ts` — función pura consumida por **`TopNav` y `SectionNav`** (DD-030).
- `core/layout/chrome-offset.ts` — fuente única del alto del chrome, consumida por **`app.config.ts`
  y `SectionNav`** (T018).

Ninguna necesita un `client/AGENTS.md` propio (las convenciones no divergen), pero el índice debería
nombrarlas igual que nombra `core/ambient/`. **Pendiente para `/akili-archive`** (Constitution & Graph
Sync). Los tres kaizen propuestos —**KZ-005** + addendum, **KZ-006**, **KZ-007** + addendum— viven en
`docs/specs/kaizen/changes--home-page-redesign.md` y aún no están en `## Active Lessons`; los pliega
`/akili-archive`.

**Nota de entorno (no es WARN del spec):** el `node` por defecto del shell es **v22.18.0**, por debajo
del mínimo de Angular CLI 22 (v22.22.3). Todos los gates fallan con un mensaje de versión hasta
apuntar a `v24.20.0`. No está documentado en `docs/infrastructure.md` §Local Environment ni existe
`.nvmrc`. Cuesta un arranque en falso a cada sesión nueva.

---

## 10. Remediation

Ocho WARN, ninguna FAIL. **Seis aplicadas en esta misma sesión**, dos aceptadas como riesgo declarado.

| ID | Severidad | Acción | Dónde | Estado |
|---|---|---|---|---|
| **W-2** | **Media** | Barridos los cinco sitios de `design.md` (§2 árbol, §3 Data Model, §5.5 tabla, **DD-034 9 s → 6 s**, §11 hooks). **Sexto encontrado al barrer:** §5.4 decía «Inicio» como primera etiqueta del `SectionNav`, que T018 cambió a «Arriba» | `design.md` | ✅ **Resuelta** |
| **W-3** | Media | Cierre de cobertura actualizado: escenario de REQ-006 renombrado y reasignado a T011→T018→T019; **fila propia para la 2ª cláusula de REQ-012** con nota explícita de que su único gate es HITL; tabla nueva de T014–T020 con lo que cierra cada una; grafo de dependencias redibujado | `tasks.md` | ✅ **Resuelta** |
| **W-4** | Baja | §10 pasa a tabla estimación-vs-real (**13 → 20 tareas**, ~1 900 → **+3 838 LOC**) con el porqué: el cable trampa saltó y se escaló por HITL, no por descomposición mal hecha | `design.md` | ✅ **Resuelta** |
| **W-5** | **Media** | `q2`/`q2By` traducidos: *«Necesitábamos acompañamiento bilingüe para montar nuestra operación en Colombia. Fluido y profesional.»* / *«Líder de operaciones, SaaS»* | `client/src/assets/i18n/es.json` | ✅ **Resuelta** |
| **W-1** | Baja | Los tres «Done when» de T013 marcados, con la evidencia del barrido en la propia línea | `tasks.md` | ✅ **Resuelta** |
| **W-8** | Baja | `## Module Guides` nombra ahora las tres superficies transversales de `client/` con sus consumidores: `core/ambient/`, `core/motion/section-theme.ts` (TopNav + SectionNav) y `core/layout/chrome-offset.ts` (app.config + SectionNav) | `CLAUDE.md` · `AGENTS.md` | ✅ **Resuelta** |
| **W-6** | Baja | **Aceptada.** La sustitución declarada (322 unit + 13 mediciones + 4 pasadas HITL) es evidencia suficiente; generar `test-report.md` a posteriori sería reconstruir una matriz que esta validación ya derivó | — | ⚠️ Aceptada |
| **W-7** | Baja | **Aceptada.** El −0.50 px se mantuvo estable en las dos corridas del gate de esta sesión. Queda como riesgo declarado para CI: si se vuelve intermitente, subir el umbral o afinar la medición | `e2e/` | ⚠️ Aceptada |

**Advisories cerradas de paso** (eran comentarios que afirmaban de más, la misma clase de defecto):

- **A-1** — `motion.service.ts:8` citaba «services-road deco parallax + progress fill», borrado en
  T007. Ahora enumera los consumidores reales: spine y reveal del ledger, video y conteo de Cifras,
  marquee del muro, ticker de sectores y el temporizador de testimonios.
- **A-2** — `trust-section.ts:45` decía «9s auto-advance». Ahora cita la constante, no el número.

### Verificación posterior a la remediación

| Gate | Resultado |
|---|---|
| `npm run test:agent` | **322/322** ✅ |
| `npm run lint -- --quiet` | limpio ✅ |
| `npm run verify:visual` | **13 PASS · 0 FAIL · 0 INCONCLUSO** ✅ |

### Seguimiento sugerido, fuera de este spec

De las advisories que siguen vivas: **A-5** (tres copias independientes de los seis ids de ancla sin
nada que las case) y **A-6** (el orden **renderizado** del ledger no se asevera — un `.reverse()` en
el `@for` dejaría 25 tests en verde) son las dos únicas donde un cambio futuro rompe un requisito sin
que ningún gate muerda. **A-3** (`reducedMotion()` leído una sola vez en `ngAfterViewInit`) es deriva
de todo el proyecto, no de una sección, y merece tarea propia.

Seguimiento sugerido, fuera de este spec (de las advisories): **A-5** (tres copias de los ids de
ancla sin nada que las case) y **A-6** (el orden renderizado del ledger no se asevera) son las dos
únicas donde un cambio futuro rompe un requisito sin que ningún gate muerda. **A-3** (`reducedMotion()`
leído una sola vez) es deriva de todo el proyecto y merece tarea propia, no un parche.

---

## 11. Archive Readiness Recommendation

**Listo para archivar.**

| Criterio | Estado |
|---|---|
| Todas las tareas `[x]` | ✅ 20/20 |
| Sin FAIL sin resolver | ✅ ninguna |
| WARN aceptadas o con seguimiento | ✅ 6 resueltas · 2 aceptadas como riesgo declarado |
| Tests cubren requisitos y escenarios clave | ✅ 322 unit + 13 mediciones + 4 pasadas HITL |
| La deriva está reflejada en spec o notas de ejecución | ✅ `design.md` y `tasks.md` barridos |
| Revisión HITL del resumen | ✅ 2026-09-06 |

**El spec puede archivarse.** Queda pendiente para `/akili-archive` únicamente lo que le corresponde
por diseño: plegar **KZ-005** (+ addendum), **KZ-006** y **KZ-007** (+ addendum) desde
`docs/specs/kaizen/changes--home-page-redesign.md` a `## Active Lessons`, y el paso de Constitution &
Graph Sync.

```text
/akili-archive docs/specs/changes/home-page-redesign
```
