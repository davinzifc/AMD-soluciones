# Design — services-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Status | Draft |
| Depth | Standard |
| Related requirements | `requirements.md` (REQ-001 … REQ-011) |
| Related UX | `docs/ux-ui/design.md` §5, §6, §7, §9, §10 |
| Related TRD | `docs/trd/trd.md` ADR-002, ADR-003 |
| Visual source | `mockup/index.html` v0.1.1 (CSS y estrategia de spy son la referencia normativa) |
| Kaizen aplicados | KZ-001, KZ-002, KZ-003 |

## 1. Overview

El rediseño **no añade rutas, módulos, dependencias ni componentes hijos**. `ServicesPage` sigue siendo el único componente de la feature; gana estado de señales para la línea activa y la expansión, y delega la decisión de "qué línea está activa" a una **función pura** aislada — que es lo único que hace verificable en jsdom el defecto DC-1.

## 2. Architecture Overview

```text
client/src/app/features/services/services-page/
├── service-catalog.data.ts     ← NUEVO  datos + SERVICE_GROUP_IDS + límite de divulgación
├── active-chapter.ts           ← NUEVO  función pura de scroll-spy (gate DC-1)
├── active-chapter.spec.ts      ← NUEVO  tests de la función pura
├── services-page.ts            ← MOD    estado de señales; re-exporta SERVICE_GROUP_IDS
├── services-page.html          ← MOD    índice + capítulos + filas
├── services-page.css           ← MOD    portado del mockup
└── services-page.spec.ts       ← MOD    selectores anclados (ver §9)
```

Fuera de la feature:

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `features/home/contact/contact-section.ts` | Lee `queryParamMap` y precarga el formulario | REQ-005 |
| `assets/i18n/{es,en}.json` | Claves nuevas de chrome + retirada del prefijo numérico | REQ-003, REQ-008 |
| `features/home/services-road/*` | **Sin cambios** — solo se verifica por test | REQ-007 |

### Por qué no se extraen componentes hijos

El índice y los capítulos comparten una única fuente de posiciones y un único estado activo; separarlos obligaría a un canal de coordinación entre padre e hijo por cada frame de scroll. Se mantiene un componente y se extrae **la lógica**, no el DOM. Esto además evita la trampa de KZ-004 (un componente hijo exige aserción de ancestría en el DOM que aquí no aporta nada).

## 3. Data Model

Las interfaces `ServiceSub` y `ServiceGroup` no cambian. Se mueven a `service-catalog.data.ts` junto con:

| Símbolo | Valor / forma | Nota |
|---------|---------------|------|
| `SERVICE_GROUP_IDS` | `['contabilidad','administrativa','riesgo','asesoria','marca']` | **Idéntico** — contrato de anclas (REQ-007) |
| `SERVICE_VISIBLE_LIMIT` | `6` | Decisión HITL |
| `SERVICE_GROUPS` | 5 grupos con `subs` como arrays **explícitos** de pares de claves | Sustituye al generador `subKeys()` |

`services-page.ts` **re-exporta** `SERVICE_GROUP_IDS` para que `contact-section.ts` conserve su import actual (`from '../../services/services-page/services-page'`) sin tocar otra feature.

### Por qué muere `subKeys(prefix, count)`

El generador produce claves en orden correlativo (`subC01t` … `subC16t`), lo que **fuerza** el orden del brochure. El orden comercial aprobado no es correlativo, así que el generador ya no puede expresar el dato. Se sustituye por listas explícitas: el orden pasa a ser un dato legible y revisable en vez de un efecto secundario de un bucle.

## 4. API Contracts

Ninguno: fase 1 no tiene backend (ADR-003). El único contrato nuevo es de **navegación interna**:

| Origen | Destino | Parámetros |
|--------|---------|-----------|
| Fila de sub-servicio | `/` fragment `contacto` | `servicio=<ServiceGroupId>`, `detalle=<titleKey>` |
| CTA de línea | `/` fragment `contacto` | `servicio=<ServiceGroupId>` |

Reglas del consumidor (`ContactSection`):

1. Lee `queryParamMap` **una vez** al inicializar.
2. `servicio` se aplica solo si pertenece a `SERVICE_GROUP_IDS`; cualquier otro valor se ignora en silencio (nunca rompe el formulario).
3. `detalle` viaja como **clave i18n**, nunca como texto traducido — así el prellenado se localiza al renderizar y sobrevive al cambio de idioma (REQ-005, en línea con KZ-003).
4. No se emite analítica nueva ni se llama a ninguna API.

## 5. Frontend Design

### 5.1 Estado del componente

