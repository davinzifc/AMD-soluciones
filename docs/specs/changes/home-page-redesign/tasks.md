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

## T001 — Tokens de dorado sobre claro y assets de medios

- **Status:** [x] — cerrada en el intento 3 tras la Pivot T001 (HITL: opción A, dos tokens).
- **Depends on:** none
- **Directory boundary:** `client/src/styles/`, `client/public/media/`
- **Recommended skills:** `ui-ux-pro-max`
- **Requirements:** REQ-009 (escenario "el token se declara en la fuente de verdad"), REQ-013 (parcial)
- **Design refs:** DD-031, DD-032, DD-039, §3 Data Model

### Scope

Declarar **dos** tokens en `client/src/styles/tokens.css`, junto al resto de los de marca:

    --amd-gold-ink: #8a7a2e;       /* 3.86:1 sobre mist — relleno y texto GRANDE sobre claro */
    --amd-gold-ink-deep: #6f6224;  /* 5.49:1 sobre mist — texto NORMAL sobre claro */

Ninguno es un color nuevo: `#8a7a2e` ya estaba suelto en `.eyebrow--ink` del mockup y `#6f6224` en
`home-redesign.css:187` y `:273`. La regla de reparto y el cuadro de qué uso lleva cuál están en
`requirements.md` → REQ-009, escenario "acento legible sobre papel". Copiar desde
`docs/specs/changes/home-page-redesign/mockup/assets/` a `client/public/media/`: las 5 fotos de
línea, la foto del manifiesto, el póster, `manifiesto.mp4` y las 13 máscaras de logo a
`client/public/media/logos/`. Copiar también `prepare-logos.py` junto a las máscaras: sin el
script, añadir un cliente obliga a reconstruir a mano la política de máscara.

### Tests

Test unitario de contraste, leyendo los valores **parseados desde `tokens.css`**, nunca de
literales copiados en el test. Los tres asertos, con su razón de ser:

| Par | Umbral | Mide | Por qué está |
|---|---|---|---|
| `--amd-gold-ink-deep` / `--amd-mist` | **≥ 4.5:1** | 5.49:1 | Es el token de texto normal: si no pasa 4.5:1 no sirve para nada |
| `--amd-gold-ink` / `--amd-mist` | **≥ 3:1** y **< 4.5:1** | 3.86:1 | La cota superior es la que importa: **pinea que este token NO vale para texto normal**. Sin ella, alguien lo sube algún día y el reparto de REQ-009 se disuelve sin que falle nada |
| `--amd-gold` / `--amd-mist` | **< 3:1** | 1.73:1 | Reprueba incluso el nivel de texto grande. Documenta por qué existen los otros dos |

- Aserto de que **ni `#8a7a2e` ni `#6f6224`** aparecen hardcodeados en ningún CSS de componente.
- **KZ-nuevo (advisory del Reviewer, aplicado):** la cabecera del fichero de test no puede afirmar
  un umbral distinto del que asevera el código. En el intento 1 decía `>= 3.5:1` con un aserto de
  `>= 3.0`; ese `3.5` no salía de ninguna fuente del spec.

- **Verification:** `cd client && npm run test:agent && npm run build`
- **Falsable con:** cambiar `--amd-gold-ink-deep` a `#8a7a2e` → el aserto de ≥ 4.5:1 debe FALLAR
  (3.86 < 4.5). Y cambiar `--amd-gold-ink` a `#cfbb66` → su aserto de ≥ 3:1 debe FALLAR. Si no
  falla, el test no está midiendo el token sino un literal.
- **Evidence disqualifier:** que el build pase **no** prueba que los assets se sirvan; sólo que
  compilan. La ruta real se verifica en T012.

### Done when

- [x] `--amd-gold-ink` y `--amd-gold-ink-deep` declarados junto al resto de tokens de marca
- [x] `client/public/media/` con 7 imágenes, 1 video y `logos/` con 13 máscaras + el script
- [x] Los tres asertos de contraste en verde y falsables, incluida la **cota superior** de `--amd-gold-ink`
- [x] Cabecera del fichero de test coherente con los umbrales que asevera
- [x] `npm run build` sin exceder los budgets de `angular.json`

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

- **Status:** [x] — cerrada en el intento 3 (i18n real, offset recalculado, fallback eliminado)
- **Depends on:** T002
- **Directory boundary:** `client/src/app/core/layout/`, `client/src/app/app.{ts,html,spec.ts}`,
  **`client/src/assets/i18n/`** y **`client/src/app/app.config.ts`** (ampliado 2026-09-06 por el
  mismo principio que en T005: quien escribe el copy crea sus claves, y quien crea una barra fija
  arregla el offset de anclaje que esa barra invalida. Ojo: T004 también toca los diccionarios —
  las dos tareas se serializan)
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

**i18n del sub-header: claves reales, sin red de seguridad.** Las seis etiquetas y el `aria-label`
van a los **dos** diccionarios con paridad ES/EN. Cuatro claves ya existen (`navServices`,
`navAbout`, `navTrust`, `navContact`); faltan la de Inicio, la de Cifras y la del `aria-label`.

> ⚠ **Prohibido el patrón `translated !== key ? translated : '<literal español>'`.** Que una clave
> ausente se renderice **como la clave** es la propiedad que hace visible el defecto; un fallback en
> español lo vuelve **indetectable para siempre**, porque la clave cruda nunca llega a pantalla y lo
> que ve un visitante EN es texto en español. Es el mismo defecto que REQ-011 ya señala en
> `testimonialLabel()`. Tampoco se declaran esas claves en el `fakeLocaleService` de un test
> mientras no existan en los diccionarios: eso deja el test verde afirmando sobre un mundo que no
> existe, y ni el gate de paridad ES/EN ni `i18n-values-gate` pueden verlo.

**El offset de anclaje deja de servir en cuanto existe el sub-header.** `app.config.ts` fija
`ViewportScroller.setOffset()` en `72 + 1.5rem = 96px`, pero el sub-header ocupa de 68 a **112 px**:
toda sección enlazada aterriza 16 px **por debajo** de la barra. Y no es hipotético para los enlaces
del propio `SectionNav`, que sólo se pueden activar cuando la barra ya está visible. Recalcular el
offset contando el sub-header cuando corresponda, y **re-basar el `1099` al breakpoint de 900 px**:
ese 1099 era el umbral del rail que DD-029 acaba de retirar.

### Tests

- `SectionNav` monta en `/` y **no** en `/about-us` ni `/services`
- Oculto dentro del hero: sus enlaces **no** son tabulables — aserto sobre el orden de foco, no
  sobre una clase CSS
- `aria-current` sobre la sección activa y sólo sobre ella; cambia al cambiar la sección activa
- Con secciones simuladas claras y oscuras, `TopNav` y `SectionNav` resuelven tema **por separado**
- **KZ-004:** aserto de ancestría — el host de `SectionNav` contiene realmente los seis enlaces
- **REQ-011:** toda clave que use el sub-header existe en `es.json` **y** `en.json`. Ningún literal
  de copy en el código ni fallback en español.
- El sub-header **vuelve a ocultarse** al reentrar en el hero (la mitad no probada del escenario
  "aparece al salir del hero")
