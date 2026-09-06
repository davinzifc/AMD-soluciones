# Requirements — services-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Status | Draft |
| Depth | **Standard** |
| Type | Change |
| Phase | 1-landing |
| Approval Mode | gated |
| Related proposal | `proposal.md` (misma carpeta) |
| Related PRD | `docs/prd.md` §4 (North Star: leads), §5 (In — fase 1), §6 US-2 |
| Related UX | `docs/ux-ui/design.md` §1, §2, §5, §6, §7, §9, §10 |
| Related TRD | `docs/trd/trd.md` §1 (fase 1 sin API), ADR-002, ADR-003 |
| Visual reference | `mockup/index.html` (v0.1.1) — contexto de diseño aprobado |
| Kaizen | KZ-001, KZ-002, KZ-003 |

## 1. Context & Goal

`/services` presenta hoy 31 sub-servicios como 31 cards idénticas: nada jerarquiza, nada es accionable y el único CTA está al final. Este cambio la convierte en un **catálogo navegable** donde el visitante localiza su servicio, entiende que hay 5 líneas, y contacta **desde el servicio exacto** — sin salir de fase 1 (sin API).

**Decisiones HITL cerradas (2026-09-05):**

| Decisión | Valor |
|----------|-------|
| Acción de la fila | Contacto con **preselección** de servicio |
| Umbral de divulgación progresiva | **6** sub-servicios visibles |
| Orden de Contabilidad | **Prioridad comercial** (la del mockup), no la del brochure |

## 2. Actors

| Actor | Necesidad en esta página |
|-------|--------------------------|
| **P1 — Emprendedor / PYME (ES)** | Encontrar su trámite entre 31 y pedir cotización sin releer todo |
| **P2 — Founder / ops lead (EN)** | Mismo recorrido en inglés, con paridad de layout |
| **Visitante que llega por deep-link** | Aterrizar en `/services#<grupo>` desde el road de Home y ver ese grupo activo |
| **Equipo AMD** | Que el copy provisional (Riesgo, Marca) se lea como provisional |

## 3. Requirements

### REQ-001 — Índice de líneas con estado de lectura

- **Actor:** todos
- **Descripción:** La página SHALL ofrecer un índice persistente de las 5 líneas de servicio que indique **cuál se está leyendo** y cuántos servicios contiene cada una.
- **Acceptance:** el índice está visible sin scroll adicional mientras se recorre el catálogo; exactamente una línea está marcada como activa en todo momento.

**Scenario: El índice sigue la lectura**

```text
GIVEN el visitante está en /services
WHEN hace scroll hasta que el capítulo "Sistemas de Riesgo" ocupa la zona de lectura
THEN el índice marca "Sistemas de Riesgo" como la línea activa
AND IT MUST marcar exactamente una línea activa, nunca cero ni dos
BUT it must NOT marcar una línea distinta de la que el visitante está viendo
BUT it must NOT existir más de un índice en el DOM (un índice re-estilizado, no uno por breakpoint)
```

**Scenario: Clic en el índice (caso que falló en el mockup v0.1)**

```text
GIVEN el visitante está leyendo "Contabilidad"
WHEN hace clic en "Sistemas de Riesgo" en el índice
THEN la vista se posiciona en el capítulo "Sistemas de Riesgo"
AND IT MUST dejar "Sistemas de Riesgo" — y solo esa — marcada como activa al terminar el desplazamiento
BUT it must NOT marcar la línea siguiente ni conservar la anterior
```

**Scenario: Final de página**

```text
GIVEN el visitante llega al final del catálogo
WHEN el último capítulo ("Marca") es el único visible
THEN el índice marca "Marca" como activa
AND IT MUST hacerlo aunque el capítulo sea demasiado corto para cruzar la zona de lectura
```

### REQ-002 — Desplazamiento continuo hacia el capítulo

- **Actor:** todos
- **Descripción:** El salto desde el índice o desde un deep-link SHALL ser un desplazamiento continuo y SHALL dejar el título del capítulo visible bajo el nav sticky.
- **Acceptance:** ningún salto deja el encabezado del capítulo oculto tras el nav.

**Scenario: Salto suave con respeto al nav**

```text
GIVEN el visitante hace clic en una línea del índice
WHEN la vista se desplaza al capítulo
THEN el desplazamiento es continuo, no un salto instantáneo
AND IT MUST dejar el <h2> del capítulo completamente visible bajo el nav sticky
BUT it must NOT desplazarse de forma animada cuando el sistema declara prefers-reduced-motion: reduce
```

### REQ-003 — Catálogo legible: filas, no cards

