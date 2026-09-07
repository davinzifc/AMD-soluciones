# Archive Summary — home-page-redesign

**La Home se rediseñó entera contra un mockup aprobado, y se cerró con los tres gates en verde:
322/322 tests, 13/13 mediciones en navegador, build sin avisos.** Veinte tareas, cero FAIL de
validación, cero HALTs. Lo que costó caro no fue implementar: fue que seis tareas se escribieran como
*deltas de comportamiento* y no portaran el diseño — la lección crítica que este spec deja.

## Document Control

| Field | Value |
|---|---|
| Spec path original | `docs/specs/changes/home-page-redesign/` |
| Archivado en | `docs/specs/archive/2026-09-06-changes--home-page-redesign/` |
| Fecha de archivo | 2026-09-06 |
| Estado final | **Completo — validado PASS, sin FAIL** |
| Baseline commit | `f891716` |
| Último commit del spec | `6393e5a` |
| Rama | `first-iteration-dev` |
| Approval Mode | `gated` |
| Ejecución | Implementer/Tester delegados a **Antigravity `gemini-3.8-flash-high`** vía Orca; Leader (T1) y Reviewer (T3) en Claude Code |
| Kaizen entry | `docs/specs/kaizen/changes--home-page-redesign.md` |

## Final Status

| Señal | Valor |
|---|---|
| Tareas | **20/20** `[x]` (presupuesto: 13) |
| Requisitos entregados | **14/14** |
| Validación | **PASS** — 0 FAIL · 8 WARN (6 resueltas, 2 aceptadas) |
| Rondas de rework | 11 · **1 Pivot** (T001) · **0 HALT** |
| LOC neto en `client/` | **+3 838** (presupuesto: ~1 900) |

## Requirements Delivered

| REQ | Qué entregó |
|---|---|
| REQ-001 | Ritmo claro dominante: 39.40 % de tinta, primer tramo claro a 1.00 vh |
| REQ-002 | `LedgerSection` — cinco líneas como índice editorial; sustituye el camino de tarjetas |
| REQ-003 | Deep-links `/services#<id>` y las anclas de la Home preservados; `#cifras` añadida |
| REQ-004 | Manifiesto claro con foto cuyo alto deriva del texto |
| REQ-005 | `FiguresBand` — banda full-bleed con video de fondo, scrim y tres métricas |
| REQ-006 | Testimonios con rotación a **6 s** y pausa al cursor/foco (revertido por HITL) |
| REQ-007 | `ClientWall` — carrusel infinito de 13 logos monocromos |
| REQ-008 | `SectionNav` sustituye al rail: un solo índice por ancho, verificado en 6 anchos |
| REQ-009 | Dos tokens de dorado de tinta, repartidos por tamaño computado |
| REQ-010 | Recorrido completo por teclado; reduced-motion apaga todo el movimiento |
| REQ-011 | Paridad ES/EN 208=208, sin claves huérfanas ni literales en código |
| REQ-012 | Cero scroll horizontal en 375/768/900/1200/1600/1920 px |
| REQ-013 | Bundle 452 kB · video fuera del bundle · máscaras 147.6 kB |
| REQ-014 | `docs/ux-ui/design.md` sincronizada (202 → 274 líneas) |

## Files Changed Summary

| Acción | Piezas |
|---|---|
| **Nuevos** | `ledger/` · `figures/` · `clients/` · `core/layout/section-nav/` · `core/motion/section-theme.ts` · `core/layout/chrome-offset.ts` · `e2e/` (gate de medición) · `public/media/` (7 imágenes + video + 13 máscaras) |
| **Modificados** | `about-teaser/` · `trust/` · `top-nav/` · `mobile-drawer/` · `home-page/` · `hero/` · `contact/` · `app.ts` · `tokens.css` · diccionarios ES/EN |
| **Borrados** | `services-road/` (4 ficheros, 1 042 líneas) · `home-side-nav/` |
| Suite | 31 → **33** ficheros · 285 → **322** tests |

## Test Evidence Summary

| Gate | Resultado |
|---|---|
| `npm run test:agent` | **322/322** en 33 ficheros |
| `npm run verify:visual` (Playwright, DD-038) | **13 PASS · 0 FAIL · 0 INCONCLUSO** |
| `npm run build` | sin avisos de budget · initial 452.47 kB |
| `npm run lint -- --quiet` | limpio |
| Revisión visual HITL | **4 pasadas** en navegador — origen de T014–T020 |