- Scroll-spy en la **última** sección (`contacto`), que es donde el bucle "última coincidencia gana"
  se comporta distinto

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet`
- **Falsable con:** ocultar el `SectionNav` con `opacity: 0` en vez de retirarlo del flujo → el test
  de tabulabilidad debe FALLAR. Es exactamente el defecto que tiene el mockup.
- **Evidence disqualifier:** **la suite entera debe compilar**, no sólo pasar los tests nuevos. Al
  borrar `HomeSideNav`, `home-side-nav.spec.ts` deja de resolver su import. Un run que sólo ejecuta
  los tests nuevos no es evidencia.

### Done when

- [x] Claves del sub-header en ES y EN, sin fallback en español
- [x] Offset de anclaje recalculado con el sub-header, y el `1099` re-basado a 900

- [x] `section-nav/` creado con test propio; `home-side-nav/` borrado por completo
- [x] `body.has-side-nav` fuera de `app.ts`; `isHomeRoute()` intacto
- [x] `app.spec.ts` y `about-page.spec.ts` reescritos — ningún test conservado en falso verde
- [x] Un solo índice de secciones a 375/768/900/1200/1600 px (lo mide T012)
- [x] Suite completa compila y pasa

---

## T004 — Etiquetas de sección, `MobileDrawer` y claves huérfanas

- **Status:** [x] PASS (2 rondas · 2026-09-06)
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

> ⚠ **Segunda colisión, sólo en EN — descubierta al cerrar T003 (2026-09-06).** T003 creó
> `navSectionInicio`, heredando su valor de `sideHome`. Resultado en los diccionarios de hoy:
>
> | Menú de páginas | Índice de secciones | ES | EN |
> |---|---|---|---|
> | `navHome` = "Home" | `navSectionInicio` = "Inicio" / **"Home"** | limpio | **choca** |
> | `navServicesPage` = "Services" | `navServices` = "Services" | choca | **choca** |
>
> La segunda la arregla el renombrado de arriba. **La primera no la cubre nadie**, y sin ella el
> test de no-repetición de esta tarea **no puede pasar en EN** — el propio test que la tarea exige
> escribir. Dale a `navSectionInicio` un valor EN distinto de "Home" (p. ej. "Top" o "Start"); el ES
> ya está bien. Es un caso ejemplar de por qué el test de no-repetición debe comparar **valores**,
> no claves: con claves distintas y valores iguales, un test de claves pasa y el usuario ve dos
> "Home" en el mismo menú.

> ⚠ **Corrección de cuenta (HITL 2026-09-06).** Este párrafo decía «pasa de 7 a 8 enlaces»,
> contando sólo el alta de `#cifras`. La cuenta era **incorrecta**: REQ-008 (`requirements.md:407`)
> exige que el panel incluya **las SEIS anclas** de la Home, y el panel de hoy sólo lleva cuatro
> (`#servicios`, `#sobre-amd`, `#confianza`, `#contacto`) — le faltan **dos**, `#cifras` y
> **`#inicio`**. El drawer es el sustituto del sub-header por debajo de 900 px (DD-029: «un solo
> índice de secciones por ancho»), así que debe cargar el mismo índice de seis que `SECTION_NAV_ANCHORS`.
> **La cuenta correcta es 9** = 3 enlaces de página + 6 anclas de sección.

Añadir `#inicio` y `#cifras` al panel, en el orden de scroll de `SECTION_NAV_ANCHORS`
(`inicio · servicios · sobre-amd · cifras · confianza · contacto`), de modo que el panel pase de
**7 a 9 enlaces** — `mobile-drawer.spec.ts:50` tiene una cuenta rígida `toBe(7)` que hay que
**actualizar a `toBe(9)`, no eliminar**. Retirar `sideHome` y `sideNavAria` de ambos diccionarios:
mueren con el rail.

`#cifras` **todavía no existe** en el DOM — lo crea T009. El enlace se añade igualmente: esta tarea
entrega el índice completo y T009 aterriza su destino. No es un defecto de esta tarea.

### Tests

- Test de **no repetición**: el conjunto de etiquetas de página y el de sección son disjuntos, en
  ES y en EN. **Compara valores traducidos, nunca nombres de clave** — ver el aviso del Scope: hoy
  hay dos pares con clave distinta y valor idéntico.
- El panel lista las **seis** anclas de la Home, `#inicio` y `#cifras` incluidas — nueve enlaces en total
- Paridad de claves ES/EN (el test existente debe seguir en verde tras añadir y quitar claves)
- Ninguna clave retirada queda referenciada en plantilla ni en código

- **Verification:** `cd client && npm run test:agent`
- **Falsable con:** devolver `navServices` a `'Servicios'` → el test de no-repetición debe FALLAR.
  Si pasa, sólo está comparando claves y no valores. **Segunda mutación, obligatoria:** devolver
  `navSectionInicio` en `en.json` a `"Home"` → el test debe FALLAR **en la comprobación del inglés**.
  Si sólo falla en español, el test no está barriendo los dos idiomas.
- **Evidence disqualifier:** el test de paridad ES/EN **no** detecta claves huérfanas (sólo compara
  los dos conjuntos entre sí). La huerfanía necesita su propio aserto.

### Done when

- [x] Etiquetas de sección y de página disjuntas en los dos idiomas, **verificado por valor**
- [x] `navSectionInicio` con un valor EN distinto de "Home" — `"Top"`
- [x] **Nueve** enlaces en el panel (3 de página + 6 de sección); `toBe(7)` → `toBe(9)`, más aserto de identidad y orden de los seis fragments
- [x] `sideHome` y `sideNavAria` fuera de ambos diccionarios y sin referencias

---

## T005 — `LedgerSection`: datos, plantilla y acordeón

- **Status:** [x] — cerrada en el intento 3 (falsabilidad de los tests de copy y de emparejamiento)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/ledger/` **y `client/src/assets/i18n/`**
  (ampliado 2026-09-06: la plantilla del ledger estrena copy, y las claves las tiene que crear quien
  escribe la plantilla. Dejárselas a T004 abre una ventana en la que el ledger renderiza español en
  duro y nada falla). **Ojo: T004 también edita los diccionarios — las dos tareas se serializan.**
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-002 escenarios "anatomía de una fila", "acordeón exclusivo", "contador de
  escala"; REQ-003 escenario "Más info sigue llevando al capítulo correcto"; **REQ-011** (copy
  traducido, sin literales en plantilla)
- **Design refs:** DD-035, §5.1

### Scope

Crear `features/home/ledger/` con las cinco filas derivadas de `SERVICE_GROUPS`, importado desde
`features/services/services-page` — **la dirección de import que ya existe**, para que los ids y el
contador no puedan derivar entre la Home y `/services`.

El contador sale de `subs.length` (hoy 16/4/4/4/3 = 31, idéntico al mockup). Acordeón exclusivo por
`signal`. Activación por `(click)` y `(keydown)` Enter/Espacio con el guard de `closest('a')` para
que "Más info" navegue sin alternar. Raíz `<section id="servicios" class="… section--light">`.

**No se monta todavía** — el cambio de `HomePage` es T007.

**Copy del ledger: claves nuevas, cero literales.** El encabezado, el CTA agregado y el sustantivo
del contador son copy nuevo y van a los **dos** diccionarios con paridad ES/EN. En particular:

- El CTA agregado ("Ver los 31 servicios") **no puede llevar el 31 en duro**: es exactamente el
  literal que DD-035 existe para evitar. Se deriva con `SERVICE_GROUPS.reduce(…)` y se interpola en
  la clave, como ya hace `svcShowMore` con su marcador. `ServicesPage` ya deriva ese total
  (`services-page.ts:58`, `totalServices`) — misma fuente, mismo número.
- El sustantivo del contador va traducido: con `servicios` en duro, la versión EN renderiza
  "16 servicios".
- **`roadHint` NO se reutiliza.** Su texto habla de *nodos* del camino que este spec borra, y T007
  tiene en su Done-when "`roadHint` fuera": si el ledger depende de esa clave, T007 no puede cumplir
  su tarea sin dejar el ledger mudo, y nada falla al hacerlo. Crear `ledgerHint` con el copy del
  mockup (`mockup/index.html:252`).

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
- **REQ-011:** ningún literal de copy en la plantilla. Aserto sobre el texto de
  `ledger-section.html`: no aparece ninguna palabra en español fuera de un `| localize`.
- **El total del CTA es derivado**, no literal: cambiar `subs` de cualquier grupo debe cambiarlo
- `roadHint` **no** aparece en la plantilla del ledger
- Paridad ES/EN de las claves nuevas (la cubre `i18n-key-parity.spec.ts`, que ya existe)

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/ledger/**/*.spec.ts"`
- **Falsable con:** añadir un sexto id a `SERVICE_GROUPS` → el test de los cinco ids debe FALLAR.
  Y sustituir el contador por el literal `16` → el test de derivación debe FALLAR.
