# Tasks — home-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Execution log | `execution.md` (mismo folder) |
| Budget (`design.md` §10) | **13 tareas · ~1 900 LOC neto · 3 rondas de revisión** |
| Directory boundary global | `client/` y `docs/` — **nunca `server/`** (ADR-003) |
| Commit | `[SPEC:docs/specs/changes/home-page-redesign] <mensaje>` |

**Regla de verificación que aplica a todas las tareas.** El runner es Vitest + jsdom. jsdom no
calcula layout, no compone `mask-image` y no evalúa contraste. Cuando la tarea produce un defecto
de esa clase, su verificación **nombra explícitamente lo que no puede probar** y quién lo prueba
(T012 o la revisión HITL). Un aserto de presencia —que una clase existe, que un atributo está—
prueba presencia, no efecto.

**Cómo se filtra la suite (corregido 2026-09-06).** `npm run test:agent` resuelve al builder
`@angular/build:unit-test`, que **sólo** acepta `--include=<glob>` relativo a `client/`. Un filtro
posicional (`npm run test:agent -- ledger`) se **ignora en silencio** y corre la suite entera: el
comando pasa igual, así que el defecto no se nota. Las verificaciones de abajo ya usan `--include`.
Donde una tarea pide deliberadamente la suite completa —T003 y T007 llevan Evidence disqualifiers
que exigen que **todo compile** tras borrar un componente— el comando va sin filtro, y eso es
intencional. T011 sí va filtrada: su Evidence disqualifier sólo exige que el run **incluya**
`trust-section.spec.ts`, que es el único importador de `TESTIMONIAL_PAUSE_MS` y vive dentro del glob.

---

## T001 — Token `--amd-gold-ink` y assets de medios

- **Status:** [ ]
- **Depends on:** none
- **Directory boundary:** `client/src/styles/`, `client/public/media/`
- **Recommended skills:** `ui-ux-pro-max`
- **Requirements:** REQ-009 (escenario "el token se declara en la fuente de verdad"), REQ-013 (parcial)
- **Design refs:** DD-031, DD-032, DD-039, §3 Data Model

### Scope

Declarar `--amd-gold-ink: #8a7a2e` en `client/src/styles/tokens.css`. Copiar desde
`docs/specs/changes/home-page-redesign/mockup/assets/` a `client/public/media/`: las 5 fotos de
línea, la foto del manifiesto, el póster, `manifiesto.mp4` y las 13 máscaras de logo a
`client/public/media/logos/`. Copiar también `prepare-logos.py` junto a las máscaras: sin el
script, añadir un cliente obliga a reconstruir a mano la política de máscara.

### Tests

- Test unitario de contraste sobre los tokens: `--amd-gold-ink` sobre `--amd-mist` **≥ 4.5:1**, y
  `--amd-gold` sobre `--amd-mist` **< 3:1** — el segundo aserto documenta por qué existe el primero.
- Aserto de que `#8a7a2e` no aparece hardcodeado en ningún CSS de componente.

- **Verification:** `cd client && npm run test:agent && npm run build`
- **Falsable con:** cambiar `--amd-gold-ink` a `#cfbb66` → el test de contraste debe FALLAR. Si no
  falla, el test no está midiendo el token sino un literal.
- **Evidence disqualifier:** que el build pase **no** prueba que los assets se sirvan; sólo que
  compilan. La ruta real se verifica en T012.

### Done when

- [ ] `--amd-gold-ink` declarado junto al resto de tokens de marca
- [ ] `client/public/media/` con 8 imágenes, 1 video y `logos/` con 13 máscaras + el script
- [ ] Test de contraste en verde y falsable
- [ ] `npm run build` sin exceder los budgets de `angular.json`

---

## T002 — `probeSectionThemeAt`: extraer el algoritmo de tema a función pura

- **Status:** [x]
- **Depends on:** none
- **Directory boundary:** `client/src/app/core/motion/`
- **Recommended skills:** `angular-developer`
- **Requirements:** REQ-008 (escenario "el chrome se invierte sobre los tramos claros")
- **Design refs:** **DD-030**, §2 "La pieza que casi se pierde"

