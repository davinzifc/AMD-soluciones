# Requirements — home-page-redesign

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Status | **Approved** — HITL 2026-09-06 |
| Depth | **Standard** |
| Phase | 1-landing |
| Related PRD | `docs/prd.md` §5, §6, §7 |
| Related UX | `docs/ux-ui/design.md` §2, §5, §7, §10, §11 |
| Related TRD | `docs/trd/trd.md` §3 (Performance, Accessibility), §8, §12 |
| Source of truth | `proposal.md` (aprobado) + `mockup/index.html` (navegable, validado en navegador) |
| Supersedes | `archive/2026-08-05-domain--landing`: **REQ-002** (sidenav de puntos; incluida su cláusula *"no dark bar / opaque sidenav background"* — el sub-header **es** una barra, la supersesión es deliberada), **REQ-004** (camino de servicios y su *"Road progress"*), **REQ-007** (escenario *"Testimonials readable pause"*, que empieza con `GIVEN testimonials are rotating`) |

---

## 1. Context & Goal

La Home actual entrega la promesa pero no el ritmo: el recorrido de servicios es un zig-zag de
tarjetas que gasta pantalla y media por línea de negocio, no hay una sola imagen en toda la página,
y el índice de secciones vive en tres formas distintas según el ancho.

Este spec **rediseña la Home completa** contra un mockup ya validado en navegador y aprobado por el
cliente: el recorrido de servicios pasa a ser un índice editorial sobre papel, entra una banda
cinematográfica con video, aparece un muro de clientes, y el índice de secciones se reduce a dos
formas. El hero y su campo de orbes se conservan **intactos**.

**Lo que NO cambia:** la página `/services`, las rutas, el contrato de deep-link
`/services#<id>`, el flujo de contacto (WhatsApp/mailto) y la ausencia de `server/`.

---

## 2. Actors

| Actor | Qué le cambia |
|-------|---------------|
| **P1 — Emprendedor / PYME (ES)** | Escanea las 5 líneas de negocio en una sola pasada de ojos en vez de scrollear pantalla y media por línea; ve clientes reales y una banda de cifras |
| **P2 — Founder / ops lead (EN)** | Lo mismo, con paridad completa de copy |
| **Usuario de teclado / lector de pantalla** | Un solo índice de secciones por ancho; el carrusel de clientes se pausa al tabular y anuncia 13 empresas, no 26 |
| **Usuario con `prefers-reduced-motion`** | Sin marquee, sin parallax de spine, sin video en movimiento: póster fijo y retícula estática |
| **Visitante en 3G / móvil** | La banda carga 1.9 MB de video **después** del contenido crítico, con póster inmediato |

---

## 3. Requirements

### REQ-001 — Ritmo claro/oscuro con aire real

- **Persona:** P1 / P2
- **Descripción:** La página SHALL alternar tramos oscuros y claros de modo que el oscuro sea
  puntuación (entrada, banda de video, cierre) y no el suelo de la página.
- **Acceptance:** el orden de secciones y su tono coinciden con `mockup/index.html`, y las
  proporciones medidas caen dentro de las bandas declaradas abajo.

Tono por sección, en orden de scroll:

| # | Sección | id | Tono | Cambia respecto a producción |
|---|---------|-----|------|------------------------------|
| 01 | Hero | `inicio` | Oscuro | No — se conserva intacto |
| 02 | Ledger (líneas) | `servicios` | Claro (`--amd-mist`) | Mantiene el fondo; cambia la forma por completo |
| 03 | Manifiesto | `sobre-amd` | Claro (`--amd-surface`) | **Sí** — hoy es oscuro (`--amd-ink`) |
| 04 | Cifras | `cifras` | Oscuro + video | **Sección nueva** |
| 05 | Confianza | `confianza` | Claro (`--amd-surface`) | Pasa de mist a blanco |
| 06 | Contacto | `contacto` | Oscuro | No |

**Scenario: proporción de tinta**

