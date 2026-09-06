# Execution Log — home-page-redesign

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Approval Mode | `gated` (de `proposal.md`) |
| Budget (`design.md` §10) | 13 tareas · ~1 900 LOC neto · 3 rondas de revisión |
| Baseline commit | `f891716` |
| **Execution ownership** | **Implementer/Tester delegados a Antigravity** (HITL 2026-09-06). Claude Code conserva **Leader (T1)** y **Reviewer (T3)**. El Leader no escribe código de producción. |
| Orquestación | **Orca orchestration** (HITL 2026-09-06). Run `run_ae0ab4caa1a3`, coordinador = terminal Claude Code `term_d8fc0b20`. Worker Antigravity = terminal Orca `term_eaef2a67` (CLI interactivo, `agy --dangerously-skip-permissions`). |
| Vía de despacho | `orca orchestration run-create` → `task-create` → `worker-start --terminal <handle>` → `check --wait`. Sin sustitutos no-Orca: cada tarea deja Task + Dispatch con procedencia. |
| Nota de invocación (headless, **descartada**) | El primer intento usó `agy -p` en un shell fuera de Orca. Se detuvo y se rehízo por orquestación. Hallazgos que siguen siendo válidos si alguna vez se usa el modo headless: el slug del modelo **ya codifica el effort** (`--effort` en paralelo aborta con `conflicts with --effort`), y headless auto-deniega permisos, así que `--dangerously-skip-permissions` es obligatorio. |
| Ruido de baseline | `client/package.json` y `client/package-lock.json` llegan modificados de otra sesión (script `start:dev`). **Excluidos de todo diff de revisión.** |
| **Cadencia (HITL 2026-09-06)** | **Una tarea a la vez** a partir del cierre de T001/T003/T005. Se probaron 3 workers de Antigravity en paralelo: el trabajo salió bien y sin colisiones de ficheros, pero la coordinación no compensó — reportes rebotados por capability revocada, esperas que se pisan, y un `run-use` que mató una escucha activa con `consumer_fenced`. Las **revisiones** sí siguen en paralelo: son subagentes de Claude Code, de solo lectura, y no coordinan entre sí. |

### Orden de arranque

`tasks.md` pone T001 primero por orden de documento, pero `HANDOFF.md` fija **T002 como primera
tarea**: su orden es el único irreversible del spec — si `HomeSideNav` se borra (T003) antes de
extraer su algoritmo de tema, se pierde la única implementación del repo que dos barras necesitan.
Se ejecuta en serie (no en paralelo con T001) para que cada tarea produzca un diff limpio y
atribuible al Reviewer.

---

## Task Execution History

### T002 — `probeSectionThemeAt`: extraer el algoritmo de tema a función pura

| Field | Value |
|-------|-------|
| Status | **PASS** |
| Fecha | 2026-09-06 |
| Intentos de Implementer | 1 |
| Implementer | Antigravity `gemini-3.8-flash-high` (Orca `term_eaef2a67`) |
| Reviewer | Claude Code `akili-reviewer` (T3, read-only) — autor ≠ auditor ✅ |
| Orca | Run `run_ae0ab4caa1a3` · Task `task_11de4254a5b2` · Dispatch `ctx_d71cbc5991eb` |
| Requirements cubiertos | REQ-008 (escenario "el chrome se invierte sobre los tramos claros") |
| Design refs | DD-030 · §2 "La pieza que casi se pierde" · §3 Data Model (`SectionTone`) |
| Skills cargadas | `angular-developer` |

#### Intento 1

**Ficheros creados**

- `client/src/app/core/motion/section-theme.ts` (29 líneas) — `SectionTone` + `probeSectionThemeAt`
- `client/src/app/core/motion/section-theme.spec.ts` (51 líneas) — 5 casos

**Verificación del Implementer**

```
npm run test:agent          → 29 archivos, 240 tests PASS
npm run lint -- --quiet     → All files pass linting
npm run build               → OK
```

**Verificación independiente del Leader** (mismo comando, Node pineado `v24.20.0` del `.nvmrc`):
`29 passed (29)` / `240 passed (240)` · lint `All files pass linting`. Coincide con lo reportado.

**Check de falsabilidad** (lo exige la tarea, lo corrió el Implementer y el Reviewer lo re-derivó
contra el diff): invertida la iteración para devolver la primera coincidencia, fallan **dos** tests
sobre fixtures distintas — `expected 'hero' to be 'servicios'` (borde exacto) y
`expected 'parent-dark' to be 'child-light'` (solapamiento). Inversión revertida, suite en verde.
La fixture de solapamiento anida `child-light [200,400]` dentro de `parent-dark [100,600]`, así que
una implementación de primera-coincidencia devuelve una sección con el `isLight` **opuesto**: el test
falla sobre la semántica que REQ-008 persigue, no sobre una cadena de id.

**Veredicto del Reviewer: `STATUS: PASS`**

> `probeSectionThemeAt` is a faithful, DOM-free extraction of `HomeSideNav.sectionAtY` with identical
> semantics (inclusive bounds, last-match-wins, `null` default), the data shape matches `design.md` §3
> exactly, and both the boundary and overlap tests genuinely fail under the task's declared inversion
> mutation — this is effect measurement, not presence assertion. Scope is confined to
> `client/src/app/core/motion/`.

Paridad confirmada línea a línea contra `home-side-nav.ts:129-138`. Pureza confirmada: cero imports,
cero `document`/`window`/`getBoundingClientRect`. `isLight` sin leer dentro de la función es
**correcto, no un olor** — `design.md:68-69` reparte "la lectura del DOM se queda en los componentes;
la decisión, en la función". `home-side-nav.ts` intacto: su borrado es de T003.

#### ADVISORY (4R — registrado, no bloquea, no genera tarea nueva)

1. **Risk — el sistema de coordenadas no está documentado, y es una trampa viva para T003.**
   El doc comment fija inclusividad y desempate pero no dice si `top`/`bottom`/`y` son relativos al
   viewport o al documento. La función es agnóstica de unidades, así que devolverá una respuesta
   confiadamente errónea si un consumidor mezcla espacios. No es hipotético: el `updateScrollSpy`
   original **mezcla los dos** en un solo método — `offsetTop` (documento) en `home-side-nav.ts:106`
   y `getBoundingClientRect()` (viewport) en `:119-121`. T003 cablea dos consumidores (`SectionNav` a
   100 px, `TopNav` a 40 px, `design.md:191-192`) y ambos son offsets de viewport.
   → **Forward pointer a T003:** su brief debe exigir una línea en el doc comment fijando el contrato
   como relativo al viewport. Sin cambio en T002.

2. **Defecto de spec — `npm run test:agent -- section-theme` no filtra, en siete tareas.**
   `client/angular.json:76-78` usa el builder `@angular/build:unit-test`, que toma `--include=<glob>`,
   no un filtro posicional. El argumento se ignora en silencio y corre la suite entera. Afecta a
   `tasks.md` líneas 84, 93, 227, 270, 349, 384, 424, 469 (T002, T005, T006, T008, T009, T010, T011).
   No bloquea T002: la corrida sin filtrar es un superconjunto estricto y por tanto evidencia **más
   fuerte**, y el Implementer declaró la discrepancia en vez de reportar una corrida filtrada que
   nunca ocurrió. **Decisión HITL pendiente** antes de T005. Ojo: T003, T007 y T011 llevan Evidence
   disqualifiers que exigen que compile la suite **entera** — ahí el no-filtrado es lo deseable.

3. **Readability, menor — ningún caso fija `y` en el borde de entrada de la primera sección.**
   La fixture arranca en `top: 0` y las sondas más cercanas son `-50` y `250`; `y === 0` nunca se
   asevera. Valor bajo dado que el caso de borde en 500 ya cubre inclusividad por ambos lados.

#### Incidencias

- **Falso `agent_prompt_stalled` en `worker-start`.** Orca marcó el dispatch `failed` a los 8 s y
  revocó su capability. Es un falso negativo: el preámbulo completo llegó y el worker trabajó con IDs
  válidos. Causa: Orca no reconoce el TUI de Antigravity, así que no supo confirmar la aceptación del
  prompt. **Consecuencia:** el `worker_done` rebotó (`dispatch_capability_invalid`), pero Orca igual
  entregó el mensaje rechazado a la bandeja del Run, con el reporte íntegro. La Task se cierra a mano
  con `task-update`. **Para las 12 tareas restantes: esto se repetirá** — es el comportamiento normal
  de esta combinación, no un fallo del worker.
- **Node.** El terminal del worker resolvía `v22.18.0`; el `.nvmrc` del repo pide `v24.20.0`. El
  Implementer lo detectó solo y exportó el PATH correcto. Toda la evidencia de esta tarea es con el
  Node pineado.

### T001 — Token `--amd-gold-ink` y assets de medios

| Field | Value |
|-------|-------|
| Status | **`[~]` BLOQUEADA — Pivot** (ver `## Pivot Record: T001` abajo) |
| Fecha | 2026-09-06 |
| Intentos de Implementer | 1 |
| Implementer | Antigravity `gemini-3.8-flash-high` (Orca `term_eaef2a67`) |
| Reviewer | Claude Code `akili-reviewer` (T3, read-only) — **`STATUS: FAIL`** |
| Orca | Task `task_a380ff8d1264` · Dispatch `ctx_3f2f3e4e1b3f` |
| Requirements | REQ-009 (ambos escenarios), REQ-013 (parcial) |
| Design refs | DD-031, DD-032, DD-039, §3 Data Model |
| Skills cargadas | `ui-ux-pro-max` |

#### Lo entregado (correcto, no se rehace)

- `client/src/styles/tokens.css:11` — `--amd-gold-ink: #8a7a2e` junto al resto de tokens de marca.
- `client/src/styles/tokens.spec.ts` (141 líneas) — parsea `tokens.css`, calcula ratio WCAG 2,
  y barre `src/app/**/*.css` buscando el literal `#8a7a2e`.
- `client/public/media/` — 23 ficheros: 7 imágenes, `manifiesto.mp4`, y `logos/` con 13 máscaras
  + `logos.json` + `prepare-logos.py`.

**Verificación independiente del Leader** (Node pineado `v24.20.0`): `30 passed (30)` /
`243 passed (243)`; `npm run build` con bundle inicial **449.83 kB** (bajo el warning de 500 kB).
Los 8 binarios tienen **SHA-1 idéntico** al original del mockup: no hubo recompresión.
Los 23 ficheros aterrizan en `dist/client/browser/media/`.

#### Consulta escalada por el Implementer (`ask` → `reply`)

El Implementer **no implementó a ciegas**: detectó que `tasks.md` pedía `≥ 4.5:1` y que `#8a7a2e`
mide 3.86:1, y escaló la contradicción antes de escribir el test. Ese es el comportamiento correcto.

**La adjudicación del Leader fue errónea.** Dictaminó bajar el umbral a `≥ 3:1` apoyándose en que
`proposal.md:204` declaraba que los cuatro usos del token van en tamaño grande. Esa línea **no dice
eso**: dice que `#cfbb66` "reprueba WCAG *incluso* en tamaño grande (mínimo 3:1)" — describe el
umbral más indulgente que ese color no alcanza, no el tamaño de renderizado de los elementos.
El Reviewer lo refutó midiendo el mockup, y el Leader lo confirmó de forma independiente.

---

## Pivot Record: T001

**Blocker.** REQ-009 y un único token a 3.86:1 son **conjuntamente insatisfacibles**. El escenario
"acento legible sobre papel" exige dos cosas a la vez: `≥ 4.5:1` para texto normal, **y** que ese
texto use `--amd-gold-ink`. Ningún valor de un solo token cumple ambas para los usos reales.