### Scope

Crear `core/motion/section-theme.ts` con una función **pura** que reciba una lista de secciones
`{ id, top, bottom, isLight }` y una coordenada `y`, y devuelva la sección bajo esa `y` (o `null`).
Es el algoritmo que hoy vive enterrado en `HomeSideNav.updateScrollSpy()` y que T003 va a borrar —
REQ-008 lo necesita para **dos** barras.

**Ninguna lectura del DOM entra en este fichero.** Esa es la razón de ser de la tarea: es lo que
hace la lógica verificable en jsdom.

### Tests

- `y` dentro de una sección → esa sección; en el borde exacto entre dos → la última en orden DOM
  (paridad con `sectionAtY` actual)
- `y` fuera de todas → `null`
- Lista vacía → `null` sin lanzar
- Secciones solapadas → la última, no la primera

- **Verification:** `cd client && npm run test:agent -- --include="src/app/core/motion/section-theme.spec.ts"`
- **Falsable con:** invertir el orden de la iteración (devolver la primera coincidencia en vez de la
  última) → el test de solapamiento debe FALLAR.
- **Evidence disqualifier:** ninguno relevante — es lógica pura y determinista.

### Done when

- [x] Función pura exportada, sin `document` ni `window` en el fichero
- [x] Los 4 casos cubiertos, incluido el borde exacto
- [x] `npm run test:agent -- --include="src/app/core/motion/section-theme.spec.ts"` en verde

---

## T003 — `SectionNav` sustituye a `HomeSideNav`

- **Status:** [ ]
- **Depends on:** T002
- **Directory boundary:** `client/src/app/core/layout/`, `client/src/app/app.{ts,html,spec.ts}`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-008 escenarios "nunca dos índices", "aparece al salir del hero",
  "dice en qué sección estás", "oculto significa no tabulable", "el chrome se invierte"
- **Design refs:** DD-029, DD-030, DD-037, §5.4

### Scope

Crear `core/layout/section-nav/`: barra de secciones visible **desde 900 px**, que aparece al salir
del hero, con las seis anclas. Consume `probeSectionThemeAt` a su propia altura (100 px) mientras
`TopNav` lo consume a la suya (40 px). Publica `aria-current` sobre la sección activa.

Borrar `core/layout/home-side-nav/` completo (ts, html, css, **spec**), su montaje en `app.html`, y
la clase `body.has-side-nav` de `app.ts` — **no la estiliza nadie**, su retirada es inerte.
`App.isHomeRoute()` **sobrevive**: es el único gate Home-vs-deep del shell y ahora monta `SectionNav`.

Actualizar `app.spec.ts` (sus dos tests de `Home-vs-deep shell flag` afirman `.sidenav-host`,
`app-home-side-nav` y `body.has-side-nav`) y `about-page.spec.ts` (su aserto de ausencia del rail
queda vacío: **se reescribe contra `SectionNav` o se borra, no se deja en verde**).

**KZ-002:** la visibilidad por ancho va en media query del CSS del componente. Un selector
`body`/`html` nunca casa bajo la encapsulación de Angular.

### Tests

- `SectionNav` monta en `/` y **no** en `/about-us` ni `/services`
- Oculto dentro del hero: sus enlaces **no** son tabulables — aserto sobre el orden de foco, no
  sobre una clase CSS