```text
GIVEN la Home renderizada a 1440x900 en un navegador real
WHEN se suma el alto de las secciones cuyo fondo tiene luminancia relativa < 0.18
THEN esa suma MUST estar entre el 35 % y el 45 % del alto total de las secciones
AND IT MUST existir al menos un tramo claro cuyo `offsetTop` sea <= 1.2 alturas de viewport
BUT it must NOT haber dos secciones oscuras consecutivas antes del primer tramo claro
```

> **Referencia medida (mockup, 1440 px):** 39.8 % en tinta, primer tramo claro en `y = 900 px`
> (1.00 pantalla). La v1 del mockup —descartada por el cliente— daba 68.2 % y 2.40 pantallas.
> Ambas cifras son mockup-contra-mockup; no son una medición de la Home en producción.

**Scenario: el corte tinta→papel va a filo**

```text
GIVEN la juntura entre una sección oscura y la siguiente clara
WHEN se inspecciona la franja de 140 px alrededor del borde
THEN el cambio de fondo MUST ser un corte, no un degradado
BUT it must NOT introducirse ninguna capa de transición que vele el contenido adyacente
```

---

### REQ-002 — El ledger sustituye el camino de servicios

- **Persona:** P1 / P2
- **Descripción:** La sección de servicios de la Home SHALL presentar las cinco líneas de negocio
  como filas de un índice editorial —ordinal, título, resumen, contador y control de apertura—
  en lugar del zig-zag de tarjetas actual.
- **Acceptance:** las cinco líneas caben en un bloque continuo; el alto de la sección no crece al
  navegar entre líneas.

**Scenario: anatomía de una fila**

```text
GIVEN la sección `#servicios` renderizada en >= 901 px
WHEN se inspecciona cualquiera de las cinco filas
THEN la fila MUST mostrar ordinal (01…05), título, resumen de una línea, contador de servicios
  y un control de apertura dibujado en CSS
AND IT MUST usar el mismo orden de líneas que `SERVICE_GROUP_IDS`
BUT it must NOT usar emojis como iconos ni renderizar tarjetas
```

**Scenario: acordeón exclusivo**

```text
GIVEN la fila 01 abierta
WHEN el usuario activa la fila 03 con puntero, Enter o Espacio
THEN la fila 03 MUST abrirse y la fila 01 MUST cerrarse
AND IT MUST quedar `aria-expanded="true"` exactamente en una fila y `"false"` en las otras cuatro
AND IT MUST poder cerrarse la fila abierta volviéndola a activar (estado "ninguna abierta" permitido)
BUT it must NOT depender de `:hover` para abrir: puntero, teclado y táctil llegan al mismo camino
```

**Scenario: revelado de imagen**

```text
GIVEN un puntero sobre una fila, o el foco de teclado en ella, en >= 901 px
WHEN se revela la fotografía de esa línea
THEN la imagen MUST disolverse en el fondo por los cuatro lados
AND IT MUST quedar recortada por su contenedor durante toda la transición de escala
AND IT MUST terminar en el borde del contenido, nunca en el borde de la ventana
AND IT MUST mantener el mismo estado visual con la fila abierta que al pasar el cursor
BUT it must NOT revelarse por hover en <= 900 px, donde no hay puntero fiable
```

**Scenario: una fila cerrada no es tabulable por dentro**

```text
GIVEN cuatro filas cerradas y una abierta
WHEN el usuario recorre la sección con Tab
THEN el foco MUST alcanzar el control de apertura de las cinco filas
BUT it must NOT alcanzar el enlace "Más info" de ninguna fila cerrada
AND IT MUST volver a ser alcanzable en cuanto su fila se abre
```

> Este escenario existe porque `ServicesRoadSection` ya lo resolvía —marca el detalle
> colapsado como `inert`— y el rediseño lo borraría sin querer: cinco filas cerradas, cada una
> con su enlace, es la misma trampa WCAG servida de nuevo.

**Scenario: contador de escala**

```text
GIVEN una fila de línea de negocio
WHEN se muestra su contador
THEN el número MUST derivarse de `SERVICE_GROUPS[i].subs.length`, no de un literal
BUT it must NOT listar los sub-servicios en la Home: ese detalle vive en `/services`
```

---

### REQ-003 — Continuidad de deep-links y anclas (regresión)

- **Persona:** P1 / P2 / buscadores
- **Descripción:** El rediseño SHALL preservar los contratos de navegación que la Home ya publica.

**Scenario: "Más info" sigue llevando al capítulo correcto**

```text
GIVEN una fila abierta en `#servicios`
WHEN el usuario activa su enlace "Más info"
THEN MUST navegar a `/services#<id>` con el mismo `id` que hoy
AND IT MUST no alternar el acordeón al hacerlo
BUT it must NOT convertirse en una ruta hija ni cambiar el fragmento
```

**Scenario: las anclas de la Home siguen existiendo**

```text
GIVEN un enlace externo a `/#servicios`, `/#sobre-amd`, `/#confianza` o `/#contacto`
WHEN se abre
THEN la sección correspondiente MUST existir con ese `id` y quedar visible bajo las barras fijas
AND IT MUST añadirse `#cifras` como ancla nueva
BUT it must NOT eliminarse ni renombrarse ninguna de las anclas existentes
```

---

### REQ-004 — Manifiesto: el respiro claro

- **Persona:** P1 / P2
- **Descripción:** La sección `#sobre-amd` SHALL fusionar el manifiesto y el teaser de Nosotros en
  un único bloque claro con una imagen a color pleno.