- **Evidence disqualifier:** un aserto de que la clase `.line__count` existe **no** prueba que el
  número sea correcto. El aserto debe leer el texto renderizado.

### Done when

- [x] Cinco filas derivadas de `SERVICE_GROUPS`, sin catálogo duplicado
- [x] Cero literales de copy en la plantilla; claves nuevas en ES y EN con paridad
- [x] Total del CTA derivado, no el literal `31`
- [x] `ledgerHint` propia; el ledger no depende de `roadHint`
- [x] Los tres gates archivados reimplantados y verdes
- [x] Acordeón exclusivo con `aria-expanded` sincronizado en las cinco filas
- [x] Contador derivado, leído del DOM renderizado

---

## T006 — `LedgerSection`: CSS, revelado de imagen, spine y colapsado inerte

- **Status:** [x] PASS (2 rondas · 2026-09-06)
- **Depends on:** T005
- **Directory boundary:** `client/src/app/features/home/ledger/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-002 escenarios "revelado de imagen" y "una fila cerrada no es tabulable por
  dentro"; REQ-010 escenario "recorrido completo por teclado"; REQ-012; **REQ-009 escenario "acento
  legible sobre papel"** (añadido en la Pivot T001 — esta es la tarea que *aplica* el reparto)
- **Design refs:** DD-036, DD-040, **DD-031**, §5.1 "Tres invariantes de CSS"

### Scope

Portar el CSS del ledger desde `mockup/home-redesign.css` + `home-redesign-claro.css`.

> ⚠ **El port NO puede ser literal en el color del acento (Pivot T001).** El mockup pinta los cuatro
> usos con `var(--amd-gold-ink)` (`home-redesign-claro.css:108, 110, 115, 147`), y eso **incumple
> REQ-009**: `#8a7a2e` da 3.86:1, que sólo basta para texto grande, y tres de esos cuatro usos son
> texto pequeño. El reparto correcto está en `requirements.md` → REQ-009, cuadro "El reparto medido":
>
> | Uso del mockup | Token que va en `client/` |
> |---|---|
> | `.ledger .eyebrow` (12px normal) | `--amd-gold-ink-deep` |
> | `.ledger .linkarrow` "Más info" (14.4px/700) | `--amd-gold-ink-deep` |
> | `.line__count b` (18.4px/700) | `--amd-gold-ink-deep` |
> | `.line__ord` activo, **≥ 900px** (24–38.4px) | `--amd-gold-ink` |
> | `.line__ord` activo, **< 900px** (18.4px) | `--amd-gold-ink-deep` |
>
> El ordinal cambia de token en el mismo breakpoint en que cambia de tamaño. `:focus-visible`
> (`:151`) es contorno, no texto: `--amd-gold-ink` sirve.
> Y **ningún dorado de marca como texto sobre claro**: ni `--amd-gold` (1.73:1) ni
> `--amd-gold-soft` (1.32:1).

Spine con
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
- **Reparto de dorado (REQ-009).** Aserto sobre el **texto del CSS portado**: eyebrow, "Más info" y
  contador resuelven a `--amd-gold-ink-deep`; el ordinal a `--amd-gold-ink` en la regla base y a
  `--amd-gold-ink-deep` en la media query de < 900px. Ningún `var(--amd-gold)` ni
  `var(--amd-gold-soft)` como `color:` dentro del ledger.
  **Por qué un aserto sobre el texto y no sobre el render:** jsdom no resuelve variables CSS en
  cascada, así que el efecto real lo mide T012. Este aserto sólo impide el port literal, que es el
  modo de fallo concreto — y es exactamente el defecto que la Pivot T001 encontró tarde.

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/ledger/**/*.spec.ts" && npm run build`
- **Falsable con:** quitar `inert` del detalle colapsado → el test de tabulabilidad debe FALLAR.
  Y devolver el eyebrow a `var(--amd-gold-ink)` (el valor literal del mockup) → el aserto de reparto
  debe FALLAR.
- **Evidence disqualifier:** **jsdom no puede probar el revelado de imagen ni el recorte**: no
  compone `transform` ni mide cajas. Que el CSS esté presente no prueba que la foto no se desborde.
  Esa clase la mide **T012** y la revisa el HITL. No reportar el revelado como cubierto aquí.

### Done when

- [x] CSS portado (539 líneas, **11.7 kB** — por debajo incluso del aviso de 16 kB)
- [x] Reparto de dorado aplicado según el cuadro de arriba, con su aserto en verde y falsable
- [x] Colapsado inerte, verificado por orden de foco
- [x] Spine estático bajo reduced-motion
- [x] Declarado explícitamente en `execution.md` qué queda pendiente de T012

---

## T007 — Cortar: montar el ledger y retirar `ServicesRoadSection`

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** T006
- **Directory boundary:** `client/src/app/features/home/` y **`client/src/assets/i18n/`**
  (ampliado 2026-09-06: el Scope ordena retirar `roadHint` de los diccionarios, que viven fuera del
  boundary original — mismo defecto que **KZ-005** ya registró en T003 y T005)
- **Recommended skills:** `angular-developer`
- **Requirements:** REQ-003 (regresión completa), REQ-002
- **Design refs:** §9 reversión 3

### Scope

Cambiar `home-page.html` para montar `LedgerSection` en lugar de `ServicesRoadSection`. Borrar
`features/home/services-road/` completo, incluido su `.spec.ts` (~30 tests) y el export
`ROAD_DECO_FACTORS`. Retirar `roadHint` de los diccionarios.

**No tocar `g*Title`** — las comparte `SERVICE_GROUPS` con `/services` y borrarlas rompe esa página
y sus tests de contenido. `g*Sum` y `g*Body` **se conservan**: el ledger las reutiliza.

> ⚠ **Corregido 2026-09-06.** Esta línea decía «Actualizar la lista de anclas de `home-page.spec.ts`,
> a la que le falta `cifras`». **No puede hacerse aquí:** la sección `#cifras` la crea **T009**, que
> no depende de T007 y puede llegar después. Añadir `cifras` a la lista en esta tarea deja la suite
> **en rojo** hasta que T009 aterrice — y el Evidence disqualifier de T007 exige justo lo contrario,
> que la suite completa compile y pase.
>
> **T007 deja la lista en las cinco anclas actuales.** La sexta la añade **T009**, que es la tarea
> que crea la sección y la monta. Ver la corrección equivalente en el Scope de T009.

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

- [x] `services-road/` borrado por completo (4 ficheros, 1 042 líneas); ningún import huérfano
- [x] Suite completa verde: 31→**30** ficheros, 285→**259** tests. Los 26 que se van son los del camino, que murieron con su sujeto
- [x] `roadHint` fuera de ambos diccionarios; las 15 claves `g*Title`/`g*Sum`/`g*Body` intactas en ES y EN
- [x] **N/A — premisa falsa, medida 2026-09-06.** `services-road-section.css` pesaba **6 868 bytes**, muy por debajo del aviso de 16 kB: ese aviso **nunca existió**. Ningún CSS de componente del proyecto supera hoy los 16 kB (el mayor es `ledger-section.css`, 11 677 bytes). El ítem se cierra por inaplicable, no por corregido

---

## T008 — `AboutTeaserSection` → Manifiesto claro

