# Execution — services-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Branch | `first-iteration-dev` |
| Orchestration Run | `run_562e4cba24c1` |
| **Implementer** | **Antigravity CLI 1.1.27** — Gemini 3.8 Flash (High) — terminal Orca `term_a92b415d` |
| **Leader + Reviewer** | Claude Code (opus) — esta sesión |
| Budget (design §11) | 7 tareas · ≈700 LOC · 2 rondas de revisión |
| Regla de estado | `[~]` → `[x]` **solo** tras PASS del Reviewer registrado aquí |
| Escalada | 3 fallos de rework en una tarea → HALT a HITL |

## Registro de tareas en Orca

| Tarea | Task id | Depende de |
|-------|---------|-----------|
| T001 | `task_7a9987d7b054` | — |
| T002 | `task_b4ff11bc993a` | — |
| T003 | `task_71aacd675764` | T001 |
| T004 | `task_ace56575576d` | T001, T003 |
| T005 | `task_985e4e23c20d` | T002, T004 |
| T006 | `task_bad36dad205c` | T004 |
| T007 | `task_5fcf7df159c6` | T001 |

**Orden de despacho:** un solo worker disponible → ejecución **serial**: T001 → T002 → T003 → T004 → T007 → T005 → T006. El paralelismo previsto (`T001 ∥ T002`) queda sin usar; no altera el grafo.

## Estado inicial del árbol (antes de T001)

```text
 M AGENTS.md              ← registry de modelos (esta sesión)
 M CLAUDE.md              ← registry de modelos (esta sesión)
 M client/package.json    ← script start:dev añadido fuera de este spec
 M client/package-lock.json
?? README.md              ← esta sesión
?? docs/specs/changes/    ← este spec
```

Node local: **v22.18.0** (coincide con el LTS esperado por el repo).

## Attempt History

| # | Tarea | Intento | Implementer | Resultado | Notas |
|---|-------|---------|-------------|-----------|-------|
| 1 | T001 | 1 | Antigravity | **PASS** | Revisado por Leader. Ver veredicto abajo |

### T001 — veredicto del Reviewer (2026-09-05)

**PASS.** Auditoría independiente, sin apoyarme en el verde reportado por el Implementer.

| Done-when | Resultado |
|-----------|-----------|
| `service-catalog.data.ts` con interfaces, ids, `SERVICE_VISIBLE_LIMIT = 6`, `SERVICE_GROUPS` | ✅ 103 líneas |
| `subKeys()` eliminado; subs como arrays explícitos | ✅ |
| Contabilidad en orden comercial | ✅ C01, C06, C08, C09, C07, C05, C02, C03, C04, C10…C16 — exacto |
| **DD-027: diccionarios sin tocar** | ✅ `git diff client/src/assets/i18n/` vacío |
| 16 pares `titleKey`/`descKey` emparejados | ✅ verificados uno a uno (`subC06t`↔`subC06d`, etc.) |
| Re-export de `SERVICE_GROUP_IDS` | ✅ `contact-section.ts`, `contact-intent.model.ts` y `services-road-section.ts` sin tocar |
| Ids idénticos y en el mismo orden | ✅ |
| Ningún test relajado | ✅ conteos 16/4 intactos |
| Sin dependencias nuevas | ✅ |

**Verificación independiente:** `npm run test:agent` → **26 archivos, 195 tests, todo verde**.

**Observación menor (sin rework):** dos citas de decisión equivocadas en comentarios del archivo nuevo — el reorden se atribuye a DD-027 (es DD-020) y el límite a DD-019 (es REQ-004 / decisión HITL). No afecta comportamiento; se corrige al pasar por T004.

| 2 | T002 | 1 | Antigravity | **FAIL** | 2 defectos: retorno vacío con cast, y alias especulativos. Rework despachado |

### T002 — veredicto del Reviewer, intento 1 (2026-09-05)

**FAIL.** La regla está bien implementada y los tests del salto por ancla (DC-1) son genuinamente buenos: cubren el caso del bug tres veces, más el capítulo final corto. Suite verificada por el Leader: **27 archivos, 208 tests, verde**.

Devuelto por dos defectos:

| # | Defecto | Por qué importa |
|---|---------|-----------------|
| 1 | `return '' as T` cuando la lista está vacía | Viola el Done-when explícito ("nunca vacío"). El cast miente al compilador; T005 escribiría `aria-current` sobre un id inexistente y el índice quedaría sin línea activa — justo lo que REQ-001 prohíbe. Además el test de invariante lleva el calificativo *"for non-empty lists"*, que recorta la invariante alrededor del único caso donde falla: un test moldeado sobre el defecto |
| 2 | Alias `getActiveChapter` / `pickActiveChapter` | Superficie pública especulativa que nadie pidió, con un test tautológico que no puede fallar |

Corrección pedida: lista no vacía **a nivel de tipo** (`readonly [ChapterPosition<T>, ...ChapterPosition<T>[]]`) — elimina la rama y el cast sin lanzar excepciones dentro de un manejador de scroll. La guarda de lista vacía se traslada a T005.

| 3 | T002 | 2 (rework) | Antigravity | **PASS** | Ambos defectos corregidos |

### T002 — veredicto del Reviewer, intento 2 (2026-09-05)

**PASS.** Los dos defectos del intento 1 quedaron corregidos exactamente como se pidió:

| Defecto | Corrección verificada |
|---------|----------------------|
| `return '' as T` | Firma ahora `readonly [ChapterPosition<T>, ...ChapterPosition<T>[]]`. **La rama y el cast desaparecieron por completo** — el caso vacío es irrepresentable, no atrapado en runtime |
| Alias especulativos | `getActiveChapter` y `pickActiveChapter` eliminados junto con su test tautológico. Un solo nombre exportado |
| Test de invariante | Perdió el calificativo *"for non-empty lists"* |

Las tres reglas de REQ-001 siguen intactas; la función sigue pura, sin DOM ni `window`, sin `IntersectionObserver` (DD-017 ✓).

**Verificación independiente del Leader:** `npm run test:agent` → **207 tests verdes**; `npm run lint -- --quiet` → limpio.

**Deuda trasladada a T005:** la guarda de lista vacía. El componente debe comprobar que hay capítulos **antes** de llamar a `resolveActiveChapter`, porque el tipo ya no admite lista vacía.

| 4 | T003 | 1 | Antigravity | **PASS** | Gate de valores con prueba de falsabilidad demostrada |

### T003 — veredicto del Reviewer (2026-09-05)

**PASS a la primera.**

**Auditoría del diff de diccionarios** (comparación programática contra `HEAD`, no confianza en el reporte):

| Comprobación | ES | EN |
|--------------|----|----|
| Claves eliminadas | ninguna | ninguna |
| Claves añadidas | las 6 previstas | las 6 previstas |
| Valores cambiados | 20 | 20 |
| **Cambios NO explicables solo por quitar el prefijo** | **NINGUNO** | **NINGUNO** |
| Prefijos numéricos restantes | 0 | 0 |
| `sub*t` / `sub*d` | 31 / 31 | 31 / 31 |

Es decir: **DD-027 respetado** — ningún valor se movió entre claves.

**Prueba de falsabilidad (exigida por el brief).** El Implementer dejó a propósito `"01. Financial Statements"` en `subC01t` de `en.json`. El gate falló nombrando ese valor exacto, **mientras `i18n-key-parity` seguía verde** — demostrando que el gate cierra un hueco que la paridad de claves no ve. Luego retiró el prefijo y todo volvió a verde.

**Calidad del gate** (`i18n-values-gate.spec.ts`): importa los diccionarios reales (no fixtures), recorre ambos idiomas, y **documenta explícitamente lo que no puede probar** (remapeo semántico título↔descripción), remitiendo a DD-027 más revisión humana. Es justo lo que el spec pedía.

**Verificación independiente del Leader:** `npm run test:agent` → **213 tests verdes**; lint limpio.

| 5 | T004 | 1 | Antigravity | **FAIL** | Selectores con coma que anulan el gate, número duplicado, métodos muertos |

### T004 — veredicto del Reviewer, intento 1 (2026-09-05)

**FAIL.** Suite verificada por el Leader: **218 tests verdes**, lint limpio. El template cumple las decisiones estructurales (índice único DD-026, `id` en el `<article>` DD-025, 31 filas en DOM con colapso por atributo DD-019, `detalle` como clave DD-021) y varios tests son genuinamente conductuales — el del toggle ejercita clics y comprueba `aria-expanded` y `data-collapsed` en ambos sentidos.

Devuelto por tres defectos:

| # | Defecto | Por qué importa |
|---|---------|-----------------|
| 1 | **Selectores con coma sobre clases duplicadas.** El template emite dos vocabularios (`class="subs svc-subs"`, `chapter__note svc-note`, `chapter svc-group`, `closer svc-actions`, `rail toc`) y los tests preguntan por ambos (`.subs li, .svc-subs li`) | Un selector con coma casa con cualquiera de los dos → **el test no fija ninguno de los dos contratos**. Es literalmente la clase DC-6 que este spec existe para cerrar. Además deja a T006 dos vocabularios que estilar |
| 2 | `inject(WHATSAPP_NUMBER, { optional: true }) ?? '573248805290'` | El token es `providedIn: 'root'` **con factory**: nunca falta, así que el literal es código muerto. Pero duplica una constante cuya config dice explícitamente que se centralizó para tener un único origen; los otros dos consumidores usan `inject(WHATSAPP_NUMBER)` a secas |
| 3 | `getMoreLabel()` / `getQuoteLabel()` sin usar | El template llama directo a los `computed`. Misma superficie especulativa por la que ya se devolvió T002 |

**Nota de presupuesto:** esta es la **segunda ronda de revisión**, el tope estimado en `design.md` §11. Si T005, T006 o T007 requieren rework, se supera el presupuesto y el Leader **escala a HITL** en vez de continuar.

| 6 | T004 | 2 (rework) | Antigravity | **PASS** | Los tres defectos corregidos |

### T004 — veredicto del Reviewer, intento 2 (2026-09-05)

**PASS.**

| Defecto | Corrección verificada |
|---------|----------------------|
| Selectores con coma sobre clases duplicadas | **0 clases heredadas** en el template (`svc-subs`, `svc-note`, `svc-group`, `svc-lead`, `svc-actions`, `toc` eliminadas) y **0 selectores con coma** en el spec. Cada aserción fija ahora un único contrato |
| Número de WhatsApp duplicado | `inject(WHATSAPP_NUMBER)` a secas, sin `optional` ni literal. Un solo origen |
| Métodos muertos | `getMoreLabel` / `getQuoteLabel` eliminados |

**Gates no relajados:** 16 / 4 / 4 / 3 por grupo, 31 filas totales, 5 enlaces de índice — todos exactos.

**Verificación independiente del Leader:** 218 tests verdes, lint limpio.

| 7 | T005 | 1 | Antigravity | **PASS** | Cableado correcto; DC-2 queda pendiente hasta después de T006 |

### T005 — veredicto del Reviewer (2026-09-05)

**PASS a la primera.** Verificación independiente: **223 tests verdes**, lint limpio.

| Requisito del brief | Verificado |
|---------------------|-----------|
| `afterNextRender` antes de medir | ✅ en el constructor |
| Listeners fuera de la zona (`runOutsideAngular`) | ✅ scroll y resize, ambos `passive` |
| Coalescencia a un solo `requestAnimationFrame` | ✅ guarda `if (this.rafId !== null) return` |
| Re-entrada a la zona **solo** al cambiar el id | ✅ `if (nextId !== this.activeGroup())` |
| **Guarda de lista vacía** (deuda heredada de T002) | ✅ `if (chapterElements.length === 0) return;` antes de llamar a la función |
| Línea de lectura al 30% y fórmula de `atBottom` | ✅ idénticas al mockup |
| Limpieza al destruir | ✅ `destroyRef.onDestroy` → `cancelAnimationFrame` + `removeEventListener` |
| Re-evaluar al expandir/colapsar | ✅ en `toggleGroup` |
| **Sin `IntersectionObserver`** (DD-017) | ✅ la única mención es el comentario que documenta que no se usa |

Tests nuevos: monta/destruye sin lanzar, guarda de lista vacía, retirada de listeners y `rAF` cancelado, re-evaluación al alternar, y cambio de `activeGroup`. No son tautológicos: espían `removeEventListener`/`cancelAnimationFrame` y mockean `querySelectorAll` para forzar la lista vacía.

**Observación menor (sin rework):** `initScrollSpy`, `scheduleUpdate`, `checkActiveChapter` y `destroyScrollSpy` quedaron públicos para poder ejercitarlos desde los tests. Es superficie interna expuesta, pero en jsdom no hay otra vía de probar el cableado, y no introduce comportamiento erróneo. Se acepta.

