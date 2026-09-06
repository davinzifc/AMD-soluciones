# Tasks — services-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Execution log | `execution.md` (misma carpeta) |
| Depth | Standard |
| Budget (design §11) | 7 tareas · ≈700 LOC · 2 rondas de revisión |
| Directory boundary | `client/` — fase 1; **nunca** `server/` |
| Ejecución | **Implementer = Antigravity** (`agy --model gemini-3.8-flash-high`) · **Reviewer = Claude Code opus** (ver `proposal.md` → Execution ownership) |

## Grafo de dependencias

```text
T001 ──┬── T003 ──┬── T004 ──┬── T005
       │          │          └── T006
T002 ──┴──────────┘
T001 ────────────────── T007
```

Paralelizable con techo de 2 workers: `T001 ∥ T002` → `T003` → `T004 ∥ T007` → `T005 ∥ T006`.

## Estrategia de PR

≈700 LOC supera el umbral de ~400: **dos PRs**.

| PR | Tareas | LOC aprox. | Qué revisar primero |
|----|--------|-----------|---------------------|
| **PR 1 — Fundaciones** | T001, T002, T003 | ≈250 | El orden explícito del array y los tests de la función pura. Sin cambio visual salvo el orden y los títulos sin número |
| **PR 2 — Página + contacto** | T004, T005, T006, T007 | ≈450 | Primero el template y el estado (T004); el CSS (T006) es portado casi literal del mockup |

Las descripciones de PR siguen `cognitive-doc-design`: qué revisar primero, qué queda fuera de alcance, enlace al PR anterior/siguiente.

---

## T001 — Extraer el catálogo a datos con orden explícito

- **Status:** [x] PASS (Reviewer, 2026-09-05 — ver `execution.md`)
- **Depends on:** none
- **Directory boundary:** `client/src/app/features/services/services-page/`
- **Recommended skills:** angular-developer
- **Requirements:** REQ-003 (cláusula de orden), REQ-007 (ids intactos)
- **Design refs:** §3 Data Model, DD-020, DD-027
- **Verification:** `nvm use && cd client && npm run test:agent`
- **Evidence disqualifier:** si el verde se obtuvo relajando un conteo (`16` → `>=`), **no cuenta**: ese conteo es el único gate de facto de NFR-003.
- **Exemplar file:** `client/src/app/features/services/services-page/services-page.ts` (cabecera de doc-comment a imitar)

### Done when
- [ ] Existe `service-catalog.data.ts` con `ServiceSub`, `ServiceGroup`, `SERVICE_GROUP_IDS`, `SERVICE_VISIBLE_LIMIT = 6` y `SERVICE_GROUPS`.
- [ ] `subKeys()` eliminado; los `subs` de los 5 grupos son arrays **explícitos** de pares de claves.
- [ ] Contabilidad usa el orden comercial del mockup (Estados Financieros, Declaraciones, Revisoría, Facturación, Exógena, Asesoría contable, y luego el resto).
- [ ] **El reorden se hizo moviendo entradas del array. Ningún valor de `es.json`/`en.json` fue movido entre claves** (DD-027).
- [ ] `SERVICE_GROUP_IDS` sigue exportándose desde `services-page.ts` (re-export) — `contact-section.ts` y `contact-intent.model.ts` no se tocan.
- [ ] Los 5 ids de ancla son idénticos, en el mismo orden.

---

## T002 — Función pura de línea activa + sus tests

- **Status:** [x] PASS (Reviewer, 2026-09-05, intento 2 — ver `execution.md`)
- **Depends on:** none
- **Directory boundary:** `client/src/app/features/services/services-page/`
- **Recommended skills:** angular-developer
- **Requirements:** REQ-001 (los 3 escenarios)
- **Design refs:** §5.3, DD-017 · gate de DC-1
- **Verification:** `nvm use && cd client && npm run test:agent`
- **Input que la haría fallar:** posiciones donde el capítulo objetivo está justo por encima de la línea de lectura y el siguiente ya entró en viewport → si la función devuelve el siguiente, FALLA (es el bug del mockup v0.1). Y: última posición con `atBottom = true` y un capítulo final que nunca cruza la línea → si devuelve el penúltimo, FALLA.
- **Evidence disqualifier:** un test que solo comprueba el caso de scroll monótono hacia abajo **no es evidencia**: el defecto vive en el salto por ancla.