| Señal | Tipo | Papel |
|-------|------|-------|
| `activeGroup` | `signal<ServiceGroupId>` | Línea marcada en el índice (REQ-001) |
| `expanded` | `signal<ReadonlySet<ServiceGroupId>>` | Qué líneas están desplegadas (REQ-004) |
| `moreLabel(group)` | `computed` por grupo | Etiqueta del control con el conteo interpolado |

### 5.2 Interpolación del conteo sin tocar el pipe

`LocalizePipe.transform()` acepta **solo una clave**: no hay interpolación de parámetros. Se resuelve en el componente con un `computed()` que llama a `LocaleService.translate()` y sustituye un marcador `{n}`:

- La clave `svcShowMore` vale `"Ver {n} servicios más"` / `"Show {n} more services"`.
- `translate()` lee `dictionarySignal()`, así que el `computed` se recalcula solo al cambiar de idioma.

Alternativa rechazada: extender `LocalizePipe`/`LocaleService` con parámetros. Es la solución "correcta" a largo plazo, pero toca i18n compartido por toda la app para un único caso de uso — blast radius desproporcionado en un cambio de una página.

### 5.3 Scroll-spy — medido, no observado (gate DC-1)

`active-chapter.ts` expone una función **pura y sin DOM**:

- Entrada: lista ordenada de `{ id, top }` (coordenadas relativas al viewport), la posición de la línea de lectura, y si la página está al final.
- Salida: el id de la línea activa.
- Regla: gana el **último** capítulo cuyo `top` ha cruzado la línea de lectura; si la página está al final, gana siempre el último capítulo (puede ser demasiado corto para cruzarla).

El componente solo aporta las mediciones y el ciclo de vida:

1. `afterNextRender` para no medir en un entorno sin layout.
2. Escucha `scroll` y `resize` **fuera de la zona de Angular**, coalescida a un `requestAnimationFrame` (NFR-001).
3. Vuelve a entrar en la zona **solo cuando el id cambia**, escribiendo la señal.
4. Se re-evalúa tras expandir/colapsar una línea, porque eso desplaza todos los capítulos siguientes.

**Por qué no `IntersectionObserver`:** su callback solo entrega las entradas cuyo estado de intersección **cambió en ese tick**. Tras un salto por ancla, el capítulo que queda arriba puede no volver a emitir y el lote contiene únicamente el capítulo siguiente — el índice marca la línea equivocada. Es exactamente el defecto reproducido en el mockup v0.1 y corregido en v0.1.1. Además, un observador no es verificable en jsdom; una función pura sí.

### 5.4 Divulgación progresiva

Las 31 filas están **siempre en el DOM renderizado**; el colapso es puramente CSS por atributo de dato (NFR-003: SEO y deep-link). Se descarta `@if` porque sacaría contenido del HTML inicial.

- El control expone su estado con `aria-expanded` y solo existe cuando el grupo supera el límite.
- Las filas ocultas se ocultan con `display: none`, de modo que salen también del árbol de accesibilidad — coherente con "contenido colapsado", no con "contenido invisible pero anunciado".

### 5.5 Layout y responsive

Portado de `mockup/services-redesign.css`, sin cambios de estructura:

| Breakpoint | Índice | Filas |
|------------|--------|-------|
| ≥1100px | Columna sticky de 15.5rem | 2 columnas |
| 720–1099px | Barra de chips horizontal sticky bajo el nav | 2 columnas |
| <720px | Barra de chips | 1 columna |

Todo el cambio responsive se hace con **media queries y scope de montaje**; ningún selector con ancestro `body`/`html` (KZ-002).

### 5.6 Tokens

El mockup deriva cuatro valores de texto/hairline sobre fondo ink (`--ink-text`, `--ink-text-2`, `--ink-text-3`, `--hairline`). Se declaran **en `:host` del componente**, no en `tokens.css`: promoverlos al sistema global es un cambio a `docs/ux-ui/design.md` §7 que este spec no necesita. Quedan documentados como candidatos a promoción si una segunda página los reclama.

Cero colores fuera de los tokens AMD; cero púrpura (REQ-011).

## 6. Backend Design

No aplica — fase 1 (TRD §1, ADR-003).

## 7. Design Decisions

