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