**No existe `test-report.md`:** `/akili-test` no se corrió como fase; los tests se escribieron dentro
de cada tarea con Reviewer independiente. Aceptado en la validación (W-6).

**El gate paró la línea una vez, y valió la pena.** T012 midió **+97 px de desborde horizontal a
375 px** — un defecto **preexistente** al spec que 19 tareas y cuatro revisiones no habían visto. Se
aisló en T020 y hoy mide 0.00 px.

## Validation Summary

`validation-report.md` — auditado por Claude Code `opus` (T3), **autor ≠ auditor**: implementó
Antigravity. Veredicto **PASS**, cero FAIL. Las ocho WARN eran documentales o de contenido menor.

Seis se resolvieron en la misma sesión: la deriva de `design.md` sobre los testimonios (seis sitios),
el Cierre de cobertura de `tasks.md`, el presupuesto de §10, la traducción de `q2`/`q2By`, los
checkboxes de T013 y el índice de Module Guides.

## Accepted Warnings & Follow-Ups

| Ítem | Estado |
|---|---|
| **W-6** — no hay `test-report.md` | Aceptado: la sustitución declarada (322 unit + 13 mediciones + 4 HITL) es evidencia suficiente |
| **W-7** — costura del carrusel en el límite exacto (−0.50 px contra \|≤0.50\|) | Aceptado como riesgo declarado. Vigilar si se vuelve intermitente en CI |
| **A-5** — tres copias independientes de los seis ids de ancla, sin nada que las case | Seguimiento fuera del spec |
| **A-6** — el orden **renderizado** del ledger no se asevera; un `.reverse()` dejaría 25 tests en verde | Seguimiento fuera del spec |
| **A-3** — `reducedMotion()` leído una sola vez en `ngAfterViewInit`; deriva de todo el proyecto | Tarea propia, no un parche |
| REQ-012, 2ª cláusula | El reapilado del ledger < 900 px está implementado pero **su único gate es HITL**. Declarado en `tasks.md` |
| Logos vectoriales de SK Glam y Obed Services | Pedir; no bloquea (SK Glam se amplía 1.49× y sale blando) |

## Historical Notes

**La reversión que el cliente pidió dos veces.** REQ-006 nació diciendo que los testimonios **no**
rotan solos, con una regresión de 15 s que lo guardaba. El cliente pidió en revisión que pasen solos
(T018, 9 s) y luego que pasen más rápido (T019, **6 s**, medido sobre el copy: el testimonio más largo
son 16 palabras). La objeción original —sustituir texto que se está leyendo— se resolvió con la pausa
al cursor y al foco, no renunciando a la rotación.

**La pieza que casi se pierde.** `HomeSideNav` contenía la **única implementación del repo** del
algoritmo «qué fondo tengo bajo mi propia posición vertical». Borrar el rail se la llevaba, y REQ-008
la necesitaba para **dos** barras. `HANDOFF.md` fijó T002 como primera tarea por eso: es el único
orden irreversible del spec.

**El mockup mandaba y no se le hizo caso a tiempo.** Once tareas pasaron con PASS del Reviewer antes
de que una revisión HITL en navegador encontrara que dos secciones no se parecían al diseño aprobado.
Las tareas escritas como «portar el mockup» salieron fieles; las escritas como «pasa de oscuro a
claro» produjeron componentes que cumplían su Done-when al 100 % y divergían del diseño. Es **KZ-007**,
la lección crítica de este spec, y costó las seis tareas de corrección T014–T019.

**Un agujero que se cerró de paso.** Entre 900 y 1099 px la Home **no tenía ningún índice de
secciones**: el drawer se ocultaba desde 900 px y el rail sólo aparecía desde 1100. Retirar el rail no
abrió un hueco — cerró uno que ya existía.

**El dorado de marca no es texto.** La Pivot T001 descubrió tarde que un solo token de tinta no basta:
`#8a7a2e` da 3.86:1, suficiente para texto grande, y **tres de los cuatro usos reales del acento se
renderizan a 12–18.4 px**. Hicieron falta dos tokens repartidos por tamaño computado. El mockup
incumple esta regla — portar su CSS al pie de la letra reintroduce el defecto.
