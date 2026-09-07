# Kaizen Entry — changes/home-page-redesign

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/home-page-redesign` |
| Date | 2026-09-06 |
| Branch | `first-iteration-dev` — **rama de spec** (default = `main`, sin pin) |
| Archive Run | 1 |
| Approval Mode | `gated` |
| Ejecución | Implementer/Tester delegados a Antigravity `gemini-3.8-flash-high` vía Orca; Leader y Reviewer en Claude Code |

> **Todo lo de `## Pending Items` está sin aplicar por diseño.** El gate de rama mueve la escritura,
> no la revisión: las lecciones están distiladas y sus ediciones redactadas verbatim, esperando la
> fase de apply en `main`.

---

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tareas ejecutadas | **20** (presupuesto: 13) | `tasks.md` |
| Reviewer FAIL rework attempts | **11** — T001 ×2, T003 ×2, T005 ×2, T004/T006/T008/T011/T018 ×1 | `execution.md` |
| HALTs / FATAL_FAILs | **0** | `execution.md` |
| Pivots | **1** — T001, dorado de tinta: un token → dos | `execution.md` — `## Pivot Record: T001` |
| PRODUCT_BUGs | **0** | — (`/akili-test` no se corrió como fase) |
| Judgment-day severe findings | 0 | — |
| Validation FAIL / WARN | **0 / 8** (6 resueltas en sesión, 2 aceptadas) | `validation-report.md` |
| LOC neto en `client/` | **+3 838** (presupuesto: ~1 900) | `git diff f891716..HEAD` |
| Pasadas de revisión HITL en navegador | **4** — origen de T014–T020 | `execution.md` |

**MUDA dominante: retrabajo por defecto de especificación, no de implementación.** Las 11 rondas de
rework y las 7 tareas de más no salen de workers flojos: salen de tareas y documentos que decían lo
que no era. Las cuatro lecciones de abajo son la misma familia vista desde cuatro ángulos.

**Jidoka, y funcionó.** El gate de medición (T012) paró la línea con un FAIL de +97 px que ninguna
revisión había visto en 19 tareas, y T020 lo cerró. El instrumento encontró un defecto **preexistente**
al spec: eso es exactamente lo que se le pide.

---

## Lessons

- **KZ-005 — El brief del Implementer debe nombrar i18n cuando la tarea produce copy.** (Product, **Alta**)
  - **Causa raíz — del Leader, no de los workers.** Dos Implementers independientes y en paralelo
    (T003 `SectionNav`, T005 `LedgerSection`) cometieron el mismo defecto: escribir copy en español en
    plantilla o código en vez de crear claves en los dos diccionarios. Ninguno de los dos briefs
    mencionaba i18n, y la trazabilidad de REQ-011 en `tasks.md` apuntaba sólo a T004 y T011: **ninguna
    tarea era dueña del copy nuevo**.
  - **El agravante, y la lección real.** El patrón `translated !== key ? translated : '<literal>'` no
    sólo incumple REQ-011: **destruye la detectabilidad del incumplimiento**. Que una clave ausente se
    renderice *como la clave* es lo que vuelve visible el fallo a la primera mirada. Con fallback, la
    clave cruda nunca llega a pantalla y el defecto sobrevive a cualquier revisión visual. Declarar
    esas claves inventadas en el `fakeLocaleService` de un test deja la suite **verde afirmando contra
    un diccionario que no existe**, y ni el gate de paridad ES/EN (compara los diccionarios entre sí,
    no contra el uso) ni `i18n-values-gate` pueden verlo.
  - **Tercera reincidencia (addendum, T007), y por qué la lección no entra.** El `Directory boundary`
    de T007 era `client/src/app/features/home/` y su Scope ordenaba retirar `roadHint` de los
    diccionarios: el Scope nombra el fichero y el boundary lo excluye, **en la misma tarea y a cuatro
    líneas de distancia**. Un worker obediente tiene dos salidas y las dos son malas. Los tres puntos
    del KZ-005 original actúan sobre el brief y sobre los tests; ninguno impide que `tasks.md` nazca ya
    contradictorio. Tres reincidencias en trece tareas dicen que la revisión caso a caso del Leader no
    escala — las atrapó las tres veces, siempre en el último momento.
  - **Segundo hallazgo del addendum:** `Depends on` no captura la dependencia real. El Scope de T007
    ordenaba añadir el ancla `#cifras` a `home-page.spec.ts`, pero esa sección la crea T009, que **no
    está** en su `Depends on`. Cumplir T007 al pie de la letra dejaba la suite en rojo, contra su
    propio Evidence disqualifier.
  - **Evidencia:** `execution.md` — Reviewer T003, Reviewer T005, Reviewer T007.
  - **Standardization:** → **P1** (el gate mecánico al cerrar `/akili-specify`, que habría atrapado
    los tres casos antes de que existiera un brief). Los otros tres puntos propuestos —
    `.agents/implementer.md` («las claves en ambos diccionarios son parte del entregable; el boundary
    debe incluir `client/src/assets/i18n/`; prohibido todo fallback de copy en código»), el `Done when`
    de paridad ES/EN en la plantilla de `tasks.md`, y un aserto que cruce **claves usadas** contra
    **claves declaradas** — quedan registrados aquí como seguimiento de la misma lección.