**DC-2 SIGUE SIN VERIFICAR.** El verde de jsdom no es evidencia de REQ-001: jsdom no hace layout y todo `getBoundingClientRect()` devuelve 0. El check en navegador **no se hace ahora**: la página tiene el template nuevo con el CSS viejo, así que cualquier observación visual sería engañosa. Se hace **después de T006**, y hasta entonces REQ-001 y REQ-002 quedan sin evidencia de comportamiento real.

| 8 | T006 | 1 | Antigravity | **PASS (condicional)** | Gates automatizados en verde; DC-2/DC-3/DC-7 pendientes de check en navegador |

### T006 — veredicto del Reviewer (2026-09-05)

**PASS en lo automatizable.** Verificación independiente: 28 archivos, **223 tests**, lint limpio.

| Requisito | Verificado |
|-----------|-----------|
| KZ-002 — sin selectores con ancestro `body`/`html` | ✅ cero coincidencias |
| REQ-011 — cero púrpura del builder | ✅ cero coincidencias |
| DD-024 — tokens derivados en `:host`, no en `tokens.css` | ✅ `--ink-text`, `--ink-text-2`, `--ink-text-3`, `--hairline`, `--nav-h` |
| REQ-002 — `scroll-margin-top` con offset del nav | ✅ desktop y móvil (el chip rail exige más offset) |
| `prefers-reduced-motion` | ✅ |
| KZ-001 — objetivos ≥44px | ✅ 5 declaraciones |
| Alcance | ✅ solo `services-page.css` |

**Buen criterio a destacar:** el brief avisaba de que `scroll-behavior` no se puede aplicar desde `:host`. En vez de duplicarlo o salirse del alcance, el Implementer **detectó que `client/src/styles.css` ya lo declaraba** (con su guarda de reduced-motion) desde un spec anterior, lo documentó en un comentario y no tocó el archivo. Verificado: `git status` limpio para `styles.css`.

**PENDIENTE — DC-2, DC-3 y DC-7 siguen sin evidencia.** Son las tres clases de defecto que `requirements.md` §5 declaró sin gate automatizado. Ahora que la página está completa, el check en navegador **ya es posible y es obligatorio antes de cerrar el spec**.

| 9 | T007 | 1 | Antigravity (**con skills**) | **PASS condicional — escalado a HITL** | Comportamiento correcto; andamiaje defensivo redundante por 3ª vez. Presupuesto de revisión agotado |

### T007 — veredicto del Reviewer (2026-09-05) · primer experimento con skills

**Comportamiento: correcto.** 28 archivos, **232 tests**, lint limpio. Las 7 reglas del contrato se cumplen, incluida la robustez con `servicio=noexiste` (test presente, con el input falsador exigido).

**Resultado del experimento.** Es el primer brief que **no** prescribe APIs de Angular. Antigravity cargó `angular-developer` y `error-handling-patterns` y tomó decisiones acertadas por su cuenta:

- `snapshot.queryParamMap` para leer una sola vez — coincide con la regla 1 de design §4 sin que nadie se la dictara.
- Type guard `isServiceGroupId` para la validación.
- `effect()` acoplado al diccionario para relocalizar `detalle` al cambiar de idioma.
- **Guarda `pristine`** para no pisar lo que el usuario ya escribió. Nadie lo pidió; es criterio propio y es correcto.

**Observación — patrón recurrente, 3ª aparición.** Añadió andamiaje defensivo para estados imposibles:

| Capa | Por qué sobra |
|------|---------------|
| `inject(ActivatedRoute, { optional: true })` | `ContactSection` vive dentro de una ruta |
| `this.route?.snapshot?.queryParamMap?.get(...)` | encadenamiento opcional en cada nivel |
| `try { … } catch { return '' }` | envuelve una lectura de propiedad ya totalmente opcional-encadenada: **no puede lanzar** |
| `typeof this.locale.dictionary === 'function' ? … : null` + `void dict` | guardas sobre señales que existen con certeza; basta con llamar a `translate()`, que ya lee la señal dentro del `effect` |

Es la misma clase que `'' as T` (T002) y que el `?? '573248805290'` inalcanzable (T004): **código defensivo para un estado que no puede ocurrir**. No produce comportamiento erróneo ni verde falso — a diferencia de los selectores con coma de T004 — pero es ruido que oscurece la intención.