### Done when
- [ ] `active-chapter.ts` exporta una función **pura, sin DOM y sin acceso a `window`**: recibe posiciones `{id, top}`, la línea de lectura y `atBottom`; devuelve un id.
- [ ] Regla implementada: gana el **último** capítulo cuyo `top` cruzó la línea; con `atBottom` gana siempre el último.
- [ ] `active-chapter.spec.ts` cubre los 3 escenarios de REQ-001 con posiciones fabricadas, incluido el salto por ancla y el capítulo final corto.
- [ ] **Prohibido `IntersectionObserver`** en esta tarea y en T005 (DD-017).
- [ ] Nunca devuelve `undefined`/vacío: siempre exactamente un id.

---

## T003 — i18n: retirar el prefijo numérico, claves nuevas y gate de valores

- **Status:** [x] PASS (Reviewer, 2026-09-05 — ver `execution.md`)
- **Depends on:** T001
- **Directory boundary:** `client/src/assets/i18n/`, `client/src/app/core/i18n/`
- **Recommended skills:** angular-developer
- **Requirements:** REQ-003 (cláusula de numeración), REQ-008
- **Design refs:** §5.2, DD-023 · gate de DC-9
- **Verification:** `nvm use && cd client && npm run test:agent`
- **Input que la haría fallar:** strippear `"01. "` en `es.json` y dejar `en.json` intacto → el test de valores debe FALLAR. Si no falla, el test no es evidencia.
- **Evidence disqualifier:** verde con el test corriendo sobre un solo diccionario no cuenta.

### Done when
- [ ] Ningún valor `sub*t` empieza por prefijo numérico (`NN. `) — en **ES y EN**. Afecta `subC01t`…`subC16t` y `subA01t`…`subA04t`.
- [ ] **Ninguna palabra cambió**: solo se retiró el prefijo. Riesgo/Asesoría/Marca no se tocan (nunca tuvieron número).
- [ ] Claves nuevas en ambos idiomas: `svcIndexTitle`, `svcIndexAria`, `svcShowMore` (con marcador `{n}`), `svcShowLess`, `svcQuoteLine` (con marcador `{line}`), `svcRowCue`.
- [ ] Test de valores nuevo: ningún `sub*t` con prefijo numérico en ambos idiomas **y** el número de entradas `sub*t`/`sub*d` no cambió.
- [ ] **Lo que este gate no puede probar:** un remapeo semántico título↔descripción. Contra eso actúa T001 (se mueve el array, no el diccionario) más revisión humana.
- [ ] `i18n-key-parity` sigue en verde.

---

## T004 — Template del catálogo: índice, capítulos, filas y CTAs

- **Status:** [x] PASS (Reviewer, 2026-09-05, intento 2 — ver `execution.md`)
- **Depends on:** T001, T003
- **Directory boundary:** `client/src/app/features/services/services-page/`
- **Recommended skills:** angular-developer, ui-ux-pro-max
- **Requirements:** REQ-003, REQ-004, REQ-006, REQ-007
- **Design refs:** §5.1, §5.4, DD-018, DD-019, DD-022, DD-025, DD-026
- **Verification:** `nvm use && cd client && npm run test:agent`
- **Evidence disqualifier:** un test que use `querySelector('a.btn--gold')` o `a.btn--ghost` sin anclar al capítulo **no es evidencia** — habrá varios CTAs y tomará el primero. Igual para `textContent).toContain('subC01t')`: el stub devuelve la clave, así que matchea un `aria-label` o un nodo oculto.
- **Exemplar file:** `docs/specs/changes/services-page-redesign/mockup/index.html` + `mockup/services-redesign.js` (estructura y marcado)

### Done when
- [ ] `activeGroup` y `expanded` como señales; `moreLabel` como `computed` que interpola `{n}` vía `translate()` (DD-023).
- [ ] **Un solo índice en el DOM** con 5 enlaces, cada uno `routerLink="/services" [fragment]` → `href === "/services#<id>"` (DD-026).
- [ ] El `id` de ancla vive en el `<article>` del capítulo, **no** en un elemento vacío (DD-025).
- [ ] Las 31 filas están en el DOM aunque el grupo esté colapsado; el colapso es por atributo de dato, **no** `@if` (DD-019 / NFR-003).
- [ ] El control de divulgación solo existe si el grupo supera 6, expone `aria-expanded` y permite colapsar.
- [ ] Cada fila enlaza a `/` fragment `contacto` con `servicio=<id>` y `detalle=<titleKey>` (clave, no texto traducido).
- [ ] CTA por capítulo (`svcQuoteLine` + WhatsApp) **y** el CTA de cierre de página se conservan.
- [ ] Ninguna numeración `NN.` antepuesta al título visible.
- [ ] `services-page.spec.ts` actualizado: aserciones ancladas al capítulo o al rol; **conteos 16/4 y 5-enlaces conservados exactos**, nunca relajados a `>=`.
- [ ] Cada aserción de presencia tocada declara en un comentario **qué no prueba**.

---