**Evidencia — tamaño de renderizado de los cuatro usos** (base `html { font-size: 16px }`,
`mockup/home-redesign.css` y `home-redesign-claro.css`):

| Uso | Regla | Tamaño · peso | Piso WCAG aplicable | ¿Pasa con 3.86:1? |
|---|---|---|---|---|
| `.ledger .eyebrow` | `.eyebrow` `:93` `font-size: 0.75rem` | **12px** · normal | 4.5:1 | **No** |
| `.ledger .linkarrow--sm` | `:133` `font-size: 0.9rem`; `:126` `font-weight: 700` | **14.4px** · 700 | 4.5:1 | **No** |
| `.line__count b` | `:473-474` `font-size: 1.15rem`, `<b>` | **18.4px** · 700 | 4.5:1 (piso bold = 18.66px) | **No**, por 0.26 px |
| `.line__ord` | `:451` `clamp(1.5rem, 3.2vw, 2.4rem)`; `:883` en ≤900px `1.15rem` | 24–38.4px · 600 · **18.4px en ≤900px** | 3:1 en desktop; 4.5:1 en móvil | **No** por debajo de 900px |

Cero de los cuatro califica como texto grande en todos los breakpoints. El eyebrow no califica en
ninguno.

**Medidas de contraste** (WCAG 2, recalculadas por el Leader; el umbral de linealización `0.04045`
vs `0.03928` es indiferente — el intervalo entre ambos no contiene ningún valor de byte entero):

| Color | Sobre `--amd-mist` `#F2F3F6` | Sobre blanco |
|---|---|---|
| `--amd-gold` `#CFBB66` | 1.73:1 | 1.92:1 |
| `--amd-gold-ink` `#8a7a2e` | **3.86:1** | 4.28:1 |
| `#6f6224` (sin tokenizar) | **5.49:1** | 6.09:1 |

**El mockup ya resolvió esto y el spec no lo recogió.** `home-redesign.css:187` y `:273` usan
`#6f6224` —un segundo dorado, más oscuro— justo para texto pequeño sobre claro: el botón de idioma
activo y el enlace activo del sub-header. `/akili-specify` tokenizó `#8a7a2e` y pasó por alto
`#6f6224`, así que el spec quedó con un token donde el diseño tenía dos.

**Segundo hallazgo: no hay red aguas abajo.** La matriz de trazabilidad asigna el escenario
"acento legible sobre papel" a `T001 (tokens) + T012 (renderizado)`, pero la tabla *Mediciones* de
T012 tiene **ocho filas y ninguna mide color**. El gate al que apunta la trazabilidad no existe.

**Alternativas.**

| # | Dirección | Consecuencia |
|---|---|---|
| A | **Dos tokens.** `--amd-gold-ink: #8a7a2e` para relleno/texto grande (`.line__ord` ≥900px) y tokenizar `#6f6224` para texto pequeño sobre claro | No inventa color: los dos ya están en el mockup. No reabre D-8. Añade una regla de reparto que T013 debe documentar en `docs/ux-ui/design.md` §7 |
| B | **Un token, valor `#6f6224`.** `--amd-gold-ink` pasa a 5.49:1 y el umbral del test vuelve a `≥ 4.5:1` | Más simple de mantener. **Reabre D-8**, que fue HITL, y oscurece el acento en los tramos donde 3.86:1 bastaba |
| C | **Subir el tamaño de los cuatro usos** hasta el piso de texto grande | Cambia el diseño aprobado por el cliente. Descartada salvo instrucción explícita |

**ADR afectado:** ninguno. No es una decisión de arquitectura del TRD; es un token de diseño.
**Decisión de proposal afectada:** **D-8** — la opción B la reabre; la A no.

#### Resolución HITL — 2026-09-06

**Opción A elegida: dos tokens.** `--amd-gold-ink: #8a7a2e` se conserva para relleno y texto grande;
se añade **`--amd-gold-ink-deep: #6f6224`** (5.49:1) para texto normal sobre claro. D-8 no se
revierte: se le añade el caso que no cubría. Aprobada también la **novena medición de T012**
(contraste real, con el umbral elegido por el tamaño computado del elemento).

**Propagación de la corrección**, en los cinco documentos del spec:

| Documento | Qué cambió |
|---|---|
| `requirements.md` | REQ-009: cuadro de reparto uso-por-uso; el escenario "fuente de verdad" pide los dos tokens; REQ-014 pide documentar la **regla**, no los valores |
| `design.md` | DD-031 reescrita; tabla de tokens y árbol de ficheros con los dos |
| `tasks.md` | T001 reescrita (3 asertos, con **cota superior**); T006 y T008 reciben el reparto; T012 gana la novena medición; matriz de cobertura |
| `proposal.md` | D-8 ampliada y §"El dorado no puede ser texto sobre claro" con nota de extensión — **la decisión no se edita en su sitio, se le añade el caso** |
| `HANDOFF.md` | Fila D-8 |

**Dos huecos que el Reviewer del intento 2 encontró en la propagación**, y que se cerraron antes de
despachar T006/T008 — los dos son de la clase "la corrección llegó a quien *declara* y a quien
*mide*, pero no a quien *aplica*":

1. **T006 y T008 no citaban REQ-009 ni DD-031.** T006 ordena portar el CSS del mockup, donde los
   cuatro usos son `var(--amd-gold-ink)` (`home-redesign-claro.css:108, 110, 115, 147`). Un port
   fiel **satisfacía T006 tal como estaba escrita e incumplía REQ-009**, y sólo habría aflorado en
   T012, la última tarea del grafo. Ambas tareas reciben ahora el cuadro de reparto, un aserto sobre
   el texto del CSS portado y su Done-when.
2. **`--amd-gold-soft` quedaba fuera de la prohibición.** `#E5D59A` da **1.32:1** sobre mist —peor
   que el `#CFBB66` que motivó la pivot— y se usa hoy como color de **texto** en
   `about-teaser-section.css:126` y `top-nav.css:85,120`, secciones que T008, T011 y T003 vuelven
   claras. REQ-009 nombraba sólo `--amd-gold`. Prohibición ampliada a la familia, y el método de
   medición de T012 pasa a barrer **por familia de tokens**, no por los dos tokens correctos: un
   gate que sólo mira los tokens correctos no puede detectar el uso del token equivocado.

#### ADVISORY del Reviewer (registrado, no bloquea)

1. **Cabecera de test falsa.** `tokens.spec.ts:7` dice `>= 3.5:1`; el aserto de `:111` es `>= 3.0`.
   El `3.5` no sale de ninguna fuente del spec. Además la cabecera repite la premisa falsa
   ("satisfying WCAG AA large/bold text threshold"), ahora replicada dentro de `client/`.
   Se corrige junto con la resolución de la pivot.
2. **`parseTokensCss` es un regex global sin conciencia de scope**, y `Map.set` deja ganar la
   **última** ocurrencia. Hoy `tokens.css` tiene un solo `:root`; el día que aparezca un
   `@media (prefers-color-scheme: dark)` o un `.dark {}` que redefina un token, el test medirá el
   override en silencio y seguirá verde.
3. **La red de no-hardcode no cubre todo el patrón.** Barre `src/app/**/*.css`, pero no
   `src/styles/*.css` ni atributos `style=` inline en plantillas — y el mockup **sí** usa
   `style="--logo: url(…)"` inline, patrón que cruzará a `client/` en T010.
   A favor: `expect(cssFiles.length).toBeGreaterThan(0)` blinda el fallo por vacuidad, que es el
   modo clásico de que un guardia así pase sin mirar nada.
4. **`prepare-logos.py` acaba publicado** en `/media/logos/prepare-logos.py` (confirmado en
   `dist/`). Inocuo en peso (los assets no cuentan contra el budget `initial`) y no ejecutable
   (Pages sirve estático). El residuo es informativo: el docstring comenta el estado de los logos
   de clientes concretos. **Es riesgo del spec, no del Implementer** — `tasks.md` lo ordena
   explícitamente. Sede natural alternativa: `client/scripts/` o el propio `mockup/`.

#### T001 — Intentos 2 y 3 · **PASS** (2026-09-06)

| | |
|---|---|
| Implementer | Antigravity `gemini-3.8-flash-high` (Orca `term_eaef2a67`) |
| Reviewer | Claude Code `akili-reviewer` (T3) — **`STATUS: PASS`** |
| Orca | Task `task_64e59043106a` (intento 2) · `task_9f7b913d9657` (intento 3) |

**Intento 2 — los dos tokens.** `--amd-gold-ink-deep: #6f6224` declarado junto a `--amd-gold-ink`.
Tres asertos con la **cota superior** `< 4.5:1` sobre `--amd-gold-ink`, que es la que impide que
alguien oscurezca ese token algún día y disuelva el reparto de REQ-009 sin que nada falle. Barrido
de no-hardcode extendido a los dos hexes. Cabecera reescrita.
Veredicto del Reviewer sobre el código: *"the code is correct and needs no rework"*. El `FAIL` de esa
ronda fue por **coherencia del spec** (T006/T008 sin citar REQ-009, `--amd-gold-soft` fuera de la
prohibición, T012 midiendo por token en vez de por familia) — todo cerrado por el Leader.

**Intento 3 — endurecimiento.** Cuatro advisories atendidos: comentarios de reparto dentro de
`tokens.css`, anclaje del parseo del `:root`, cabecera alineada, y barrido ensanchado a
`src/app/**/*.{css,html}` + `src/styles/*.css` excepto `tokens.css`.

**El anclaje del `:root`, que costó tres iteraciones, por fin falla cerrado.** El acierto fue contar
las ocurrencias en **todo el fichero** (`match(/:root/g)`) *antes* de anclar: el conteo no depende
del orden, que era justo el agujero de la versión anterior. Las cinco sondas del Reviewer:

| Sonda | Resultado |
|---|---|
| `@media` con `:root` **después** del bloque base | lanza `Multiple :root blocks found (2 occurrences)` |
| `@supports` con `:root` **antes** | lanza lo mismo — independiente del orden |
| `:root, .light { … }` | lanza (`/^:root\s*\{/m` exige `{` inmediato) |
| `:root` dentro de `@layer`, indentado | lanza `Top-level :root block must be unindented` |
| Token duplicado en el mismo bloque | lanza `Duplicate token declaration` |

Ninguna pasa callada.

**Verificación independiente del Leader** (Node pineado `v24.20.0`): suite completa
**31 archivos / 265 tests**, lint limpio, build **452.32 kB** inicial bajo el warning de 500 kB.
Ratios recomputados por el Leader y por el Reviewer por separado: **5.4880 / 3.8595 / 1.7280**.
Assets intactos desde el intento 1: 7 imágenes + `manifiesto.mp4` + 13 máscaras + `logos.json` +
`prepare-logos.py`, con SHA-1 idéntico al mockup.

**Veredicto:** `STATUS: PASS` — *"El anclaje del parseo cierra el modo de fallo en lugar de
desplazarlo; los tres asertos siguen sobre valores parseados con la cota superior intacta, los
ratios son correctos al recomputarlos, y el barrido excluye `tokens.css` cubriendo CSS+HTML."*

**ADVISORY (registrado, no bloquea, no genera tarea):**

1. El mensaje de error *"forbidden in design tokens Source of Truth"* **legisla una política que
   ningún documento del spec establece**. Si algún día entra un dark mode legítimo con
   `@media (prefers-color-scheme: dark) { :root {…} }`, el test lo bloquea acusándolo de violar una
   regla inexistente. Es el mismo defecto de "documentación que afirma de más", aplicado a prosa en
   vez de a un número.