- **KZ-006 — Revertir una mutación con `git checkout` destruye trabajo sin commitear.** (Product + Methodology, Media)
  - **Causa raíz.** `git checkout -- <fichero>` parece un «deshacer» local y no lo es: su punto de
    referencia es **HEAD**. Durante una ronda de revisión el árbol siempre tiene cambios sin commitear
    — que son justamente los que se auditan. El Reviewer mutó `home-page.ts` para probar falsabilidad,
    revirtió con `git checkout`, y el trabajo del Implementer en ese fichero desapareció. Se recuperó
    verbatim porque el diff completo se había capturado antes de mutar.
  - **Falla en silencio:** el fichero queda sintácticamente válido, y sólo lo delata que la suite se
    rompa o —peor— que **no** se rompa.
  - **Por qué es dual:** la regla no menciona stack, dominio ni convención local. Es una regla de
    persona universal; pertenece a `.agents/reviewer.md` de este proyecto **y** a la plantilla AKILI.
  - **Evidencia:** `execution.md` — revisión de T007.
  - **Standardization:** → **P2** (local) + upstream a la metodología AKILI.

- **KZ-007 — Una tarea escrita como *delta de comportamiento* no porta el diseño, y la revisión no lo detecta.** (Product + Methodology, **Crítica**)
  - **Medido (HITL).** El usuario abrió la Home en el navegador y encontró que **dos de las seis
    secciones no se parecen al mockup aprobado**. **Once tareas habían pasado con PASS del Reviewer**
    antes de que nadie lo notara.
  - **La correlación es exacta:**

    | Sección | Cómo estaba escrita su tarea | Resultado |
    |---|---|---|
    | `#servicios` (T006) | «**Portar el CSS del ledger** desde `mockup/…`» | ✅ fiel |
    | `#cifras` (T009) | «Sección nueva… CSS de referencia: `mockup/…`» | ✅ fiel |
    | `#sobre-amd` (T008) | «La sección **pasa de `--amd-ink` a claro**…» | ❌ el teaser viejo repintado |
    | `#confianza` (T011) | «**Retirar `setInterval`**… montar `ClientWall`…» | ❌ el Confianza viejo con el muro pegado |

    Las tareas redactadas como **port del mockup** salieron fieles. Las redactadas como **delta sobre
    el componente existente** produjeron componentes que cumplen su Done-when al 100 % y **no se
    parecen al diseño aprobado**. `design.md` §5.5 es una tabla de deltas y las tareas la copiaron
    literalmente: en ningún punto del spec existe la frase «que `#confianza` se parezca al mockup».
  - **Causa raíz del lado del Reviewer, y es la parte grave.** Validó **cada tarea contra su propio
    Done-when**, que es lo que la metodología pide, y por eso las once pasaron. **Nunca abrió el
    mockup.** Agravante: en T008 **el propio Leader detectó el hueco** —dejó escrito que «la cita y los
    pilares no los porta ninguna tarea»— y aun así decidió no portarlos, apoyándose en la prosa del
    spec en vez del mockup. La información estaba; la jerarquía de fuentes era la equivocada.
  - **Addendum — el diff de inventario es necesario, no suficiente.** Tras cerrar T014/T015 con el
    diff de clases en verde, el usuario encontró **dos secciones más** divergentes. El hero es el caso
    instructivo: **su inventario de clases coincide exactamente con el del mockup** y aun así sale
    centrado, por un `max-width: 38rem` propio sobre una clase `wrap` que ya aporta `margin-inline:
    auto`. El diff de inventario atrapa **elementos ausentes** y es **ciego a divergencias de propiedad
    CSS con estructura idéntica**.
  - **Hallazgo colateral, el más grave:** `#contacto` **no lo cubría ninguna tarea** y arrastraba jerga
    interna en copy público — `contactLead` decía «Fase 1: WhatsApp o correo — sin backend». Estaba en
    producción, a la vista de los clientes. **Una sección que ninguna tarea toca es una sección que
    nadie revisa**, y el alcance se definió por deltas sobre lo existente en vez de por cobertura de
    la página.
  - **Evidencia:** `execution.md` T014–T017; `tasks.md` T014/T015/T016/T017; revisión HITL 2026-09-06.
  - **Standardization:** → **P3**. Los otros cuatro puntos propuestos, registrados como seguimiento:
    (a) el mockup manda sobre la prosa del spec para el *qué se ve*, la prosa para el *cómo se
    comporta*, y la discrepancia se resuelve en HITL, no eligiendo la prosa por defecto; (b) todo
    `Done when` de fidelidad cita el rango de líneas del markup y del CSS de referencia; (c) el
    Reviewer hace el diff de inventario de clases antes del veredicto; (d) **la medición visual no
    puede vivir sólo en la última tarea del grafo** — aquí T012 acumuló la deuda visual de quince.