**Scenario: la imagen no impone el layout**

```text
GIVEN la sección `#sobre-amd` en >= 901 px
WHEN la imagen se muestra junto al texto
THEN su alto MUST derivarse del alto del texto
BUT it must NOT declararse un `aspect-ratio` que le permita imponerse sobre la columna
AND IT MUST conservar el CTA a `/about-us` que la sección ya publica hoy
```

---

### REQ-005 — Banda de Cifras con video de fondo

- **Persona:** P1 / P2 / visitante en 3G
- **Descripción:** SHALL existir una banda full-bleed con video de fondo, scrim de tinta, eyebrow
  de ubicación, una frase corta y tres métricas con conteo animado.

**Scenario: el video es fondo, no pieza**

```text
GIVEN la banda `#cifras` en un navegador con reproducción automática permitida
WHEN la sección entra en pantalla
THEN el video MUST reproducirse en bucle, silenciado y sin controles
AND IT MUST declarar un `poster` que se pinte antes de que el video cargue
AND IT MUST llevar un scrim que garantice el contraste del texto encima
BUT it must NOT reproducir audio, mostrar controles ni bloquear el render del contenido crítico
```

**Scenario: reduced-motion y conexión lenta**

```text
GIVEN `prefers-reduced-motion: reduce`
WHEN se muestra la banda
THEN MUST mostrarse el póster fijo y el video MUST NO reproducirse
AND IT MUST el conteo animado de las métricas mostrar directamente el valor final
```

---

### REQ-006 — Confianza en tres escalones

- **Persona:** P1 / P2
- **Descripción:** La sección `#confianza` SHALL presentar prueba social en tres grados de
  concreción: qué dicen (testimonio), quiénes son (clientes) y dónde operan (sectores).

**Scenario: el testimonio no rota solo**