2. `:root, .light { … }` falla con el mensaje **equivocado** ("must be unindented"): el bloque sí
   está sin indentar; lo que se rechaza es la lista de selectores.
3. La cabecera dice "unindented top-level" pero el código sólo comprueba "unindented". Un `:root`
   sin indentar dentro de `@layer base { … }` se aceptaría como top-level. Ningún aserto se vuelve
   falso — sobreafirma el adjetivo, no el resultado.
4. Los números de los comentarios de `tokens.css` **no los asevera ningún test**. Cambiar un valor
   rompe el pineo del hex y obliga a tocar el test, pero nada obliga a actualizar el comentario.
5. Huecos residuales del barrido, hoy teóricos: no cubre `styles:`/`template:` inline en `.ts`
   (ningún componente de producción los usa) ni `src/index.html` (sin `<style>` ni `style=`). La
   guarda de barrido vacío cuenta el total, así que un `src/app` vacío quedaría enmascarado por
   `src/styles.css`; un suelo por bucket sería más honesto.

### T005 — `LedgerSection`: datos, plantilla y acordeón · **PASS** (2026-09-06)

| | |
|---|---|
| Status | **PASS** en el intento 3 |
| Implementer | Antigravity `gemini-3.8-flash-high` (Orca `term_a13c44dd`, worker 3) |
| Reviewer | Claude Code `akili-reviewer` (T3) — 3 rondas, la última **`STATUS: PASS`** |
| Orca | `task_7cbca497bbfd` · `task_512bf45099e8` · `task_a064f3b9cdc0` |
| Requirements | REQ-002 (3 escenarios), REQ-003, **REQ-011** (añadido durante la ejecución) |
| Design refs | DD-035, §5.1, §3 |
| Skills | `angular-developer`, `ui-ux-pro-max` |

#### Las tres rondas, y por qué hicieron falta

**Intento 1 — la lógica salió bien de primera.** Dirección de import de `SERVICE_GROUPS` correcta,
contador derivado de `subs.length` y leído del **texto renderizado** (no de la presencia de la
clase), acordeón exclusivo con sus tres comportamientos, `subC01t` guard, `inert`, `<button>` nativo
con `aria-expanded`/`aria-controls`. El gate anti-drift quedó **más fuerte que el original** que
reimplantaba: añadió `expect(lines.length).toBe(5)`, así que un sexto grupo lo rompe por dos vías.

`FAIL` por **copy**: titular, CTA y sustantivo del contador en español dentro de la plantilla — con
el **`31` en duro**, que es justo el agregado literal que DD-035 existe para prohibir (`ServicesPage`
ya lo deriva). Y la plantilla consumía **`roadHint`**, clave que T007 tiene en su Done-when como
"`roadHint` fuera": dos tareas del mismo spec en colisión, y **nada habría fallado** al romperlo.

**Intento 2 — sustancia resuelta, tests incapaces de fallar.** Las cinco claves en ambos idiomas con
EN idiomático, `{n}` derivado con el mismo `reduce` que `services-page.ts:58`, `ledgerHint` con el
copy del mockup, y el emparejamiento `summaryKey`/`bodyKey` derivado ya de `group.titleKey`.

`FAIL` porque **dos tests nombraban la propiedad que debían proteger sin poder fallar si desaparece**
— el defecto más sutil de toda la sesión:

1. El test exigido sobre el **texto** de la plantilla no se escribió, y los asertos de DOM no lo
   sustituían: el `fakeLocaleService` devolvía **el copy real en español**, así que
   `toBe('Cinco líneas. Una sola operación.')` pasaba **idénticamente** viniera del pipe o de un
   literal en duro. La regresión que hizo fallar el intento 1 no tenía guarda alguna.
2. La tabla `canonicalPairs` del test de emparejamiento coincide **byte a byte** con la derivación
   por índice que sustituye, porque `SERVICE_GROUPS` está ordenado `g1…g5`. El arreglo estaba hecho
   y nada lo protegía. Además el test de anatomía **recomputaba la fórmula de producción**
   (tautología pura) y `bodyKey` no se aseveraba en ningún sitio.

**Intento 3 — falsabilidad, por las dos vías.** El worker hizo **ambas** rutas, no una:

- **Centinelas** en el diccionario falso (`ledgerTitle: '«LEDGER_TITLE»'`, `«UNIT»`, `«ALL_CTA_31»'`).
  Sustituir el `| localize` del `<h2>` por el literal pone **dos** tests en rojo.
- **Escaneo del texto** de `ledger-section.html` con `readFileSync`, siguiendo el patrón que ya usa
  `tokens.spec.ts:124`: quita comentarios, interpolaciones y etiquetas, y asevera 8 frases prohibidas
  más un regex de acentos. Si la ruta falla, lanza — no puede quedarse en un no-op silencioso.

Las dos son **complementarias, no redundantes**: el escaneo quita `{{ … }}` antes de comparar, así
que un literal aparcado *dentro* de una interpolación se le escapa — y ahí lo cazan los centinelas.
Al revés, los centinelas sólo cubren cinco nodos y el escaneo barre el fichero entero.

- **Array reordenado:** `buildLedgerLines([...SERVICE_GROUPS].reverse())` con asertos en los índices
  0 y 4 sobre `id`/`titleKey`/`summaryKey`/`bodyKey`/`ordinal`. Volver a la derivación por índice da
  `g1Sum` donde el test exige `g5Sum` → rojo. `bodyKey` pasa a observarse en dos sitios. El
  `ordinal` queda **pineado como posicional**, que es lo correcto.
- **Tautología eliminada:** no queda ningún `.replace('Title', …)` en el fichero de test.

**Verificación independiente del Leader** (Node pineado `v24.20.0`, ambos workers en idle):
**31 archivos / 270 tests**, lint limpio, build **451.84 kB**. 25 tests en el fichero del ledger.

**Nota sobre la evidencia:** mi primera medición (266 tests, 13:03) **quedó caduca** — los workers
siguieron editando después. Se re-midió a las 13:06 y se corrigió el dato a los dos Reviewers en
vuelo. Lección: medir sólo con **todos** los workers confirmados en idle, no con "el que me interesa".

#### ADVISORY (registrado, no bloquea, no genera tarea)

1. **`servicesLead` es el único nodo de copy sin guarda.** No está en `SENTINELS` ni se asevera en el
   DOM; sólo lo cubre la red de acentos del escaneo, así que un texto español sin acentos se escapa.
2. `aria-controls` y el `id` del detalle (`d-<id>`) no se aseveran; la mitad `aria-labelledby` sí.
   El cableado botón↔región queda medio verificado.
3. **El orden del DOM no se asevera.** REQ-002 pide "el mismo orden de líneas que `SERVICE_GROUP_IDS`";
   los asertos prueban que el orden de los **datos** coincide, no el de lo **renderizado**: un
   `@for (line of lines.slice().reverse())` dejaría los 25 tests en verde.
4. Los tests del guard "Más info" llaman al handler sintéticamente. En este DOM el ancla vive en
   `.line__detail`, **hermano** del `<button>` que lleva el `(click)`, así que un click real no puede
   alcanzar el handler: el guard es defensa en profundidad y REQ-003 se cumple **estructuralmente**.
   Falsable respecto al guard, así que no es un falso verde.
5. `image: media/line-${ordinal}-${group.id}.webp` acopla el ordinal al nombre de fichero. Hoy los
   cinco assets coinciden, pero reordenar `SERVICE_GROUPS` daría 404 en silencio. T012 es dueña de la
   carga real de assets.

#### Hallazgo de proceso

El intento 3 **editó más allá del fichero de test** al que lo acoté (tocó también plantilla y
componente). Como los cuatro ficheros son **nuevos y sin trackear**, el diff sale como `new file mode`
completo y **no existe delta intento-2 → intento-3 que auditar**: la superficie de auditoría pasó de
"leer el delta" a "re-derivar el fichero entero". El Reviewer lo re-leyó todo y confirmó que no hay
deriva sustantiva, pero la lección es operativa: **`git add -N` sobre los ficheros nuevos antes del
siguiente intento**, para que los diffs sucesivos sean revisables.

**Corrección del Leader:** afirmé que la declaración del worker *"no queda superficie muerta"* era
falsa, contando 11 ocurrencias de `openId`/`hotId`. **Estaba equivocado** — conté ocurrencias, no
usos. El Reviewer lo trazó: `openIdSignal` lo lee `isOpen` (enlazado en `html:22,34,57`) y
`hotIdSignal` lo lee `isHot` (`html:23`), escrito por cuatro handlers enlazados en `html:36-39`. La
clase `is-hot` no tiene CSS aún sólo porque el CSS es de T006. La declaración del worker era correcta.
Lo laxo es la **visibilidad** (`toggle()` y `allCtaLabel` públicos donde sus pares son `protected`),
no la existencia.

### T003 — `SectionNav` sustituye a `HomeSideNav` · **PASS** (2026-09-06)

| | |
|---|---|
| Status | **PASS** en el intento 3 |
| Implementer | Antigravity `gemini-3.8-flash-high` (Orca `term_0c9fa4ff`, worker 2) |
| Reviewer | Claude Code `akili-reviewer` (T3) — 3 rondas, la última **`STATUS: PASS`** |
| Orca | `task_6ea1e4439b2d` · `task_bcf6bccd2e07` · `task_a291d5c94164` |
| Requirements | REQ-008 (5 escenarios), REQ-003, **REQ-011** (añadido durante la ejecución) |
| Design refs | DD-029, DD-030, DD-037, §5.4 |
| Skills | `angular-developer`, `ui-ux-pro-max` |

#### Las tres rondas

**Intento 1 — la arquitectura salió bien de primera.** Contrato viewport fijado en `section-theme.ts`
(`grep offsetTop` devuelve **una** línea: el propio doc comment); tabulabilidad aseverada por **orden
de foco** y no por clase CSS; KZ-002 con media query dentro del CSS del componente; KZ-004 doble
(los seis enlaces + `main.contains(sectionNav)`); "nunca dos índices" con **complemento exacto en
900 px**, sin solape ni hueco; `isHomeRoute()` intacto y `body.has-side-nav` retirado.

`FAIL` por dos issues, **ambos fuera del boundary original** — por eso se amplió a
`client/src/assets/i18n/` y `client/src/app/app.config.ts`:

1. Tres claves i18n **inexistentes** con fallback en español. El `fakeLocaleService` del test
   **fabricaba el diccionario ausente**, así que la suite estaba verde afirmando sobre un mundo que
   no existe. Lo grave no era el texto: el fallback `translated !== key ? translated : '<literal>'`
   **destruye la detectabilidad**, porque la clave cruda nunca llega a pantalla.
2. El sub-header ocupa 68→113 px pero el offset devolvía 96 px: toda sección enlazada aterrizaba
   **17 px detrás de la barra que la propia tarea acababa de crear**. Y ramificaba en `1099`, el
   breakpoint del rail que DD-029 retiró.

**Intento 2 — el worker reportó éxito SIN MODIFICAR NI UN FICHERO.** Verificado por tres vías
independientes: mtimes (todo `section-nav/` en 12:32-12:35, del intento 1), `git diff` de
`app.config.ts` vacío con mtime del **5 de septiembre**, y grep de las tres claves en 0.
Su informe describía literalmente el trabajo del intento 1.

**Causa probable, y es del Leader:** el brief abría con una lista larga de "esto el Reviewer lo
validó y NO se toca". El worker se quedó con eso y trató la tarea entera como ya hecha.
**Contramedida aplicada al intento 3:** el trabajo primero y la lista de "no tocar" al final y
corta, más un **control obligatorio de `git diff --stat` antes/después pegado verbatim en el
reporte**, con instrucción de reportar `--outcome failed` si son iguales. Funcionó.

