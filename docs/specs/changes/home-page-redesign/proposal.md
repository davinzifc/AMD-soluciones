# Proposal — Rediseño de la página Home

Alinear el landing con el lenguaje editorial que estrenó `/services`, **rediseñando a fondo el
recorrido de servicios** (el zig-zag de tarjetas pasa a ser un índice editorial sobre papel con
revelado de imagen), y darle al resto de la página un ritmo de claro/oscuro con aire real para
descansar la vista. Se incorporan imágenes y **un solo video**, con presupuesto de medios
explícito para no saturar. El hero y su campo de orbes difuminados se conservan intactos.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/home-page-redesign/` |
| Slug | `home-page-redesign` |
| Type | Change |
| Approval Mode | gated |
| Status | **Approved** — todas las decisiones cerradas (HITL 2026-09-06) |
| Phase | 1-landing |
| Depends on | `archive/2026-09-05-changes--services-page-redesign` (lenguaje visual de origen) · `archive/2026-08-05-changes--hero-floating-orbs` (campo de orbes, se preserva) |
| Parallel-safe | parcial — toca `features/home/*` y añade `public/media/`; no toca `features/services/` |
| Requirement source | Screenshots HITL de `/` y `/services` + free-text del usuario |
| Related | `docs/prd.md` §5 · `docs/ux-ui/design.md` §1 / §5 / §6 / §7 · `docs/trd/trd.md` ADR-002 |
| Kaizen | **KZ-001** (no tocar geometría ≥44px salvo que la tarea lo nombre) · **KZ-002** (nada de selectores `body`/`html` para show/hide) · **KZ-003** (pipes i18n impuros) |
| Skills | `ui-ux-pro-max` (aplicada) · `angular-developer` · `frontend-design` · `gsap-animation` (solo si se aprueba el scroll-driven del spine) |
| Mockup | `mockup/index.html` — navegable (variante clara aprobada), 13 capturas en `mockup/shots/` |

---

## 1 · Diagnóstico de la Home actual

Contrastando la captura de `/` con la de `/services`:

| # | Hallazgo | Severidad |
|---|---|---|
| D-1 | **El path de servicios desperdicia la mitad del ancho.** El zig-zag deja una columna vacía por fila, con círculos decorativos que no comunican nada. Cinco líneas exigen un scroll largo para poca información. | Alta |
| D-2 | **Ruptura de lenguaje con `/services`.** El landing usa tarjetas claras con sombra neuromórfica; la página de servicios usa capítulos oscuros, hairlines, ordinales sobredimensionados y dorado de acento. Son dos productos distintos. | Alta |
| D-3 | **Cero imágenes en toda la página.** `about-teaser` tiene un `<figure>` literalmente vacío con solo un `figcaption`. Nada aterriza el negocio en algo concreto. | Alta |
| D-4 | **El espacio vacío no lee como respiro, lee como layout roto.** Hay hueco, pero es hueco *dentro* de las secciones (columnas sin contenido) en vez de aire *entre* secciones. | Media |
| D-5 | **Ritmo plano.** Tras el hero oscuro, todo el resto es una banda clara continua sin jerarquía ni pausas. | Media |
| D-6 | **`trust` compite con `road`.** Métricas, pills de sectores y testimonios apilados sin aire hacen que la sección de credibilidad se lea como relleno. | Baja |

---

## 2 · Concepto: continuidad editorial, extremos cinematográficos

Una sola idea estructural: **la página respira en bandas alternadas** y el recorrido de servicios
se convierte en el puente visual hacia `/services`.

```
┌──────────────────────────────────────────────────────────────┐
│ 01 · HERO           OSCURO   orbes difuminados — SIN CAMBIOS │
├──────────────────────────────────────────────────────────────┤
│ 02 · LEDGER         OSCURO   ← el rediseño fuerte            │
│      "Cinco líneas. Una sola operación."                     │
│      5 filas · hairlines · panel de foto · spine dorado      │
├══════════════════════════════════════════════════════════════┤ ← corte de capítulo
│ 03 · NOSOTROS       CLARO    el respiro: tipografía y aire   │
│      manifiesto + 3 pilares — CERO imágenes                  │
├──────────────────────────────────────────────────────────────┤
│ 04 · CIFRAS         BANDA    full-bleed · el VIDEO es fondo  │
│      3 métricas grandes con conteo al entrar (≈46vh)         │
├──────────────────────────────────────────────────────────────┤
│ 05 · CONFIANZA      CLARO    testimonio + ticker de sectores │
├══════════════════════════════════════════════════════════════┤
│ 06 · CONTACTO       OSCURO   eco del hero (orbes al 45%)     │
└──────────────────────────────────────────────────────────────┘
```

Por qué funciona:

- **Oscuro–oscuro al principio** hace que el ledger se sienta parte del hero, no una sección
  aparte; y cuando el usuario llega a `/services` (también oscuro) la transición es invisible.
- **El corte a blanco tras el ledger** es la pausa. Llega justo después del bloque de mayor
  densidad informativa, que es donde el ojo la pide.
- **La banda oscura de Cifras parte la zona clara en dos**, así ni Nosotros ni Confianza se
  perciben como una única losa blanca larga.
- **Cerrar en oscuro** cierra el paréntesis y devuelve el foco al CTA.

### Sistema visual (sin paleta nueva)

`ui-ux-pro-max --design-system` propuso el patrón **Scroll-Triggered Storytelling** con estilo
**Exaggerated Minimalism** (tipografía sobredimensionada, alto contraste, espacio negativo
generoso) — encaja exactamente con lo que ya hace `/services`, así que se adopta.

**Se descarta la paleta que sugirió la herramienta** (azul cielo `#0EA5E9` + naranja): contradice
los tokens de marca ya aprobados en `docs/ux-ui/design.md` §7. Se mantiene íntegro
`client/src/styles/tokens.css` — oro `#CFBB66`, tinta `#0D141A`, Sora + DM Sans — y los tokens
derivados de banda oscura (`--ink-text`, `--hairline`) con los **mismos nombres** que ya usa
`services-page.css` (DD-024), para que ambas páginas compartan vocabulario.

---

## 3 · El rediseño del path de servicios ("Ledger")

Sustituye `services-road-section` completo. Conserva el **contrato de interacción** actual
(expandir en el landing + "Más info" que abre `/services#<id>`), cambia por completo la forma.

### Anatomía de una fila

```
│ 01   Contabilidad              ░▒▓▓▓▓▓▒░  16 servicios   (+)  │
│      Estados financieros…      la foto nace de la tinta        │
├────────────────────────────────────────────────────────────────┤
↑                               ↑                                ↑
spine dorado        se disuelve por los 4 lados     borde del contenido:
que se llena        (viñeta de degradados)          la foto NO llega al
con el scroll                                       borde de la pantalla
```

| Elemento | Comportamiento |
|---|---|
| **Ordinal** (`01`…`05`) | Sora 600, `clamp(1.5rem, 3.2vw, 2.4rem)`, tinta al 16 %. Pasa a **oro** al hover, al foco **y con la fila abierta** — el estado abierto debe verse igual que el activo, no sólo mientras el cursor esté encima. Mismo recurso que el `chapter__ordinal` de `/services`. |
| **Título + resumen** | Una línea de título grande + una de resumen. Nada más por fila cerrada. |
| **Revelado de foto** | La foto ocupa la mitad derecha de la fila y se disuelve en la tinta por los cuatro lados con una viñeta de degradados. Entra con `opacity 0→.38` + `scale(1.06)→1`. Grayscale + duotono dorado (`mix-blend-mode: color`). **Termina en el borde del contenido, no en el de la ventana.** |
| **Contador** | `16 servicios` — el número en oro. Da escala del catálogo sin listar nada. |
| **Botón `+`** | Dibujado en CSS (regla `no-emoji-icons`), rota 135° a `×` al abrir. |
| **Detalle** | Acordeón **exclusivo** con `grid-template-rows: 0fr → 1fr` (sin medir alturas en JS). Cuerpo + "Más info →". |
| **Spine** | Línea de 2 px a la izquierda que se llena con el progreso de scroll. **Conserva la metáfora de "camino"** del diseño actual, comprimida a su expresión mínima. |

### Dos invariantes del revelado (cada una costó un bug)

1. **`overflow: hidden` en el contenedor de la foto es obligatorio.** El `<img>` se anima con
   `transform: scale(1.06) → scale(1)`; sin recorte se desborda del contenedor durante toda la
   transición, por fuera del alcance de la viñeta — que es exactamente el "se sale" que se veía
   al hacer hover.
2. **La foto termina en el borde del contenido (`right: 0`), nunca en el de la ventana.** Sangrar
   hasta el borde del viewport rompe el margen que respeta el resto de la página y hace que la
   fila se lea como una banda pegada al filo del navegador.

Ambas quedan documentadas como comentarios en el CSS del mockup para que no se pierdan al
portarlo a Angular.

### Acordeón exclusivo

Abrir una línea **cierra la que estaba abierta**. Razones:

- La altura de la sección se mantiene estable: sin acordeón exclusivo, cinco filas abiertas
  duplican el alto del bloque y se pierde el efecto de índice compacto.
- Siempre hay exactamente una línea "activa", así que el panel de foto tiene un referente
  inequívoco.
- Estas filas son resúmenes de una frase, no contenido que el usuario necesite comparar en
  paralelo — que es el único caso donde el multi-abierto gana.

`aria-expanded` se sincroniza en todas las filas en cada clic; volver a pulsar la fila abierta la
colapsa (estado "ninguna abierta" permitido).

### Qué se gana

- Las cinco líneas caben en un bloque continuo y legible en vez de un zig-zag de pantalla y media
  por ítem. En el mockup la sección completa (encabezado + 5 filas + hint) mide **1 250 px** a
  1 080 px de ancho, con una fila abierta — y no crece al navegar, por el acordeón exclusivo.
- El hueco muerto de D-1 desaparece: el ancho que sobraba ahora es la columna del panel.
- Escanear las cinco líneas es una sola sacada de ojos por la columna de títulos.

### Responsive

- **≥ 901 px** — fila en grid `ordinal | texto | panel | contador | botón`; el panel se revela
  al puntero o al foco de teclado.
- **≤ 900 px** — la fila se reordena a `ordinal + contador + botón` arriba y `título + resumen`
  debajo; **el revelado por hover se desactiva** (no hay hover fiable en táctil) y el panel pasa
  a ancho completo dentro de la fila abierta. La columna fija desaparece: por debajo de 900 px
  no cabe sin comprimir el texto.

Verificado sin scroll horizontal a **375 · 768 · 900 · 1200 · 1600 · 1920 px**, con un solo índice
de secciones en cada uno.


### El ritmo claro/oscuro — iteración HITL 2026-09-06

Feedback del cliente y de AMD: *«el diseño me agrada, lo único es que siento que está muy
oscuro»*, con la instrucción de tener en cuenta la página que AMD tiene hoy en producción.

**Medición, no impresión** (1440 px, `getBoundingClientRect` sobre las seis secciones):

| | Oscuro (v1) | **Claro (v2)** |
|---|---|---|
| Alto de página en tinta | **68.2 %** | **43.2 %** |
| Alto de página en claro | 31.8 % | 56.8 % |
| Primer tramo claro | y = 2 162 px — **2.40 pantallas** | y = 900 px — **1.00 pantalla** |
| Alto total | 5 138 px | 5 138 px (sin reflow) |

El problema no era el color: era que el hero y el ledger, ambos en tinta, formaban un bloque
continuo de 2 162 px. Se scrolleaban dos pantallas y media seguidas antes de la primera bocanada
de aire. Y `amdsoluciones.com` —Hostinger Website Builder, blanco dominante con el mismo dorado
`#cfbb66`— es exactamente lo contrario.

**Qué cambia: sólo el ledger pasa a claro.** Nada más. El oscuro deja de ser el suelo de la página
y pasa a ser puntuación en tres momentos: hero (entrada), banda de Cifras (el video) y Contacto
(cierre). Hero y Contacto siguen cerrando el paréntesis; el video sigue siendo el único momento
cinematográfico.

Implementado como **capa de override** en `mockup/home-redesign-claro.css` (~120 líneas, cero
duplicación de layout) que `mockup/index.html` carga sobre la base. La sección entera se invierte redefiniendo las cuatro derivadas de sección oscura
en el propio scope (`--ink-text`, `--ink-text-2`, `--ink-text-3`, `--hairline`), que es el mismo
patrón DD-024 de `services-page.css`: el layout no se toca.

**El ledger gana con el cambio, no sobrevive a él.** Sobre tinta la foto *nacía* de la oscuridad;
sobre papel se *imprime* en la hoja (`mix-blend-mode: multiply`, opacidad 0.5, tinte dorado 0.2).
Un ledger es papel, no pizarra: la metáfora del libro contable se lee mejor en claro.

#### El dorado no puede ser texto sobre claro

Medido: `#cfbb66` sobre `#f2f3f6` da **1.73:1**, y sobre blanco **1.92:1**. Reprueba WCAG incluso
en tamaño grande (mínimo 3:1). Afectaba al ordinal activo, al contador, al eyebrow y a los enlaces
"Más info". Sobre tinta el mismo dorado da 9.68:1, así que en los tramos oscuros se queda igual.

La solución no inventa color: **`--amd-gold-ink: #8a7a2e`** es el valor que el propio mockup ya
usaba suelto en `.eyebrow--ink` para las secciones claras — mismo tono (H 48.6°) y saturación
(52 %), sólo más oscuro. Da **3.86:1** sobre mist y **4.28:1** sobre blanco. Sobre papel además
lee a bronce de libro contable, que es mejor que el brillo.

Donde el dorado es **relleno** y no texto, se queda pleno `#cfbb66`: el spine del "camino", el
subrayado del título activo y el anillo del botón `+`, que ahora va **relleno de dorado con los
trazos en tinta** (9.7:1) en vez de trazos dorados sobre papel (1.7:1). El dorado gana presencia
justo donde antes se perdía.

#### Invariante nueva: el corte tinta → papel va a filo

Se probó un puente de 140 px en degradado para suavizar el salto hero → ledger, y otro simétrico
en Confianza → Contacto. **Medido en el navegador: no suaviza, ensucia.** Vela el tercio inferior
del hero con una niebla gris, apaga los orbes y deja el indicador "SCROLL" flotando en una zona
lechosa; en Contacto se lee como un borde sucio. Ambos se retiraron.

El corte limpio es además el gesto correcto: pasar de tinta a papel de golpe es pasar la página de
un libro. Entre las dos secciones claras (mist → blanco) basta un hairline, que no vela nada.

#### Verificado en navegador

- Nav y sub-header se invierten correctamente al 15 %, 45 % y 80 % del ledger claro.
- Sin scroll horizontal a 375 / 768 / 900 / 1200 / 1600 / 1920 px, en las dos variantes; un solo
  índice de secciones en cada ancho y cero errores de JS tras retirar el rail.
- Perfil de píxeles a resolución nativa sobre una fila cerrada: el fondo se mantiene en 241–243/255
  (±2) entre x=900 y x=1300 — **no hay costura** donde el JPEG comprimido parecía mostrar una.
  Es exactamente el artefacto contra el que advierte el HANDOFF.

---

## 4 · Plan de medios: 7 piezas fotográficas, ni una más

La regla que evita saturar es un **presupuesto cerrado**, no el buen criterio del momento.

| # | Pieza | Dónde | Tratamiento | Peso |
|---|---|---|---|---|
| 1–5 | 5 fotos de línea | Ledger, una por línea | WebP 900 px en un panel de 11.5 rem, grayscale + duotono oro, `loading="lazy"` | 143 KB total |
| 6 | 1 video | **Fondo** de la banda de Cifras | 720p, **sin audio**, en bucle continuo sin controles, `preload="none"`, se reproduce solo en viewport, scrim de tinta al 70–95 % encima | 1.9 MB |
| 7 | 1 póster del video | Banda de Cifras | WebP; es lo único que carga hasta que la banda entra en pantalla | 46 KB |
|   | **Nosotros** | — | **Cero imágenes, a propósito.** Es el respiro. | 0 |
|   | **Confianza** | — | **Cero imágenes.** | 0 |
|   | **Hero** | — | **Sin video ni foto.** Los orbes son el fondo. | 0 |

**Total: ~2.1 MB**, de los cuales 1.9 MB (el video) no se descargan hasta que el usuario llega
a la banda. Por encima del pliegue solo cargan tipografías + CSS, igual que hoy.

### El video como fondo, no como pieza

El video es un loop ambiental: no explica nada, así que **no merece espacio propio**. En vez de
un reproductor 16:9 de ancho completo (≈1 190 px de alto), pasa a ser el **fondo de una banda
full-bleed de ≈46 vh (483 px medidos)** que existiría igual para alojar las tres métricas.

Resultado: el video no cuesta ni un píxel adicional de scroll, y a cambio le da atmósfera a la
información que sí importa. La página completa pasó de 6 176 px a **4 982 px** de alto
(−19 %) sólo con este cambio.

El "valor interactivo" lo aportan dos cosas que sí invitan a mirar:

1. **Conteo animado de las cifras** al entrar en pantalla (`+10`, `31`, `100%`), con easing
   cúbico de 1.1 s. Con `prefers-reduced-motion` el número aparece directo.
2. El propio movimiento continuo del video bajo el scrim.

Alternativa considerada y descartada: un *chip* de video pequeño que abre lightbox al clic.
Añade una capa modal y un estado más para algo que no tiene información que revelar.

### Video: siempre en reproducción, sin controles *(decisión HITL)*

`autoplay muted loop playsinline` y **sin botón de play/pausa**: es un loop ambiental de fondo, no
una pieza que el usuario venga a ver, y un control flotante sobre las cifras añadía ruido a la
banda. Se conservan dos salvaguardas que no son controles de interfaz:

- **Se pausa fuera del viewport** (IntersectionObserver) — ahorro de CPU y batería, no
  accesibilidad.
- **`prefers-reduced-motion: reduce` deja sólo el póster**, sin movimiento. Es lo que protege de
  verdad a quien es sensible al movimiento, porque actúa sin que tenga que buscar un botón.

El `<video>` es `aria-hidden` + `tabindex="-1"`: es decoración, y toda la información de la banda
está en el texto que va encima, con el scrim garantizando el contraste sobre cualquier fotograma.

**Implicación a registrar:** WCAG 2.2.2 (*Pause, Stop, Hide*, nivel A) pide un mecanismo en la
interfaz para detener cualquier movimiento automático de más de 5 s. Sin el botón, el criterio no
se cumple por la letra aunque `prefers-reduced-motion` cubra el caso real. Es una decisión de
diseño tomada a conciencia, no un olvido; si más adelante se exige conformidad AA/A auditada, la
vía menos invasiva es devolver el control como un icono discreto en una esquina de la banda.

### Origen y licencia

Todo el material es de **Pexels**, bajo la [Licencia Pexels](https://www.pexels.com/license/)
(verificada el 2026-09-06). Los IDs exactos están en `mockup/README.md`.

**Lo que sí permite:** descarga y uso gratuitos, **uso comercial**, modificación libre, y
**atribución opcional** — "Giving credit to the photographer or Pexels is not necessary but
always appreciated".

**Lo que prohíbe, y la cláusula que nos aplica:**

| Prohibición (verbatim) | ¿Nos afecta? |
|---|---|
| *"Don't imply endorsement of your product by people or brands on the imagery."* | **SÍ — riesgo activo.** Ver abajo. |
| *"Identifiable people may not appear in a bad light or in a way that is offensive."* | No, el uso es neutro y profesional |
| *"Don't sell unaltered copies… as a poster, print or on a physical product"* | No, sólo van en web |
| *"Don't redistribute or sell the photos and videos on other stock photo platforms"* | No |
| *"Don't use the photos or videos as part of your trade-mark… business name or service mark"* | No, el logo de AMD es propio |

> **⚠️ Regla de uso — no implicar respaldo.** La foto del Manifiesto y el video de la banda
> contienen **personas identificables**. Hoy el uso es seguro porque acompañan copy descriptivo
> ("Una asesoría, no un ticket") sin atribuirles identidad. **Cruzaría la línea** poner cualquiera
> de esas imágenes junto a texto que las presente como el equipo de AMD, como clientes de AMD, o
> firmando un testimonio. Esto es especialmente delicado en la sección Confianza, que sí lleva
> testimonios: **esa sección debe quedarse sin fotografía de personas** mientras se usen
> placeholders de stock.
>
> Pexels tampoco garantiza *model releases*. Es el argumento más fuerte a favor de **D-2**: para
> una web corporativa que habla de "nuestro equipo" y muestra testimonios, la fotografía propia
> no es sólo mejor visualmente, elimina un riesgo legal.

Los assets actuales son **placeholders con licencia limpia y aptos para producción tal cual**;
la recomendación sigue siendo sustituirlos por fotografía propia de AMD (ver D-2).

---

## 5 · El resto de la página

### 03 · Manifiesto — el respiro *(fusiona el antiguo Manifiesto + About)*

Fondo blanco y mucho aire. Una frase de una sola idea en Sora a
`clamp(1.85rem, 4.4vw, 3.2rem)`, un párrafo, y tres pilares separados por hairlines con ordinal
dorado.

> **Tu contabilidad no debería ser una caja negra.**
> Somos una PYME colombiana enfocada en finanzas, administración y cumplimiento, con más de una
> década acompañando empresas de distintas industrias. Formalizar no es llenar formatos — es
> poder tomar decisiones con números en los que confías.

| | Pilar | Copy |
|---|---|---|
| 01 | Cercanía | Un interlocutor que conoce tu operación, no un ticket en una cola. |
| 02 | Cumplimiento | Calendario tributario y laboral al día, sin sobresaltos de última hora. |
| 03 | Claridad | Cifras que puedes explicar frente a un banco, un socio o la DIAN. |

**Imagen sola a la izquierda; eyebrow, titular y párrafo juntos a la derecha.**

**La altura de la foto no se fija en ningún número: la marca el bloque de texto.** La fila del
grid la define la columna de texto (`align-items: stretch`, con la copia centrada), la figura se
estira a esa altura y un `margin-block: -1.75rem` la deja sobresalir ~28 px por arriba y por
abajo — acompaña al texto sin dominarlo. Medido a 1600 px: texto 335 px, foto 391 px. La ventaja
es que se adapta sola a un titular de 2 o 3 líneas y a la traducción al inglés sin tocar el CSS;
un `min-height: 17rem` cubre el caso de copy muy corto. En apilado (móvil) no hay fila que
estirar, así que se recupera una relación fija de 4:3.

Dos razones para el lado:

1. **Compensa el peso visual.** En el ledger todos los revelados de foto salen por la derecha;
   repetir el lado aquí carga toda la página hacia el mismo costado.
2. **`align-items: center`, nunca `end`.** Con `end` el párrafo se empujaba hacia abajo para
   alinearse con el borde inferior de la foto, abriendo un vacío de ~230 px entre el titular y el
   texto que parecía un error de maquetación. Con `center` el bloque de texto se equilibra contra
   la foto y el desfase se reparte en dos mitades simétricas, que el ojo lee como aire deliberado.

   **Criterio para la spec:** ese equilibrio depende del largo del copy. El párrafo debe
   mantenerse en **3–5 líneas en ambos idiomas**; en inglés este texto se acorta y el desfase
   crece, así que el gate visual debe revisarse en ES y en EN.

Se descartaron por el camino, con la razón:

| Intento | Por qué no |
|---|---|
| Bokeh de Cali en columna 3:4 | Demasiado alta, se salía de pantalla; el desenfoque la hace materia de fondo, no pieza autónoma |
| Banda 21:9 a todo el ancho | El recorte se comía la escena hasta dejar sólo una mano, y competía con la banda de Cifras |
| 16:9 a 46 rem | Seguía siendo casi el ancho de pantalla y empujaba los pilares fuera del primer vistazo |
| 3:2 a la derecha con `align-items: end` | Alineaba el párrafo al pie de la foto y abría un hueco muerto bajo el titular |
| Plano de manos entregando un documento | Ilustraba el trámite, no la relación: sin rostros no hay confianza que mostrar |

La foto elegida es [Pexels 7979438](https://www.pexels.com/photo/7979438/): dos asesores
explicando sobre documentos y laptop a un cliente que vemos **de espaldas en primer plano**, de
modo que quien mira se pone en su lugar. Hay rostros, atención y conversación real — que es lo que
construye confianza. Un plano de manos con lápiz y papel (el intento anterior, Pexels 3760067)
ilustraba el trámite, no la relación, y el copy de esta sección habla de la relación.

Es la única foto a color pleno de la página; el resto va en duotono dorado dentro del ledger. La
foto de la línea 04 del ledger se rotó a otra para no repetir imágenes.

### 04 · Cifras — la banda

Full-bleed, ≈46 vh, video de fondo con scrim de tinta, eyebrow `CALI · COLOMBIA`, una frase corta
y tres métricas con conteo animado. Absorbe las métricas que antes vivían apretadas dentro de
Confianza.

### 05 · Confianza

Queda con lo que de verdad es prueba social, en tres escalones de concreción: **un testimonio a
la vez** centrado en 44 rem con sus tres puntos de navegación (lo que dicen), el **muro de
clientes** (quiénes son) y el **ticker de sectores** en texto con máscara de degradado en los
bordes (dónde operan). Sigue sin fotos de personas — la restricción de la licencia Pexels de §4
no se toca.

#### El muro de clientes *(HITL 2026-09-06)*

13 logos de empresas que ya operan con AMD, en **carrusel infinito** — decisión del cliente
(HITL 2026-09-06), que lo quiso en movimiento como el ticker de sectores.

Se propuso primero una retícula estática, con el argumento de que un ticker mueve el logo justo
cuando alguien lo busca. El cliente prefirió el movimiento, así que el carrusel absorbe esa
objeción en vez de ignorarla:

| Riesgo del marquee | Cómo queda resuelto |
|---|---|
| No se puede señalar un logo | **Se pausa** al pasar el cursor o al tabular dentro del carril |
| El lector de pantalla oye los logos dos veces | La copia duplicada va `aria-hidden` y sin `role="img"`: se anuncian 13, no 26 |
| Movimiento no deseado (la razón de D-5) | Bajo `prefers-reduced-motion` vuelve a ser **retícula estática** con los 13 visibles, no una cinta congelada que dejaría a la mayoría fuera de pantalla |
| Dos cintas seguidas se leen como repetición | El muro corre en **sentido contrario** al ticker de sectores |

Dos detalles de implementación que son la diferencia entre un marquee y un marquee que funciona:

- **Sin `gap`: el aire va como margen de cada logo.** Con `gap`, desplazar el 50 % no cae en el
  mismo punto del patrón —queda desfasado medio hueco— y el bucle da un salto en cada vuelta.
  Con margen por elemento las dos mitades son idénticas. Medido: desfase de costura **0.00 px a
  1440 px, −0.03 a 768 y −0.13 a 375**.
- **La duración se calcula desde el ancho medido, no se fija en el CSS.** Con una duración fija la
  cinta corre más rápido en móvil —mismo tiempo, menos recorrido— justo donde ya cuesta leerla.
  Medido a 42 px/s constantes en los tres anchos (51 s a 1440, 44 s a 768, 38 s a 375).

**Los archivos llegaron como los envían las empresas**, y ese es el problema de diseño real:

| Defecto medido | Ejemplo |
|---|---|
| Ratios de 0.82 a 4.18 — **5.1x de dispersión** | NFES (0.82) frente a Virtual Cloud (4.18) |
| Fondo oscuro incrustado, sin canal alfa | `Logo Obedservices.jpg` |
| Arte rosa pálido, invisible sobre papel | `Logo SK Glam SAS.png` |
| Líneas de recorte pegadas al arte | KAES: una barra de 27x2156 px, el 2.35 % de la tinta |
| Pesos de 8 KB a 4.8 MB | SK Glam vs Caval |

**La decisión: monocromo.** Lo que se sirve no es el logo, es una **máscara de un solo canal**; el
color lo pone el CSS con `mask-image` y `currentColor`. Eso resuelve cuatro cosas de una vez: el
caos cromático desaparece, el fondo negro y el rosa pálido dejan de ser problemas de color para
ser problemas de forma —que sí se normalizan—, los halos de JPEG se van con la silueta, y **la
misma pieza sirve en la variante clara y en la oscura** sin duplicar assets.

Ninguna política de máscara única sirve para los 13; se eligieron mirando las tres renderizadas
lado a lado, logo por logo: **silueta por alfa** (9 logos), **tinta** `α·(1−L)` para los que
tienen detalle claro que la silueta borraría — el loto de Loto Group se volvía un borrón (3), y
**luz** `α·L` para el arte claro sobre fondo negro incrustado de Obed Services (1).

Las siluetas se limpian de astillas de recorte con una regla de **tres condiciones simultáneas**:
menos del 3 % de la tinta, alargamiento mayor de 15:1 **y** tocar el borde. Las tres hacen falta —
un umbral de tamaño a secas borró 26 componentes en Ballet Capital y 14 en D&P: eran las letras de
sus taglines.

El tamaño se equilibra por **área de tinta**, no por caja: dos logos con el mismo alto no pesan lo
mismo si uno es un wordmark fino y el otro un símbolo macizo. La corrección es suave (exponente
0.35, tope ±) porque igualar el área de tinta del todo hace lo contrario de lo que promete —
agranda los logos de línea fina hasta que dominan el muro.

**Total: 144 KB** para los 13, sin `<img>` de color y sin peticiones de más.

El pipeline completo, con el porqué de cada decisión, vive en
`mockup/assets/logos/prepare-logos.py`, y es reejecutable: `python3 prepare-logos.py <carpeta>`.

**Dos cosas que quedan abiertas y no son técnicas:**

- **Permiso de uso: resuelto.** Son los mismos logos que ya se muestran en `amdsoluciones.com` y
  la autorización la tienen los dueños del sitio (HITL 2026-09-06).
- **Dos originales flojos.** `SK Glam` sólo trae 208x123 px, así que se amplía 1.49x y sale algo
  blando; `Obed Services` es línea muy fina y pesa menos tinta que el resto. Se buscó fuente mejor
  en la web: SK Glam no tiene presencia pública con logo, y el único "Obed" con sitio propio es
  **Obed Technologies LLC**, una empresa distinta de EE. UU. — usar ese logo sería un error de
  hecho en un muro de clientes, así que no se sustituyó. Lo correcto es pedírselos a los clientes.

### 06 · Contacto

Panel de vidrio sobre fondo oscuro con el campo de orbes al 45 % — cierra el paréntesis del hero.
El formulario mantiene los campos y el flujo actuales (WhatsApp/mailto, fase 1 sin backend).

### Navegación: dos sistemas, y sólo uno visible por ancho

| | Qué es | Dónde lleva |
|---|---|---|
| **Menú superior** | Navegación entre **páginas** | `/` · `/about-us` · `/services` |
| **Índice de secciones** | Navegación **dentro del home** | `#inicio` · `#servicios` · `#sobre-amd` · `#cifras` · `#confianza` · `#contacto` |

**Ninguna etiqueta se repite entre los dos.** La sección del catálogo se llama **"Líneas"** (no
"Servicios", que es la página `/services`) y la del manifiesto **"Manifiesto"** (no "Nosotros",
que es `/about-us`). Dos entradas con el mismo nombre llevando a sitios distintos es una trampa,
y con un sub-header debajo del menú principal la trampa queda a dos centímetros de distancia.

El índice de secciones **cambia de forma según el ancho, pero nunca hay dos a la vez**:

| Ancho | Índice de secciones | Por qué |
|---|---|---|
| **≥ 900 px** | Sub-header | Una línea de 44 px bajo el nav, que **aparece sólo al salir del hero** para no restarle impacto. Sin logo, sin botones, tipografía pequeña: pesa una fracción del menú principal. |
| **< 900 px** | Panel de hamburguesa | Páginas y secciones en la misma hoja, agrupadas bajo "Páginas" y "En esta página". Resuelve además que los enlaces de página desaparecían por completo en móvil. |

#### El rail lateral queda descartado *(HITL 2026-09-06)*

La v1 traía un tercer índice: un rail de puntos pegado al borde izquierdo, activo sólo a partir de
1540 px. **Se retira en todos los anchos.** El sub-header ya hacía ese trabajo, y sostener dos
piezas para la misma función es una decisión de más: dos sitios donde sincronizar el scroll-spy,
dos temas claro/oscuro que mantener, dos juegos de etiquetas que no pueden divergir.

Con el rail se van además sus tres problemas propios, todos reportados en su momento: los puntos
se perdían contra el fondo, el revelado mostraba una etiqueta a la vez en vez de todas, y el
umbral de 1540 px existía únicamente para que el rail no se montara sobre el texto. Ninguno de
los tres le pasa al sub-header, que vive en el flujo y no compite con el contenido por el margen.

**Sobre si el sub-header carga de más:** en la forma habitual sí — dos barras fijas comen ~120 px
permanentes, el 15 % de un móvil. Lo que lo hace viable aquí son tres decisiones: (1) no existe en
móvil, que es donde el alto es escaso, y por debajo de 900 px lo releva la hamburguesa; (2) sólo
se materializa tras el hero, así que la primera pantalla conserva una única barra; (3) ahora es el
único índice, así que nunca coexiste con nada.

---

---

## 6 · Lo que NO cambia

Explícito, porque es lo que el usuario pidió preservar:

- **`AmbientOrbsComponent` no se toca.** Ni el componente, ni sus tokens, ni su gate de
  `MotionService`, ni sus tests. El mockup porta `buildOrbs()` 1:1 solo para poder verlo en
  vanilla.
- **El hero conserva** su composición, su copy, sus dos CTAs, el `SCROLL` y el parallax.
- **`service-catalog.data.ts` no se toca** — el ledger consume los mismos cinco grupos.
- **El contrato de navegación** landing → `/services#<id>` se mantiene.
- **Tokens de marca**: sin colores nuevos, sin fuentes nuevas.

---

## 7 · Decisiones abiertas (HITL)

| # | Decisión | Recomendación |
|---|---|---|
| ~~**D-1**~~ | ¿El ledger va en oscuro (continuidad con `/services`) o en claro? | **RESUELTA (HITL 2026-09-06): claro, aprobada por el cliente.** El feedback fue «me agrada, lo único es que siento que está muy oscuro». Medido: la v1 tenía 68.2 % de la página en tinta y 2.4 pantallas seguidas antes del primer tramo claro; en claro baja a 43.2 % y el aire llega a la pantalla 1. Ver §3 → *El ritmo claro/oscuro*. Es ya la versión que sirve `mockup/index.html`. |
| ~~**D-2**~~ | ¿Fotografía propia de AMD o stock con licencia? | **RESUELTA (HITL 2026-09-06): se usan los placeholders de Pexels por ahora**, sustituibles más adelante. Implica que la spec debe tratar las rutas de imagen como intercambiables (nombres estables por rol, no por contenido) y que **la regla de "no implicar respaldo" de §4 queda vigente** mientras haya stock con personas: Confianza no lleva fotos de personas, y ningún copy presenta a los retratados como equipo o clientes de AMD. |
| ~~**D-3**~~ | ¿La banda de Cifras usa video o una foto fija? | **RESUELTA (HITL 2026-09-06): video.** Se implementa `manifiesto.mp4` (1.9 MB) como fondo de la banda, con las reglas de §4 (autoplay, muted, loop, sin controles, `poster` como primer frame y `prefers-reduced-motion` → póster fijo). El póster queda como fallback declarado para conexiones lentas; cambiar a foto fija no altera el diseño. |
| **D-4** | ¿El spine se anima con scroll nativo (`requestAnimationFrame`) o con GSAP ScrollTrigger? | **Nativo.** Es una sola propiedad (`height`); GSAP no se justifica y añade peso. |
| **D-5** | ¿El testimonio rota solo o solo con los puntos? | **Solo con los puntos.** Un carrusel automático es contenido en movimiento y volvería a exigir control de pausa. |
| **D-6** | ¿Copy nuevo en ES/EN lo escribe AMD o se propone desde aquí? | Se proponen las claves ya redactadas en ES (§8); AMD valida y aporta EN. |
| **D-7** | ¿La sección Nosotros se queda sin fotografía? | **Sí por ahora** (ver §5). Cuando exista fotografía propia de AMD, esta es la primera sección donde debe entrar — probablemente como banda full-bleed, no como columna vertical. |
| ~~**D-8**~~ | ¿Se formaliza `--amd-gold-ink: #8a7a2e` en `client/src/styles/tokens.css`? | **RESUELTA: sí.** No admite otra respuesta: sin ese token el dorado de marca es ilegible como texto sobre claro (1.73:1) y el ledger claro —ya aprobado— no pasa accesibilidad. Y no es un color nuevo: es el valor que el mockup ya usaba hardcodeado en `.eyebrow--ink`, que al formalizarlo deja de estar suelto. `/akili-specify` debe registrarlo en `design.md` **y** propagarlo a `docs/ux-ui/design.md`, que es la fuente de verdad de tokens. |
| ~~**D-9**~~ | ¿AMD tiene autorización de los 13 clientes para mostrar su marca? | **RESUELTA (HITL 2026-09-06): sí.** Son los logos que ya se muestran en `amdsoluciones.com` y el permiso lo tienen los dueños del sitio. Queda en pie sólo la recomendación operativa: pedir el original vectorial de **SK Glam** (208x123 px, se amplía 1.49x) y de **Obed Services** (JPG con fondo negro incrustado) — no bloquea nada, mejora dos piezas. |

---

## 8 · Impacto técnico estimado

### Componentes

| Acción | Componente |
|---|---|
| **Reemplazar** | `features/home/services-road/` → `features/home/services-ledger/` |
| **Nuevo** | `features/home/stats-band/stats-band-section` (banda de Cifras) |
| **Nuevo** | `core/layout/section-nav` — el índice de secciones en sus dos formas (sub-header ≥900 px, panel móvil <900 px), con una sola fuente de datos |
| **Modificar** | `about-teaser` (manifiesto + 3 pilares + imagen), `trust` (testimonio + ticker; las métricas se van a la banda), `contact` (panel de vidrio), `core/layout/topnav` (estado `on-light`, hamburguesa) |
| **Sin tocar** | `hero`, `core/ambient/*`, `features/services/*`, `core/contact/*` |

### Assets

Nueva carpeta `client/public/media/` (imágenes + video) y `client/public/media/logos/` (las 13
máscaras de clientes, 144 KB en total). Requiere revisar el `assets` budget de `angular.json` — el
video de 1.9 MB no debe entrar en el presupuesto de bundle inicial por ser un fetch en runtime,
pero conviene confirmarlo en la fase de diseño.

Las máscaras de logos son WebP sin pérdida de un solo canal útil (alfa); el color lo pone el CSS.
`prepare-logos.py` debe viajar con ellas: sin el script, añadir un cliente nuevo obliga a
reconstruir a mano la política de máscara y la normalización óptica.

### i18n

Claves nuevas en `es.json` / `en.json`: `homeLinesEyebrow`, `homeLinesTitle`, `homeLinesAside`,
`homeLinesCta`, `homeLinesHint`, `g1Count`…`g5Count`, `aboutEyebrow`, `aboutQuote`, `aboutBodyNew`,
`pillar1Title`…`pillar3Title`, `pillar1Body`…`pillar3Body`, `aboutTeamCta`, `bandEyebrow`,
`bandLine`, `bandMetric1`…`bandMetric3`, `bandVideoPause`, `bandVideoPlay`, `tickerLabel`.
Se reutilizan `g1Title`…`g5Body`, `moreInfo`, `talkAdvisor`, `aboutCta`, `contactTitle` y las
claves del formulario.

### Riesgos

| Riesgo | Mitigación |
|---|---|
| Reemplazar `services-road` invalida su suite de tests | La spec debe portar los casos de expand/collapse, `aria-expanded` y navegación a `/services#id` al nuevo componente antes de borrar el viejo |
| El presupuesto de CSS por componente vuelve a saltar (pasó en la spec anterior) | El ledger es un componente nuevo, no una ampliación; medir en la primera build |
| `mix-blend-mode: color` necesita `isolation: isolate` en el contenedor, y en móvil el tinte inunda la fila si el contenedor pasa a `static` | Ya detectado y resuelto en el mockup (`position: relative` explícito en el bloque móvil); documentarlo como decisión de diseño |
| Sin `overflow: hidden` en el contenedor de la foto, el `scale(1.06)` del `<img>` se desborda y aparece un borde duro en el hover | Invariante documentada en el CSS; el Tester debe verificarla en el hover, no sólo en reposo |
| Un `<img>` con atributos `width`/`height` ignora `aspect-ratio` salvo que el CSS declare `height: auto` — la foto salió a 1067 px de alto en vez de 256 | Regla documentada en el CSS; aplica a cualquier `<img>` con relación de aspecto forzada |
| La foto de Manifiesto deriva su altura del texto: si alguien le devuelve un `aspect-ratio`, vuelve a imponerse sobre el layout | El `<img>` lleva `height: 100%` + `object-fit: cover` y la figura `align-self: stretch`; documentado en el CSS |
| El nav y el sub-header decidían su tema midiendo el mismo punto pese a estar a alturas distintas | Cada componente mide en su propia posición (40 px y 100 px); cubrir con un test de barrido de scroll |
| `align-items: end` en un grid con una imagen más alta que el texto abre huecos muertos que parecen un error de maquetación | Regla para esta spec: `center` cuando el desfase deba leerse como aire, `start` cuando no; `end` nunca |
| El equilibrio vertical de Manifiesto depende del largo del copy y se rompe al traducir | Criterio de aceptación: el párrafo se mantiene en 3–5 líneas en ES y EN; verificar en ambos idiomas |
| **El topnav ya desborda a 375 px** (bug preexistente, rama `bugfix/topnav-overflow-mobile` sin abrir) | Es una dependencia, no parte de esta spec. Conviene resolverlo antes o en paralelo — el mockup lo hereda |

---

## 9 · Siguiente paso

Revisar el mockup en el navegador:

```bash
cd docs/specs/changes/home-page-redesign/mockup && python3 -m http.server 4310
# → http://localhost:4310/index.html
```

Con las decisiones D-1…D-6 resueltas, esto pasa a `/akili-specify` para producir
`requirements.md`, `design.md` y `tasks.md`.

> **Nota de método** (kaizen de la spec anterior): los dos defectos más caros del ciclo pasado
> —contenido de mockup perdido y desbordamiento horizontal en móvil— no los detectó ningún test,
> sino la comparación visual contra el mockup y la medición en navegador real. `requirements.md`
> debe declarar ambos gates como criterios de aceptación explícitos desde el inicio.