- **KZ-changes--home-page-redesign-1 — Una reversión HITL actualiza la decisión, no la prosa que afirmaba la decisión anterior.** (Product + Methodology, Media)
  - **Causa raíz.** T018 revirtió DD-034 (los testimonios vuelven a rotar) y actualizó **REQ-006 y
    DD-034**. No barrió los otros cuatro sitios de `design.md` que seguían afirmando lo contrario: el
    árbol de §2, el párrafo de §3, la fila de §5.5 y el hook de test de §11. Después T019 cambió el
    ritmo de 9 s a 6 s **y no barrió DD-034**, que era el sitio que T018 acababa de escribir. Resultado
    en el archivo: **un `design.md` que se contradecía a sí mismo en seis sitios**, con §5.5 diciendo
    que el temporizador se retira y DD-034, ocho líneas más abajo, diciendo a qué ritmo rota.
  - **Por qué importa más de lo que parece.** La baseline (`docs/ux-ui/design.md`) sí quedó correcta.
    Fue el documento del spec el que quedó atrás — y es el que lee el siguiente agente. Lo mismo pasó
    con el Cierre de cobertura de `tasks.md`, que seguía citando un escenario de REQ-006 que ya no
    existe y omitía las siete tareas T014–T020.
  - **El mecanismo ya existe y no se aplicó.** `/akili-specify` define **Correction Closure**: barrer
    hacia delante el valor superado y hacia atrás las referencias a la sección corregida. Una
    corrección cuyo barrido no corrió **no está aplicada, sólo reubicada**. Ninguna de las dos
    reversiones lo ejecutó, y nada lo pidió: `tasks.md` T018 sí lleva el ítem «REQ-006 y DD-034
    actualizados **antes** de implementar» — nombra los dos sitios que sabía, que es exactamente el
    fallo.
  - **Evidencia:** `validation-report.md` §7 W-2 y W-3; `tasks.md` T018 Done-when, T019 §2.
  - **Standardization:** → **P4**.

---

## Noted, not a lesson

- **El cable trampa del presupuesto saltó y nadie cerró el bucle.** `design.md` §10 declara las cifras
  como tripwire que obliga a «parar y escalar». Se excedió a **20 tareas / +3 838 LOC** (+54 % / +102 %)
  y la escalada **sí ocurrió**, por HITL, que es la mejor vía. Lo que faltó fue volver a §10 a
  corregirlo — lo hizo la validación, no la ejecución. Por debajo del listón de lección (una vez, sin
  daño), pero alimenta la comprobación de recurrencia: es la misma familia que
  `KZ-changes--home-page-redesign-1`.
- **`q2`/`q2By` llevaban meses en inglés dentro de `es.json`.** Preexistente y fuera del alcance de
  REQ-011 (compara claves, no valores). Lo destapó la validación, no un gate. Un aserto de «ningún
  valor de `es.json` es idéntico a su par de `en.json`, salvo lista blanca» lo habría cazado.