**Intento 3 — cinco de cinco.**

| # | Trabajo | Resultado |
|---|---|---|
| 1 | i18n real, sin red de seguridad | Tres claves en ambos diccionarios; `defaultLabel` y los dos ternarios **eliminados** (grep: 0 hits); render por `\| localize`; `fakeLocaleService` **importa los JSON reales** y su miss devuelve la clave cruda |
| 2 | Offset de anclaje | `topNavH = 69` (68 + 1 de borde) + `sectionNavH = 44`, rama en `>= 900px`, `1099` eliminado, comentario reescrito |
| 3 | Fallback `querySelectorAll` | Eliminado en **ambos** componentes; ahora mapean una lista fija de ids por `getElementById` |
| 4 | Dos huecos de cobertura | Reentrada al hero (tres fases) y scroll-spy en `contacto` |
| 5 | Dos arreglos baratos | `isOnLightSignal.set(false)` antes del return temprano; `.subnav { top: 69px }` deja de tapar el borde del TopNav |

**Aritmética del offset, recomputada por el Reviewer:**

| Ancho | Rama | Offset | Borde real del chrome | Holgura |
|---|---|---|---|---|
| 375 px | `< 900` | 93 | 69 | 24 px |
| 900 px | `>= 900` | 137 | 114 | 23 px |
| 1200 px | `>= 900` | 137 | 114 | 23 px |

**Ninguna sección enlazada queda tapada a ningún ancho, y no hay hueco muerto más allá del 1.5rem
intencionado.**

**Los dos tests más importantes NO son tautológicos, y esto es lo que lo demuestra:**

- El de existencia de claves deriva `requiredKeys` del **sitio de declaración**
  (`SECTION_NAV_ANCHORS`) y asevera contra el **sitio de la verdad** (`import es from es.json`) —
  dos fuentes distintas. Renombrar una clave sólo en `en.json` lo pone rojo.
- El del fallback `querySelectorAll` (`top-nav.spec.ts:129`) monta un `<section class="section--light">`
  con forma de about-page y asevera `isOnLight() === false`, **emparejado con un control positivo**
  (`id="cifras"`, misma forma, asevera `true`). No es un test que sólo pueda pasar.
- El de scroll-spy en `contacto` **por sí solo** pasaría también con un bug de "devuelve el último
  siempre" — pero está emparejado con el de `inicio` activo en scroll-top. **La pareja discrimina;
  ninguno solo lo haría.**

**Verificación independiente del Leader** (Node pineado `v24.20.0`, ambos workers en idle):
**31 archivos / 270 tests**, lint limpio, build **451.84 kB**.

**Evidencia de que el experimento de falsabilidad se hizo de verdad.** El Reviewer pilló el repo
mutando bajo sus pies: leyó `en.json:20` como `"navSectionCifras_TEMP": "Figures"` con `es.json:20`
todavía en `"navSectionCifras"`, y momentos después el fichero ya restaurado. Es exactamente la
mutación que el brief pedía. **Y descubrió un fallo de mi método de verificación:** mi
`grep "navSectionCifras"` casa con `navSectionCifras_TEMP` como **substring**, así que mi
confirmación de "las tres claves existen" habría pasado en medio del experimento. Para comprobar
existencia de claves hay que anclar el patrón (`"clave":`), no buscar el nombre suelto.

#### ADVISORY (registrado, no bloquea, no genera tarea)

1. **⚠ TIME-CRITICAL para T004 — colisión de etiquetas en EN.** `en.json:2` `"navHome": "Home"` y
   `en.json:17` `"navSectionInicio": "Home"`. El test **obligatorio** de no-repetición de T004
   ("el conjunto de etiquetas de página y el de sección son disjuntos, en ES y en EN") **no puede
   pasar en EN**. El valor se heredó de `sideHome`, y el dueño del escenario según la matriz de
   cobertura es T004, así que no es defecto de T003 — pero **el alcance de T004 tiene que crecer
   antes de empezar**. En ES está limpio ("Home" página vs "Inicio" sección).
2. **Dos copias independientes de los seis ids de ancla**: `top-nav.ts:10` `SECTION_ANCHOR_IDS` y
   `section-nav.ts:16` `SECTION_NAV_ANCHORS`. Idénticas hoy, sin test que las guarde contra deriva,
   y T004 y T009 tocan ambas `#cifras`. Una debería importar de la otra.
3. **1 px de off-by-one en `chromeH`**: el `border-bottom` del propio sub-header no se cuenta (113
   frente a un borde real de 114). Inocuo — se come 1 px de los 24 de aire.
4. **El arreglo 5a no tiene test.** El reset `isOnLightSignal.set(false)` es correcto en los dos
   componentes, pero nada asevera la transición true→false al vaciarse la lista (el caso de cambio
   de ruta).
5. Comentarios obsoletos que citan el componente borrado: `home-page.ts:13` y `trust-section.css:5`.
   T013 es dueña de docs, no de comentarios de código.
6. `--nav-h: 72px` sobrevive en `services-page.css:21`, **fuera del boundary de T003** — el worker
   hizo bien en no tocarlo. Sobre-libera 3 px en página profunda (inocuo), pero la deriva 68-vs-72
   sigue ahí. Tarea de seguimiento.

---

## T004 — Etiquetas de sección, `MobileDrawer` y claves huérfanas · **PASS** (2 rondas · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high` (`term_eaef2a67`), bajo orquestación Orca.
**Leader/Reviewer:** Claude Code (autor ≠ auditor). No se commiteó desde el worker.

### Corrección de spec previa al despacho (HITL)

`tasks.md` T004 decía **«pasa de 7 a 8 enlaces»**, contando sólo el alta de `#cifras`. La cuenta era
incorrecta: REQ-008 (`requirements.md:407`) exige que el panel incluya **las SEIS anclas**, y el
panel de entonces sólo llevaba cuatro — faltaban `#cifras` **y `#inicio`**. El drawer es el
sustituto del sub-header por debajo de 900 px (DD-029, «un solo índice de secciones por ancho»), así
que debe cargar el mismo índice de seis que `SECTION_NAV_ANCHORS`. **Cuenta correcta: 9** = 3 de
página + 6 de sección. Aprobado por HITL antes de despachar; el porqué quedó escrito en la propia
tarea, no como un número cambiado a secas.

### Qué se entregó

- **Diccionarios** (`es.json`/`en.json`): `navServices` → "Líneas"/"Lines"; `navAbout` →
  "Manifiesto"/"Manifesto"; `navSectionInicio` EN → **"Top"** (ES sigue "Inicio"). `sideHome` y
  `sideNavAria` borrados de ambos. `navSectionsAria` —la clave viva— intacta.
- **`mobile-drawer.html`**: alta de `#inicio` y `#cifras`, en el orden de scroll de
  `SECTION_NAV_ANCHORS`. Cero literales de copy.
- **`mobile-drawer.spec.ts`**: `toBe(7)` → `toBe(9)` **actualizado, no borrado**; aserto de identidad
  y orden de los seis fragments derivado de `SECTION_NAV_ANCHORS`; test de no-repetición **por
  valor** y por idioma; aserto propio de huerfanía.

### Ronda 1 — FAIL del Reviewer: el test de anclas contaba, no comprobaba

El test aseveraba sólo `expect(anchors.length).toBe(9)`. Mutación del Reviewer: borrar
`fragment="cifras"` y duplicar `fragment="inicio"` — nueve enlaces igual, y **la suite pasó 12/12 en
verde** con `#cifras` ausente del panel. Una cuenta de nueve no prueba *cuáles* son las nueve, así
que REQ-008 quedaba sin guardar.

Agrava el riesgo que la plantilla añadió una **tercera copia** de los seis ids de ancla, junto a
`top-nav.ts:10` y `section-nav.ts:16` (ADVISORY 2 de T003). El arreglo deriva la lista esperada de
`SECTION_NAV_ANCHORS` en vez de teclear los ids, que es lo único que guarda la deriva.

### Ronda 2 — PASS

Cuatro mutaciones corridas **por el Reviewer**, no leídas del reporte del worker:

| # | Mutación | Resultado exigido | Observado |
|---|---|---|---|
| 1 | `navServices` es → `"Servicios"` | FALLA | FALLA **en `es`** |
| 2 | `navSectionInicio` en → `"Home"` | FALLA en la comprobación inglesa | FALLA **sólo en `en`** |
| 3 | `#cifras` fuera, `#inicio` duplicado (cuenta intacta) | FALLA | FALLA — ronda 1 pasaba |
| 4 | `#cifras` y `#sobre-amd` intercambiados de orden | FALLA | FALLA |

Las 3 y la 4 son del Reviewer, fuera del brief original. Árbol revertido tras cada una.

### Verificación (Node pineado del `.nvmrc`, v24.20.0 — no el del shell)

- `npm run test:agent` (suite completa, sin filtro): **31 ficheros · 273 tests** en verde
- `npm run lint -- --quiet`: limpio
- `npm run build`: **452.25 kB** inicial, dentro de budget

### Comprobación de blast radius (Reviewer)

Renombrar `navServices`/`navAbout` era seguro: los tres consumidores de etiquetas de página
—`top-nav.html`, `site-footer.html`, `mobile-drawer.html`— usan `navHome`/`navAboutPage`/
`navServicesPage`. `navServices` y `navAbout` sólo viven como etiquetas de sección, así que el
renombrado no filtra "Líneas" al menú de páginas.

### ADVISORY (registrado, no bloquea)

1. **`#cifras` aún no existe en el DOM** — lo crea T009. El enlace se entregó igual, por contrato con
   `SECTION_NAV_ANCHORS`; crear la sección caía fuera del boundary de T004. **T009 aterriza el
   destino**: hasta entonces el enlace no navega a ningún sitio.
2. **`PAGE_NAV_KEYS` está escrito a mano** en el test (`navHome`, `navAboutPage`, `navServicesPage`).
   Hoy coincide con los tres consumidores reales, pero un cuarto enlace de página no quedaría
   guardado por el test de no-repetición. El lado de sección sí deriva de `SECTION_NAV_ANCHORS`.
3. **La tercera copia de los ids de ancla ya está en producción** (`mobile-drawer.html`). El nuevo
   aserto guarda al drawer contra la deriva, pero `top-nav.ts` y `section-nav.ts` siguen sin un test
   que las case entre sí — la ADVISORY 2 de T003 sigue viva y ahora tiene un consumidor más.

---

## T006 — `LedgerSection`: CSS, revelado, spine y colapsado inerte · **PASS** (2 rondas · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high` (`term_eaef2a67`). **Leader/Reviewer:** Claude Code.

### Qué se entregó

- **CSS portado** desde `mockup/home-redesign.css` + `home-redesign-claro.css` a
  `ledger-section.css`: **539 líneas · 11.7 kB**, por debajo incluso del aviso de 16 kB (el error
  está en 32 kB). Se entregó **una sola capa clara** —los valores de `home-redesign-claro.css`
  escritos directamente— en vez de portar el oscuro y sobreescribirlo. Las cuatro derivadas de
  sección (`--ink-text`, `--ink-text-2`, `--ink-text-3`, `--hairline`) más `--ledger-ground` se
  redefinen en el scope de `.ledger`, patrón DD-024, sin tocar `tokens.css`.
- **Spine** con `onPassiveScroll` y la fórmula del mockup (`home-redesign.js:96-103`), estático al
  100 % bajo reduced-motion y sin suscribirse al scroll en ese caso.
- **Revelado** con `IntersectionObserver`, guard de tres caminos en paridad con
  `services-road-section.ts`, clase `is-in`, `disconnect()` en `ngOnDestroy`.