| ID | Decisión | Alternativa rechazada | Por qué |
|----|----------|----------------------|---------|
| **DD-016** | El índice de `/services` es un **índice de página profunda**, distinto del sidenav flotante de Home | Reutilizar el sidenav de Home | Delta explícito a `design.md` §5, que hoy dice "sidenav solo en Home". No lleva dots, no hace scroll-spy de las secciones de Home, y su unidad es la línea de servicio |
| **DD-017** | Scroll-spy por medición en una función pura | `IntersectionObserver` | El callback solo entrega entradas cambiadas → marca la línea equivocada tras un salto (reproducido en el mockup v0.1). Además, una función pura es el único gate posible en jsdom para DC-1 |
| **DD-018** | El sub-servicio es una fila de texto, no una card | Mantener la card | `design.md` §7: "soft cards solo donde hay interacción". *(Reversión — challenge en §7.1)* |
| **DD-019** | El colapso es CSS sobre DOM completo | `@if` / `@defer` | NFR-003: los 31 servicios deben seguir en el HTML inicial para SEO y deep-link |
| **DD-020** | Orden explícito de sub-servicios; se elimina `subKeys()` | Conservar el generador | El orden comercial no es correlativo; el generador no puede expresarlo |
| **DD-021** | La preselección viaja como **clave** i18n en query params | Enviar el texto traducido | Sobrevive al cambio de idioma; alineado con KZ-003 |
| **DD-022** | Se retira el prefijo numérico del título visible | Conservar `01.` … `16.` | El número no codifica ni prioridad ni secuencia: es ruido. *(Reversión — challenge en §7.1)* |
| **DD-023** | Interpolación del conteo con `computed()` + `translate()` | Extender `LocalizePipe` con parámetros | Evita tocar i18n compartido por toda la app para un solo caso |
| **DD-024** | Los tokens derivados viven en `:host`, no en `tokens.css` | Promoverlos al sistema global | Promover tokens es un cambio al design system que este spec no necesita |
| **DD-025** | El `id` de ancla permanece en el `<article>` del capítulo | Moverlo a un elemento sentinel de 0px para el spy | Un sentinel vacío haría que `app.routes.spec.ts` siga encontrando `#contabilidad` sin que el aterrizaje real funcione: el gate de DC-4 quedaría laxo (hallazgo del challenge) |
| **DD-026** | **Un solo índice en el DOM**, re-estilizado por media query | Renderizar un rail de escritorio y otro de móvil | Dos índices duplicarían los `aria-current` y romperían REQ-001. El conteo exacto de enlaces del índice es el guard contra esa duplicación (hallazgo del challenge) |
| **DD-027** | El reorden comercial se hace **moviendo entradas del array**; los diccionarios nunca se reasignan entre claves | Reordenar los valores dentro de `es.json`/`en.json` | Mover valores entre claves remapearía 16 títulos↔descripciones **sin que ningún gate lo note**: `i18n-key-parity` compara claves, no valores (hallazgo del challenge) |

### 7.1 Reversion challenge (Step 2.3)

Revisor independiente (T3, read-only), una pregunta por reversión: *"¿qué rompe quitar esto?"*

**DD-018 (card → fila) — SEGURA CON CONDICIÓN.** Rompe, correctamente, 4 grupos de aserciones en `services-page.spec.ts`: los conteos `.svc-subs li` (16/4), las notas `.svc-note` de Riesgo/Marca, el conteo exacto de enlaces del índice, y el guard `href === '/services#<id>'` del defecto de `<base href="/">`. **Condición:** conservar como gates el conteo de sub-servicios (16/4, nunca relajado a `>=` — hoy es el único gate de facto de NFR-003) y el conteo exacto de enlaces del índice (guard anti-rail-duplicado → DD-026).

**DD-022 (quitar "01.") — SEGURA CON CONDICIÓN.** Ningún consumidor depende del prefijo: el `number` del road de Home numera las 5 líneas, no los sub-servicios, y no sale de los diccionarios; el handoff de contacto serializa el **id**, no el título; ningún test compara el texto visible. **Condición:** exige un gate de **valores** (no de claves) — ver DD-027 y §9.

**Roturas que el spec no había anticipado y que ahora cubre:**

| # | Hallazgo | Dónde se resuelve |
|---|----------|-------------------|
| 1 | `querySelector('a.btn--ghost')` tiene el mismo defecto de laxitud que `a.btn--gold`; el spec solo listaba el dorado | DC-6 ampliado |
| 2 | `article.textContent).toContain('subC01t')` es tautológico: con el stub que devuelve la clave, matchea un `aria-label`, un `href` o un nodo oculto — no prueba render visible | DC-6 ampliado |
| 3 | Si el `id` migrara a un sentinel, `app.routes.spec.ts` seguiría verde sin aterrizaje real | DD-025 |
| 4 | **Cero cobertura sobre valores de diccionario:** strippear "01." en `es.json` y olvidar `en.json` deja la suite verde; reordenar valores en vez del array remapea 16 pares título↔descripción en silencio | DD-027 + DC-9 |

**Nota de acoplamiento (no bloqueante):** engordar `services-page.ts` agrava el acoplamiento ya registrado en el archivo de `domain/landing` (import de *valor* desde una feature lazy hacia `core/`). DD extraer los datos a `service-catalog.data.ts` lo alivia; el re-export mantiene el blast radius en cero.

## 8. NFR scenarios