**Presupuesto agotado.** `design.md` §11 estimó 2 rondas de revisión; ambas consumidas (T002, T004). Un rework aquí sería la 3ª → el Leader paró y escaló a HITL.

**Decisión HITL (2026-09-05): opción A — aceptar con observación.** Razón: el código funciona y está probado; el patrón se estandariza como **KZ-005** en vez de corregirse una tercera vez a mano, y el esfuerzo restante va al check en navegador, donde tres clases de defecto siguen sin evidencia. **T007 = PASS.**

## Check en navegador (Reviewer, 2026-09-05) — cierre de DC-2 / DC-3 / DC-7

Ejecutado sobre el dev server real en `http://localhost:4200/services`, viewport 1080×912, con el navegador embebido de Orca. **Esto es la evidencia que jsdom no podía producir.**

### Estructura medida en el DOM real

| Medida | Valor | Requisito |
|--------|-------|-----------|
| Índices en el DOM | **1** | DD-026 ✅ |
| Enlaces del índice / capítulos | 5 / 5 | REQ-001 ✅ |
| Filas en el DOM | **31** | NFR-003 ✅ |
| Filas **visibles** | **21** (10 ocultas por CSS) | REQ-004 ✅ — el colapso funciona de verdad |
| Scroll horizontal de página | **no** | REQ-009 ✅ |

### REQ-001 — el bug original, reproducido y cerrado

Clic en "Sistemas de Riesgo" desde el índice → **activa = "Sistemas de Riesgo"**, `aria-current` count = **1**, URL `/services#riesgo`. El defecto del mockup v0.1 **no se reproduce**. ✅

### DC-7 — objetivos táctiles (solo elementos visibles)

| Selector | Visibles | Alto mínimo |
|----------|----------|-------------|
| `.rail__link` | 5 | 44px ✅ |
| `.sub__link` | 21 | 78px ✅ |
| `.more` | 1 | 44px ✅ |
| `.chapter__cta .btn` | 10 | 44px ✅ |

KZ-001 respetado: ninguna geometría por debajo de 44px.

### DC-3 — contraste WCAG AA, calculado sobre color computado real

| Elemento | Ratio | Mínimo | |
|----------|-------|--------|---|
| `.chapter h2` | 17.15 | 3 | ✅ |
| `.sub__title` | 17.15 | 4.5 | ✅ |
| `.chapter__note` | 12.65 | 4.5 | ✅ |
| `.chapter__lead` | 9.21 | 4.5 | ✅ |
| `.rail__label` | 9.21 | 4.5 | ✅ |
| `.sub__desc` | **4.99** | 4.5 | ✅ (el más ajustado) |
| `.rail__count` | **4.99** | 4.5 | ✅ |

### DC-2 — **DEFECTO ENCONTRADO: REQ-002 no se cumple**

| Vía de navegación | `top` del capítulo | `<h2>` |
|-------------------|--------------------|--------|
| `scrollIntoView()` nativo | **144px** = el `scroll-margin-top` declarado | visible ✅ |
| **Router (clic en el índice / deep-link)** | **0px** | **tapado por el nav** ❌ |

Nav sticky (`app-top-nav`) termina en 69px; tras un clic del router el `<h2>` queda en y=18px → **oculto tras el nav**.

**El CSS de T006 es correcto** — lo demuestra que `scrollIntoView()` nativo aterriza exactamente en 144px. La causa es que `withInMemoryScrolling({ anchorScrolling: 'enabled' })` scrollea vía `ViewportScroller`, que **ignora `scroll-margin-top`**.

**Probablemente preexistente:** el CSS anterior declaraba `scroll-margin-top: 5.5rem` con el mismo router, así que los deep-links del road de Home ya aterrizaban bajo el nav. El rediseño lo hace más visible (5 clics de índice por página).

**Fuera del alcance declarado del spec** (el arreglo vive en `app.config.ts`, no en `features/services/`) **y con el presupuesto de revisión agotado** → escalado a HITL.

### No verificado

- **Layout de escritorio ≥1100px**: el navegador embebido tiene 1080px de ancho, así que solo se vio el modo chips. El índice en columna sticky no se ha visto renderizado.
- **375px / 768px**: no medidos.
- Aparece un badge rojo "Invalid PrimeUI License" (stub vacío en local, preexistente; CI puede inyectar el secreto).

