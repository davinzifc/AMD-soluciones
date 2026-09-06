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