```text
GIVEN la sección `#confianza` con sus CUATRO testimonios
WHEN el usuario no interactúa durante al menos 15 segundos
THEN el testimonio visible MUST permanecer sin cambiar
AND IT MUST cambiar únicamente al activar uno de los puntos de navegación
BUT it must NOT existir ningún temporizador que sustituya el texto mientras se lee
```

> **Cuatro, no tres.** Producción sirve `q1…q4`; el mockup dibujó tres puntos sólo como
> ilustración. Reducir el número sería una pérdida de contenido que ningún requisito pide, y
> dejaría `q4`/`q4By` huérfanas en los dos diccionarios.

**Scenario: los puntos dejan de ser decoración**

```text
GIVEN que los puntos pasan a ser la ÚNICA vía a los testimonios 2, 3 y 4
WHEN se inspecciona cada punto
THEN cada uno MUST conservar un objetivo táctil de al menos 44x44 px
AND IT MUST llevar un nombre accesible traducido, no un literal en español
AND IT MUST marcarse el punto activo de forma programática, no sólo por color
BUT it must NOT depender el cambio de testimonio de ningún gesto que no sea activar un punto
```

> Hoy `TrustSection.testimonialLabel()` devuelve `'Testimonio N'` **hardcodeado en español**:
> incumple REQ-011 y hay que corregirlo en la misma tarea que eleva los puntos a control primario.

**Scenario: sin fotos de personas**

```text
GIVEN la sección `#confianza`
WHEN se renderiza
THEN MUST NO incluirse ninguna fotografía de personas
AND IT MUST ningún copy presentar a personas retratadas en la página como equipo o clientes de AMD
```

---

### REQ-007 — Muro de clientes en carrusel infinito

- **Persona:** P1 / P2 / usuario de teclado / lector de pantalla
- **Descripción:** SHALL mostrarse un carrusel infinito con los 13 logos de clientes, normalizados
  a monocromo, con el color aportado por CSS.

**Scenario: el bucle no salta**

```text
GIVEN la cinta del carrusel con el conjunto de logos duplicado exactamente una vez
WHEN la animación completa una vuelta
THEN el desplazamiento MUST recorrer exactamente la mitad del ancho de la cinta
AND IT MUST el primer logo de la segunda copia arrancar a esa misma mitad, con desfase <= 0.5 px
BUT it must NOT usarse `gap` entre elementos de la cinta: el aire va como margen por elemento
```

**Scenario: se puede señalar un logo**

```text
GIVEN el carrusel en movimiento
WHEN el puntero entra en el carril, o el foco de teclado entra en él
THEN la animación MUST pausarse
AND IT MUST reanudarse al salir
```

**Scenario: el lector de pantalla oye 13, no 26**

```text
GIVEN el carrusel renderizado
WHEN un lector de pantalla recorre la sección
THEN MUST anunciarse exactamente 13 nombres de empresa
AND IT MUST llevar cada logo original un nombre accesible con la razón social
AND IT MUST la copia duplicada ir marcada `aria-hidden="true"` y sin rol de imagen
```

**Scenario: reduced-motion devuelve la retícula**

```text
GIVEN `prefers-reduced-motion: reduce`
WHEN se muestra el muro
THEN MUST renderizarse como retícula estática con los 13 logos visibles
BUT it must NOT limitarse a detener la cinta, lo que dejaría a la mayoría fuera de pantalla
```

**Scenario: velocidad constante entre anchos**

```text
GIVEN el carrusel a 1440, 768 y 375 px
WHEN se mide su velocidad de desplazamiento
THEN MUST ser la misma en los tres, con una tolerancia de +-10 %
BUT it must NOT fijarse la duración en el CSS, lo que aceleraría la cinta al estrecharse
```

---

### REQ-008 — Un solo índice de secciones por ancho

- **Persona:** P1 / P2 / usuario de teclado
- **Descripción:** El índice de secciones de la Home SHALL existir en exactamente dos formas —
  sub-header desde 900 px y panel de hamburguesa por debajo— y el rail lateral de puntos SHALL
  retirarse en todos los anchos.
- **Supersedes:** `docs/ux-ui/design.md` §2 y §5 (sidenav de puntos `>=1100px`) y
  `archive/2026-08-05-domain--landing` REQ-002.

**Scenario: nunca dos índices, nunca ninguno**

```text
GIVEN la Home a 375, 768, 900, 1200, 1600 y 1920 px
WHEN se cuenta cuántos índices de secciones están visibles
THEN MUST ser exactamente uno en cada ancho
AND IT MUST ser el sub-header desde 900 px y el panel de hamburguesa por debajo
BUT it must NOT renderizarse ningún rail lateral de puntos en ningún ancho
```

> **Un agujero que esto cierra, y uno que abre.** Hoy entre 900 y 1099 px **no hay ningún índice
> de secciones**: el panel se oculta desde 900 px y el rail sólo aparece desde 1100 px. El
> sub-header cierra esos 200 px. A cambio, dentro del hero y por encima de 900 px no habrá índice
> —el sub-header aún no ha aparecido—; se acepta porque en el primer viewport el usuario ya está
> en `#inicio` y no necesita un ancla para volver a donde está.