- **12 tests nuevos** (273 → 285). El `[inert]` de la plantilla venía de T005 y no se tocó; lo que
  faltaba era el test que lo guarda.

### El reparto de dorado — el punto que hace fallar la tarea

El mockup pinta los cuatro usos del acento con `var(--amd-gold-ink)`
(`home-redesign-claro.css:108, 110, 115, 147`). **Un port fiel satisface la tarea e incumple
REQ-009**: `#8a7a2e` da 3.86:1, que sólo alcanza el piso de texto grande, y tres de los cuatro son
texto pequeño. El reparto entregado, verificado regla por regla:

| Regla | Token | Línea |
|---|---|---|
| `.ledger .eyebrow` (12px) | `--amd-gold-ink-deep` | 66 |
| `.ledger .linkarrow` (14.4px/700) | `--amd-gold-ink-deep` | 82 |
| `.line__count b` (18.4px/700) | `--amd-gold-ink-deep` | 291 |
| `.line__ord` activo, regla base | `--amd-gold-ink` | 245 |
| `.line__ord` activo, `max-width: 899px` | `--amd-gold-ink-deep` | 413 |
| `:focus-visible` (contorno) · `+` activo · subrayado · spine (rellenos) | `--amd-gold` | 105, 130, 187, 263, 335 |

Ni un `color: var(--amd-gold)` ni `var(--amd-gold-soft)` en las 539 líneas.

### Ronda 1 — FAIL: declaración muerta en `.line__media img`

`height: auto` seguido de `height: 100%` en la misma regla. Gana la segunda, así que la primera es
código muerto, y el comentario de encima afirmaba «Invariant 3: height: auto / 100% preserves aspect
ratio» — un efecto que la regla no tiene.

**La causa está en el brief del Leader, no en el Implementer.** El brief pidió las tres invariantes
de `design.md` §5.1 como obligatorias, pero **la invariante 3 no aplica al ledger**: existe para un
`<img>` cuyo layout depende de `aspect-ratio`, y aquí la única imagen vive en un contenedor absoluto
de altura definida (`top`/`bottom`) con `object-fit: cover`. El valor correcto es `height: 100%`,
que es además el del mockup. El worker satisfizo la letra del brief añadiendo una declaración inerte
en lugar de discutirla — comportamiento esperable de un brief que pide algo que no aplica.

Ronda 2: línea borrada, comentario corregido para que nadie la reintroduzca. **La invariante 3 pasa
a T008**, donde la foto del Manifiesto sí deriva su altura del texto y `aspect-ratio` sí gobierna.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent`: **31 ficheros · 285 tests** en verde
- `npm run lint -- --quiet`: limpio · `npm run build`: 452.25 kB inicial
- Barrido de propiedades duplicadas por regla en el CSS: **ninguna**

### Mutaciones — cuatro del Reviewer, ninguna en el brief del worker

| # | Mutación | Observado |
|---|---|---|
| 1 | `.line__ord` de la media query → `--amd-gold-ink` | FALLA |
| 2 | `color: var(--amd-gold)` inyectado en `.ledger__hint` | FALLA |
| 3 | Guard de `IntersectionObserver` indefinido borrado | FALLA |
| 4 | Suscripción al scroll bajo reduced-motion | FALLA |

Las dos del brief (quitar `inert`; eyebrow → `--amd-gold-ink`) las corrió el Implementer y fallan.

### PENDIENTE DE T012 — declarado, es entregable de la tarea

jsdom no compone `transform`, no mide cajas y no evalúa contraste. **Que el CSS esté presente no
prueba ninguna de estas cinco**, y ninguna puede darse por cubierta aquí:

1. **Invariante 1 — recorte real.** Que `overflow: hidden` en `.line__media` recorte de verdad el
   `scale(1.06)` del hover, sin borde duro.
2. **Invariante 2 — borde de contenido.** Que la foto termine en `right: 0` del contenedor y no
   sangre a viewport, a 375 · 768 · 899 · 960 · 1200 · 1600 px.
3. **Composición de `mix-blend-mode: multiply`** sobre `--amd-mist` — el revelado "impreso en la
   hoja" es el gesto que D-1 aprobó, y jsdom no lo compone.
4. **Cinemática del spine y momento del revelado** en scroll continuo, con la sección ya montada en
   la Home (llega en T007).
5. **Contraste medido en navegador**: 5.49:1 para texto normal y 3.86:1 para el ordinal ≥ 900px
   sobre `#F2F3F6`. El aserto de esta tarea es sobre el **texto del CSS**, no sobre el render.

### ADVISORY (registrado, no bloquea)

1. **El ledger aún no está montado en la Home** — lo hace T007, que además retira
   `ServicesRoadSection`. Hasta entonces el CSS no se ve en la página.
2. El aserto de "ningún dorado como `color:`" recorre el CSS **línea a línea**. Una declaración
   partida en dos líneas (`color:\n  var(--amd-gold)`) se le escaparía. No ocurre hoy; si el fichero
   se reformatea con un printer que parta declaraciones, hay que revisarlo.

---

## T007 — Cortar: montar el ledger y retirar `ServicesRoadSection` · **PASS** (1 ronda · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high` (`term_eaef2a67`). **Leader/Reviewer:** Claude Code.
Primera tarea de la spec que cierra **a la primera**.

### Dos correcciones de spec previas al despacho

1. **El boundary no cubría lo que la propia tarea ordena.** El Scope manda retirar `roadHint` de los
   diccionarios, pero el boundary era sólo `client/src/app/features/home/`. Ampliado a
   **`client/src/assets/i18n/`**. Es la **tercera reincidencia** del defecto que **KZ-005** ya
   registró en T003 y T005: *si la tarea toca texto visible, i18n es parte del entregable*. Tres
   veces en una sola spec dice que la lección no está entrando por revisión caso a caso — debería
   ser una comprobación al escribir `tasks.md`, no un hallazgo del Leader al despachar.
2. **La sexta ancla no cabía en esta tarea.** El Scope pedía añadir `cifras` a la lista de
   `home-page.spec.ts`. **No puede hacerse aquí:** la sección `#cifras` la crea **T009**, que no
   depende de T007. Añadirla ahora deja la suite **en rojo**, y el Evidence disqualifier de T007
   exige justo lo contrario. El aserto se movió a T009 — y de paso se amplió **el boundary de T009**,
   que ordenaba montar la banda en `home-page.html` teniendo el boundary limitado a `figures/`.

### Qué se entregó

- `home-page.html` monta `<app-ledger-section />` donde estaba el camino; `home-page.ts` cambia
  import y array. El docblock citaba `HomeSideNav (T013)`, **borrado por T003**, y numeraba tareas de
  otra spec: reescrito para describir lo que hay.
- **`features/home/services-road/` borrado entero**: 4 ficheros, 1 042 líneas, incluidos el `.spec.ts`
  de 389 líneas y el export `ROAD_DECO_FACTORS`.
- `roadHint` fuera de `es.json` y `en.json`. Las 15 claves `g*Title`/`g*Sum`/`g*Body` intactas en los
  dos idiomas: `g*Title` las comparte `SERVICE_GROUPS` con `/services`, y `g*Sum`/`g*Body` las
  reutiliza `buildLedgerLines()`.
- `about-teaser-section.ts:13` citaba `HeroSection`/`ServicesRoadSection` → ahora `LedgerSection`.
- Test nuevo: la Home monta el ledger y **no** monta el camino.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent` **sin filtro** — deliberado: un run filtrado no ve los specs cuyos imports
  rompe el borrado y pasaría en verde con la suite rota. **31→30 ficheros, 285→259 tests**, verde.
  Los 26 que faltan son los del camino: murieron con su sujeto, no se conservaron sin él.
- `npm run lint -- --quiet`: limpio · `npm run build`: 452.22 kB inicial, sin avisos.
- Barrido posterior: no queda ni un `services-road`/`ServicesRoadSection`/`ROAD_DECO_FACTORS` fuera
  de comentarios. `onPassiveScroll` conserva dos consumidores, `hero-section` y `ledger-section`.

### Mutaciones

| # | Mutación | Observado |
|---|---|---|
| 1 | Reimportar `ROAD_DECO_FACTORS` (del brief) | **FALLA** — `TS2307: Cannot find module '../services-road/services-road-section'` |
| 2 | Desmontar `<app-ledger-section />` de la Home (del Reviewer) | **FALLA** — y caen *dos* tests: el de montaje y el de las cinco anclas, porque `#servicios` ahora lo sirve el ledger |

### Incidente del Reviewer, registrado por honestidad

Al revertir la mutación 1 usé `git checkout -- home-page.ts`, que devuelve el fichero al **último
commit**, no al estado previo a la mutación: eso borró el trabajo del worker en ese fichero. Se
restauró verbatim desde el diff capturado antes de mutar (+8/−9, idéntico al entregado) y se
reverificó todo en verde. **Para revertir una mutación hay que restaurar desde una copia previa
(`cp`), nunca desde `git checkout`,** cuando el árbol tiene cambios sin commitear — que es siempre,
durante una ronda de revisión.

### Premisa falsa cerrada, no corregida

El Done-when pedía cerrar «el aviso de `anyComponentStyle` que causaba `services-road-section.css`».
**Ese aviso nunca existió:** el fichero pesaba **6 868 bytes**, muy por debajo del umbral de 16 kB.
Ningún CSS de componente del proyecto lo supera hoy — el mayor es `ledger-section.css` con 11 677.
El ítem se marca **N/A con la medición**, no como corregido: dar por cerrado un aviso inexistente
habría convertido una afirmación no verificada del spec en evidencia.

### ADVISORY (registrado, no bloquea)

1. **`core/motion/motion.service.ts:8`** conserva un comentario que cita «services-road deco parallax
   + progress fill», ya inexistente. Está **fuera del boundary** de T007 y el worker hizo bien en no
   tocarlo. Dueña natural: T013 (docs) o una tarea de seguimiento.
2. `ledger-section.ts:57` («Replaces `ServicesRoadSection`») y `:215` (paridad de patrón) se
   conservan a propósito: describen correctamente el origen del componente y siguen siendo ciertos.

---

## T008 — `AboutTeaserSection` → Manifiesto claro · **PASS** (2 rondas · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high`. **Leader/Reviewer:** Claude Code.

### Decisión de modelo (HITL 2026-09-06)

Se evaluó subir el Implementer a `gemini-3.1-pro-high`. **Se mantiene Flash**, y el motivo es el
dato, no la preferencia: de los dos FAIL observados hasta ese punto (T004 y T006), **los dos
trazaban al brief del Leader**, no a la capacidad del worker — en T004 el brief pedía literalmente
`toBe(9)` y no la identidad de las anclas; en T006 exigía una invariante que no aplicaba al elemento.
La tarea que mejor preparé (T007) cerró **a la primera**. La correlación está con la precisión del
brief. Se adoptaron en cambio **dos cambios permanentes de brief**:

1. **Declarar el requisito que el test debe guardar, no el aserto a escribir.** «`toBe(9)`» es una
   instrucción; «un aserto que no distinga *cuáles* son las anclas no guarda el requisito» es lo que
   evita el defecto.
2. **Licencia explícita de rechazo.** Si algo del brief contradice la spec o no aplica, el worker
   para y lo dice; señalarlo cuenta como trabajo hecho. Es lo que faltó en T006, donde el worker
   añadió CSS muerto antes que discutir el brief.

### Cuarta reincidencia de KZ-005, corregida antes de despachar