- **Status:** [x] PASS (2 rondas · 2026-09-06)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/about-teaser/` y
  **`client/src/assets/i18n/`** (ampliado 2026-09-06 — **cuarta reincidencia de KZ-005**: la tarea
  mete una imagen, que necesita `alt`, y el fichero que edita ya arrastra un literal español
  hardcodeado, `<figcaption>Cali · Colombia</figcaption>`. Ambos son copy y viven en los diccionarios)
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-004, REQ-001 (tono de la sección), **REQ-009 escenario "acento legible
  sobre papel"** (añadido en la Pivot T001: la sección pasa a clara, así que su acento dorado cambia
  de régimen de contraste)
- **Design refs:** DD-028, DD-041, **DD-031**, §5.5

### Scope

La sección pasa de `--amd-ink` a claro y recibe la imagen junto al párrafo. **Debe recibir el
marcador `.section--light`**: sin él, la inversión del chrome falla en silencio justo en la sección
que cambia de tono. Se conserva el CTA a `/about-us`.

El alto de la imagen deriva del texto (`align-self: stretch` + `height: 100%`). Devolverle un
`aspect-ratio` la vuelve a imponer sobre el layout.

> ⚠ **Al volverse clara, el dorado de esta sección cambia de régimen (Pivot T001).**
> `about-teaser-section.css:126` usa hoy `color: var(--amd-gold-soft)` — **1.32:1 sobre papel**, el
> peor de la familia. Sobre tinta era legible; sobre claro no. Todo texto de acento de esta sección
> pasa a `--amd-gold-ink-deep`, salvo que alcance el piso de texto grande (≥24px, o ≥18.66px en
> negrita), en cuyo caso vale `--amd-gold-ink`. El dorado pleno se queda **sólo como relleno**.

### Tests

- La sección lleva `.section--light`
- El CTA a `/about-us` sigue presente con su `routerLink`
- **Reparto de dorado (REQ-009).** Aserto sobre el texto del CSS: ningún `var(--amd-gold)` ni
  `var(--amd-gold-soft)` como `color:` en la sección; el acento resuelve a un token de tinta.
- **Cero literales de copy en la plantilla** (REQ-011). Incluye el `alt` de la imagen nueva y el
  `<figcaption>`, que hoy dice `Cali · Colombia` en duro.

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/about-teaser/**/*.spec.ts"`
- **Falsable con:** quitar `.section--light` → el test debe FALLAR (y con él, la inversión del nav
  en T012).
- **Evidence disqualifier:** que la clase esté **no** prueba que el fondo sea claro ni que la imagen
  no se desproporcione. Ambas las mide T012.

### Done when

- [x] Sección clara (`--amd-surface`, igual que el mockup) con `.section--light`
- [x] `--amd-gold-soft` retirado como color de texto; acento en `--amd-gold-ink-deep`
- [x] Imagen con alto derivado del texto **a ≥ 900 px**, sin `aspect-ratio` en la regla base. **Corregido en ronda 2:** por debajo de 900 px sí lleva `aspect-ratio: 4/3` con `height: auto`, como el mockup — apilado no hay fila que estirar (ver `execution.md`)
- [x] CTA a `/about-us` intacto
- [x] `aboutFigureAlt` y `aboutFigureCaption` en ES y EN; `Cali · Colombia` eliminado

---

## T009 — `FiguresBand` (`#cifras`)

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/figures/`,
  **`client/src/app/features/home/home-page/`** (ampliado 2026-09-06: el Scope ordena montar la banda
  en `home-page.html`) y **`client/src/assets/i18n/`** (**quinta reincidencia de KZ-005**: la banda
  entrega eyebrow, frase y tres etiquetas de métrica — cinco cadenas de copy visible)
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-005, REQ-003 (ancla `#cifras`), REQ-013
- **Design refs:** DD-039, §5.2

### Scope

Sección nueva full-bleed: video de fondo, scrim, eyebrow, frase y tres métricas con conteo animado.
**Sin `.section--light`** — es oscura. Montar en `home-page.html` entre Manifiesto y Confianza.

> ⚠ **Corregido 2026-09-06 — el atributo `autoplay` no va.** Esta línea decía
> `<video autoplay muted loop playsinline poster>`, y `design.md` §5.2 lo repite. **Contradice al
> escenario testable y al mockup, que mandan.** REQ-005 dice *«WHEN la sección **entra en pantalla**
> THEN el video MUST reproducirse»* — eso es un `IntersectionObserver`, no un atributo. El mockup lo
> implementa así a propósito (`home-redesign.js:216-233`), con dos salvaguardas documentadas por
> decisión HITL: **se pausa fuera del viewport** (ahorro de CPU y batería, no accesibilidad) y bajo
> `prefers-reduced-motion` **se queda en el póster**. Además lleva `preload="none"`, que es lo que
> sostiene a la persona en 3G y a DD-039. La lista de `### Tests` de esta misma tarea ya es coherente
> con el mockup: exige `muted`, `loop`, `playsinline` y `poster`, y **no** menciona `autoplay`.

> ⚠ **La métrica «31 servicios» se deriva, no se escribe.** El mockup la lleva como literal
> (`data-count="31"`). Copiarla duplica el catálogo, que es exactamente el defecto que DD-035 evita y
> que T005 ya tuvo que corregir en el CTA del ledger. El total sale de `SERVICE_GROUPS` sumando
> `subs.length`, como hace `LedgerSection.totalServices`.

### Tests

- El `<video>` lleva `muted`, `loop`, `playsinline` y `poster`, y **no** lleva `controls`
- Bajo reduced-motion el video no se reproduce y las métricas muestran el valor final
- La sección tiene `id="cifras"` y **no** lleva `.section--light`
- **Heredado de T007 (2026-09-06):** la lista de anclas de `home-page.spec.ts` pasa de cinco a
  **seis**, con `cifras` incluida. Es esta tarea la que crea la sección, así que es aquí donde el
  aserto puede pasar. T007 no podía añadirlo sin dejar la suite en rojo.

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/figures/**/*.spec.ts" && npm run build`
- **Falsable con:** añadir `controls` al `<video>` → el test debe FALLAR.
- **Evidence disqualifier:** jsdom **no reproduce video**. Que el elemento tenga los atributos no
  prueba que el póster se pinte antes ni que el scrim dé contraste. T012 y HITL.

### Done when

- [x] Banda montada entre Manifiesto y Confianza con el ancla `#cifras`; `home-page.spec.ts` barre las **seis** anclas
- [x] Rama de reduced-motion probada: no se llama a `play()` y las métricas nacen en su valor final
- [x] `npm run build` sin el video en el bundle inicial: 452.24 kB, y `manifiesto.mp4` (1.94 MB) sale como asset estático en `dist/client/browser/media/`
- [x] Las cinco cadenas por clave `figures*` en ES y EN; cero literales en la plantilla
- [x] Total derivado vía `deriveCatalogTotal(SERVICE_GROUPS)`, no el literal `31`

---