- **Actor:** todos
- **Descripción:** Cada sub-servicio SHALL presentarse como una fila de texto jerarquizada (título + descripción), no como una tarjeta con fondo y borde propios. Cada línea de servicio SHALL abrir con una cabecera de capítulo que la identifique visualmente.
- **Acceptance:** un visitante distingue de un vistazo dónde empieza cada línea y cuántos servicios trae.

**Scenario: Jerarquía del capítulo**

```text
GIVEN el visitante recorre el catálogo
WHEN llega a una línea de servicio
THEN ve una cabecera con el nombre de la línea, su lead y una marca visual de acento AMD
AND IT MUST usar el dorado de marca como acento de la página, no solo en el nav
BUT it must NOT renderizar cada sub-servicio con fondo y borde propios como una tarjeta independiente
BUT it must NOT anteponer una numeración correlativa ("01.", "02.") al título visible del sub-servicio
```

### REQ-004 — Divulgación progresiva por línea

- **Actor:** todos
- **Descripción:** Una línea con más de **6** sub-servicios SHALL mostrar los 6 primeros y ofrecer un control explícito para revelar el resto, informando cuántos faltan.
- **Acceptance:** Contabilidad (16) es la única línea colapsada; las demás (4, 4, 4, 3) se muestran completas sin control.

**Scenario: Revelar el resto**

```text
GIVEN el visitante ve la línea "Contabilidad" con 6 de 16 servicios
WHEN activa el control "Ver 10 servicios más"
THEN los 16 servicios quedan visibles
AND IT MUST anunciar el estado expandido a tecnología asistiva
AND IT MUST permitir volver a colapsar
BUT it must NOT mostrar el control en líneas con 6 o menos servicios
BUT it must NOT ocultar contenido de forma que quede fuera del DOM inicial
```

### REQ-005 — Cada servicio es accionable con su contexto

- **Actor:** P1, P2
- **Descripción:** Cada fila de sub-servicio SHALL llevar al formulario de contacto con **la línea de servicio ya seleccionada** y el sub-servicio identificado en el mensaje.
- **Acceptance:** el visitante llega al formulario sin tener que reescribir qué servicio le interesa.

**Scenario: De "Declaraciones" al formulario**

```text
GIVEN el visitante lee "Declaraciones" dentro de la línea Contabilidad
WHEN activa esa fila
THEN llega a la sección de contacto de Home
AND IT MUST dejar "Contabilidad" preseleccionada en el campo de servicio de interés
AND IT MUST identificar "Declaraciones" en el contenido prellenado del mensaje
BUT it must NOT enviar nada ni llamar a ninguna API (fase 1 no tiene backend)
BUT it must NOT perder la preselección al cambiar de idioma
```

### REQ-006 — CTA por línea de servicio

- **Actor:** P1, P2
- **Descripción:** Cada línea SHALL ofrecer su propio CTA de conversión al cierre del capítulo, sin obligar a llegar al final de la página.
- **Acceptance:** desde cualquier capítulo hay al menos un CTA alcanzable sin abandonar ese capítulo.

**Scenario: Convertir dentro del capítulo**

```text
GIVEN el visitante terminó de leer la línea "Asesoría"
WHEN busca contactar
THEN encuentra un CTA de esa línea antes de que empiece la línea siguiente
AND IT MUST llevar el contexto de esa línea al contacto
BUT it must NOT eliminar el CTA de cierre de página
```

### REQ-007 — Continuidad de anclas y deep-links (regresión)

- **Actor:** visitante que llega por deep-link; road de Home
- **Descripción:** Los cinco identificadores de ancla (`contabilidad`, `administrativa`, `riesgo`, `asesoria`, `marca`) SHALL permanecer idénticos y seguir resolviendo desde `/services#<id>`.
- **Acceptance:** los enlaces "Más info" del road de Home siguen funcionando sin cambios en Home.

**Scenario: Deep-link desde el road**

```text
GIVEN el visitante está en Home y activa "Más info" de una línea
WHEN aterriza en /services#<id>
THEN la página se posiciona en ese capítulo
AND IT MUST marcar esa línea como activa en el índice
AND IT MUST resolver para los cinco identificadores
AND IT MUST llevar el identificador el propio capítulo, no un elemento vacío colocado para el seguimiento de lectura
BUT it must NOT introducir rutas hijas /services/:group (DD-014: los grupos son fragments)
```

### REQ-008 — Paridad bilingüe

- **Actor:** P1, P2
- **Descripción:** Todo texto nuevo introducido por el rediseño SHALL existir en ES y EN con las mismas claves.
- **Acceptance:** la verificación de paridad de diccionarios pasa sin claves huérfanas.

**Scenario: Cambio de idioma en el catálogo**