## Fallo del Reviewer detectado por HITL (2026-09-05)

El HITL comparó el mockup con el desarrollo y encontró contenido faltante que **el Reviewer aprobó sin ver**:

| Zona | Mockup aprobado | Renderizado | Estado |
|------|-----------------|-------------|--------|
| Panel de cierre | eyebrow "Siguiente paso" + `<h2>` "¿No sabes por dónde empezar?" + párrafo + CTA WhatsApp | solo 2 botones; el segundo es `backRoad`, sobrante de la página anterior | ❌ |
| Hero de página | eyebrow "Portafolio AMD" + lista `hero-meta` (5 líneas · 31 servicios · 2 modalidades) | solo `<h1>` + lead | ❌ |

**Causa raíz — el spec, no el Implementer.** REQ-006 solo exige *"conserva el CTA de cierre de página"*, y el template lo conserva literalmente. La tabla de clases de defecto (DC-1…DC-9) cubre estructura, conteos, anclas, a11y, contraste y paridad i18n, pero **no tiene entrada para fidelidad de contenido al mockup**. Ningún gate podía fallar.

El Reviewer además vio el hero sin eyebrow en la captura del check de navegador y lo descartó como "menor, no es un REQ" en vez de leerlo como síntoma de un gate ausente.

Registrado como **KZ-008** (severidad High): un spec con mockup aprobado debe llevar inventario de contenido por sección como requisito verificable.

### T008 — veredicto del Reviewer (2026-09-05)

**PASS.** Verificación independiente: 28 archivos, **234 tests**, lint limpio, **más medición en navegador real**.

#### REQ-002 — corregido y medido

| | Antes | Después |
|---|-------|---------|
| `top` del capítulo tras clic en el índice | **0px** | **144px** |
| `top` del `<h2>` | 18px | 162px |
| Nav sticky termina en | 69px | 69px |
| **¿Título tapado?** | **SÍ** | **NO** ✅ |
| Línea activa | Sistemas de Riesgo | Sistemas de Riesgo ✅ (sin regresión) |

`ViewportScroller.setOffset` con **forma de función**: 96px en escritorio, 144px bajo el chip rail, derivado del `rootFontSize` para respetar la escala de fuente del usuario.

#### Fidelidad de contenido — medida en el DOM real

| Elemento | Renderizado |
|----------|-------------|
| Eyebrow del hero | "Portafolio AMD" ✅ |
| Meta del hero | "5 líneas de servicio \| 31 servicios \| 2 modalidades: individual o paquete" ✅ |
| Eyebrow del cierre | "Siguiente paso" ✅ |
| `<h2>` del cierre | "¿No sabes por dónde empezar?" ✅ |
| Párrafo del cierre | presente ✅ |
| CTAs del cierre | "Hablar con un asesor" → `/#contacto` · "Escribir por WhatsApp" → `https://wa.me/573248805290` ✅ |

`backRoad` retirado. El número de WhatsApp sale del token (`whatsappUrl()`), **sin literal** — no repitió el defecto de T004.

**Conteos derivados, no escritos a mano:** `totalLines = groups.length`, `totalServices = groups.reduce(...)`. Si cambia el catálogo, el hero sigue diciendo la verdad.

#### Gate de fidelidad — con prueba de falsabilidad

Borró el `<h2>` del cierre, la suite falló en `services-page.spec.ts:339` con `expected null to be truthy`, y lo restauró. El gate **puede fallar**, luego es evidencia.

## Hallazgo de entorno — bloqueante para toda verificación

`node` en el PATH del repo es **v22.18.0**, pero la CLI de Angular exige **≥ v22.22.3 / v24.15.0 / v26**. Con v22.18.0 la suite **no arranca**:

```text
The Angular CLI requires a minimum Node.js version of v22.22.3 or v24.15.0 or v26.0.0.
```

El salto de Antigravity a `.nvmrc` → v24.20.0 vía `nvm use` **no fue un descuido: era la única forma de correr los tests.** Mi aviso previo de "riesgo de Node 24" estaba invertido.

Contrato para el resto de tareas — toda verificación corre así:

```bash
nvm use   # lee .nvmrc → v24.20.0
cd client && npm run test:agent
```

`npm run test:agent -- <filtro>` **no funciona** en esta versión (`Error: Unknown arguments: watch, reporters, …`). Se corre la suite completa, sin filtros.