## T010 — `ClientWall`: carrusel infinito de logos

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/clients/` y **`client/src/assets/i18n/`**
  (ampliado 2026-09-06 — **sexta reincidencia de KZ-005**: el muro rotula su cinta
  («Empresas que ya operan con AMD», `mockup/index.html:363`) y esa cadena es copy visible.
  **Las 13 razones sociales NO son copy**: son nombres propios y viven en `client-logos.data.ts`,
  nunca en los diccionarios)
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

- [x] 26 elementos: 13 originales con `role="img"` y razón social, 13 copias `aria-hidden` sin rol. **147 618 bytes** de máscaras, bajo el techo de 200 kB
- [x] `duracion(anchoMitad, pxPorSegundo)` pura y exportada, recalculada en `resize` y en `document.fonts.ready`
- [x] Retícula estática bajo reduced-motion, con los 13 originales visibles y la copia oculta
- [x] Fallback `@supports` declarado: el nombre en texto vía `content: attr(aria-label)`
- [x] `clientsLabel` en ES y EN; las 13 razones sociales en `client-logos.data.ts`
- [x] `--logo` conserva su `url()` en los 13, verificado en el DOM renderizado

---

## T011 — `TrustSection`: sin auto-rotación, puntos como control primario

- **Status:** [x] PASS (2 rondas · 2026-09-06)
- **Depends on:** T010
- **Directory boundary:** `client/src/app/features/home/trust/` y **`client/src/assets/i18n/`**
  (ampliado 2026-09-06 — **séptima reincidencia de KZ-005**: la tarea reescribe `trustLead` y crea la
  clave del nombre accesible de los puntos. Las dos son copy y viven en los diccionarios)
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

> **Dónde va el muro (decisión del Leader, 2026-09-06).** El Scope decía «Montar `ClientWall`» sin
> decir dónde. REQ-006 pide **tres grados de concreción: qué dicen → quiénes son → dónde operan**, y
> el mockup los sirve en ese orden (`index.html:332-370`: cita y puntos → muro de clientes → ticker
> de sectores). La plantilla actual los tiene al revés —sectores antes que testimonios—, así que el
> montaje exige **mover el bloque `.logos` (sectores) detrás del muro**. Orden final:
> cabecera → métricas → testimonios → puntos → `ClientWall` → sectores → CTA.
> Ningún escenario de REQ-006 asevera el orden, así que esto es juicio del Leader, no letra del spec.

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

- [x] Sin temporizador ni export `TESTIMONIAL_PAUSE_MS`; regresión de 15 s en verde y falsable
- [x] Cuatro testimonios conservados; `q4`/`q4By` intactas
- [x] `testimonialDotLabel` con `{n}` interpolado, en ES y EN
- [x] `ClientWall` montado entre puntos y sectores, con aserto de ancestría (KZ-004) falsable
- [x] `trustLead` reescrito en ES y EN; los dos tests del temporizador borrados con su sujeto. **`logosLabel` también** — quedó engañosa al aparecer un muro de clientes real encima (ver `execution.md`)
- [x] Fondo a `--amd-surface`, conservando `.section--light`
- [x] Geometría 44×44 de los puntos **intacta**

---

## T014 — Manifiesto: portar la sección del mockup (cita + pilares)

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** T008
- **Origen:** **KZ-007** — revisión HITL en navegador, 2026-09-06. T008 estaba redactada como *delta*
  («pasa de tinta a claro, recibe la imagen») y produjo el teaser antiguo repintado. **El mockup manda.**
- **Directory boundary:** `client/src/app/features/home/about-teaser/` y `client/src/assets/i18n/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-004 (descripción: *fusionar el manifiesto y el teaser*), **REQ-009**, REQ-011
- **Design refs:** DD-028, DD-031, §5.5 · **Mockup: `index.html` `<section id="sobre-amd">`;
  `home-redesign.css:518-578`**

### Scope

Portar la sección **entera** del mockup. Inventario que hoy falta:

| Elemento del mockup | Hoy |
|---|---|
| `p.eyebrow.eyebrow--ink` «Por qué existimos» | ausente |
| `h2.about__quote` «Tu contabilidad no debería ser una caja negra.» | dice «Quiénes somos» |
| `p.about__body` (3 frases, la larga) | versión corta |
| `ol.pillars` — 01 Cercanía · 02 Cumplimiento · 03 Claridad | **ausente entero** |
| `.about__cta`: «Conocer al equipo» `btn--ink` + «Contactar» `btn--ghost-ink` | «Ver más» `btn--gold` + «Contactar» |
| `.about__lead` grid `minmax(0,26rem) minmax(0,1fr)`, `align-items: stretch` | grid `1.1fr 0.9fr` |
| `.about__figure` con `margin-block: -1.75rem` | sin él |

**El alto lo marca el texto y la foto se estira a él** con un pequeño desborde arriba y abajo
(`margin-block: -1.75rem`), que es lo que hace que la acompañe sin dominarla. Es la invariante de
REQ-004, ahora en el layout correcto.

> ⚠ **REQ-009 se aplica otra vez, y el mockup lo incumple.** `home-redesign.css:98` pinta
> `.eyebrow--ink` con `#8a7a2e` (`--amd-gold-ink`, 3.86:1) y `:573` hace lo mismo con `.pillars__ord`.
> **Los dos son texto pequeño**: el eyebrow es 0.75rem (12px) y el ordinal 0.95rem/600 (15.2px) —
> ninguno alcanza el piso de texto grande. **Ambos van a `--amd-gold-ink-deep`.** Ningún literal
> `#8a7a2e` en el CSS del componente: se usa el token.

### Tests

- Los cinco elementos existen: eyebrow, `about__quote`, `about__body`, **tres** `pillars li`, y los
  dos botones del CTA con sus rutas
- **Fidelidad de inventario:** el conjunto de clases del componente contiene el del mockup
- Reparto de dorado: eyebrow y `pillars__ord` resuelven a `--amd-gold-ink-deep`; cero `#8a7a2e` literal
- Cero literales de copy en la plantilla; paridad ES/EN
- Sin `aspect-ratio` en la regla base de la figura (REQ-004 ≥ 901 px); el apilado móvil lo conserva

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet && npm run build`
- **Falsable con:** borrar un `pillars li` → el test de tres debe FALLAR. Devolver el eyebrow a
  `--amd-gold-ink` → el aserto de reparto debe FALLAR.
- **Evidence disqualifier:** jsdom no mide layout. Que las clases estén **no** prueba que los pilares
  caigan en tres columnas ni que la foto acompañe al texto. **T012.**

### Done when

- [x] Eyebrow, cita, cuerpo largo y **tres pilares**; 10 claves nuevas en ES y EN
- [x] CTA «Conocer al equipo» `btn--ink` + «Contactar» `btn--ghost-ink`; `btn--gold` fuera
- [x] Reparto REQ-009 en eyebrow y ordinales (`--amd-gold-ink-deep`), sin literales `#8a7a2e`/`#6f6224`
- [x] **Inventario de clases ⊇ el del mockup, verificado por diff**: falta **nada**; único extra `section--light`, que es del proyecto

---

## T015 — Confianza: portar la sección del mockup

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** T011
- **Origen:** **KZ-007** — revisión HITL en navegador, 2026-09-06. T011 estaba redactada como *delta*
  («retirar `setInterval`, montar `ClientWall`») y dejó el Confianza antiguo con el muro pegado.