- `aria-current` sobre la sección activa y sólo sobre ella; cambia al cambiar la sección activa
- Con secciones simuladas claras y oscuras, `TopNav` y `SectionNav` resuelven tema **por separado**
- **KZ-004:** aserto de ancestría — el host de `SectionNav` contiene realmente los seis enlaces

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet`
- **Falsable con:** ocultar el `SectionNav` con `opacity: 0` en vez de retirarlo del flujo → el test
  de tabulabilidad debe FALLAR. Es exactamente el defecto que tiene el mockup.
- **Evidence disqualifier:** **la suite entera debe compilar**, no sólo pasar los tests nuevos. Al
  borrar `HomeSideNav`, `home-side-nav.spec.ts` deja de resolver su import. Un run que sólo ejecuta
  los tests nuevos no es evidencia.

### Done when

- [ ] `section-nav/` creado con test propio; `home-side-nav/` borrado por completo
- [ ] `body.has-side-nav` fuera de `app.ts`; `isHomeRoute()` intacto
- [ ] `app.spec.ts` y `about-page.spec.ts` reescritos — ningún test conservado en falso verde
- [ ] Un solo índice de secciones a 375/768/900/1200/1600 px (lo mide T012)
- [ ] Suite completa compila y pasa

---

## T004 — Etiquetas de sección, `MobileDrawer` y claves huérfanas

- **Status:** [ ]
- **Depends on:** T003
- **Directory boundary:** `client/src/app/core/layout/mobile-drawer/`, `client/src/assets/i18n/`
- **Recommended skills:** `angular-developer`
- **Requirements:** REQ-008 escenarios "ninguna etiqueta se repite" y "el panel de hamburguesa
  cubre las seis secciones"; REQ-011 (parcial)
- **Design refs:** §3 "Claves que cambian de valor", §5.5

### Scope

`navServices` pasa de `'Servicios'` a `'Líneas'` / `'Lines'`; `navAbout` de `'Sobre AMD'` a
`'Manifiesto'` / `'Manifesto'`. Hoy `navServices` y `navServicesPage` **valen ambas `'Servicios'`**:
el panel de hamburguesa muestra la misma etiqueta dos veces, lo que ya viola REQ-008 en < 900 px.

Añadir `#cifras` al panel (pasa de 7 a 8 enlaces — `mobile-drawer.spec.ts:50` tiene una cuenta
rígida `toBe(7)` que hay que actualizar, no eliminar). Retirar `sideHome` y `sideNavAria` de ambos
diccionarios: mueren con el rail.

### Tests

- Test de **no repetición**: el conjunto de etiquetas de página y el de sección son disjuntos, en
  ES y en EN
- El panel lista las **seis** anclas de la Home, `#cifras` incluida
- Paridad de claves ES/EN (el test existente debe seguir en verde tras añadir y quitar claves)
- Ninguna clave retirada queda referenciada en plantilla ni en código

- **Verification:** `cd client && npm run test:agent`
- **Falsable con:** devolver `navServices` a `'Servicios'` → el test de no-repetición debe FALLAR.
  Si pasa, sólo está comparando claves y no valores.
- **Evidence disqualifier:** el test de paridad ES/EN **no** detecta claves huérfanas (sólo compara
  los dos conjuntos entre sí). La huerfanía necesita su propio aserto.

### Done when

- [ ] Etiquetas de sección y de página disjuntas en los dos idiomas
- [ ] Ocho enlaces en el panel; cuenta del spec actualizada
- [ ] `sideHome` y `sideNavAria` fuera de ambos diccionarios y sin referencias

---

## T005 — `LedgerSection`: datos, plantilla y acordeón

- **Status:** [ ]
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/ledger/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-002 escenarios "anatomía de una fila", "acordeón exclusivo", "contador de
  escala"; REQ-003 escenario "Más info sigue llevando al capítulo correcto"
- **Design refs:** DD-035, §5.1

### Scope

Crear `features/home/ledger/` con las cinco filas derivadas de `SERVICE_GROUPS`, importado desde
`features/services/services-page` — **la dirección de import que ya existe**, para que los ids y el
contador no puedan derivar entre la Home y `/services`.

El contador sale de `subs.length` (hoy 16/4/4/4/3 = 31, idéntico al mockup). Acordeón exclusivo por
`signal`. Activación por `(click)` y `(keydown)` Enter/Espacio con el guard de `closest('a')` para
que "Más info" navegue sin alternar. Raíz `<section id="servicios" class="… section--light">`.

**No se monta todavía** — el cambio de `HomePage` es T007.

### Tests

Los tres primeros son **gates declarados de requisitos archivados y cerrados** (spec de `/services`,
DC-4) que hoy viven en `services-road-section.spec.ts` y que T007 borra. Reimplantarlos aquí:

- Los cinco `SERVICE_GROUP_IDS` aparecen como filas — guardián anti-drift Home ↔ `/services`
- Los cinco `href="/services#<id>"` con el fragmento correcto
- Activar "Más info" **no** alterna el acordeón
- Acordeón exclusivo: abrir 03 cierra 01; `aria-expanded` verdadero en exactamente una fila
- Reactivar la fila abierta la cierra (estado "ninguna abierta")
- El contador de Contabilidad es 16 **derivado**, no literal
- La Home **no** vuelca el catálogo de sub-servicios (guard contra `subC01t`)

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/ledger/**/*.spec.ts"`
- **Falsable con:** añadir un sexto id a `SERVICE_GROUPS` → el test de los cinco ids debe FALLAR.
  Y sustituir el contador por el literal `16` → el test de derivación debe FALLAR.
- **Evidence disqualifier:** un aserto de que la clase `.line__count` existe **no** prueba que el
  número sea correcto. El aserto debe leer el texto renderizado.

### Done when

- [ ] Cinco filas derivadas de `SERVICE_GROUPS`, sin catálogo duplicado
- [ ] Los tres gates archivados reimplantados y verdes
- [ ] Acordeón exclusivo con `aria-expanded` sincronizado en las cinco filas
- [ ] Contador derivado, leído del DOM renderizado

---

## T006 — `LedgerSection`: CSS, revelado de imagen, spine y colapsado inerte

- **Status:** [ ]
- **Depends on:** T005
- **Directory boundary:** `client/src/app/features/home/ledger/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-002 escenarios "revelado de imagen" y "una fila cerrada no es tabulable por
  dentro"; REQ-010 escenario "recorrido completo por teclado"; REQ-012
- **Design refs:** DD-036, DD-040, §5.1 "Tres invariantes de CSS"

### Scope

Portar el CSS del ledger desde `mockup/home-redesign.css` + `home-redesign-claro.css`. Spine con
`onPassiveScroll` (el helper ya existe y lo comparte `hero-section`), al 100 % fijo bajo
reduced-motion. Marcar el detalle colapsado como **`inert`**.

**Las tres invariantes de `design.md` §5.1 son obligatorias**, no cosméticas: `overflow: hidden` en
el contenedor de la foto, la foto termina en el borde del contenido, y `height: auto` para que
`aspect-ratio` no se ignore.

### Tests

- El detalle de una fila cerrada está `inert`; deja de estarlo al abrirse
- El "Más info" de una fila cerrada **no** es alcanzable por Tab
- Bajo reduced-motion el spine no sigue el scroll
- Sin `IntersectionObserver`, todo el contenido queda visible (paridad con el guard que hoy tiene
  `ServicesRoadSection`)

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/ledger/**/*.spec.ts" && npm run build`
- **Falsable con:** quitar `inert` del detalle colapsado → el test de tabulabilidad debe FALLAR.
- **Evidence disqualifier:** **jsdom no puede probar el revelado de imagen ni el recorte**: no
  compone `transform` ni mide cajas. Que el CSS esté presente no prueba que la foto no se desborde.
  Esa clase la mide **T012** y la revisa el HITL. No reportar el revelado como cubierto aquí.

### Done when

- [ ] CSS portado; el componente bajo el `maximumError` de 32 kB de `anyComponentStyle`
- [ ] Colapsado inerte, verificado por orden de foco
- [ ] Spine estático bajo reduced-motion
- [ ] Declarado explícitamente en `execution.md` qué queda pendiente de T012

---

## T007 — Cortar: montar el ledger y retirar `ServicesRoadSection`

- **Status:** [ ]
- **Depends on:** T006
- **Directory boundary:** `client/src/app/features/home/`
- **Recommended skills:** `angular-developer`
- **Requirements:** REQ-003 (regresión completa), REQ-002
- **Design refs:** §9 reversión 3

### Scope

Cambiar `home-page.html` para montar `LedgerSection` en lugar de `ServicesRoadSection`. Borrar
`features/home/services-road/` completo, incluido su `.spec.ts` (~30 tests) y el export
`ROAD_DECO_FACTORS`. Retirar `roadHint` de los diccionarios.

