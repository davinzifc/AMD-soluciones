# Proposal — Rediseño de la página Servicios

Convertir `/services` de un **listado plano de 31 cards** en un **catálogo editorial navegable**: índice sticky con scroll-spy, sub-servicios como filas de texto con divulgación progresiva, identidad dorada AMD presente, y un CTA por línea de servicio que lleva al contacto con el servicio ya preseleccionado.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Slug | `services-page-redesign` — derivado del argumento free-text ("Rediseño de la sección/página Servicios…") |
| Type | Change |
| Approval Mode | gated |
| Status | **Draft** — pendiente aprobación HITL |
| Phase | 1-landing (post-`domain/landing`) |
| Depends on | `archive/2026-08-05-domain--landing` (T012 entregó la página actual) |
| Parallel-safe | yes — toca solo `features/services/` + una clave de contacto |
| Requirement source | Screenshot HITL de `localhost:4200/services` + free-text |
| Related | `docs/prd.md` §5 (In — fase 1) · `docs/ux-ui/design.md` §1 / §5 / §6 / §7 · `docs/trd/trd.md` ADR-002 |
| Kaizen | **KZ-001** (no tocar geometría ≥44px salvo que la tarea lo nombre) · **KZ-002** (nada de selectores `body`/`html` para show/hide) · **KZ-003** (pipes i18n impuros) |
| Skills | `ui-ux-pro-max` (aplicada) · `angular-developer` · `frontend-design` |

### Execution ownership (delegación HITL, 2026-09-05)

| Rol | Host / modelo | Responsable de |
|-----|---------------|----------------|
| **Owner / Leader (T1)** | Claude Code — `opus` (esta sesión) | Propose, specify, descomposición de `tasks.md`, orquestación, gates HITL |
| **Implementer (T2)** | **Antigravity `agy`** — `gemini-3.8-flash-high` | Ejecutar cada tarea de `tasks.md` (escribir el código) |
| **Reviewer (T3)** | Claude Code — `opus` (esta sesión) | Auditar el diff de Antigravity contra la spec; author ≠ auditor se cumple por construcción |
| **Tester (T2)** | Antigravity `agy` — `gemini-3.8-flash-high` | Suites asignadas; el Leader valida el reporte |

Invocación por tarea (print mode, un turno por tarea, sin sesión interactiva):

```bash
agy -p "<brief de la tarea desde tasks.md>" --model gemini-3.8-flash-high --effort high --mode accept-edits
```

`agy` está instalado y verificado en `/Users/pelitos/.local/bin/agy`. El Leader nunca escribe código de producción bajo este modo; si Antigravity falla dos veces en la misma tarea, el Leader escala a HITL en vez de tomar el teclado.

## Intent

Que un visitante entienda las 5 líneas de servicio, encuentre el servicio exacto que necesita entre 31, y pueda contactar **desde ese servicio** — sin scrollear una hoja de cálculo.

## Problem / Current Behavior

Evidencia: screenshot HITL de `/services` (2026-09-05) + `services-page.css`.

| # | Defecto observado | Por qué importa |
|---|-------------------|-----------------|
| 1 | 31 sub-servicios renderizados como 31 cards idénticas | Todo pesa igual; nada guía hacia los servicios ancla |
| 2 | Solo Contabilidad ocupa ~2,5 viewports de rectángulos iguales | Fatiga de scroll: Marca (grupo 5) casi nunca se ve |
| 3 | Numeración `01.` … `16.` dentro del título | Ruido: el número no significa prioridad ni orden de compra |
| 4 | Los chips del TOC parecen filtros pero solo saltan — sin estado activo ni conteo | Falsa affordance; el usuario pierde el "dónde estoy" |
| 5 | Cero acento dorado en toda la página (solo el nav) | Rompe §1.1 *Brand first* y el sistema de color §7 |
| 6 | Cards sin interacción alguna | Contradice §7 *"soft cards solo donde hay interacción"* — si no hacen nada, no deben ser cards |
| 7 | El único CTA está al final de la página | El usuario convencido en "Declaraciones" no tiene dónde hacer clic |
| 8 | Copy placeholder de Riesgo/Marca sin marca visual de provisionalidad en la jerarquía | Se lee como oferta cerrada |

## Proposed Outcome