| NFR | Táctica | Cómo se comprueba |
|-----|---------|-------------------|
| NFR-001 | Escucha fuera de la zona + coalescencia por frame + escritura de señal solo al cambiar el id | Revisión de código del Reviewer (jsdom no mide frames) |
| NFR-002 | Ninguna importación nueva de terceros | Diff de `client/package.json` vacío |
| NFR-003 | Colapso por CSS, no por `@if` | Test: las 31 filas existen en el DOM con el grupo colapsado |
| NFR-004 | `prefers-reduced-motion` desactiva transiciones y el desplazamiento suave | Check humano (DC-2) |
| NFR-005 | Sin `fetch`/`HttpClient` nuevos | Revisión de código |

## 9. Test plan hooks

| Gate | Archivo | Cubre |
|------|---------|-------|
| Función pura de línea activa | `active-chapter.spec.ts` (nuevo) | DC-1 · REQ-001 (los tres escenarios, incluido el salto y el capítulo corto final) |
| Página | `services-page.spec.ts` (modificado) | REQ-003, REQ-004, REQ-007, NFR-003 |
| Contacto | `contact-section.spec.ts` (modificado) | DC-8 · REQ-005 |
| Paridad de diccionarios | `i18n-key-parity.spec.ts` (existente) | DC-5 · REQ-008 |
| Check humano en HITL | — | DC-2, DC-3, DC-7 · REQ-002, REQ-009, REQ-010, REQ-011 |

**Gates que NO se pueden relajar** (condiciones del challenge):

| Aserción | Por qué sobrevive |
|----------|-------------------|
| Conteo de sub-servicios por grupo = 16 / 4 exactos | Único gate de facto de NFR-003. **Nunca** relajar a `>=`: eso permitiría que el toggle renderizara solo 6 |
| Conteo exacto de enlaces del índice = 5 | Guard anti-rail-duplicado (DD-026) |
| `href === '/services#<id>'` en cada enlace del índice | Guard del defecto de `<base href="/">`: un `href="#id"` navegaría a Home |
| `#<id>` resuelve sobre el `<article>` del capítulo | Guard de DD-025 contra el sentinel vacío |

**Deuda de aserción a saldar (DC-6).** Tres aserciones actuales pasarían sin probar nada tras el rediseño:

1. `querySelector('a.btn--gold')` — habrá varios CTAs dorados; toma el primero.
2. `querySelector('a.btn--ghost')` — mismo defecto, con el CTA de WhatsApp por grupo.
3. `article.textContent).toContain('subC01t')` — tautológico: el stub de locale devuelve la clave, así que matchea un `aria-label`, un `href` o un nodo oculto.

Cada aserción tocada se ancla al capítulo o al rol, y la tarea declara **qué deja de probar**.

**Gate de valores de diccionario (DC-9, nuevo).** `i18n-key-parity` compara claves; los valores no tienen gate. Se añade un test que, sobre `es.json` y `en.json`:

- afirma que **ningún** valor `sub*t` empieza por un prefijo numérico (`NN. `), en **ambos** idiomas;
- afirma que el número de entradas `sub*t` / `sub*d` no cambió;
- **input que lo haría fallar:** dejar `en.json` sin strippear, o borrar/duplicar una entrada al reordenar.

Este gate no puede detectar un remapeo semántico título↔descripción; contra eso actúa DD-027 (se mueve el array, nunca el diccionario) más revisión humana.

## 10. Risks & mitigations

| Riesgo | Mitigación |
|--------|-----------|
| El check visual (DC-3) se salta por prisa | Es un paso nombrado del gate HITL de `/akili-validate`, no una recomendación |
| Reordenar Contabilidad altera lo que AMD ya vio | OQ-1: bloquea publicación a Pages, no ejecución |
| El Implementer reimplementa el spy con `IntersectionObserver` | DD-017 lo prohíbe explícitamente y el Done-when de la tarea nombra el caso del salto |
| El re-export de `SERVICE_GROUP_IDS` se olvida y rompe el contacto | El test existente de `contact-section` falla de inmediato |
| Editar 40 valores de diccionario introduce desalineación ES/EN | `i18n-key-parity` cubre claves; los **valores** exigen revisión humana |

## 11. Budget (Step 2.4)

| Métrica | Estimación |
|---------|-----------|
| Tareas | **7** |
| LOC (neto tocado) | **≈ 700** — CSS ≈ 330, HTML ≈ 70, TS ≈ 150, tests ≈ 180, i18n ≈ 50 valores |
| Rondas de revisión | **2** |

Coherente con profundidad **Standard**. La estimación supera 400 LOC, así que `tasks.md` propondrá **dos PRs** (ver Fase 3). Si la ejecución supera este presupuesto, el Leader **para y escala**, no continúa.