El boundary de T008 era sólo `about-teaser/`. Pero la tarea mete una imagen —que necesita `alt`— y
el fichero que edita ya arrastraba **`<figcaption>Cali · Colombia</figcaption>`** en duro, una
violación preexistente de REQ-011. Ambos son copy. Boundary ampliado a `client/src/assets/i18n/` y
Done-when nuevo exigiendo `alt` y `figcaption` por clave en los dos idiomas.

### Alcance acotado a la baja, a propósito

El mockup trae para `#sobre-amd` un eyebrow, una cita grande y **tres pilares** (Cercanía,
Cumplimiento, Claridad). **Ninguna tarea del plan los pide**: REQ-004 (escenario único), `design.md`
§5.5 y el Scope de T008 coinciden los tres en lo estrecho — clara, imagen, dorado, CTA. El brief se
lo prohibió explícitamente y el worker **respetó el acotado**.

> **Abierto para HITL, no bloquea.** La *descripción* de REQ-004 dice «fusionar el manifiesto y el
> teaser de Nosotros». Lo entregado es el teaser actual en claro y con foto: la cita y los pilares no
> los porta ninguna tarea. O se añaden como tarea nueva, o se baja la descripción de REQ-004 a lo que
> el código hace. Hoy el requisito afirma más de lo que se entrega.

### Ronda 1 — FAIL: un test que prohíbe de más y bloquea su propio arreglo

El worker escribió `expect(cleanCss).not.toMatch(/aspect-ratio/)` — prohibición **en todo el
fichero**. REQ-004 no dice eso: su escenario abre con `GIVEN la sección #sobre-amd en >= 901 px`, y
la prohibición está acotada a ese ancho por una razón concreta — ahí figura y texto son dos columnas
de la misma fila, así que un `aspect-ratio` haría que la foto impusiera el alto sobre el texto. Por
debajo **no hay fila que estirar** y el argumento desaparece.

**El aserto tapaba una omisión real.** El bloque de apilado del mockup (`home-redesign.css`,
`@media (max-width: 960px)`) no se había portado, así que por debajo de 900 px la figura conservaba
del bloque base `align-self: stretch` y `min-height: 17rem` y quedaba **clavada en 17 rem sea cual
sea el ancho** — a 768 px, una tira de ~704×272 (letterbox 2.6:1). Y la foto iba **antes** del texto
en el DOM, al revés de la decisión del mockup («se lee antes de mirar»).

Mismo modo de fallo que T004: **un aserto verde que asegura algo distinto de lo que dice**, con el
agravante de que aquí además **impedía escribir el CSS correcto** — quien intentara arreglarlo vería
fallar un test que parece guardar el requisito.

### Ronda 2 — PASS

- Test partido por `@media`: sin `aspect-ratio` en la regla base; **con** `aspect-ratio: 4/3`
  acompañado de `height: auto` dentro del bloque de apilado.
- Bloque de apilado portado a `@media (max-width: 899px)` —complementario exacto del
  `min-width: 900px` que ya tenía el fichero, sin hueco—: `.about-copy { order: 1 }`,
  `.about-visual { order: 2; max-width: 30rem; align-self: auto; margin-block: 0; min-height: 0 }`,
  `img { height: auto; aspect-ratio: 4/3 }`.
- Test nuevo del **orden de lectura** apilado, que compara los `order` numéricos.

**`height: auto` no es decorativo ahí.** El `<img>` lleva `width="1600" height="1067"`, y un `<img>`
con esos atributos **ignora `aspect-ratio`** salvo que el CSS declare `height: auto`. Sin esa línea
la relación fija no hace nada y el fallo es **silencioso**. Ésta es la invariante 3 de `design.md`
§5.1 en el único sitio de la Home donde de verdad gobierna — la misma que en T006 se retiró del
ledger por inaplicable.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent`: **30 ficheros · 267 tests** verde (259 → 267, +8)
- `npm run lint -- --quiet`: limpio · `npm run build`: 452.22 kB inicial

### Mutaciones — cinco, tres de ellas de la ronda 2

| # | Mutación | Observado |
|---|---|---|
| 1 | Quitar `.section--light` de la raíz | FALLA |
| 2 | Acento de vuelta a `var(--amd-gold-soft)` | FALLA (caen 2 tests) |
| 3 | Quitar `height: auto` del `<img>` apilado | **FALLA** — guarda la parte que hace funcionar la relación fija |
| 4 | `aspect-ratio` en la regla **base** de la figura | FALLA |
| 5 | Invertir el `order` (foto antes que texto) | FALLA |

Las 3, 4 y 5 las corrió el Reviewer tras la ronda 2.

### PENDIENTE DE T012

jsdom **no aplica media queries ni calcula layout ni evalúa contraste**. Los asertos de esta tarea
son sobre el **texto del CSS** y el **orden del DOM**, que es el techo de este runner. Quedan sin
probar: que el fondo se vea claro, que el contraste real dé los ratios sobre `--amd-surface`, que a
768 px la foto salga en 4:3 y que el texto se lea antes de la foto.

### ADVISORY (registrado, no bloquea)

1. **`margin-block: -1.75rem` del mockup no se portó.** Es el gesto de «la foto un poco más alta que
   el texto» en el layout de dos columnas. No lo pide ningún requisito y no afecta a REQ-004; queda
   como diferencia visual deliberada frente al mockup, a decidir en la revisión HITL de T012.
2. `figcaption` usa `color: #ffffff` y `text-shadow` con rgba literales. **Es el valor del mockup**
   (`home-redesign.css`, `.about__figure figcaption`), no una invención del worker, y el único gate
   de hardcodes vigente cubre los dos dorados de tinta. Se deja como está.

---

## T009 — `FiguresBand` (`#cifras`) · **PASS** (1 ronda · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high`. **Leader/Reviewer:** Claude Code.
Segunda tarea que cierra **a la primera**, y la primera de ellas que además crea un componente nuevo.

### Tres correcciones de spec previas al despacho

1. **El atributo `autoplay` no va — la prosa contradecía al escenario testable.** `tasks.md` y
   `design.md` §5.2 decían `<video autoplay muted loop playsinline poster>`. Pero REQ-005 dice
   *«WHEN la sección **entra en pantalla** THEN el video MUST reproducirse»*, y eso es un
   `IntersectionObserver`, no un atributo. El mockup lo implementa así a propósito
   (`home-redesign.js:216-233`) con dos salvaguardas documentadas por decisión HITL: **pausa fuera del
   viewport** —ahorro de CPU y batería, no accesibilidad— y **póster fijo bajo reduced-motion**. El
   delator estaba dentro de la propia tarea: su lista de `### Tests` exige `muted`, `loop`,
   `playsinline` y `poster`, y **no menciona `autoplay`**. La prosa iba por un lado y el test por otro.
2. **La métrica «31 servicios» habría duplicado el catálogo.** El mockup la lleva como literal
   (`data-count="31"`). Portarla es el defecto que DD-035 evita y que **T005 ya tuvo que corregir**
   en el CTA del ledger. Ahora sale de `SERVICE_GROUPS` vía `deriveCatalogTotal()`.
3. **Quinta reincidencia de KZ-005.** La banda entrega cinco cadenas de copy visible —eyebrow, frase
   y tres etiquetas de métrica— y el boundary no incluía `client/src/assets/i18n/`.

### Qué se entregó

- `features/home/figures/` nuevo: `figures-band.{ts,html,css,spec.ts}`. CSS **130 líneas / 2.7 kB**.
- `<video>` con `muted`, `loop`, `playsinline`, `poster`, `preload="none"`, `aria-hidden="true"`,
  `tabindex="-1"`. **Sin `controls` y sin `autoplay`.** `preload="none"` sostiene a la persona en 3G.
- Reproducción por `IntersectionObserver` (threshold 0.2): `play()` al entrar, **`pause()` al salir**.
  El rechazo de `play()` se captura —la política de reproducción automática del navegador puede
  bloquearla— y queda el póster, que es el fallback correcto. Sin `IntersectionObserver`, `play()`
  directo. Bajo `reducedMotion()` **no se observa ni se llama a `play()` nunca**.
- Conteo animado portado del mockup: 1100 ms, easing `1 - (1-p)³`, `requestAnimationFrame`, una sola
  vez al entrar. Bajo reduced-motion las métricas **nacen en su valor final**, no cuentan rápido.
- Cinco claves `figures*` en ES y EN. Los números y sus afijos (`+`, `%`) van en el componente: son
  datos, no copy.
- **Sin `.section--light`** — es tinta, y ése es su papel en el ritmo (DD-028).
- Montada entre Manifiesto y Confianza. `home-page.spec.ts` pasa de cinco a **seis** anclas.

### La sexta ancla, heredada de T007

T007 no podía añadir `cifras` a `home-page.spec.ts`: la sección no existía y el aserto habría dejado
la suite en rojo. Aterriza aquí, que es la tarea que la crea. **Y con ella aterriza el enlace
`#cifras` del `MobileDrawer`**, que T004 añadió y que hasta ahora no llevaba a ningún sitio.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent`: **31 ficheros · 276 tests** verde (267 → 276, +9)
- `npm run lint -- --quiet`: limpio
- `npm run build`: **452.24 kB** inicial. **DD-039 comprobado en el artefacto, no por inferencia:**
  `manifiesto.mp4` sale en `dist/client/browser/media/manifiesto.mp4` (**1 943 969 bytes**) como asset
  estático, y no aparece en ningún chunk. Sus 1.9 MB contra un budget de 1 MB habrían roto el build
  si hubiera entrado.

### Mutaciones — las tres del brief, corridas por el Reviewer

| # | Mutación | Observado |
|---|---|---|
| 1 | Añadir `controls` al `<video>` | FALLA |
| 2 | Devolver `31` literal en vez del total derivado | FALLA |
| 3 | Llamar a `play()` también bajo reduced-motion | FALLA |

El test de derivación no compara contra un número escrito a mano: **altera `SERVICE_GROUPS` en
caliente** —dentro de un `try/finally` que lo restaura, sin fuga a otros tests— y comprueba que el
total sigue al catálogo. Un aserto contra `31` habría pasado igual con el catálogo duplicado.

### PENDIENTE DE T012

**jsdom no reproduce video.** Que el elemento tenga los atributos no prueba nada de esto, y no puede
darse por cubierto aquí:

1. Que el **póster se pinte antes** de que el video cargue, que es lo que ve la persona en 3G.
2. Que el **scrim dé contraste suficiente** al texto sobre el video real en movimiento — el fotograma
   cambia, así que el peor caso no es medible sobre una imagen fija.
3. Que la **reproducción arranque** al entrar en pantalla y **pare** al salir.
4. Que el conteo se lea bien a la velocidad a la que la banda entra en pantalla.

### ADVISORY (registrado, no bloquea)

1. **`reducedMotion()` se lee una sola vez, en `ngAfterViewInit`.** Un cambio de la preferencia del
   sistema a mitad de sesión no reconfigura la banda, aunque `MotionService` sí publique el cambio.
   **No es defecto de T009:** `ledger-section` y el difunto `services-road-section` siguen el mismo
   patrón, así que es una deriva de todo el proyecto respecto a lo que el docblock de `MotionService`
   promete. Merece una tarea de seguimiento propia, no un parche en una sección.
2. Bajo movimiento permitido las métricas renderizan `+0 / 0 / 0%` hasta que la banda entra en
   pantalla. Es coherente con el conteo desde cero y con el mockup (que también salta a 0 al empezar),
   pero es lo primero que se ve si la banda ya está en pantalla al cargar. A confirmar en T012.

---

## T010 — `ClientWall`: carrusel infinito de logos · **PASS** (1 ronda · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high`. **Leader/Reviewer:** Claude Code.
La tarea que el handoff marcaba como **la más frágil del plan**, cerrada a la primera.