```text
GIVEN el visitante está en /services en ES con Contabilidad expandida
WHEN cambia a EN
THEN todo el texto del índice, controles y CTAs aparece en EN
AND IT MUST conservar el capítulo y el estado de expansión
BUT it must NOT dejar ninguna clave sin traducir en ninguno de los dos diccionarios
```

### REQ-009 — Comportamiento responsive

- **Actor:** todos
- **Descripción:** El índice y el catálogo SHALL adaptarse sin pérdida de función en móvil y tablet.
- **Acceptance:** ninguna anchura entre 375px y 1440px produce scroll horizontal de página.

**Scenario: Índice en móvil**

```text
GIVEN el visitante abre /services en un viewport menor a 1100px
WHEN recorre el catálogo
THEN el índice se presenta como una barra horizontal desplazable fijada bajo el nav
AND IT MUST seguir marcando la línea activa
AND IT MUST mantener la fila de sub-servicio a una sola columna por debajo de 720px
BUT it must NOT provocar scroll horizontal en el cuerpo de la página
BUT it must NOT usar selectores con ancestro body/html para mostrar u ocultar el índice (KZ-002)
```

### REQ-010 — Accesibilidad

- **Actor:** todos, incluidos usuarios de teclado y lector de pantalla
- **Descripción:** Todos los controles nuevos SHALL ser operables por teclado, anunciar su estado y cumplir los mínimos de tamaño y contraste del design system.
- **Acceptance:** WCAG AA en contraste; foco visible; objetivos ≥44px.

**Scenario: Recorrido por teclado**

```text
GIVEN un usuario navega con teclado
WHEN tabula por el índice, las filas, el control de expansión y los CTAs
THEN cada elemento recibe un foco visible en dorado de marca
AND IT MUST exponer la línea activa del índice de forma programática, no solo por color
AND IT MUST exponer el estado expandido/colapsado del control de divulgación
AND IT MUST mantener todos los objetivos táctiles en 44px o más (KZ-001)
BUT it must NOT depender únicamente del color para indicar la línea activa
```

### REQ-011 — Identidad de marca

- **Actor:** AMD
- **Descripción:** La página SHALL usar exclusivamente los tokens de `docs/ux-ui/design.md` §7.
- **Acceptance:** cero valores de color fuera del sistema de tokens; cero púrpura del builder anterior.

**Scenario: Auditoría de color**

```text
GIVEN se revisa el CSS de la página
WHEN se listan los colores usados
THEN todos derivan de los tokens AMD (dorado, ink, glass, hairlines)
BUT it must NOT contener #673de6, #5025d1, #8c85ff ni gradientes púrpura genéricos
```

## 4. Non-Functional Requirements

| ID | Requisito | Medida |
|----|-----------|--------|
| NFR-001 | El seguimiento de lectura del índice no degrada el scroll | El cálculo corre como máximo una vez por frame; nada de trabajo sincrónico por evento de scroll |
| NFR-002 | Sin dependencias nuevas | `client/package.json` sin entradas añadidas |
| NFR-003 | Contenido en el DOM inicial | Los 31 sub-servicios están en el HTML renderizado aunque estén colapsados (SEO / deep-link) |
| NFR-004 | Movimiento respetuoso | Toda animación se desactiva bajo `prefers-reduced-motion: reduce` |
| NFR-005 | Sin backend | Ninguna llamada de red nueva; fase 1 (TRD ADR-003) |

## 5. Defect classes → gate

Las clases de defecto que **este** spec puede producir, y qué las detecta. El harness es **Vitest + jsdom**: no rasteriza, no hace layout, no ejecuta scroll real.