**Scenario: el sub-header aparece al salir del hero**

```text
GIVEN la Home cargada arriba del todo en >= 900 px
WHEN el usuario aún no ha salido del hero
THEN el sub-header MUST estar oculto, para que el primer viewport conserve una sola barra
AND IT MUST aparecer al pasar el hero
```

**Scenario: ninguna etiqueta se repite entre los dos menús**

```text
GIVEN el menú de páginas y el índice de secciones visibles a la vez
WHEN se comparan sus etiquetas
THEN MUST NO repetirse ninguna
AND IT MUST llamarse "Líneas" a la sección del catálogo y "Manifiesto" a la de Nosotros,
  reservando "Servicios" y "Nosotros" para las páginas `/services` y `/about-us`
```

**Scenario: el sub-header dice en qué sección estás**

```text
GIVEN el sub-header visible y el usuario dentro de una sección
WHEN se inspecciona su enlace correspondiente
THEN MUST marcarse como actual de forma programática (`aria-current`), no sólo por color
AND IT MUST actualizarse al cambiar de sección con el scroll
```

> El rail publicaba este indicador. Sin un escenario que lo exija, la sustitución pierde en
> silencio el "dónde estoy" para lectores de pantalla.

**Scenario: oculto significa no tabulable**

```text
GIVEN el sub-header aún oculto porque el usuario no ha salido del hero
WHEN el usuario recorre la página con Tab
THEN sus enlaces MUST NO recibir foco
AND IT MUST ocultarse con una técnica que retire el elemento del orden de foco
BUT it must NOT ocultarse sólo con `opacity` o `transform`, que dejan los enlaces tabulables
  mientras son invisibles
```

> El mockup tiene exactamente este defecto: `.subnav` conserva `display: block` y se oculta con
> `opacity: 0` + `translateY(-100%)`. Portarlo tal cual traería la trampa a producción.

**Scenario: el panel de hamburguesa cubre las seis secciones sin repetir etiquetas**

```text
GIVEN el panel de hamburguesa en < 900 px
WHEN se listan sus enlaces
THEN MUST incluir las SEIS anclas de la Home, incluida `#cifras`
AND IT MUST usar para las secciones las etiquetas "Líneas" y "Manifiesto"
BUT it must NOT repetir "Servicios" ni "Nosotros", que pertenecen a los enlaces de página
```

> Hoy el panel ya muestra **"Servicios" dos veces** — `navServicesPage` para `/services` y
> `navServices` para `#servicios` valen ambos `'Servicios'`. Es una violación preexistente del
> escenario de no-repetición, y este spec la arrastra si no la corrige.

**Scenario: el chrome se invierte sobre los tramos claros**

```text
GIVEN el usuario desplazándose por la página
WHEN el nav o el sub-header quedan sobre un tramo claro
THEN cada uno MUST invertir su tema midiendo el fondo EN SU PROPIA posición vertical
BUT it must NOT decidirse el tema de ambos midiendo un único punto común
```

---

### REQ-009 — El dorado de marca no puede ser texto sobre claro

- **Persona:** todos, y especialmente baja visión
- **Descripción:** Sobre fondos claros el dorado `--amd-gold` SHALL usarse únicamente como
  relleno; el texto de acento SHALL usar un dorado oscurecido que cumpla contraste.