1. **Índice sticky** (columna izquierda ≥1100px) con las 5 líneas, `aria-current` por scroll-spy y **conteo de servicios** por línea.
2. **Capítulos editoriales**: ordinal gigante en dorado al 9%, regla dorada, H2 + lead — una idea visual dominante por grupo (§6).
3. **Sub-servicios como filas de texto** con hairline y marcador dorado en hover — no cards.
4. **Divulgación progresiva**: 6 filas visibles por grupo + `Ver N servicios más` (`aria-expanded`).
5. **Cada fila es accionable** → contacto con el servicio preseleccionado.
6. **CTA por grupo**: `Cotizar <línea>` + WhatsApp, además del cierre de página.
7. **Numeración fuera del título**; el orden pasa a priorizar servicios ancla.
8. Nota de copy provisional (Riesgo/Marca) conservada, pero como badge secundario.

## Scope

**In:**

- `client/src/app/features/services/services-page/` — `.html`, `.css`, `.ts` (orden de datos, estado de expandido).
- Scroll-spy del índice (IntersectionObserver, sin librerías).
- Claves i18n nuevas (ES + EN en paridad): índice, `Ver N más`, `Cotizar <línea>`, conteos.
- Un punto de integración con la sección de contacto para preseleccionar servicio.

**Out (Non-Goals):**

- Rediseñar Home `#servicios` (el "road") — solo se verifica que sus deep-links siguen resolviendo.
- Cambiar el copy de los sub-servicios o cerrar el placeholder de Riesgo/Marca (input de negocio).
- Rutas nuevas (`/services/:group` sigue prohibido — DD-014: los grupos son fragments).
- Backend, formularios server-side, analítica nueva.
- Tocar tokens globales salvo promover 3 derivaciones de texto (ver Riesgos).

## Affected Users, Systems, And Specs

| Área | Impacto |
|------|---------|
| `features/services/services-page/*` | Reescritura de template + CSS; el `.ts` gana estado de expandido y orden |
| `features/home/services-road/*` | Solo lectura: los deep-links `/services#<id>` deben seguir resolviendo (ids sin cambio) |
| `features/home/contact/contact-section.ts` | `ServiceOption` recibe preselección desde la fila |
| `assets/i18n/{es,en}.json` | Claves nuevas con paridad (test `i18n-key-parity` ya lo vigila) |
| `docs/ux-ui/design.md` | **Delta requerido**: §5 dice que el sidenav flotante es solo de Home; este índice es un patrón nuevo de página profunda |

## Visual Reference

- Source: **Self-contained HTML mockup** (generado en esta sesión con `ui-ux-pro-max`)
- Location: `docs/specs/changes/services-page-redesign/mockup/` (`index.html`, `services-redesign.css`, `services-redesign.js`, `README.md`)
- Notes: cubre la página `/services` completa en desktop, tablet y móvil. Usa los tokens reales de `client/src/styles/tokens.css`, el copy real de `es.json` y los mismos `SERVICE_GROUP_IDS`. El array `GROUPS` del mock refleja 1:1 el modelo de datos de `services-page.ts` para que `/akili-specify` lo traduzca sin re-derivarlo.

## Requirement Delta Preview

### ADDED

- Índice sticky con scroll-spy, `aria-current` y conteo por línea; colapsa a chips horizontales `<1100px`.
- Divulgación progresiva por grupo (umbral configurable, hoy 6).
- CTA por grupo y fila accionable con contexto de servicio.
- Jerarquía editorial: ordinal dorado, regla dorada, ritmo de capítulo.

### MODIFIED

- Sub-servicio: de card a fila de texto con hairline.
- TOC: de chips estáticos a índice con estado.
- Orden de Contabilidad: prioridad comercial sobre el orden del brochure.
- Numeración: sale del título visible.

### REMOVED

- `.svc-sub` como card (fondo `rgba(255,255,255,0.03)` + borde por ítem).
- Prefijo `01.`…`16.` en los títulos renderizados (las claves i18n se conservan).

## Approach Options