- **Directory boundary:** `client/src/app/features/home/trust/` y `client/src/assets/i18n/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-006 (los tres escenarios se conservan), REQ-009, REQ-011
- **Design refs:** DD-028, DD-034, §5.5 · **Mockup: `index.html` `<section id="confianza">`;
  `home-redesign.css:630-668` y `:751-756`**

### Scope

| Elemento del mockup | Hoy |
|---|---|
| `p.eyebrow.eyebrow--ink` «Confianza que se nota», centrado | `h2` grande + `p` lead |
| `figure.quote` — cita grande centrada, `max-width: 44rem`, `clamp(1.2rem, 2.6vw, 1.7rem)` | tarjeta blanca pequeña, alineada a la izquierda |
| `.quote__dots` centrados, `margin-top: 2rem` | tras un hueco enorme |
| `.ticker` — sectores como **texto plano** en cinta continua, 38 s, `gap: 3.5rem`, borde arriba y abajo | `logo-pill`: **tarjetas con borde y sombra** |
| `.ticker__label` «Sectores que acompañamos» **debajo** de la cinta | encima |
| `text-align: center` en toda la sección | izquierda |
| **Sin** tarjetas de métricas | 4 tarjetas (10+ · 98% · ES/EN · Cali) |
| **Sin** CTA final | «Contactar» |

**Decisiones HITL (2026-09-06):**

- **Las cuatro métricas se retiran.** No están en el mockup. Sus claves `m1…m4` quedan huérfanas:
  **retirarlas de ambos diccionarios**, junto con `trustTitle` y `trustLead` si dejan de usarse.
- **Los sectores pasan a la lista del mockup (9)**: Comercio, Servicios profesionales, Salud,
  Construcción, Transporte, Educación, Manufactura, Tecnología, Agroindustria. Sustituyen a las ocho
  actuales (Cripto, Moda, Oro, Educación, Fundaciones, Minimarket, Ploteo, Turismo).
- **El CTA «Contactar» final se retira** — el mockup cierra con el ticker.

**Lo que NO cambia:** los **cuatro** testimonios (DD-034: el mockup dibuja tres como ilustración),
la ausencia de temporizador, los 44×44 de los puntos, `ClientWall` montado y su ancestría.

> ⚠ **REQ-009.** El mockup pinta el punto activo y el eyebrow con `#8a7a2e` literal. El punto activo
> es **relleno** → `--amd-gold-ink` vale. El eyebrow es texto de 12px → **`--amd-gold-ink-deep`**.
> Ningún `#8a7a2e` literal en el CSS del componente.

### Tests

- Eyebrow presente; **no** hay `h2` de título ni párrafo lead
- **Cero** elementos de métrica en el DOM; `m1…m4` fuera de ambos diccionarios y sin referencias
- La cita es `figure.quote` centrada; los cuatro puntos y los cuatro testimonios siguen
- El ticker tiene **9 sectores duplicados** (18 elementos) y son `<span>` de texto, **no** tarjetas
- El rótulo del ticker va **después** de la cinta en orden de documento
- **Fidelidad de inventario:** el conjunto de clases del componente contiene el del mockup
- Se conservan: sin temporizador (regresión de 15 s), ancestría de `ClientWall`, 44×44

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet && npm run build`
- **Falsable con:** reintroducir una tarjeta de métrica → el test de cero debe FALLAR. Poner el
  rótulo antes de la cinta → el test de orden debe FALLAR.
- **Evidence disqualifier:** jsdom no compone la cinta ni mide el centrado. La velocidad del ticker y
  la costura son de **T012**.

### Done when

- [x] Eyebrow en vez de título + lead; sección centrada
- [x] Métricas fuera del DOM; `m1…m4`, `trustTitle`, `trustLead`, `trustCta` y `logosLabel` fuera de ambos diccionarios, sin referencias
- [x] Cita grande centrada con sus cuatro puntos; cuatro testimonios intactos
- [x] Ticker de **texto plano**: 9 sectores por clave `sector*`, duplicados a 18, rótulo debajo
- [x] CTA final retirado
- [x] **Inventario ⊇ el del mockup, verificado por diff** contando la plantilla de `ClientWall`: falta **nada**; único extra `section--light`
- [x] Regresión de 15 s, ancestría de `ClientWall` y 44×44 siguen en verde

---

## T016 — Contacto: portar la sección del mockup y sacar la jerga interna

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** none
- **Origen:** **KZ-007** — revisión HITL en navegador, 2026-09-06. `#contacto` **no lo toca ninguna
  tarea de esta spec** y §5.5 no lo lista, pero el mockup lo dibuja y es la Home aprobada.
- **Directory boundary:** `client/src/app/features/home/contact/` y `client/src/assets/i18n/`
- **Recommended skills:** `ui-ux-pro-max`, `frontend-design`
- **Requirements:** REQ-001 (tono), **REQ-011**, REQ-013
- **Design refs:** DD-028 · **Mockup: `index.html` `<section id="contacto">`**

### Scope

> 🔴 **Lo más urgente no es visual: hay jerga interna en la página del cliente.**
>
> | Clave | Valor hoy |
> |---|---|
> | `contactLead` | «Cuéntanos qué necesitas. **Fase 1: WhatsApp o correo — sin backend.**» |
> | `fNote` | «**Validación client-side + handoff.**» / «Client-side validation + handoff.» |
>
> «Fase 1», «sin backend», «client-side» y «handoff» son vocabulario del proyecto, no del negocio.
> Están hoy en producción a la vista de los clientes de AMD. **Salen sí o sí**, con independencia del
> resto de la tarea.

| Elemento del mockup | Hoy |
|---|---|
| `p.eyebrow` «Hablemos» + `h2` «Cuéntanos qué necesitas.» | `h2` «Hablemos», sin eyebrow |
| `p.contact__lead` «Respondemos por WhatsApp o correo. Sin formularios eternos.» | la línea con «Fase 1 / sin backend» |
| `dl.contact__meta` con **tres** filas (Ubicación · WhatsApp · **Correo**), separadas por hairline | dos `dt/dd` + un enlace `mailto` suelto fuera del `<dl>` |
| Un solo botón `btn--gold btn--block` «Enviar por WhatsApp» | dos botones: «Enviar consulta» + «Abrir WhatsApp» |
| `option` «Selecciona una línea» | «Selecciona (opcional)» |
| `orbfield orbfield--dim` (campo ambiental atenuado) | ausente |
| Clases BEM `contact__grid/intro/lead/meta` | `contact-grid/intro/meta`, más un `section-head` que el mockup no tiene |

> ⚠ **El formulario de `client/` hace cosas que el mockup NO hace, y esas se conservan.** El mockup
> lleva `onsubmit="return false"`: es una maqueta muerta. En `client/` hay formulario reactivo con
> validación, mensajes de error accesibles (`aria-invalid`, `aria-describedby`), fallback `mailto` y
> toast. **Nada de eso se borra.** Esta tarea porta **lo visual y el copy**, no el comportamiento.
> Si el mockup y una regla de accesibilidad chocan, gana la accesibilidad y se reporta.

**Sobre los dos botones:** el mockup deja uno. Antes de fusionarlos, comprueba qué hace hoy cada uno
(`submit()` y `openWhatsApp()`): si «Enviar consulta» es la única vía al fallback `mailto`,
**fusionarlos pierde un canal**. Repórtalo en vez de decidirlo solo.

### Tests

- Eyebrow presente y `h2` con el titular del mockup, no «Hablemos»
- **Ni «Fase 1», ni «backend», ni «client-side», ni «handoff» en ningún valor de los diccionarios** —
  aserto sobre el texto de `es.json` y `en.json`, en los dos idiomas