- **Contexto medido:** `#CFBB66` da **1.73:1** sobre `--amd-mist` y **1.92:1** sobre
  `--amd-surface` — reprueba WCAG AA incluso en texto grande (mínimo 3:1). Sobre `--amd-ink` da
  9.68:1 y se conserva sin cambios.

**Scenario: acento legible sobre papel**

```text
GIVEN cualquier texto de acento sobre un fondo claro de la Home
WHEN se mide su contraste contra el fondo
THEN MUST ser >= 4.5:1 para texto normal y >= 3:1 para texto grande
AND IT MUST usarse el token `--amd-gold-ink` para ese texto
BUT it must NOT usarse `--amd-gold` como color de texto sobre `--amd-mist` ni `--amd-surface`
AND IT MUST seguir usándose `--amd-gold` como relleno decorativo (spine, subrayado, anillo del
  control de apertura) donde no es texto
```

**Scenario: el token se declara en la fuente de verdad**

```text
GIVEN el token `--amd-gold-ink`
WHEN se busca su declaración
THEN MUST estar en `client/src/styles/tokens.css`
AND IT MUST estar documentado en `docs/ux-ui/design.md` §7
BUT it must NOT quedar ningún valor `#8a7a2e` hardcodeado en CSS de componente
```

---

### REQ-010 — Accesibilidad y movimiento

- **Persona:** usuario de teclado, lector de pantalla, `prefers-reduced-motion`

**Scenario: recorrido completo por teclado**

```text
GIVEN un usuario que sólo usa teclado
WHEN recorre la Home con Tab
THEN el orden de foco MUST coincidir con el orden visual
AND IT MUST haber foco visible en todos los interactivos
AND IT MUST poder abrirse y cerrarse cada fila del ledger con Enter y Espacio
BUT it must NOT quedar ningún control alcanzable sólo con puntero
```

**Scenario: reduced-motion apaga todo el movimiento**

```text
GIVEN `prefers-reduced-motion: reduce`
WHEN se carga la Home
THEN MUST apagarse el marquee de clientes, el marquee de sectores, el parallax del spine,
  el conteo animado y la reproducción del video
AND IT MUST seguir siendo toda la información alcanzable sin movimiento
```

---

### REQ-011 — Paridad bilingüe

**Scenario: ninguna clave huérfana**

```text
GIVEN los diccionarios `es.json` y `en.json`
WHEN se comparan sus conjuntos de claves
THEN MUST ser idénticos
AND IT MUST existir traducción para toda clave nueva que introduzca este spec
BUT it must NOT quedar ningún literal de copy incrustado en plantilla NI en código
AND IT MUST las razones sociales de los clientes quedar fuera de i18n: son nombres propios
AND IT MUST retirarse de ambos diccionarios toda clave que quede huérfana al retirar el rail
```

> Hay al menos un literal en **código**, no en plantilla: `TrustSection.testimonialLabel()`
> devuelve `'Testimonio N'` en español fijo. Un gate que sólo mire plantillas no lo ve.

---

### REQ-012 — Responsive sin desbordamiento

**Scenario: sin scroll horizontal**

```text
GIVEN la Home a 375, 768, 900, 1200, 1600 y 1920 px
WHEN se compara `documentElement.scrollWidth` con `window.innerWidth`
THEN MUST NO haber desbordamiento horizontal en ninguno
AND IT MUST el ledger reordenarse a ordinal + contador + control arriba y título + resumen
  debajo por debajo de 900 px