**No tocar `g*Title`** — las comparte `SERVICE_GROUPS` con `/services` y borrarlas rompe esa página
y sus tests de contenido. `g*Sum` y `g*Body` **se conservan**: el ledger las reutiliza.

Actualizar la lista de anclas de `home-page.spec.ts`, a la que le falta `cifras`.

### Tests

- La Home monta el ledger y **no** monta el camino
- Las seis anclas existen con sus ids
- `onPassiveScroll` sigue teniendo consumidor (`hero-section`) y su spec sigue verde

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet`
- **Falsable con:** dejar `ROAD_DECO_FACTORS` importado en cualquier sitio → la compilación debe
  FALLAR.
- **Evidence disqualifier:** **la suite completa debe compilar y ejecutarse.** Borrar un componente
  rompe los imports de su spec; un run parcial no es evidencia de nada.

### Done when

- [ ] `services-road/` borrado por completo; ningún import huérfano
- [ ] Suite completa verde; ningún test conservado sin sujeto
- [ ] `roadHint` fuera; `g*Title`, `g*Sum` y `g*Body` intactas
- [ ] Aviso de `anyComponentStyle` que causaba `services-road-section.css` cerrado

---

## T008 — `AboutTeaserSection` → Manifiesto claro

- **Status:** [ ]
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/about-teaser/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-004, REQ-001 (tono de la sección)
- **Design refs:** DD-028, DD-041, §5.5

### Scope

La sección pasa de `--amd-ink` a claro y recibe la imagen junto al párrafo. **Debe recibir el
marcador `.section--light`**: sin él, la inversión del chrome falla en silencio justo en la sección
que cambia de tono. Se conserva el CTA a `/about-us`.

El alto de la imagen deriva del texto (`align-self: stretch` + `height: 100%`). Devolverle un
`aspect-ratio` la vuelve a imponer sobre el layout.

### Tests

- La sección lleva `.section--light`
- El CTA a `/about-us` sigue presente con su `routerLink`

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/about-teaser/**/*.spec.ts"`
- **Falsable con:** quitar `.section--light` → el test debe FALLAR (y con él, la inversión del nav
  en T012).
- **Evidence disqualifier:** que la clase esté **no** prueba que el fondo sea claro ni que la imagen
  no se desproporcione. Ambas las mide T012.

### Done when

- [ ] Sección clara con `.section--light`
- [ ] Imagen con alto derivado del texto, sin `aspect-ratio`
- [ ] CTA a `/about-us` intacto

---

## T009 — `FiguresBand` (`#cifras`)

- **Status:** [ ]
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/figures/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-005, REQ-003 (ancla `#cifras`), REQ-013
- **Design refs:** DD-039, §5.2

### Scope

Sección nueva full-bleed: `<video autoplay muted loop playsinline poster>`, scrim, eyebrow, frase y
tres métricas con conteo animado. **Sin `.section--light`** — es oscura. Montar en `home-page.html`
entre Manifiesto y Confianza.

### Tests

- El `<video>` lleva `muted`, `loop`, `playsinline` y `poster`, y **no** lleva `controls`
- Bajo reduced-motion el video no se reproduce y las métricas muestran el valor final
- La sección tiene `id="cifras"` y **no** lleva `.section--light`

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/figures/**/*.spec.ts" && npm run build`
- **Falsable con:** añadir `controls` al `<video>` → el test debe FALLAR.
- **Evidence disqualifier:** jsdom **no reproduce video**. Que el elemento tenga los atributos no
  prueba que el póster se pinte antes ni que el scrim dé contraste. T012 y HITL.

### Done when

- [ ] Banda montada con el ancla `#cifras`
- [ ] Rama de reduced-motion probada
- [ ] `npm run build` sin el video en el bundle inicial

---

## T010 — `ClientWall`: carrusel infinito de logos

- **Status:** [ ]
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/clients/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-007 (los cinco escenarios)
- **Design refs:** DD-032, DD-033, §5.3

### Scope