- `dl.contact__meta` con **tres** filas, incluida Correo
- Fidelidad de inventario contra la sección del mockup
- **Regresión:** la validación, los mensajes de error, el `mailto` y el toast siguen verdes

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet && npm run build`
- **Falsable con:** devolver «Fase 1» a `contactLead` → el aserto de jerga debe FALLAR.
- **Evidence disqualifier:** jsdom no mide el layout de dos columnas ni el campo ambiental. **T012.**

### Done when

- [x] Cero jerga en **todos** los valores de ambos diccionarios; `fNote` retirada por completo
- [x] Eyebrow + titular + lead del mockup; `contact__meta` con tres filas y el correo como enlace
- [x] **Inventario ⊇ el del mockup, verificado por diff**: falta nada; extras `field-error`, `mailto-fallback`, `toast` — las piezas que el mockup no tiene
- [x] Validación, `aria-invalid`/`aria-describedby`, foco al primer inválido, `mailto`, toast y prefill por query param: **todos en verde**

---

## T017 — Hero: alineación a la izquierda y «Scroll» clicable

- **Status:** [x] PASS (1 ronda · 2026-09-06)
- **Depends on:** none
- **Origen:** **KZ-007** — revisión HITL, 2026-09-06. El inventario de clases del hero **coincide con
  el mockup** y aun así diverge: la diferencia es CSS, no estructura. **Es la prueba de que el diff de
  inventario es necesario pero no suficiente.**
- **Directory boundary:** `client/src/app/features/home/hero/` y `client/src/assets/i18n/`
- **Recommended skills:** `ui-ux-pro-max`
- **Requirements:** REQ-001, REQ-013 (objetivo táctil)
- **Design refs:** **Mockup: `index.html` `<section id="inicio">`; `home-redesign.css:318-336`**

### Scope

**1 · El contenido va a la izquierda, no centrado. Causa raíz localizada:**

`hero-section.html` usa `<div class="wrap hero__content">`. `.wrap` aporta
`width: min(100% - 2.5rem, 1160px)` **y `margin-inline: auto`**. Y `.hero__content` añade
`max-width: 38rem`. Como `max-width` gana a `width`, la caja queda en 608 px **y el `margin-inline:
auto` la centra en el viewport**. Por eso el bloque sale centrado.

El mockup no pone `max-width` en `.hero__content`: la restricción de ancho vive en
**`.hero__promise { max-width: 34rem }`**, así que el bloque arranca en el margen izquierdo del
`.wrap` y sólo el párrafo es estrecho. **Portar eso.**

**2 · «Scroll» debe ser un enlace clicable con su línea:**

| Mockup | Hoy |
|---|---|
| `<a class="hero__scroll" href="#servicios">` con `<span>SCROLL</span>` + `<i>` | `<div class="hero__scroll" aria-hidden="true">` |
| `i`: línea de 1×34 px con degradado dorado a transparente | ausente |
| `min-height: 44px` (objetivo táctil, REQ-013) | `pointer-events: none` |

Hoy **no se puede pulsar, no navega y está oculto a asistencia técnica**. Pasa a `<a>` con
`routerLink="/" fragment="servicios"`, la línea `<i aria-hidden="true">`, y `min-height: 44px`.
**Fuera el `pointer-events: none`.** El texto «SCROLL» deja de ser `aria-hidden`: es el nombre
accesible del enlace.

### Tests

- El hero **no** centra su contenido: `.hero__content` sin `max-width` propio; el ancho lo pone
  `.hero__promise`
- «Scroll» es un `<a>` con destino `#servicios`, **no** `aria-hidden`, sin `pointer-events: none`, y
  con objetivo táctil ≥ 44 px declarado

- **Verification:** `cd client && npm run test:agent -- --include="src/app/features/home/hero/**/*.spec.ts" && npm run test:agent`
- **Falsable con:** devolver `max-width: 38rem` a `.hero__content` → debe FALLAR. Devolver
  `pointer-events: none` → debe FALLAR.
- **Evidence disqualifier:** jsdom no calcula posición: que no haya `max-width` **no** prueba que el
  bloque quede a la izquierda. **T012** lo mide.

### Done when

- [x] `max-width` fuera de `.hero__content`; la restricción vive en `.hero__promise { max-width: 34rem }`, como el mockup
- [x] «Scroll» es `<a>` con `fragment="servicios"`, texto como nombre accesible, línea dorada `1×34 px` y `min-height: 44px`

---

## T018 — Ajustes HITL: etiquetas del nav, aterrizaje del sub-header y rotación de testimonios

- **Status:** [x] PASS (2 rondas · 2026-09-06)
- **Depends on:** T015, T017
- **Origen:** Revisión HITL en navegador, 2026-09-06 (tercera pasada).
- **Directory boundary:** `client/src/app/core/layout/`, `client/src/app/app.config.ts`,
  `client/src/app/features/home/trust/`, `client/src/assets/i18n/`
- **Recommended skills:** `angular-developer`, `ui-ux-pro-max`
- **Requirements:** REQ-008, **REQ-006 (revertido por HITL — leer el aviso del escenario)**, REQ-011
- **Design refs:** DD-029, DD-030, **DD-034 (revertido)**

### 1 · Etiquetas del menú de páginas → las del mockup

| Clave | Hoy | Mockup |
|---|---|---|
| `navHome` | Home / Home | **Inicio** / Home |
| `navAboutPage` | Quiénes somos / About us | **Nosotros** / About |
| `navServicesPage` | Servicios / Services | Servicios / Services *(sin cambio)* |
| `navCta` | Contactar / Contact | **Contacto** / Contact |

**Colisión resuelta (HITL):** el mockup dice «Inicio» en el menú de páginas **y** en el índice de
secciones, lo que rompería el test de no-repetición de T004. Decisión: el menú de páginas queda
exactamente como el mockup, y **`navSectionInicio` pasa de «Inicio» a «Arriba»** en ES (en EN ya vale
«Top» desde T004). «Arriba» describe lo que hace el ancla: subir al hero.

### 2 · El sub-header no aparece al aterrizar en un ancla

**Causa raíz medida.** Hay **dos números que deberían ser el mismo y viven en ficheros distintos**:

- `app.config.ts` → `ViewportScroller.setOffset` reserva **137 px** a ≥ 900 px (69 del top-nav + 44
  del sub-header + 1.5rem de aire).
- `section-nav.ts:88` → enciende la barra con `window.scrollY > heroHeight - 120`.

Al pulsar «Scroll» se aterriza en `ledgerTop − 137`, y con el `margin-top: -68px` del hero eso cae
**85 px por debajo** del umbral: la banda reservada para el sub-header queda **vacía**. En el mockup
funciona por 4 px de margen (offset 116 contra umbral 120); aquí el offset es mayor y el margen
negativo del hero se come el resto.

**El arreglo no es mover el 120.** Extraer el cálculo del alto del chrome a **una sola función
compartida** en `core/layout/` (o `core/motion/`), consumida por el `setOffset` de `app.config.ts`
**y** por el umbral de `SectionNav`. La barra se enciende cuando el borde inferior del hero alcanza
ese alto de chrome, no cuando `scrollY` supera un literal. Así los dos números no pueden volver a
separarse.

### 3 · Los testimonios vuelven a rotar solos

> ⚠ **Esto revierte REQ-006 y DD-034, por decisión del cliente.** Los dos documentos ya están
> actualizados: **léelos antes de tocar el código.** T011 retiró el `setInterval` y dejó una regresión
> de 15 s que lo prohibía; **ese test se borra**, porque su sujeto ya no es un defecto.

- Pausa de lectura: **9 s**, en una constante exportada y nombrada.
- **Se detiene** mientras el puntero esté encima de la sección de testimonios o el foco dentro
  (`:hover` / `:focus-within`, o sus equivalentes en TS). Es lo que impide sustituir texto que alguien
  está leyendo, que era la objeción original de REQ-006.
- **Sin temporizador** bajo `prefers-reduced-motion: reduce`.
- Activar un punto sigue funcionando y **reinicia** la cuenta.
- Los cuatro testimonios y los 44×44 de los puntos **no se tocan** (KZ-001).

### Tests

- Las cuatro etiquetas del menú coinciden con el mockup, en ES y EN
- El test de **no-repetición de T004 sigue verde** con `navSectionInicio` = «Arriba»
- **Una sola fuente** para el alto del chrome: aserto de que `app.config.ts` y `SectionNav` consumen
  la misma función, no dos literales
- Con timers falsos: el testimonio **avanza** a los 9 s; **no avanza** con hover/foco simulado; **no
  avanza** bajo reduced-motion; activar un punto reinicia la cuenta