```

---

### REQ-013 — Presupuesto de medios y rendimiento

**Scenario: el video no entra en el camino crítico**

```text
GIVEN la build de producción
WHEN se mide el bundle inicial
THEN el video de 1.9 MB MUST servirse como asset en runtime, no dentro del bundle inicial
AND IT MUST el bundle inicial seguir bajo el `maximumError` de 1 MB de `angular.json`
AND IT MUST el CSS de cada componente nuevo seguir bajo el `maximumError` de 32 kB
AND IT MUST el conjunto de máscaras de logos pesar <= 200 kB
```

---

### REQ-014 — Los documentos constitucionales quedan sincronizados

- **Persona:** cualquier agente o persona que lea la baseline después de este spec
- **Descripción:** Los cambios que este spec hace sobre el modelo de navegación, los tokens y el
  ritmo claro/oscuro SHALL reflejarse en `docs/ux-ui/design.md`, que es la fuente de verdad.

**Scenario: ningún documento describe lo que ya no existe**

```text
GIVEN `docs/ux-ui/design.md` después de implementar este spec
WHEN se busca la descripción del modelo de navegación, los tokens y el modo oscuro
THEN §2 y §5 MUST describir el sub-header desde 900 px, no un sidenav de puntos >= 1100 px
AND IT MUST §7 declarar el token `--amd-gold-ink` con su regla de uso
AND IT MUST §11 describir el ritmo claro dominante, no "dark premium con secciones light
  intercaladas"