| # | Clase de defecto | Gate | ¿Automatizado? |
|---|------------------|------|----------------|
| DC-1 | El índice marca la línea equivocada (el bug del mockup v0.1) | Test unitario de la **función pura** que decide la línea activa, alimentada con posiciones fabricadas — incluido el caso "salto a un capítulo corto" | ✅ `npm run test:agent` |
| DC-2 | El desplazamiento real no es suave, o el título queda bajo el nav | **Ninguno automatizado** — jsdom no hace scroll ni layout | ⚠️ **Check humano en el gate HITL** (dev server, 3 líneas del índice + 1 deep-link) |
| DC-3 | Contraste insuficiente, jerarquía visual rota, dorado ausente | **Ninguno automatizado** — jsdom no rasteriza; `axe` no evalúa contraste sin render | ⚠️ **Revisión visual T6** (o check humano contra `mockup/index.html`) |
| DC-4 | Se rompe un ancla o un deep-link del road de Home | Test de los 5 ids + test de los `routerLink`/`fragment` del road | ✅ `npm run test:agent` |
| DC-5 | Clave i18n sin par ES/EN | `i18n-key-parity.spec.ts` (ya existe) | ✅ `npm run test:agent` |
| DC-6 | **Un test existente sigue en verde sin probar nada.** Tres casos confirmados: `querySelector('a.btn--gold')` y `querySelector('a.btn--ghost')` matchearán varios CTAs y tomarán el primero; y `textContent).toContain('subC01t')` es tautológico — el stub de locale devuelve la clave, así que matchea un `aria-label`, un `href` o un nodo oculto | Los tests tocados MUST anclarse al capítulo o al rol, y la tarea MUST declarar qué deja de probar cada aserción de presencia | ✅ pero exige revisión del Reviewer, no solo verde |
| DC-7 | Objetivo táctil bajo 44px o foco no visible (KZ-001) | jsdom no mide caja | ⚠️ **Check humano** + inspección de CSS por el Reviewer |
| DC-8 | La preselección de servicio no llega al formulario | Test del contrato de parámetros en el componente de contacto | ✅ `npm run test:agent` |
| DC-9 | **Valores de diccionario desalineados.** La paridad de claves no mira los valores: strippear el prefijo numérico en `es.json` y olvidar `en.json` deja la suite verde; y reordenar valores entre claves remapearía 16 pares título↔descripción en silencio | Test de valores: ningún `sub*t` empieza por prefijo numérico **en ambos idiomas**, y el número de entradas no cambia. Contra el remapeo semántico: el orden se cambia **moviendo el array de datos, nunca el diccionario** | ✅ parcial — el remapeo semántico exige revisión humana |

**Riesgos aceptados:** DC-2, DC-3 y DC-7 no tienen gate automatizado en fase 1 (no hay Playwright ni runner de navegador — TRD tier LITE). Se sustituyen por un check humano obligatorio en la pausa HITL de `/akili-validate` y por la revisión visual contra el mockup. Introducir un runner de navegador está **fuera de alcance** de este spec.

## 6. Non-goals

- Rediseñar la sección `#servicios` de Home (el road). Solo se verifica que sus deep-links siguen resolviendo.
- Cambiar el **texto** de los sub-servicios o cerrar los placeholders de Riesgo/Marca. *(Excepción declarada: REQ-003 retira el prefijo numérico `"01. "` del inicio de 20 valores `sub*t` en ES y EN. Es formato tipográfico, no redacción — ninguna palabra cambia.)*
- Rutas hijas `/services/:group` (prohibido por DD-014).
- Backend, persistencia de leads, envío de correo.
- Analítica nueva más allá de lo que ya emite el contacto.
- Introducir un runner de navegador o suite E2E.

## 7. Traceability

| REQ | UX section | TRD / PRD |
|-----|------------|-----------|
| REQ-001 | §5 Navigation Model (delta: índice de página profunda) | PRD §6 US-2 |
| REQ-002 | §7 Motion · §10 Accessibility | — |
| REQ-003 | §6 Layout Patterns · §7 Glass vs Neumorphism | ADR-002 |
| REQ-004 | §6 Layout Patterns | PRD §5 In |
| REQ-005 | §3 F1/F2 Primary flows | PRD §4 North Star · ADR-003 |
| REQ-006 | §4 Screen Inventory (CTA por sección) | PRD §4 |
| REQ-007 | §2 Information Architecture (DD-014) | — |
| REQ-008 | §1.6 Bilingual by default | PRD §5 In |
| REQ-009 | §9 Responsive Behavior | — |
| REQ-010 | §10 Accessibility Expectations | — |
| REQ-011 | §7 Design Tokens | ADR-002 |

## 8. Open Questions

| # | Pregunta | Bloquea |
|---|----------|---------|
| OQ-1 | ¿El orden comercial de Contabilidad se confirma con AMD antes de publicar? | No bloquea ejecución; bloquea publicación a Pages |
| OQ-2 | ¿El texto prellenado del mensaje de contacto lo redacta AMD o se deriva del copy existente? | No bloquea: por defecto se deriva de las claves i18n existentes |

## 9. Requirement ID Index

| ID | Título |
|----|--------|
| REQ-001 | Índice de líneas con estado de lectura |
| REQ-002 | Desplazamiento continuo hacia el capítulo |
| REQ-003 | Catálogo legible: filas, no cards |
| REQ-004 | Divulgación progresiva por línea |
| REQ-005 | Cada servicio es accionable con su contexto |
| REQ-006 | CTA por línea de servicio |
| REQ-007 | Continuidad de anclas y deep-links |
| REQ-008 | Paridad bilingüe |
| REQ-009 | Comportamiento responsive |
| REQ-010 | Accesibilidad |
| REQ-011 | Identidad de marca |