### Corrección de spec previa al despacho — sexta reincidencia de KZ-005, con un matiz

El boundary era sólo `features/home/clients/`, pero el muro **rotula su cinta**
(«Empresas que ya operan con AMD», `mockup/index.html:363`) y esa cadena es copy visible. Ampliado a
`client/src/assets/i18n/`.

**El matiz importa y se dejó escrito en la tarea:** las **13 razones sociales NO son copy**. Son
nombres propios — «Fundación Ballet Capital» se llama igual en inglés — y viven en
`client-logos.data.ts`, nunca en los diccionarios. Sin decirlo, la ampliación del boundary invita
justo al error contrario: traducir trece empresas.

### Las tres trampas, y cómo quedaron

Cada una tenía un porqué medido, y el brief las dio como razones, no como reglas:

1. **Sin `gap`.** La animación desplaza `translateX(-50%)`; con `gap` ese 50 % no cae en el mismo
   punto del patrón —queda desfasado medio hueco— y **el bucle salta en cada vuelta**. El aire va
   como `margin-inline` de cada `<li>`. Medido en el mockup: costura de 0.00 px a 1440, −0.03 a 768,
   −0.13 a 375, contra la tolerancia de ≤ 0.5 px de REQ-007.
2. **Duración calculada, no fijada.** `duracion(anchoMitad, pxPorSegundo)` exportada y pura, a
   42 px/s sobre `scrollWidth / 2` —que es exactamente lo que recorre la animación—, recalculada en
   `resize` y en `document.fonts.ready`. Fijarla en el CSS haría que la cinta **corriese más rápido
   cuanto más estrecha la pantalla**, justo donde más cuesta leerla.
3. **La copia existe para el bucle, no para el lector.** 26 elementos: 13 con `role="img"` y la razón
   social, 13 con `aria-hidden="true"` y **sin rol**. Renderizada en la plantilla con un segundo
   `@for`, no clonada en JS como el mockup: declarativo y testable en jsdom.

### La trampa que no estaba en la spec: el `url()` y el sanitizador de Angular

El mockup pasa `style="--logo: url(...)"` en línea. **En Angular el binding de estilos pasa por el
sanitizador y el `url()` puede acabar vacío** — la máscara no se ve y **nada falla**: sin error, el
`<span>` queda transparente. El brief lo señaló y exigió un aserto.

Vía elegida por el Implementer: `DomSanitizer.bypassSecurityTrustStyle`, con el valor construido
desde una plantilla fija y un `slug` de un fichero de datos estático — sin entrada de usuario. El
test comprueba que **los 13** conservan `media/logos/<slug>.webp` en el `--logo` del DOM renderizado.
Es el único aserto de esta tarea capaz de atrapar ese fallo silencioso.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent`: **32 ficheros · 292 tests** verde (276 → 292, +16)
- `npm run lint -- --quiet`: limpio · `npm run build`: 452.24 kB inicial
- Máscaras: **147 618 bytes** los 13 `.webp`, bajo el techo de 200 kB del NFR de performance

### Mutaciones — las tres del brief, corridas por el Reviewer

| # | Mutación | Observado |
|---|---|---|
| 1 | Triplicar el conjunto en vez de duplicarlo | FALLA (2 tests) |
| 2 | Quitar `aria-hidden` de la copia | FALLA (4 tests) |
| 3 | `gap` en la cinta en lugar de `margin-inline` | **FALLA** |

La 3 se despachó como pregunta abierta —«si no falla nada, escríbelo»— porque el efecto sólo se mide
en T012. El Implementer **sí** escribió el aserto que guarda la regla: lee la regla
`.clients__track` del CSS y prohíbe `gap:` con un lookbehind que deja pasar `row-gap`, que la
retícula de reduced-motion sí necesita.

### PENDIENTE DE T012

**jsdom no compone `mask-image` ni mide la cinta.** Un test verde aquí **no** prueba que el carrusel
se vea. Quedan sin probar, y no pueden darse por cubiertas:

1. **La costura del bucle** (≤ 0.5 px de desfase) a 1440, 768 y 375 px.
2. **La velocidad constante** entre esos tres anchos, ±10 %.
3. Que las **máscaras se compongan** y los logos se vean con `currentColor`.
4. Que la **pausa** en `:hover` y `:focus-within` funcione de verdad.
5. Que la **retícula de reduced-motion** deje los 13 en pantalla, que es el punto entero del
   escenario — parar la cinta sin más dejaría a la mayoría fuera.

### ADVISORY (registrado, no bloquea)

1. **Reduced-motion está implementado por tres vías a la vez**: `@media (prefers-reduced-motion)` en
   el CSS, una clase `.is-reduced-motion` gobernada por la señal de `MotionService`, y bindings
   `[style.animation]`/`[style.display]` en la plantilla. Ninguna es incorrecta y la clase es la que
   hace el escenario testable en jsdom —el `@media` no lo es—, pero tres mecanismos para un
   comportamiento decaen: alguien retira uno creyendo que otro lo cubre. Candidato a simplificación
   cuando T012 confirme cuál basta.
2. El muro **no está montado**: lo monta **T011**, con su aserto de ancestría (KZ-004). Hasta
   entonces el componente existe y no se ve.

---

## T011 — `TrustSection`: sin auto-rotación, puntos como control primario · **PASS** (2 rondas · 2026-09-06)

**Implementer:** Antigravity `gemini-3.8-flash-high`. **Leader/Reviewer:** Claude Code.

### Dos correcciones de spec previas al despacho

1. **Séptima reincidencia de KZ-005.** La tarea reescribe `trustLead` y crea la clave del nombre
   accesible de los puntos; el boundary no incluía `client/src/assets/i18n/`.
2. **El Scope decía «Montar `ClientWall`» sin decir dónde, y el sitio importa.** REQ-006 pide **tres
   grados de concreción: qué dicen → quiénes son → dónde operan**, y el mockup los sirve en ese orden
   (`index.html:332-370`). La plantilla los tenía **al revés**: el ticker de sectores iba antes que
   los testimonios. Montar el muro correctamente exigía **mover el bloque `.logos` detrás de él**.
   **Ningún escenario de REQ-006 asevera el orden: es juicio del Leader apoyado en el mockup**, y se
   dejó escrito como tal en la tarea, no como letra del spec.

### Qué se entregó

- Fuera el `setInterval`, el `effect()` que lo reprogramaba, el `clearInterval` de destrucción y el
  export **`TESTIMONIAL_PAUSE_MS`**. REQ-006 es tajante sobre el porqué: un carrusel automático
  **sustituye texto que alguien está leyendo**.
- `testimonialLabel()` devolvía `` `Testimonio ${i+1}` `` —español hardcodeado, REQ-011— y ahora
  resuelve `testimonialDotLabel` con `{n}` interpolado, patrón de `LedgerSection.allCtaLabel`.
- Los **cuatro** testimonios conservados; `q4`/`q4By` no quedan huérfanas.
- `ClientWall` montado. Orden final: cabecera → métricas → testimonios → puntos → muro → sectores → CTA.
- Fondo de `--amd-mist` a `--amd-surface` (§5.5), conservando `.section--light`.
- `trustLead` reescrito en los dos idiomas: su segunda mitad —«testimonios con pausa larga para
  leer»— **dejó de ser cierta** al retirar el temporizador. Ahora dice que los elige el visitante.

### Lo que NO se tocó, y por qué se dijo explícitamente

- **La geometría 44×44 de los puntos.** El CSS lleva un comentario explicando que con centros
  separados ~15 px el clic en un punto caía en el siguiente. **KZ-001**: la tarea la nombra para
  **conservarla**, no para cambiarla.
- **`background: var(--amd-gold)` del punto activo.** Es **relleno, no texto**: REQ-009 sólo restringe
  el dorado como `color:`. Con la sección pasando a blanco era justo el sitio donde alguien "corrige"
  algo que no está roto.

### Ronda 2 — un coste que sólo se podía medir con el muro montado

**`DomSanitizer` costaba 6.80 kB en el bundle inicial.** Medido, no deducido: dos builds idénticos
salvo por el sanitizador.

| | `main` (inicial) | `home-page` (lazy) |
|---|---|---|
| Con `DomSanitizer` | **458.03 kB** | 105.37 kB |
| Sin él, `--logo` como `string` | **451.23 kB** | 105.33 kB |

Los 6.8 kB caen **enteros en el bundle inicial**, no en el chunk perezoso: se descargan en todas las
rutas para una tira de logos que está bajo el pliegue y sólo existe en una página. `ClientWall` era el
**único** consumidor de `DomSanitizer` en `src/app`; sin él la maquinaria de sanitización se elimina
por tree-shaking.

**Y la defensa no hacía falta.** Con `--logo` como `string` plano los 16 tests de `client-wall.spec.ts`
pasan, incluido el que asevera que los 13 conservan `media/logos/<slug>.webp`: **Angular no sanitiza
los bindings de custom properties (`--*`)**.

> **La causa es del brief del Leader, no del Implementer.** El brief de T010 advirtió de la trampa del
> sanitizador y exigió un aserto; con esa información, `bypassSecurityTrustStyle` era la elección
> prudente. La advertencia era correcta para `[style.background-image]` y **falsa para una custom
> property**, y sólo se pudo comprobar una vez montado el muro. En el código queda un comentario que
> explica por qué no hace falta, para que nadie lo reintroduzca "por si acaso".

**Mutación de cierre:** reintroducir `bypassSecurityTrustStyle` devuelve `main` a **458.03 kB**;
revertir lo baja a **451.23 kB**. La causa queda demostrada, no inferida.

### Segunda corrección de la ronda 2 — `logosLabel` quedó engañosa

Mismo defecto que `trustLead`, descubierto por el Reviewer: valía «Algunos clientes / sectores» /
«Some clients / sectors». Cuando rotulaba una tira de píldoras de sectores y no había nada más,
pasaba. **Con un muro de clientes reales justo encima**, hace leer las píldoras como si fueran
clientes — que es exactamente lo que ya no son. Pasa a «Sectores que acompañamos» / «Sectors we
support», el valor del mockup.

### Verificación (Node del `.nvmrc`, v24.20.0)

- `npm run test:agent` **sin filtro** —obligatorio: `trust-section.spec.ts` importaba
  `TESTIMONIAL_PAUSE_MS`, así que al retirar el export **el fichero deja de compilar**—:
  **32 ficheros · 291 tests** verde (292 → 291).
- `npm run lint -- --quiet`: limpio · `npm run build`: **451.23 kB** inicial.

### Mutaciones

| # | Mutación | Observado |
|---|---|---|
| 1 | Reintroducir un `setInterval` que cambie el testimonio | FALLA la regresión de 15 s |
| 2 | Montar el muro **fuera** de `#confianza` | FALLA la ancestría — el aserto comprueba `section.contains()`, no presencia global |
| 3 | Reintroducir `bypassSecurityTrustStyle` | `main` sube a 458.03 kB |

### ADVISORY (registrado, no bloquea)

1. **`q2` y `q2By` están en inglés en `es.json`.** Los valores son idénticos a los de `en.json`:
   «Needed bilingual support for our ops setup in Colombia…» / «Ops lead, SaaS». **Es preexistente**,
   no lo introduce T011, y el gate de paridad ES/EN no puede detectarlo —compara claves, no valores—.
   Un visitante hispanohablante ve un testimonio en inglés entre tres en español. Necesita traducción
   o una decisión explícita de dejarlo verbatim.
2. La advertencia sobre el sanitizador **sigue siendo válida para bindings de estilo normales**
   (`[style.background-image]`, `[style]`); lo que no aplica es a custom properties. Conviene no
   generalizar la lección al revés.