BUT it must NOT quedar ninguna referencia al rail lateral en la baseline
```

---

## 4. Non-goals

- Tocar `/services`, `/about-us`, `/privacy`, `/terms` o el 404.
- Cualquier trabajo en `server/` (ADR-003).
- Toggle global claro/oscuro (`docs/ux-ui/design.md` §11 lo excluye de v1).
- Sustituir las fotos de Pexels por fotografía propia de AMD (D-2: se hace después, sin tocar CSS).
- Analytics de los nuevos elementos.
- Reemplazar los originales de logo de SK Glam y Obed Services: se pedirán, no bloquean.

---

## 5. Clases de defecto y su gate

**El runner de este proyecto es Vitest sobre jsdom.** jsdom no calcula layout, no compone
`mask-image`, no resuelve `getBoundingClientRect` real y no evalúa contraste. Este spec produce
sobre todo defectos **visuales y de layout**, que son exactamente los que ese runner no puede ver.
Declarar `npm run test:agent` como gate único sería declarar un gate ciego a la clase de defecto
dominante del spec.

| Clase de defecto | Ejemplo concreto de este spec | Gate que la ve |
|---|---|---|
| Lógica de estado | Acordeón no exclusivo; `aria-expanded` desincronizado; duplicación del carrusel | `npm run test:agent` (Vitest) |
| Foco alcanzable en contenido oculto | Enlace "Más info" de una fila cerrada; enlaces del sub-header aún invisible | `npm run test:agent` — assert de `inert`/no-tabulable, no de presencia de clase |
| Regresión por borrado | Tests que dejan de compilar al retirar un símbolo exportado (`TESTIMONIAL_PAUSE_MS`, `ROAD_DECO_FACTORS`, `HomeSideNav`); cuentas rígidas como `expect(anchors.length).toBe(7)` | `npm run test:agent` — **la suite completa debe compilar**, no sólo pasar los tests nuevos |
| Test que queda vacío | Un test cuyo sujeto desaparece y por eso pasa trivialmente | Revisión del diff: un test que ya no puede fallar **se borra**, no se conserva en verde |
| Contrato de datos | Contador que no deriva de `subs.length`; deep-link roto | `npm run test:agent` — y **por nombre**: los cinco `SERVICE_GROUP_IDS` cubiertos, los cinco `href="/services#<id>"`, y el guard de "Más info no alterna el acordeón". Los tres son hoy gates declarados de requisitos archivados y **cerrados**; viven en `services-road-section.spec.ts`, que este spec borra |
| Paridad i18n | Clave en `es.json` que falta en `en.json` | `npm run test:agent` (test de paridad de claves) |
| Ramas de reduced-motion | El marquee sigue animando; el video se reproduce | `npm run test:agent` sobre el servicio de motion + **verificación en navegador** para el efecto real |
| **Contraste de color** | `--amd-gold` como texto sobre mist (1.73:1) | **Ninguna automática en jsdom.** Cálculo de contraste sobre los tokens en test unitario + verificación en navegador |
| **Layout y geometría** | Desbordamiento horizontal; foto del ledger saliéndose del contenedor; sección oscura donde debía ir clara | **Ninguna en jsdom.** Medición en navegador real |
| **Costura del carrusel** | Salto de medio hueco en cada vuelta | **Ninguna en jsdom.** Medición en navegador real |
| **Fidelidad al mockup** | Ritmo claro/oscuro fuera de banda | **Ninguna automática.** Medición en navegador + revisión visual HITL |
| Presupuesto de assets | Video dentro del bundle inicial | `npm run build` con los budgets de `angular.json` |

**Sustitución declarada.** Las cuatro clases sin gate automático en jsdom se cubren con una
**verificación en navegador real** (`design.md` decide la herramienta) que mide y reporta números,
más una **revisión visual HITL** en la pausa de aprobación. Una captura JPEG **no** es evidencia
para estas clases: durante el mockup, las capturas comprimidas inventaron una costura que la
medición de píxeles a resolución nativa demostró inexistente (fondo estable en 241–243/255).

**Descalificador de evidencia — aplica a toda medición de esta tabla.** Un número producido no es
un número válido. Una medición no cuenta si el layout aún se está asentando: `scroll-behavior:
smooth` sigue animando (durante este spec, una prueba de pausa del carrusel dio un falso negativo
por medir una posición obsoleta), las fuentes web no han cargado, o el video no ha pintado su
póster. Antes de comprometer una cifra: forzar scroll instantáneo, esperar `document.fonts.ready`,
y repetir la medición. **Si dos lecturas consecutivas difieren más que el efecto medido, el
resultado es INCONCLUSO y debe reportarse como tal — nunca colapsarse en PASS porque el comando
salió con código 0.**

**Riesgo aceptado.** No se automatiza la comprobación de que el *encuadre* de cada fotografía es
el adecuado, ni de que un texto alternativo es verdadero y no sólo plausible. Ambas quedan a la
revisión HITL.

---

## 6. Traceability

| REQ | UX section | TRD section | Notas |
|-----|-----------|-------------|-------|
| REQ-001 | §6 Layout, §11 Dark mode | §8 | **Supersede** §11: v1 se describía "dark premium con secciones light intercaladas"; pasa a claro dominante |
| REQ-002 | §4, §6 | §4 `landing/services`, §8 | Sustituye `ServicesRoadSection` |
| REQ-003 | §2 IA | §9 | Regresión pura |
| REQ-004 | §4 Sobre AMD | §4 `landing/about` | |
| REQ-005 | §6 Full-bleed | §3 Performance | Sección nueva |
| REQ-006 | §4 Confianza | §4 `landing/trust` | Retira la auto-rotación |
| REQ-007 | §8 Component inventory | §3 Accessibility | Componente nuevo |
| REQ-008 | **§2, §5** | §8 | **Supersede** el sidenav de puntos |
| REQ-009 | **§7 Tokens**, §10 | §3 Accessibility | Token nuevo `--amd-gold-ink` |
| REQ-010 | §10 | §3 Accessibility | |
| REQ-011 | §1 principio 6 | §13 punto 5 | |
| REQ-012 | §9 Responsive | §3 | |
| REQ-013 | — | §3 Performance | Budgets de `angular.json` |
| REQ-014 | §2, §5, §7, §11 | — | Cumple la exigencia de sincronía documental de `archive/…domain--landing` REQ-015 |

---

## 7. Open Questions

Ninguna bloquea implementación. Las cinco decisiones abiertas del proposal (D-1, D-2, D-3, D-8,
D-9) están cerradas por HITL el 2026-09-06.

Pendiente **no bloqueante**: pedir a SK Glam y a Obed Services su logo vectorial original. Hoy se
usan sus PNG/JPG normalizados; SK Glam se amplía 1.49x y sale algo blando.