## T005 — Conectar el seguimiento de lectura al componente

- **Status:** [x] PASS (Reviewer, 2026-09-05 — DC-2 pendiente hasta post-T006)
- **Depends on:** T002, T004
- **Directory boundary:** `client/src/app/features/services/services-page/`
- **Recommended skills:** angular-developer
- **Requirements:** REQ-001 (cableado), NFR-001
- **Design refs:** §5.3, DD-017
- **Verification:** `nvm use && cd client && npm run test:agent` (no debe romper en jsdom) **+ check humano en dev server**: clic en 3 líneas distintas del índice y 1 deep-link `/services#marca`; la línea activa debe coincidir en los 4 casos.
- **Evidence disqualifier:** el verde de jsdom **no es evidencia de REQ-001**: jsdom no hace layout ni scroll, así que todas las medidas son 0. El único gate real de la lógica es T002; este es el cableado, y su prueba es el check humano.
- **Lo que la verificación automatizada no puede probar:** DC-2 (suavidad, offset del nav) y el comportamiento real de scroll.

### Done when
- [ ] **Guarda de lista vacía antes de llamar a `resolveActiveChapter`** (su tipo ya no admite lista vacía — deuda heredada de T002).
- [ ] Las mediciones se toman tras `afterNextRender`; nada mide en un entorno sin layout.
- [ ] `scroll` y `resize` se escuchan **fuera de la zona de Angular**, coalescidos a un `requestAnimationFrame` (NFR-001).
- [ ] Se vuelve a la zona **solo cuando el id cambia**.
- [ ] Expandir o colapsar un grupo re-evalúa la línea activa.
- [ ] Las suscripciones se limpian al destruir el componente.
- [ ] El índice expone la línea activa de forma **programática** (`aria-current`), no solo por color (REQ-010).
- [ ] Sin `IntersectionObserver` (DD-017).

---

## T006 — CSS: portar el mockup a la página

- **Status:** [x] PASS (Reviewer, 2026-09-05 — check en navegador ejecutado: contraste AA, ≥44px, sin scroll horizontal; DC-2 cerrado por T008)
- **Depends on:** T004
- **Directory boundary:** `client/src/app/features/services/services-page/services-page.css`
- **Recommended skills:** ui-ux-pro-max, frontend-design
- **Requirements:** REQ-002, REQ-009, REQ-010, REQ-011
- **Design refs:** §5.5, §5.6, DD-024
- **Verification:** `cd client && npm run lint -- --quiet` **+ check humano obligatorio** contra `mockup/index.html` en 375px, 768px, 1024px y 1440px.
- **Evidence disqualifier:** `lint` verde **no es evidencia de nada visual**. jsdom no rasteriza ni mide caja: contraste (DC-3) y objetivos de 44px (DC-7) **no tienen gate automatizado** y se saldan en la pausa HITL.
- **Exemplar file:** `docs/specs/changes/services-page-redesign/mockup/services-redesign.css`

### Done when
- [ ] CSS portado del mockup v0.1.1, adaptado a `:host` con scope de componente.
- [ ] Los 4 valores derivados (`--ink-text`, `--ink-text-2`, `--ink-text-3`, `--hairline`) se declaran en `:host`, **no** en `tokens.css` (DD-024).
- [ ] `scroll-behavior: smooth` en el documento + `scroll-margin-top` por capítulo, con `auto` bajo `prefers-reduced-motion` (REQ-002).
- [ ] Breakpoints: índice en columna ≥1100px, chips horizontales por debajo; filas a 1 columna <720px.
- [ ] **Ningún selector con ancestro `body`/`html` para mostrar u ocultar** (KZ-002) — solo media queries.
- [ ] Todos los objetivos táctiles ≥44px (KZ-001) y foco visible en dorado.
- [ ] Cero color fuera de los tokens AMD; cero `#673de6`/`#5025d1`/`#8c85ff`.
- [ ] Sin scroll horizontal de página en ninguno de los 4 anchos.

---

## T007 — Preselección de servicio en el formulario de contacto

- **Status:** [x] PASS con observación (HITL eligió aceptar, 2026-09-05 — ver `execution.md` y KZ-005)
- **Depends on:** T001
- **Directory boundary:** `client/src/app/features/home/contact/`
- **Recommended skills:** angular-developer, error-handling-patterns
- **Requirements:** REQ-005
- **Design refs:** §4 API Contracts · gate de DC-8
- **Verification:** `nvm use && cd client && npm run test:agent`
- **Input que la haría fallar:** `servicio=noexiste` → el formulario debe quedar intacto y no lanzar. Si el test no cubre ese caso, no es evidencia.