Componente nuevo con `client-logos.data.ts` (13 entradas: slug, razón social, w, h ópticos). Cada
logo es un `<span>` con `mask-image` y `background: currentColor`. La cinta duplica el conjunto
**exactamente una vez**; la copia va `aria-hidden="true"` y **sin** `role="img"`.

**Sin `gap`: el aire va como `margin-inline`.** Con `gap`, desplazar el 50 % queda desfasado medio
hueco y el bucle salta. La duración se calcula desde el ancho medido a velocidad fija (~42 px/s).
Pausa en `:hover` y `:focus-within`. Bajo reduced-motion, retícula estática con los 13 visibles.
Fallback con `@supports` para navegadores sin `mask-image`: el nombre en texto.

### Tests

- 26 elementos en la cinta; exactamente 13 con `aria-hidden="true"`; **cero** `role="img"` en la copia
- Los 13 originales tienen nombre accesible con la razón social
- Bajo reduced-motion la animación es `none` y los 13 originales son visibles
- Función pura de duración: `duracion(anchoMitad, pxPorSegundo)` con sus casos

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/clients/**/*.spec.ts"`
- **Falsable con:** duplicar el conjunto dos veces en vez de una → el test de 26 debe FALLAR.
  Quitar `aria-hidden` de la copia → el test de 13 debe FALLAR.
- **Evidence disqualifier:** **jsdom no compone `mask-image` ni mide la cinta.** La costura del
  bucle y la velocidad constante son de T012. Un test verde aquí **no** prueba que el carrusel se
  vea ni que no salte.

### Done when

- [ ] 13 máscaras renderizadas, copia duplicada oculta a asistencia técnica
- [ ] Duración derivada de medición, no literal en CSS
- [ ] Retícula estática bajo reduced-motion, con los 13 visibles
- [ ] Fallback `@supports` declarado

---

## T011 — `TrustSection`: sin auto-rotación, puntos como control primario

- **Status:** [ ]
- **Depends on:** T010
- **Directory boundary:** `client/src/app/features/home/trust/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-006 (los tres escenarios), REQ-011
- **Design refs:** DD-034, §5.5, §9 reversión 2

### Scope

Retirar `setInterval` y el export `TESTIMONIAL_PAUSE_MS`. **Conservar los cuatro testimonios** —
producción sirve `q1…q4`; los tres puntos del mockup eran ilustración. Elevar los puntos a control
primario: nombre accesible **traducido** (hoy `testimonialLabel()` devuelve `'Testimonio N'` en
español fijo, que incumple REQ-011), estado programático, 44×44 px conservados (**KZ-001**: no tocar
geometría de control aprobada salvo que la tarea lo nombre — aquí la nombra: se conserva).

Montar `ClientWall`. La sección pasa a blanco y conserva `.section--light`. Reescribir `trustLead`:
su segunda mitad —"testimonios con pausa larga para leer"— queda falsa.

### Tests

- **Regresión de la reversión:** avanzar 15 s con timers falsos → el testimonio activo **no** cambia
- Los cuatro testimonios y los cuatro puntos siguen presentes
- Cada punto tiene nombre accesible traducido y estado programático
- **KZ-004:** aserto de ancestría — `TrustSection` contiene realmente el host de `ClientWall`
- El test de reduced-motion que quedaría **vacío** al no haber temporizador **se borra**, no se
  conserva en verde

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/trust/**/*.spec.ts"`
- **Falsable con:** reintroducir cualquier `setInterval` que cambie el testimonio → el test de 15 s
  debe FALLAR.
- **Evidence disqualifier:** `trust-section.spec.ts` importa `TESTIMONIAL_PAUSE_MS`: al retirar el
  export **el fichero deja de compilar**. Un run que no incluya este spec no es evidencia.

### Done when

- [ ] Sin temporizador; regresión de 15 s en verde
- [ ] Cuatro testimonios conservados; `q4`/`q4By` intactas
- [ ] Nombre accesible de los puntos traducido en ES y EN
- [ ] `ClientWall` montado con aserto de ancestría
- [ ] `trustLead` reescrito; ningún test conservado sin sujeto

---

## T012 — Gate de medición en navegador

