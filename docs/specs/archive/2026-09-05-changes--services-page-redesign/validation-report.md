# Validation Report — services-page-redesign

**Veredicto: APTO PARA ARCHIVAR con 5 WARN aceptados.** Cero FAIL. WARN-1 (presupuesto de CSS) fue **resuelto durante esta validación** por decisión HITL.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Fecha | 2026-09-05 |
| Auditor | Claude Code (opus) — T3 |
| **Salvedad de independencia** | El auditor **no** escribió código de producción (lo hizo Antigravity), pero **sí** actuó como Reviewer durante `/akili-execute`. La independencia frente al *autor* se cumple; frente al *revisor*, no. Un tercer modelo daría una señal más limpia |
| Commits | `a878b47` (spec), `4b1fb3b` (infra) |

## Summary

| Fase | Resultado |
|------|-----------|
| 1 · Tareas completas | **PASS** — 8/8 en `[x]` (T006 corregido durante esta validación) |
| 2 · Existencia de archivos | **PASS** — los 7 del árbol de `design.md` §2, más los de T008 |
| 3 · Integridad de build | **PASS** — build limpio tras subir el presupuesto (HITL) |
| 4 · Cobertura de requisitos | **WARN** — 11/11 con dueño; 1 escenario sin test automatizado |
| 5 · Calidad | **PASS** con 2 notas advisory |
| 6 · Conformidad de diseño | **PASS** — con desviación de presupuesto registrada |

## 1. Task Completion

Las 8 tareas en `[x]` con PASS del Reviewer registrado en `execution.md`. Dos consumieron rework (T002, T004); T008 se añadió fuera de plan tras el check en navegador.

**Corrección aplicada en esta validación:** T006 seguía en `[~]` ("bloqueado hasta el check en navegador") pese a que el check se ejecutó y DC-2 se cerró en T008. Estado corregido a `[x]`. Sweep de cierre ejecutado: sin referencias obsoletas.

## 2. File Existence

Los 7 archivos previstos en `design.md` §2 existen. Modificados fuera de la feature, todos previstos: `contact-section.{ts,spec.ts}`, `assets/i18n/{es,en}.json`, `app.config.ts` (autorizado por HITL en T008).

## 3. Build Integrity

| Comando | Resultado |
|---------|-----------|
| `npm run test:agent` | **PASS** — 28 archivos, 234 tests |
| `npm run lint -- --quiet` | **PASS** |
| `npm run build` | **PASS** — sin avisos tras la remediación |

### WARN-1 — El CSS estaba a 0,45 kB de romper el build de producción · **RESUELTO**

```text
services-page.css exceeded maximum budget.
Budget 4.00 kB was not met by 3.55 kB with a total of 7.55 kB.
```

`angular.json` declara `anyComponentStyle: { maximumWarning: 4kB, maximumError: 8kB }`. Con **7,55 kB**, cualquier adición de ~450 bytes convierte el aviso en **error** y **rompe `npm run build:pages`**, que es el deploy a GitHub Pages.

**Causa de que se colara:** ninguna de las 8 tareas incluyó `npm run build` en su verificación — solo `test:agent` y `lint`. El presupuesto de estilos únicamente se evalúa en el build de producción.

**Riesgo:** alto para el siguiente cambio de CSS en esta página; nulo hoy.

**Resuelto (HITL, 2026-09-05).** `anyComponentStyle` pasó de `4kB/8kB` a **`16kB/32kB`** en `client/angular.json`. Build reverificado: **sin avisos**, incluido el de `services-road-section.css` que venía de antes.

Se descartó el valor de 20 MB que se barajó inicialmente: `anyComponentStyle` mide el CSS de **un componente**, no el bundle. A 20 MB el presupuesto no podría fallar nunca y dejaría de ser un gate. Con 16 kB hay margen de sobra sobre los 7,55 kB actuales y sigue detectando una regresión real (por ejemplo, una imagen embebida en base64 dentro del CSS).

*(Nota: `services-road-section.css` también excede en 828 bytes — preexistente, ajeno a este spec.)*

## 4. Requirement Coverage

Los 11 requisitos tienen tarea dueña a nivel de **escenario y cláusula** (tabla en `tasks.md`). Evidencia por requisito:

| REQ | Evidencia | Resultado |
|-----|-----------|-----------|
| REQ-001 | `active-chapter.spec.ts` (3 escenarios, incl. salto por ancla) + **medición en navegador**: clic en Riesgo → activa Riesgo, `aria-current` count = 1 | **PASS** |
| REQ-002 | **Medición en navegador**: capítulo en 144px, `<h2>` en 162px, nav termina en 69px → no tapado | **PASS** |
| REQ-003 | Tests de estructura + captura del navegador (filas con hairline, ordinal dorado, sin numeración) | **PASS** |
| REQ-004 | Test de toggle conductual + navegador: 31 filas en DOM, 21 visibles | **PASS** |
| REQ-005 | `contact-section.spec.ts`, incl. `servicio=noexiste` y supervivencia al cambio de idioma (intercambio de diccionario) | **PASS** |
| REQ-006 | Test de CTA por capítulo anclado + navegador | **PASS** |
| REQ-007 | Tests de los 5 ids sobre `article#<id>` y `href === '/services#<id>'` | **PASS** |
| REQ-008 | `i18n-key-parity` + `i18n-values-gate` (con falsabilidad demostrada) | **WARN — ver WARN-2** |
| REQ-009 | Navegador: sin scroll horizontal a 1080px | **WARN — ver WARN-3** |
| REQ-010 | Navegador: ≥44px en los 4 tipos de control; `aria-current`/`aria-expanded` en tests | **PASS** |
| REQ-011 | Cero púrpura verificado; contraste AA calculado sobre color computado real | **PASS** |