### Done when
- [ ] `ContactSection` lee `queryParamMap` una vez al inicializar.
- [ ] `servicio` se aplica a `serviceInterest` **solo** si pertenece a `SERVICE_GROUP_IDS`; cualquier otro valor se ignora en silencio.
- [ ] `detalle` llega como **clave** i18n y se localiza al renderizar → sobrevive al cambio de idioma (KZ-003).
- [ ] El mensaje prellenado identifica el sub-servicio.
- [ ] **No** se llama a ninguna API ni se emite analítica nueva (fase 1, ADR-003).
- [ ] Tests: preselección válida, valor inválido ignorado, y ausencia de parámetros (comportamiento actual intacto).

---

## T008 — Contenido del mockup, gate de fidelidad y arreglo de REQ-002

- **Status:** [x] PASS (Reviewer, 2026-09-05 — verificado en navegador real)
- **Depends on:** T004, T006
- **Añadida fuera del plan** tras el check en navegador (HITL). Cubre KZ-008.
- **Verification:** suite + `lint` + **medición en navegador**: `top` del capítulo tras clic del índice debe ser ≥ el borde inferior del nav.

### Done when
- [x] Cierre con eyebrow, `<h2>`, párrafo y los 2 CTAs del mockup; `backRoad` retirado.
- [x] Hero con eyebrow y meta de 3 datos, **conteos derivados del catálogo**.
- [x] 8 claves i18n nuevas en ES y EN.
- [x] `ViewportScroller.setOffset` en forma de función, adaptado al breakpoint.
- [x] Gate de fidelidad de contenido con prueba de falsabilidad demostrada.

## T009 — Corregir el desbordamiento horizontal en móvil y tablet

- **Status:** [x] PASS (Reviewer, 2026-09-05 — medido en navegador a 375/768/1400)
- **Depends on:** T006
- **Añadida** tras el PRODUCT_BUG de `/akili-test`.
- **Verification:** suite + lint + **build** + medición por iframe a 375/768/1400px.

### Done when
- [x] `minmax(0, 1fr)` en la media query `≤1099px`.
- [x] Eliminada la dependencia de `50vw` en el rail móvil.
- [x] Scroll horizontal interno de los chips conservado.
- [x] Escritorio ≥1100px intacto.
- [x] KZ-002 respetado: sin `body`/`html`, sin `overflow-x: hidden` de tapadera.

## Cobertura requisito → tarea

| REQ | Escenario / cláusula | Tarea |
|-----|----------------------|-------|
| REQ-001 | El índice sigue la lectura | T002 (lógica) + T005 (cableado) |
| REQ-001 | Clic en el índice (bug v0.1) | T002 + T005 (check humano) |
| REQ-001 | Final de página | T002 |
| REQ-001 | *BUT NOT* más de un índice en el DOM | T004 |
| REQ-002 | Salto suave + `<h2>` visible + reduced-motion | T006 (+ check humano DC-2) |
| REQ-003 | Jerarquía de capítulo, dorado presente | T006 |
| REQ-003 | *BUT NOT* card por sub-servicio | T004 + T006 |
| REQ-003 | *BUT NOT* numeración en el título | T003 (valores) + T004 (template) |
| REQ-004 | Revelar / colapsar, `aria-expanded`, no en grupos ≤6 | T004 |
| REQ-004 | *BUT NOT* fuera del DOM inicial | T004 |
| REQ-005 | Preselección + detalle + sobrevive idioma | T007 (destino) + T004 (origen) |
| REQ-005 | *BUT NOT* llamada a API | T007 |
| REQ-006 | CTA por línea + CTA de cierre conservado | T004 |
| REQ-007 | Deep-link, 5 ids, id en el `<article>` | T001 (ids) + T004 (marcado) |
| REQ-008 | Paridad y estado al cambiar idioma | T003 |
| REQ-009 | Chips, 1 columna, sin scroll horizontal | T006 |
| REQ-009 | *BUT NOT* selectores `body`/`html` | T006 |
| REQ-010 | Teclado, foco, 44px, estado programático | T005 (`aria-current`) + T006 (foco, 44px) |
| REQ-011 | Solo tokens AMD, cero púrpura | T006 |

## Convenciones de ejecución

1. Commit: `[SPEC:docs/specs/changes/services-page-redesign] <mensaje>`
2. El Leader registra Attempt History en `execution.md`; `[~]` → `[x]` solo tras **PASS** del Reviewer.
3. 3 fallos de rework en la misma tarea → HALT y escalada a HITL.
4. No correr build ni mediciones mientras un worker escribe.
5. **DC-2, DC-3 y DC-7 no tienen gate automatizado.** Ninguna tarea puede declararse completa apoyándose solo en el verde de la suite; el check humano es un paso nombrado del gate de `/akili-validate`.