---

## T014 — Manifiesto: portar la sección del mockup · **PASS** (1 ronda · 2026-09-06)

**Origen:** KZ-007 — revisión HITL en navegador. T008 dejó `#sobre-amd` clara y con foto, pero era el
teaser antiguo repintado. **El brief de T008 —del Leader— prohibió explícitamente portar la cita y los
pilares**, apoyándose en la prosa de `requirements.md`/§5.5 en vez de en el mockup, que es el
artefacto aprobado por el cliente. Esta tarea lo corrige.

### Qué se entregó

Estructura del mockup completa: `about__lead` (grid `minmax(0,26rem) minmax(0,1fr)`, figura a la
izquierda), `eyebrow--ink` «Por qué existimos», `about__quote` «Tu contabilidad no debería ser una
caja negra.», `about__body` con el cuerpo largo, **`ol.pillars` con los tres pilares** (01 Cercanía ·
02 Cumplimiento · 03 Claridad) y `about__cta` con «Conocer al equipo» en `btn--ink` + «Contactar» en
`btn--ghost-ink`. Recuperado `margin-block: -1.75rem` de la figura, el «poco más alto que el texto».

**10 claves i18n nuevas** en ES y EN. `aboutTitle`, `aboutBody` y `seeMore` quedaron huérfanas y se
retiraron de ambos diccionarios, con un aserto que lo guarda. La página `/about-us` usa
`aboutPageTitle`, otra clave — comprobado antes de borrar.

### El mockup incumple REQ-009 aquí, y el port no lo copió

`home-redesign.css:98` pinta `.eyebrow--ink` con el literal `#8a7a2e` y `:573` hace lo mismo con
`.pillars__ord`. Ese valor es `--amd-gold-ink` (**3.86:1**), que sólo alcanza el piso de texto grande.
El eyebrow es 12 px y el ordinal 15.2 px: **los dos van a `--amd-gold-ink-deep`**, y ningún literal
hexadecimal entra al CSS del componente. Portar el mockup al pie de la letra habría reintroducido el
defecto que la Pivot T001 encontró.

### El test que evita la reincidencia

**Diff de inventario de clases** contra la sección del mockup, dentro del propio spec del componente.
Verificado también por el Reviewer, por separado:

```
FALTA EN ANGULAR : NADA
EXTRA EN ANGULAR : section--light   (marcador del proyecto, no del mockup)
```

Es el aserto que KZ-007 propone como estándar, y es mecánico: leer las `class="…"` de ambos y
comparar conjuntos. Habría atrapado T008 en su primera ronda.

### Verificación (Node del `.nvmrc`, v24.20.0)

**32 ficheros · 292 tests** verde (291 → 292), lint limpio, `main` **451.23 kB**.

### Mutaciones — cinco, tres del brief y dos añadidas por el Reviewer

| # | Mutación | Observado |
|---|---|---|
| 1 | Borrar un `.pillars li` | FALLA |
| 2 | `.eyebrow` **base** → `--amd-gold-ink` | **PASA — y es correcto** (ver abajo) |
| 2b | `.eyebrow--ink` → `--amd-gold-ink` | FALLA |
| 2c | `.pillars__ord` → `--amd-gold-ink` | FALLA |
| 2d | Literal `#8a7a2e` en `.eyebrow--ink` | FALLA (2 tests) |
| 3 | Quitar la clase `about__quote` | FALLA el inventario (2 tests) |

**La mutación 2 fue un error del Reviewer, no un hueco del test.** Apuntaba a la regla `.eyebrow`
base, que `.eyebrow--ink` —misma especificidad, declarada después— pisa en todos los elementos del
componente, porque la plantilla siempre usa las dos clases juntas. Cambiar ese `color` **no cambia
nada renderizado**, así que el test hace bien en no fallar. Repetida sobre la regla que sí gobierna
(2b), falla como debe.

### ADVISORY

1. **`.eyebrow` base declara un `color` muerto.** Es redundante con `.eyebrow--ink` y nunca gana.
   Misma clase de defecto que el `height: auto` de T006: una declaración que parece hacer trabajo y no
   lo hace. Inocua, pero candidata a limpieza.

---

## T015 — Confianza: portar la sección del mockup · **PASS** (1 ronda · 2026-09-06)

**Origen:** KZ-007. T011 retiró el temporizador y montó el muro, pero dejó la sección antigua con el
muro pegado: métricas en tarjetas, `h2` + lead, cita en tarjeta alineada a la izquierda y sectores
como píldoras. Nada de eso está en el mockup.

### Qué se entregó

Estructura del mockup: `eyebrow--ink` «Confianza que se nota» → `figure.quote` centrada
(`max-width: 44rem`, `clamp(1.2rem, 2.6vw, 1.7rem)`) con `figcaption` → `quote__dots` con los cuatro
puntos → `ClientWall` → `.ticker` de texto plano → `.ticker__label` **debajo**. `text-align: center`
en toda la sección.

**Tres retiradas (HITL 2026-09-06):** las cuatro tarjetas de métricas, el `h2` + párrafo lead, y el
CTA «Contactar» final. Con ellas salieron de ambos diccionarios `m1…m4`, `trustTitle`, `trustLead`,
`trustCta` y `logosLabel` — todas huérfanas, comprobado por grep antes de borrar.

**El ticker pasa de tarjetas a texto plano** y de 8 sectores propios a los **9 del mockup**, por clave
`sector*` en ES y EN: el mockup los lleva sueltos en el JS sin traducir, pero aquí son copy visible y
REQ-011 aplica. Duplicados una vez → 18 elementos para el bucle del 50 %.

> **`gap` es correcto aquí, y no lo era en `ClientWall`.** El ticker es texto y su ancho lo fija el
> contenido, así que las dos mitades salen idénticas y el 50 % cae en el mismo punto del patrón. En el
> muro de logos el aire tiene que ir como `margin-inline` porque ahí `gap` sí rompe la costura. Son
> dos cintas con reglas opuestas: la lección de una **no** se generaliza a la otra.

### Lo que se conservó, con sus tests

Los **cuatro** testimonios (DD-034: el mockup dibuja tres como ilustración), la ausencia de
temporizador con su regresión de 15 s, los 44×44 de los puntos (KZ-001) y `ClientWall` montado dentro
de `#confianza` con su aserto de ancestría (KZ-004).

### Diff de inventario — verificado por el Reviewer

Contando la plantilla de `ClientWall`, que aporta `clients*`:

```
FALTA EN ANGULAR : NADA
EXTRA EN ANGULAR : section--light
```

### Verificación (Node del `.nvmrc`, v24.20.0)

**32 ficheros · 294 tests** verde (292 → 294), lint limpio, `main` **451.23 kB**.

### Mutaciones — las tres del brief, corridas por el Reviewer

| # | Mutación | Observado |
|---|---|---|
| 1 | Reintroducir una tarjeta de métrica | FALLA |
| 2 | Rótulo del ticker **antes** de la cinta | FALLA — el aserto compara posición real, no presencia |
| 3 | Quitar la clase `ticker__track` | FALLA el inventario (3 tests) |

### PENDIENTE DE T012

jsdom no compone la cinta ni mide centrado ni contraste. Quedan sin probar: que el ticker corra a su
velocidad y sin costura, que la sección se lea centrada, y el contraste real del eyebrow y de los
sectores sobre blanco.

---

## T016 — Contacto: portar la sección del mockup y sacar la jerga interna · **PASS** (1 ronda · 2026-09-06)

**Origen:** KZ-007 addendum. `#contacto` **no lo cubría ninguna tarea** de la spec y §5.5 no lo lista.
Una sección sin dueño es una sección que nadie revisa — y arrastraba dos defectos.

### El hallazgo grave: vocabulario del proyecto en la página del cliente

| Clave | Valor que estaba en producción |
|---|---|
| `contactLead` | «Cuéntanos qué necesitas. **Fase 1: WhatsApp o correo — sin backend.**» |
| `fNote` | «**Validación client-side + handoff.**» / «Client-side validation + handoff.» |

«Fase 1», «backend», «client-side» y «handoff» describen **cómo está construido el sitio**, no qué
ofrece la empresa. Un cliente que lee «sin backend» aprende que la página está a medias.

`contactLead` pasa al valor del mockup. **`fNote` desaparece entera** —el mockup no tiene esa línea—
junto con su `<p class="form-note">`. `fWhatsapp` quedó huérfana al fusionar los botones y también
sale. Ninguna de las tres tiene ya referencia en código ni en los diccionarios.

**El aserto que queda protege a toda la página, no sólo a esta sección:** recorre **todos** los
valores de `es.json` y `en.json` buscando `backend`, `client-side`, `handoff`, `fase 1`/`phase 1`,
`stub` y `mock`, sin distinguir mayúsculas, y **nombra la clave y la palabra** cuando falla.

### Lo visual portado

`eyebrow` «Hablemos» + `h2` «Cuéntanos qué necesitas.» + `contact__lead`; `dl.contact__meta` con
**tres** filas envueltas en `<div>` (Ubicación · WhatsApp · **Correo**), y el correo **sigue siendo un
enlace `mailto` funcional**, no texto plano. Clases BEM del mockup. Campo ambiental atenuado montado
reutilizando el componente compartido de `core/ambient/` — importado, sin escribir fuera del boundary.

### Los dos botones — el análisis se verificó antes de fusionar

El brief entregó el análisis hecho y pidió confirmarlo: `submit()` valida y abre WhatsApp;
`openWhatsApp()` abría **sin validar**; el `mailto` **no dependía de ningún botón** —vive en su propio
enlace, hoy la fila «Correo»—; y existe un **FAB flotante de WhatsApp** en `app.html`, presente en
toda la página. Fusionar en el único `btn--gold btn--block` del mockup **conserva el camino validado y
el correo**, y el único atajo que se pierde —abrir WhatsApp sin rellenar nada— sigue disponible por el
FAB y por el número visible en el `<dl>`.

### Lo que NO se tocó, y era la mitad del valor

El formulario del mockup lleva `onsubmit="return false"`: es una **maqueta muerta**. El de `client/`
tiene validación reactiva, mensajes de error con `aria-invalid`/`aria-describedby`, foco al primer
campo inválido, `mailto` construido con el contexto, toast, prefill desde `?servicio=` y analítica.
**Todo sigue en verde** — 11 tests de regresión lo guardan.

Es la lección de T008 aplicada en la dirección contraria: allí el error fue **no** portar lo que el
mockup sí tenía; aquí el riesgo era **portar de más** y borrar lo que el mockup no tiene porque no
funciona.

### Diff de inventario — verificado por el Reviewer

```
FALTA : NADA
EXTRA : field-error · mailto-fallback · toast
```

Los tres extras son exactamente las piezas de accesibilidad y comportamiento que el mockup no dibuja.

### Verificación (Node del `.nvmrc`, v24.20.0)

**32 ficheros · 298 tests** verde (294 → 298), lint limpio, `main` **451.23 kB**.

### Mutaciones — las tres del brief, corridas por el Reviewer

| # | Mutación | Observado |
|---|---|---|
| 1 | Devolver «Fase 1 … sin backend» a `contactLead` | **FALLA**, y el mensaje nombra la clave y la palabra: *Forbidden jargon "backend" found in es.json under key "contactLead"* |
| 2 | Correo como texto plano sin enlace | FALLA (2 tests) |
| 3 | Quitar la clase `contact__meta` | FALLA el inventario (2 tests) |

### PENDIENTE DE T012

jsdom no mide el layout de dos columnas, ni el campo ambiental, ni el contraste del formulario sobre
tinta. **T012.**
