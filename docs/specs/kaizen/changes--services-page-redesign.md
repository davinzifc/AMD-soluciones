# Kaizen Entry — changes/services-page-redesign

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/services-page-redesign` |
| Date | 2026-09-05 |
| Branch | `first-iteration-dev` (rama de spec — default es `main`) |
| Archive Run | 1 |
| Approval Mode | gated |
| Implementer | Antigravity (`gemini-3.8-flash-high`) · Leader/Reviewer: Claude Code opus |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tareas ejecutadas | **9** (7 planificadas + T008, T009 añadidas por HITL) | `tasks.md` |
| Rework por FAIL del Reviewer | **2** (T002 ×1, T004 ×1) | `execution.md` |
| HALTs / FATAL_FAILs | 0 | `execution.md` |
| Pivots | 0 | `execution.md` |
| **PRODUCT_BUGs** | **1** — desbordamiento horizontal ≤1099px (resuelto en T009) | `test-report.md` §2 |
| Hallazgos del reversion challenge | 4 no anticipados por el spec | `design.md` §7.1 |
| Validación FAIL / WARN | **0 / 6** (1 resuelto en la propia validación, 5 aceptados) | `validation-report.md` |
| Escalaciones desde `/akili-quick` | 0 | — |
| Desviación de presupuesto | tareas 7→9, rondas de revisión 2→3 | `design.md` §11 |
| Tests | 0 → **235**, 28 archivos | `test-report.md` |

**Jidoka en acción:** el Tester mantuvo el fallo de REQ-009 en rojo como `PRODUCT_BUG` en vez de reescribir la aserción; la línea se paró y el defecto se corrigió antes de archivar.

## Lessons

- **KZ-changes--services-page-redesign-1 — Una medición de navegador a un solo ancho no es cobertura responsive.** (Product, **High**)
  - Root cause: el check de navegador se hizo únicamente a 1080px. A ese ancho el desbordamiento coincide con el viewport y `scrollWidth > innerWidth` da `false`. La medición era correcta y la conclusión ("REQ-009 ✅") era falsa: a 375px el documento medía 775px sobre un viewport de 375.
  - 5W1H — *por qué no se detectó*: jsdom no hace layout, así que ninguno de los 235 tests podía verlo; y el único gate que sí podía (el navegador) se ejecutó en un solo punto de la curva.
  - Evidencia: `test-report.md` §2; `validation-report.md` WARN-3.
  - Standardization: → P1

- **KZ-changes--services-page-redesign-2 — Un mockup aprobado necesita su propio gate de fidelidad de contenido.** (Product + Methodology, **High**)
  - Root cause: `requirements.md` describía comportamiento (REQ-006: *"conserva el CTA de cierre"*) pero nunca un inventario de contenido por sección. El Implementer envolvió el marcado antiguo en las clases nuevas y **todos los gates siguieron verdes**; faltaban el eyebrow, el `<h2>`, el párrafo y un CTA del panel de cierre, más el eyebrow y la meta del hero.
  - 5W1H — *quién lo detectó*: el HITL, comparando el mockup con la pantalla, **después** del PASS del Reviewer.
  - Evidencia: `execution.md` — "Fallo del Reviewer detectado por HITL"; cerrado en T008.
  - Standardization: → P2 (local) + P3 (upstream)

- **KZ-changes--services-page-redesign-3 — La verificación de una tarea que toca CSS de componente debe incluir `build`.** (Product, Medium)
  - Root cause: las 9 tareas verificaban con `test:agent` y `lint`. Los presupuestos de estilo **solo se evalúan en el build de producción**, así que `services-page.css` llegó a 7,55 kB con un `maximumError` de 8 kB — a 0,45 kB de romper `build:pages`, que es el deploy — sin que ningún gate lo dijera.
  - Evidencia: `validation-report.md` WARN-1 / WARN-5.
  - Standardization: → P4

## Noted, not a lesson

- **Código defensivo para estados imposibles — 3 apariciones** (`'' as T` en T002; `?? '573248805290'` inalcanzable sobre un token `providedIn:'root'` en T004; `optional`+encadenamiento+`try/catch` inerte en T007). Mismo Implementer las tres veces. Dos costaron rework; la tercera se aceptó por presupuesto. **Recurrencia alta: candidata a lección propia en la próxima retrospectiva** si vuelve a aparecer.
- **Selectores con coma en tests de DOM** (`.subs li, .svc-subs li`): no fijan ningún contrato, pasan con cualquiera de los dos. Causaron el FAIL de T004. Cubierto de facto por el gate de fidelidad de P2, pero merece regla propia si reaparece.
- **Señal de fin de agente por terminal**: el TUI parte las líneas largas y el marcador `T00N DONE` se fragmentó; el vigía nunca disparó. **Ya estandarizado en la práctica** desde T002-r2: el worker escribe un archivo de reporte y el vigía comprueba su existencia. Sin item pendiente — ya es el procedimiento.
- Desviación de presupuesto (9 tareas vs 7, 3 rondas vs 2): ambas nacieron de defectos que el plan no anticipó y se escalaron a HITL antes de continuar, conforme al tripwire. El mecanismo funcionó; no hay lección.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/specs/general-setup/requirements.md` |
| Edit | En la tabla de clases de defecto: una clase verificada en navegador debe declarar **los anchos medidos**; un solo ancho no cubre un requisito responsive. |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/specs/general-setup/requirements.md` |
| Edit | Cuando el spec tenga mockup aprobado, añadir un requisito de **inventario de contenido por sección** (eyebrow, titular, párrafo, CTAs) verificable por test. |
| Severity | High |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | standardization |
| Target | **upstream AKILI** — plantilla `requirements.md` de la metodología |
| Edit | Misma regla que P2, generalizada: ningún elemento del proyecto (stack, dominio, convención local) interviene — es un hueco de plantilla. |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/specs/general-setup/task.md` |
| Edit | Toda tarea que modifique CSS de componente verifica también con el comando de build del proyecto — los presupuestos de estilo solo se evalúan ahí. |
| Severity | Medium |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `CLAUDE.md` — tabla `## Module Guides`, fila `client/` |
| Edit | La fila dice *"phase 1 archived as `domain/landing`"*; tras este spec debe citar también `changes/services-page-redesign` como archivado que reformó `/services`. |
| Severity | Low |
| Status | pending |

### P6

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/specs/kaizen-log.md` — nota de cabecera |
| Edit | Recordar que el digest lo escribe **solo** la fase Apply en la rama por defecto. Esta sesión lo violó escribiendo KZ-005…008 desde una rama de spec; se revirtió durante el archivado. |
| Severity | Medium |
| Status | pending |

### P7

| Field | Value |
|---|---|
| Kind | guide-sync |
| Target | `docs/specs/general-setup/task.md` |
| Edit | La señal de fin de un agente delegado se entrega por **archivo de reporte**, nunca leyendo el terminal: un TUI parte las líneas largas y fragmenta el marcador. |
| Severity | Medium |
| Status | pending |