- **La costura del carrusel pasa exactamente en el límite** (−0.50 px contra \|≤ 0.50\|). Estable en
  dos corridas; vigilar si se vuelve intermitente en CI.
- **Node v22.18.0 en el PATH del shell está por debajo del mínimo de Angular CLI 22.** Todos los gates
  fallan con un error de versión hasta apuntar a v24.20.0. No hay `.nvmrc` ni nota en
  `docs/infrastructure.md`. Cuesta un arranque en falso por sesión nueva.

---

## Pending Items

> **Branch Context = rama de spec.** Ninguno aplicado. Esperan la fase de apply en `main`.

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `docs/specs/general-setup/task.md` |
| Edit | Al cerrar `/akili-specify`, por cada tarea: (a) todo fichero o directorio nombrado en `### Scope` debe caer dentro del `Directory boundary` declarado; (b) todo símbolo, id o ancla que la tarea asevere existir debe estar creado por esa tarea o por una de sus `Depends on`. |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.agents/reviewer.md` |
| Edit | Para mutar un fichero: copiar antes (`cp <f> <f>.bak`) y revertir con `cp` de vuelta. **Nunca `git checkout`, `git restore` ni `git stash`** mientras el árbol tenga cambios del Implementer sin commitear — su referencia es HEAD, no el estado previo. Tras la última reversión, verificar `git diff --stat` contra el estado esperado antes del veredicto. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.agents/reviewer.md` |
| Edit | Cuando la tarea toca una sección que el mockup dibuja, el Reviewer **abre el mockup** antes del veredicto y compara el inventario de clases del componente contra el de su sección. Un Done-when satisfecho no es evidencia de fidelidad. |
| Severity | **Critical** |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.agents/leader.md` |
| Edit | Toda reversión de una decisión aprobada (HITL incluido) ejecuta **Correction Closure** antes de implementar: grep del valor superado por toda la carpeta del spec —hacia delante, los sitios que el hallazgo no citó— y grep de las referencias *a* la sección corregida. Nombrar los sitios que ya se conocen no es el barrido: es el fallo. |
| Severity | Medium |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | `factual-sweep` |
| Target | `CLAUDE.md` · `AGENTS.md` (sección `### CodeGraph`) |
| Edit | Sustituir «CLI no instalado» por: CodeGraph **instalado y con índice vivo** (`.codegraph/` con daemon activo). Preferirlo a grep/find para localizar o entender código. No commitear la DB generada. |
| Severity | Medium |
| Status | pending |

### P6

| Field | Value |
|---|---|
| Kind | `factual-sweep` |
| Target | `docs/trd/trd.md` §12 |
| Edit | Playwright deja de ser «fase 1 late»: `npm run verify:visual` es un gate real con 13 mediciones (DD-038). Añadirlo a los comandos lean junto a `test:agent` y `lint`. |
| Severity | Medium |
| Status | pending |

### P7

| Field | Value |
|---|---|
| Kind | `factual-sweep` |
| Target | `CLAUDE.md` · `AGENTS.md` (resumen de constitución) |
| Edit | Añadir el pin `Default Branch: main`. Sin él, el Branch Context de `kaizen` cae al fallback en cada retrospectiva y `/akili-archive` difiere por defecto. |
| Severity | Low |
| Status | pending |

---

## Upstream a la metodología AKILI

Dos lecciones no nombran stack, dominio ni convención local — son huecos de plantilla disfrazados:

| Lección | Qué proponer aguas arriba |
|---|---|
| **KZ-006** | La regla de mutación/reversión del Reviewer pertenece a la persona `reviewer` de AKILI, no sólo a este repo. `git checkout` durante una revisión sobre árbol sucio es destructivo en cualquier proyecto. |
| **KZ-007** | El paso de revisión de `/akili-execute` debería exigir que, cuando existe una **Visual Reference** en `proposal.md`, el Reviewer la abra. Hoy la metodología pide validar contra el Done-when, y esa es literalmente la razón por la que once tareas pasaron divergiendo del diseño aprobado. Corolario para `/akili-specify`: enumerar las secciones que el mockup dibuja y comprobar que **cada una tiene dueño** en `tasks.md` — una sección sin tarea es una sección que nadie revisa. |
