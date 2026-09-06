# Archive Summary — services-page-redesign

**Entregado y verificado.** `/services` pasó de un listado plano de 31 cards a un catálogo editorial navegable. 11/11 requisitos con evidencia, 235 tests, cero FAIL.

## Document Control

| Field | Value |
|---|---|
| Spec path original | `docs/specs/changes/services-page-redesign/` |
| Fecha de archivo | 2026-09-05 |
| Estado final | **Completado** |
| Rama | `first-iteration-dev` (rama de spec) |
| Tipo | Change · Profundidad Standard |
| Implementer | **Antigravity** (`gemini-3.8-flash-high`) |
| Leader / Reviewer | Claude Code (opus) |
| Tester | `akili-tester` (sonnet) — ≠ Implementer |

## Requisitos entregados

| REQ | Entregado |
|-----|-----------|
| REQ-001 | Índice con línea activa por scroll-spy medido; el bug del salto por ancla, cerrado |
| REQ-002 | Desplazamiento continuo con el título visible bajo el nav (`ViewportScroller.setOffset`) |
| REQ-003 | Sub-servicios como filas de texto, jerarquía editorial, sin numeración en el título |
| REQ-004 | Divulgación progresiva: 6 visibles + revelar el resto |
| REQ-005 | Fila → contacto con servicio preseleccionado y sub-servicio en el mensaje |
| REQ-006 | CTA por línea de servicio + CTA de cierre |
| REQ-007 | Los 5 anclajes intactos; deep-links del road de Home siguen resolviendo |
| REQ-008 | Paridad ES/EN con gate de valores; el cambio de idioma conserva capítulo y expansión |
| REQ-009 | Responsive sin scroll horizontal (375 / 768 / 1400 medidos) |
| REQ-010 | ≥44px, foco dorado, estado programático |
| REQ-011 | Solo tokens AMD; contraste AA en los 7 elementos medidos |

## Archivos cambiados

**Nuevos:** `service-catalog.data.ts`, `active-chapter.ts`, `active-chapter.spec.ts`, `i18n-values-gate.spec.ts`
**Modificados:** `services-page.{ts,html,css,spec.ts}`, `contact-section.{ts,spec.ts}`, `assets/i18n/{es,en}.json`, `app.config.ts`, `angular.json`
**Fuera de `client/`:** `README.md`, `.nvmrc`, `CLAUDE.md`, `AGENTS.md`

## Evidencia de tests

**235 tests, 28 archivos, lint limpio, build sin avisos.**

Tres gates nacieron con **prueba de falsabilidad demostrada** — se rompió algo a propósito y se confirmó el rojo antes de restaurar: el gate de valores i18n, el de fidelidad de contenido, y el de conservación de estado al cambiar de idioma.

Verificación en navegador real (`iframes` con viewport propio): línea activa correcta tras clic, títulos no tapados, sin desbordamiento a 375/768/1400, contraste AA, objetivos ≥44px.

## Validación

Cero FAIL. Seis WARN, uno de ellos (presupuesto de CSS) resuelto durante la propia validación. Los cinco restantes documentados con remediación.

## Warnings aceptados y seguimiento

| # | Pendiente |
|---|---|
| 1 | **`bugfix/topnav-overflow-mobile`** — `.topnav__actions` / `.menu-btn` llegan a 462px en viewport de 375px, **en todas las rutas**. Preexistente, ajeno a este spec |
| 2 | OQ-1: confirmar con AMD el orden comercial de Contabilidad antes de publicar en Pages |
| 3 | Copy placeholder de Riesgo y Marca sigue provisional (fuera de alcance) |
| 4 | 7 items kaizen pendientes de la fase Apply en `main` |

## Notas históricas

- **El bug que originó el rediseño** (el índice marcando la línea equivocada) se reprodujo en el mockup v0.1 y se corrigió antes de escribir una sola línea de Angular. La causa —`IntersectionObserver` solo entrega las entradas cuyo estado cambió en ese tick— quedó como DD-017, y el brief de T002 se lo prohibió explícitamente al Implementer.
- **Primer spec ejecutado íntegramente por delegación:** Antigravity escribió todo el código de producción; Claude no escribió ninguna. Dos tareas volvieron con FAIL y ambas se corrigieron sin que el Leader tocara el teclado.
- **Dos defectos escaparon a todos los gates automatizados** y los encontró el HITL o una medición en navegador: el contenido faltante del mockup y el desbordamiento en móvil. Ambos generaron lecciones kaizen de severidad alta.