- **Status:** [ ]
- **Depends on:** T007, T009, T011
- **Directory boundary:** `client/` (devDependency + script)
- **Recommended skills:** `angular-developer`
- **Requirements:** REQ-001 (los dos escenarios), REQ-007 escenarios "el bucle no salta" y
  "velocidad constante", REQ-008 "nunca dos índices", REQ-012, y el efecto real de REQ-002
  "revelado de imagen", REQ-005 y REQ-009
- **Design refs:** **DD-038**, §11 Test plan hooks

### Scope

Añadir Playwright como devDependency (**ya contemplado por el TRD §12** para fase 1 tardía) y un
script `verify:visual` que levante la app y **reporte números**, no capturas. Es el gate de las
cuatro clases de defecto que jsdom no puede ver.

### Mediciones

| Qué | Umbral |
|---|---|
| Proporción de tinta a 1440 px | 35–45 % |
| Primer tramo claro | ≤ 1.2 alturas de viewport |
| Scroll horizontal a 375/768/900/1200/1600/1920 | ninguno |
| Índices de sección visibles por ancho | exactamente 1 |
| Costura del carrusel | \|desfase\| ≤ 0.5 px |
| Velocidad del carrusel entre anchos | ±10 % |
| Pausa del carrusel en hover | `paused`, y `running` al salir |
| Foto del ledger dentro de su contenedor durante la transición | sin desbordamiento |

- **Verification:** `cd client && npm run verify:visual`
- **Falsable con:** poner el ledger en `--amd-ink` → la proporción de tinta debe salir fuera de
  banda y el gate FALLAR. Sustituir `margin-inline` por `gap` en la cinta → la costura debe salir
  de tolerancia.
- **Evidence disqualifier (el más importante del spec):** forzar `scroll-behavior: auto`, esperar
  `document.fonts.ready` y **repetir cada lectura**. Si dos lecturas consecutivas difieren más que
  el efecto medido, el resultado es **INCONCLUSO** y se reporta como tal — nunca PASS por código de
  salida 0. Una captura JPEG **no es evidencia** para estas clases: durante el mockup inventaron una
  costura que la medición de píxeles demostró inexistente.

### Done when

- [ ] `verify:visual` reporta las ocho mediciones con su número
- [ ] Las ocho dentro de umbral, o reportadas como INCONCLUSO con su dispersión
- [ ] Playwright sólo como devDependency; el bundle no cambia

---

## T013 — Sincronizar `docs/ux-ui/design.md`

- **Status:** [ ]
- **Depends on:** T003, T007, T011
- **Directory boundary:** `docs/ux-ui/`
- **Recommended skills:** `cognitive-doc-design`
- **Requirements:** REQ-014
- **Design refs:** DD-028, DD-029, DD-031

### Scope

La baseline sigue describiendo lo que este spec elimina. Editar:

| Sección | Qué dice hoy | Qué debe decir |
|---|---|---|
| §2 IA | "Left dot sidenav (§5), `≥1100px`" | Sub-header de secciones desde 900 px |
| §5 Navigation Model | Tabla del "Sidenav flotante ≥1100px" y su regla de contraste | `SectionNav` desde 900 px, con `aria-current` |
| §7 Tokens | Sin `--amd-gold-ink` | Token declarado, con la regla: el dorado de marca no es texto sobre claro |
| §11 Dark Mode | "tema principal dark premium con secciones light intercaladas" | Ritmo claro dominante; el oscuro es puntuación |

### Tests

Sin test automatizado — es documentación. La verificación es un **barrido de cierre**: ninguna
referencia al rail lateral sobrevive en la baseline.

- **Verification:** `grep -rn "sidenav\|1100px\|dot sidenav" docs/ux-ui/design.md` → sin resultados,
  y `grep -n "amd-gold-ink" docs/ux-ui/design.md` → con resultado
- **Falsable con:** dejar cualquiera de las tres menciones de §2/§5 → el primer grep devuelve línea
  y el gate FALLA.
- **Evidence disqualifier:** un grep sin resultados prueba **ausencia del término**, no que la
  sección nueva sea correcta. Lo segundo lo lee una persona.

### Done when