| | A — Catálogo editorial + índice sticky **(recomendada)** | B — Bento por grupo + drawer de detalle | C — Acordeón simple |
|---|---|---|---|
| Qué hace | Índice con estado + capítulos + filas + divulgación progresiva | 5 tiles bento; el detalle completo abre en un sheet lateral | Colapsa cada grupo; el primero abierto |
| Defectos que corrige | 1–8 | 1–7, pero esconde el catálogo tras un clic | Solo 2 |
| Coste | Medio — 1 componente, sin dependencias nuevas | Alto — componente sheet + estado de ruta + foco atrapado | Bajo |
| Riesgo | Delta en design.md §5 (patrón de índice) | SEO/deep-link: el contenido deja de estar en el DOM inicial | Sigue leyéndose como hoja de cálculo |
| A11y | Estándar (scroll-spy + `aria-current`) | Exige focus trap y gestión de retorno | Trivial |

## Recommended Approach

**Opción A.** Es el camino seguro más pequeño que corrige los 8 defectos: sin dependencias nuevas, sin rutas nuevas, sin componentes overlay, conservando los `SERVICE_GROUP_IDS` — así los deep-links del road de Home no se tocan. B esconde el catálogo detrás de un clic y castiga el deep-link, que es justo el flujo F2 del design (§3). C es barato pero deja la página viéndose igual de genérica.

## Risks, Dependencies, And Open Questions

| Tipo | Detalle | Mitigación |
|------|---------|------------|
| Riesgo | El índice sticky contradice §5 del design ("sidenav solo en Home") | `/akili-specify` debe emitir un **DD nuevo**: índice de página profunda ≠ sidenav de Home (sin dots, sin scroll-spy de secciones de Home) |
| Riesgo | Reordenar Contabilidad cambia lo que el cliente vio aprobado | HITL debe confirmar el orden comercial antes de ejecutar |
| Riesgo (KZ-001) | Tocar CSS de filas puede degradar targets a <44px | Done-when de la tarea nombra explícitamente los ≥44px |
| Riesgo | **Scroll-spy por `IntersectionObserver` pinta el grupo equivocado** tras un salto por ancla: el callback solo recibe las entradas cuyo estado *cambió* en ese tick, así que el capítulo que quedó arriba puede no re-emitir. Detectado en el mockup v0.1 (HITL 2026-09-05) | El spy mide `getBoundingClientRect()` de los 5 capítulos contra una línea al 30% del viewport, en `requestAnimationFrame`. La tarea Angular debe portar **esta** estrategia, no un `IntersectionObserver`, y su Done-when incluye "clic en cualquier línea del índice deja esa misma línea activa" |
| Riesgo | Salto por ancla sin transición se siente roto | `scroll-behavior: smooth` en `html` + `scroll-margin-top` por capítulo; `auto` bajo `prefers-reduced-motion` |
| Riesgo (KZ-002) | El colapso responsive del rail tentará selectores `body`/`html` | Solo media queries + scope de montaje |
| Riesgo (KZ-003) | Claves i18n nuevas en listas renderizadas | Reutilizar `LocalizePipe` existente (ya impuro) |
| Dependencia | Preselección de servicio requiere que `contact-section` acepte contexto | Si el contrato no existe, la fila cae a WhatsApp con texto pre-armado |
| Dependencia | Ejecución delegada a Antigravity (`agy`) | Verificado disponible; el Leader revisa cada diff antes de PASS |
| Open Q | ¿Umbral de divulgación = 6, u 8? | HITL en `/akili-specify` |
| Open Q | ¿La fila abre contacto o WhatsApp directo? | HITL — impacta la métrica North Star del PRD |
| Open Q | ¿Se cierra el copy placeholder de Riesgo/Marca en este ciclo? | Input de negocio; hoy fuera de scope |

## Success Criteria

- [ ] Un visitante alcanza cualquiera de las 5 líneas en ≤1 interacción desde el índice.
- [ ] El alto de la página baja notablemente (Contabilidad: 16 filas → 6 + toggle).
- [ ] Cada grupo ofrece al menos un CTA sin volver al final de la página.
- [ ] `/services#<id>` sigue resolviendo para los 5 ids desde el road de Home.
- [ ] Paridad ES/EN verde (`i18n-key-parity`).
- [ ] Contraste ≥4.5:1 en todo texto; targets ≥44px; focus dorado visible; `prefers-reduced-motion` respetado.
- [ ] `npm run test:agent` y `npm run lint -- --quiet` en verde.

## Next Step

```text
/akili-specify changes/services-page-redesign
```