### WARN-2 — Escenario de REQ-008 sin test automatizado

El escenario dice: *"AND IT MUST conservar el capítulo y el estado de expansión"* al cambiar de idioma. La paridad de claves y valores está cubierta, pero **no hay test que verifique que el capítulo activo y el estado expandido sobreviven al cambio de locale** en `/services`. El equivalente sí existe en contacto (REQ-005).

Es un huérfano a nivel de escenario, del tipo exacto que `requirements.md` §5 advertía. Riesgo bajo (el estado vive en señales del componente, ajenas al diccionario), pero **no verificado**.

### WARN-3 — Cobertura responsive incompleta

`REQ-009` exige comportamiento correcto entre 375px y 1440px. Verificado **solo a 1080px** (modo chips), porque el navegador embebido no se puede redimensionar.

**Nunca se ha visto renderizado el índice en columna sticky de escritorio (≥1100px)** — la pieza central del rediseño en escritorio. Tampoco 375px ni 768px.

## 5. Linting & Code Quality

`lint` limpio. Dos notas **advisory** (no violan el spec):

| # | Nota | Origen |
|---|------|--------|
| A-1 | Andamiaje defensivo para estados imposibles en `contact-section.ts`: `optional: true` + encadenamiento opcional + `try/catch` que no puede lanzar + guardas `typeof` sobre señales conocidas | T007; aceptado por HITL; estandarizado como **KZ-005** |
| A-2 | `initScrollSpy`, `scheduleUpdate`, `checkActiveChapter` y `destroyScrollSpy` públicos por testabilidad en `ServicesPage` | T005; aceptado |

## 6. Design Conformance

Las 9 decisiones de diseño (DD-016 … DD-027) implementadas y verificadas. Sin drift no documentado.

### Contraste de cifras entre documentos

| Cifra | `design.md` §11 | Real | |
|-------|-----------------|------|---|
| Tareas | 7 | **8** | drift documentado (T008 añadida por HITL) |
| Rondas de revisión | 2 | **3** | drift documentado (T002, T004, + T008) |
| Sub-servicios | 31 | 31 | coherente |
| Líneas de servicio | 5 | 5 | coherente |

### WARN-4 — Presupuesto excedido

Ambas desviaciones se originaron en defectos que el plan no anticipó (el gate de fidelidad al mockup no existía) y se escalaron a HITL antes de continuar, conforme al contrato del tripwire. **No es un fallo de proceso**, pero queda registrado.

### WARN-5 — La verificación de las tareas nunca incluyó `build`

Causa raíz de WARN-1. Toda tarea que toque CSS de componente debe verificar con `build`, no solo con `test:agent` y `lint`.

### WARN-6 — Fidelidad al mockup sin gate durante 7 de 8 tareas

El contenido faltante del hero y del cierre pasó todos los gates y lo detectó el HITL. Cerrado en T008 con un gate de fidelidad; registrado como **KZ-008**.

## 7. Test Evidence Summary

No existe `test-report.md`: `/akili-test` aún no se ha ejecutado. La evidencia procede de `execution.md` y de las mediciones en navegador del Reviewer.

**234 tests, 28 archivos, verde.** Tres gates nacieron con **prueba de falsabilidad demostrada** (se rompió algo a propósito y se confirmó el rojo): el gate de valores i18n, el de fidelidad de contenido, y el caso `servicio=noexiste`.

## 8. Agent Guide / Constitution Impact

Sin notas `## Constitution Impact` en `execution.md`. No se crearon módulos nuevos ni se movieron fronteras. `client/` sigue sin `AGENTS.md` propio y las convenciones no divergen. **PASS.**

`CLAUDE.md` y `AGENTS.md` sí se actualizaron (registry de modelos, montaje de skills en Antigravity) — cambio de proceso, no de arquitectura.

## 9. Remediation

| # | Acción | Prioridad | Dueño |
|---|--------|-----------|-------|
| R-1 | ~~Resolver el presupuesto de `services-page.css`~~ | ~~Alta~~ | **HECHO** — presupuesto a 16kB/32kB, build limpio |
| R-2 | Añadir `npm run build` a la verificación de toda tarea que toque CSS de componente | Alta | plantilla de tareas |
| R-3 | Test del escenario de REQ-008 (idioma conserva capítulo y expansión) | Media | `/akili-test` |
| R-4 | Verificar el índice de escritorio ≥1100px y los breakpoints 375/768 | Media | check humano |

R-3 y R-4 son candidatos naturales para `/akili-test`.

## 10. Archive Readiness Recommendation

**APTO PARA ARCHIVAR.** Cero FAIL. WARN-1, el único con riesgo material, quedó resuelto durante la validación. Los 5 restantes están documentados con remediación asignada y ninguno bloquea el comportamiento entregado.

```text
/akili-test changes/services-page-redesign
/akili-archive changes/services-page-redesign
```