- [ ] §2, §5, §7 y §11 reescritas
- [ ] Barrido de cierre sin menciones supervivientes al rail
- [ ] `--amd-gold-ink` documentado con su regla de uso

---

## Grafo de dependencias

```text
T001 ─┬─ T005 ── T006 ── T007 ──┐
      ├─ T008 ──────────────────┤
      ├─ T009 ──────────────────┼── T012
      └─ T010 ── T011 ──────────┘        │
T002 ── T003 ── T004                     │
        └────────────────────────────────┴── T013
```

Sin ciclos. **Paralelizables** (dominios disjuntos, techo de 2 workers): `T002/T003/T004` corre en
paralelo a `T005…T007`; `T008`, `T009` y `T010` son independientes entre sí.

**T012 va al final a propósito:** mide la página ensamblada. Correrlo antes daría números de una
página a medias — exactamente el tipo de lectura que su propio descalificador prohíbe comprometer.

---

## Cierre de cobertura

Cada **escenario** —no cada REQ— tiene tarea dueña. Un requisito "aparece en una tarea" es la
afirmación más débil posible.

| REQ | Escenario / cláusula | Tarea |
|---|---|---|
| REQ-001 | Proporción de tinta | T012 |
| REQ-001 | Corte a filo | T006, T012 |
| REQ-002 | Anatomía de una fila | T005 |
| REQ-002 | Acordeón exclusivo | T005 |
| REQ-002 | Revelado de imagen | T006 (CSS) + **T012** (efecto) |
| REQ-002 | Fila cerrada no tabulable | T006 |
| REQ-002 | Contador de escala | T005 |
| REQ-002 | *BUT NOT* listar sub-servicios | T005 |
| REQ-003 | "Más info" → `/services#<id>` | T005 |
| REQ-003 | Las anclas de la Home siguen existiendo (+ `#cifras`) | T007, T009 |
| REQ-004 | Imagen no impone layout | T008 |
| REQ-005 | Video es fondo | T009 |
| REQ-005 | Reduced-motion y 3G | T009 |
| REQ-006 | Testimonio no rota solo | T011 |
| REQ-006 | Los puntos dejan de ser decoración | T011 |
| REQ-006 | Sin fotos de personas | T011 |
| REQ-007 | Bucle no salta | T010 (estructura) + **T012** (costura) |
| REQ-007 | Se puede señalar (pausa) | T010, T012 |
| REQ-007 | 13 nombres, no 26 | T010 |
| REQ-007 | Reduced-motion retícula | T010 |
| REQ-007 | Velocidad constante | T010 (función pura) + **T012** (real) |
| REQ-008 | Nunca dos índices | T003 + T012 |
| REQ-008 | Aparece al salir del hero | T003 |
| REQ-008 | Ninguna etiqueta se repite entre los dos menús | T004 |
| REQ-008 | El sub-header dice en qué sección estás (`aria-current`) | T003 |
| REQ-008 | Oculto significa no tabulable | T003 |
| REQ-008 | El panel de hamburguesa cubre las seis secciones | T004 |
| REQ-008 | Chrome invierte en su posición | T002 (lógica) + T003 (dos barras) |
| REQ-009 | Acento legible sobre papel | T001 (tokens) + T012 (renderizado) |
| REQ-009 | Token en la fuente de verdad | T001, T013 |
| REQ-010 | Recorrido por teclado | T003, T006 |
| REQ-010 | Reduced-motion apaga todo | T006, T009, T010 |
| REQ-011 | Ninguna clave huérfana | T004 |
| REQ-011 | *AND* literales en **código** | T011 (`testimonialLabel`) |
| REQ-012 | Sin scroll horizontal | T012 |
| REQ-013 | El video no entra en el camino crítico | T001, T009 |
| REQ-014 | Ningún documento describe lo que ya no existe | T013 |

**Sin huérfanos.** Ninguna laguna se salda citando un requisito distinto del que la tiene. Las
etiquetas de esta tabla **citan el nombre del escenario** en `requirements.md`, no lo parafrasean,
para que el cierre se pueda auditar comparando las dos listas y no leyendo con buena voluntad.