- El test de regresión de 15 s de T011 **se borra**, no se deja pasando

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet && npm run build`
- **Falsable con:** devolver `navSectionInicio` a «Inicio» → el test de no-repetición debe FALLAR.
  Quitar la pausa por hover → el test de pausa debe FALLAR.
- **Evidence disqualifier:** jsdom no hace scroll real. Que las dos piezas compartan función **no
  prueba** que el sub-header aparezca al pulsar «Scroll». **T012** lo mide en navegador.

### Done when

- [x] Menú `Inicio / Nosotros / Servicios` + CTA `Contacto`; `navSectionInicio` = «Arriba»/«Top»; el test de no-repetición de T004 en verde **sin tocarlo**
- [x] `chrome-offset.ts` como fuente única: `getChromeOffset()` la consumen `app.config.ts` y `SectionNav`. Umbral con `SUB_HEADER_THRESHOLD_TOLERANCE = 2` para absorber el subpíxel del aterrizaje
- [x] Rotación a 9 s contra la constante; pausa al cursor y al foco por **una sola vía**; sin temporizador bajo reduced-motion; el punto reinicia la cuenta
- [x] Regresión de 15 s borrada con su sujeto; REQ-006 y DD-034 actualizados **antes** de implementar

---

## T019 — Ajustes HITL: alineación del top-nav y ritmo de los testimonios

- **Status:** [ ]
- **Depends on:** T018
- **Origen:** Revisión HITL en navegador, 2026-09-06 (cuarta pasada).
- **Directory boundary:** `client/src/app/core/layout/top-nav/` y `client/src/app/features/home/trust/`
- **Recommended skills:** `ui-ux-pro-max`
- **Requirements:** REQ-006 (ritmo de lectura), REQ-008
- **Design refs:** **Mockup: `home-redesign.css` `.topnav__inner` / `.brand` / `.topnav__links`**

### 1 · El menú del top-nav va a la derecha, no centrado

**Causa raíz medida.** Es una sola declaración:

| | Mockup | Hoy |
|---|---|---|
| `.topnav__inner` | `display: flex; gap: 1.5rem` | `display: flex; gap: 1rem;` **`justify-content: space-between`** |
| `.brand` | **`margin-right: auto`** | — |

Con `space-between` y tres hijos —marca, nav, acciones— el navegador reparte el hueco sobrante
**entre** ellos y el nav queda **centrado**. El mockup no reparte: empuja sólo la marca con
`margin-right: auto`, así que enlaces y acciones quedan **pegados a la derecha** como un solo grupo.

Portar también el espaciado del mockup, que cambia con la alineación:
`.topnav__links { gap: 0.35rem }` y `padding: 0 0.85rem` en cada enlace — hoy es `gap: 1.5rem` sin
padding, que a la derecha se lee suelto.

**No toques** el `min-height: 44px` de los enlaces (KZ-001, objetivo táctil), ni la inversión
`on-light`, ni el comportamiento del `SectionNav`.

### 2 · La pausa de 9 s es demasiado larga

**Medido sobre el copy real** (`es.json`, `q1`–`q4`):

| Testimonio | Palabras | ~200 ppm | ~160 ppm |
|---|---|---|---|
| q1 (el más largo) | 16 | 4.8 s | 6.0 s |
| q2 | 12 | 3.6 s | 4.5 s |
| q3 | 14 | 4.2 s | 5.2 s |
| q4 | 10 | 3.0 s | 3.8 s |

`TESTIMONIAL_PAUSE_MS` pasa de **9000** a **6000**: cubre el peor caso incluso leyendo despacio, y no
deja el carrusel parado. Cambiar **sólo la constante** — los tests aseveran contra ella, así que no
hay literales que perseguir. Si alguno compara con `9000` a mano, es un defecto: repórtalo.

### Tests

- `.topnav__inner` **no** declara `justify-content: space-between`; `.brand` **sí** declara
  `margin-right: auto`
- `TESTIMONIAL_PAUSE_MS === 6000`, y ningún test compara contra un literal distinto
- Los tests de rotación, pausa por cursor/foco y reduced-motion siguen verdes **sin tocarlos**

- **Verification:** `cd client && npm run test:agent && npm run lint -- --quiet && npm run build`
- **Falsable con:** devolver `space-between` → debe FALLAR. Poner la pausa en 9000 → debe FALLAR.
- **Evidence disqualifier:** jsdom no calcula layout: que no haya `space-between` **no** prueba que el
  menú quede a la derecha. **T012.** Y si 6 s es cómodo de leer sólo lo dice un humano leyéndolo.

### Done when

- [ ] Menú y acciones agrupados a la derecha; la marca empuja con `margin-right: auto`
- [ ] Espaciado de enlaces portado del mockup, con los 44 px intactos
- [ ] `TESTIMONIAL_PAUSE_MS = 6000`; el resto de tests de rotación en verde sin tocarlos

---

## T012 — Gate de medición en navegador

- **Status:** [ ]
- **Depends on:** T007, T009, T011, **T014, T015, T016, T017, T018, T019**
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
| **Contraste de cada texto dorado sobre claro** | **≥ 4.5:1, o ≥ 3:1 si el elemento alcanza el piso de texto grande** |

**Cómo se mide el contraste (novena fila, añadida por la Pivot T001).** Para **cada elemento cuyo
`color` computado resuelva a un token de la familia dorada** —`--amd-gold`, `--amd-gold-soft`,
`--amd-gold-ink`, `--amd-gold-ink-deep`— sobre un fondo claro. **El barrido tiene que ser por
familia, no por los dos tokens de tinta**: si sólo mira los tokens correctos, no puede detectar
justamente el defecto que busca, que es alguien usando el dorado equivocado. Leer con
`getComputedStyle` su `color`,
`fontSize`, `fontWeight` y el `background-color` **efectivo** del ancestro que lo pinta, y elegir el
umbral **por el tamaño computado**: `≥ 3:1` sólo si `fontSize ≥ 24px`, o `fontSize ≥ 18.66px` con
`fontWeight ≥ 700`; `≥ 4.5:1` en cualquier otro caso. Que la regla se aplique sola a partir del
tamaño medido es el punto: es lo único que impide repetir el defecto que originó la Pivot T001,
donde el umbral se eligió a mano sobre una suposición de tamaño que nadie había medido.
Medir a **375 y a 1200 px** como mínimo: el ordinal del ledger cambia de tamaño en 900 px y por
tanto cambia de umbral.

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

- [ ] `verify:visual` reporta las **nueve** mediciones con su número
- [ ] Las nueve dentro de umbral, o reportadas como INCONCLUSO con su dispersión
- [ ] El contraste se mide a 375 y 1200 px, y el umbral lo elige el tamaño computado, no una constante
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
| §7 Tokens | Sin dorado de tinta | **Los dos** tokens declarados (`--amd-gold-ink`, `--amd-gold-ink-deep`) con la **regla de reparto por tamaño** de REQ-009, y la regla de que el dorado de marca no es texto sobre claro |
| §11 Dark Mode | "tema principal dark premium con secciones light intercaladas" | Ritmo claro dominante; el oscuro es puntuación |

### Tests

Sin test automatizado — es documentación. La verificación es un **barrido de cierre**: ninguna
referencia al rail lateral sobrevive en la baseline.

- **Verification:** `grep -rn "sidenav\|1100px\|dot sidenav" docs/ux-ui/design.md` → sin resultados,
  y `grep -n "amd-gold-ink-deep" docs/ux-ui/design.md` → con resultado (si aparece el token
  profundo, el otro ya está: se documentan juntos porque la regla es el reparto entre ambos)
- **Falsable con:** dejar cualquiera de las tres menciones de §2/§5 → el primer grep devuelve línea
  y el gate FALLA.
- **Evidence disqualifier:** un grep sin resultados prueba **ausencia del término**, no que la
  sección nueva sea correcta. Lo segundo lo lee una persona.

### Done when

- [ ] §2, §5, §7 y §11 reescritas
- [ ] Barrido de cierre sin menciones supervivientes al rail
- [ ] Los dos tokens de tinta documentados, **con la regla de reparto por tamaño**, no sólo sus valores

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
| REQ-009 | Acento legible sobre papel | T001 (tokens) + **T006/T008 (aplicación del reparto)** + T012 (renderizado) |
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
