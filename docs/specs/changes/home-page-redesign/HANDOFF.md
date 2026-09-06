# Handoff — Rediseño de la Home

Estado al cierre de la sesión del **2026-09-06**. Punto de retoma para la siguiente sesión.

## Dónde estamos

Fase **Specify cerrada**. Propuesta, mockup y los tres documentos de spec están completos y
aprobados. **No se ha tocado una sola línea de `client/`.**

| Artefacto | Estado |
|---|---|
| `proposal.md` | Approved — diagnóstico, concepto, plan de medios, decisiones cerradas, riesgos |
| `mockup/` | Navegable y verificado en navegador real a 375 / 768 / 1200 / 1600 px |
| `mockup/shots/` | 13 capturas regeneradas contra el mockup final (clara, sin rail, con muro) |
| `requirements.md` | Approved — 14 REQ, 35 escenarios, mapa de clases de defecto a su gate |
| `design.md` | Approved — DD-028…DD-041, reto a reversiones, presupuesto |
| `tasks.md` | 13 tareas, cierre de cobertura verificado escenario a escenario |

## Siguiente paso

```
/clear                                                   ← sesión limpia
/akili-execute docs/specs/changes/home-page-redesign/
```

**Primera tarea: T002.** No es la que desbloquea más, pero su orden es el único irreversible: si
`HomeSideNav` se borra antes de extraer su algoritmo de tema, se pierde la única implementación del
repo de algo que dos barras van a necesitar.

**PR recomendados: 3** — Navegación (T001–T004, ~450 LOC) · Ledger (T005–T007, ~700) · Secciones
nuevas y gate (T008–T013, ~750). PR 1 y 2 se mergean **sin** el gate visual automático: T012 mide la
página ensamblada y no puede correr antes, así que hasta PR 3 dependen de revisión en navegador.

## Para retomar

```bash
cd docs/specs/changes/home-page-redesign/mockup
python3 -m http.server 4310
# http://localhost:4310/index.html   → la página
# http://localhost:4310/frame.html   → los 4 anchos a la vez
```


## Nada bloquea avanzar

**Todas las decisiones abiertas están cerradas** (HITL 2026-09-06):

| # | Decisión | Resolución |
|---|---|---|
| D-1 | ¿Ledger oscuro o claro? | **Claro**, aprobado por el cliente. De 68.2 % a 39.8 % de tinta; el aire llega en la pantalla 1 en vez de la 2.4. Es lo que sirve `index.html` |
| D-2 | ¿Foto propia o stock? | Placeholders de Pexels, rutas intercambiables por rol |
| D-3 | ¿Cifras con video o foto? | **Video** (`manifiesto.mp4`, 1.9 MB), póster como fallback |
| D-8 | ¿`--amd-gold-ink` en `tokens.css`? | **Sí** — sin él el ledger claro no pasa contraste |
| D-9 | ¿Permiso de los 13 clientes? | **Sí** — ya se muestran en `amdsoluciones.com` |

Además, por decisión HITL: **rail lateral descartado** (sub-header desde 900 px) y **muro de
clientes en carrusel infinito**.


**El mockup es uno solo**: `index.html` sirve la versión clara, que es la aprobada. La oscura se
recupera quitando el `<link>` de `home-redesign-claro.css`.

**D-3 ya está resuelta** (HITL 2026-09-06): la banda de Cifras **va con el video** — `public/media/` lleva los 1.9 MB de `manifiesto.mp4`, con el póster como fallback declarado para conexiones lentas.

**D-2 ya está resuelta** (HITL 2026-09-06): se arranca con los **placeholders de Pexels**, con la
foto propia como sustitución posterior. Consecuencias para `/akili-specify`:

- Las rutas de imagen se tratan como **intercambiables**: nombres por rol
  (`line-01-contabilidad`, `about-asesoria`), nunca por contenido.
- La **regla de "no implicar respaldo"** de `proposal.md` §4 queda vigente: Confianza sin fotos de
  personas, y ningún copy presenta a los retratados como equipo ni clientes de AMD.
- Sustituir las fotos más adelante no debe requerir tocar CSS: el encuadre lo resuelven
  `object-fit: cover` y `object-position`.

Las demás (D-4 a D-7) tienen recomendación y no bloquean.

## Licencia de las imágenes — verificado

Todo el material es de **Pexels**, [licencia verificada el 2026-09-06](https://www.pexels.com/license/):
uso comercial gratuito, modificación libre, **atribución opcional**. Los assets actuales son
aptos para producción tal cual.

**La cláusula que nos aplica:** *"Don't imply endorsement of your product by people or brands on
the imagery."* La foto del Manifiesto y el video de Cifras llevan **personas identificables**.
Hoy el uso es seguro (copy descriptivo, sin atribuirles identidad), pero **no pueden presentarse
como el equipo de AMD, como clientes, ni firmando un testimonio**. Detalle completo en
`proposal.md` §4.

## Decisiones de diseño que costaron una iteración cada una

Están documentadas en `proposal.md`, pero conviene tenerlas a mano porque son fáciles de romper
sin querer al portar a Angular:

0. **El corte tinta → papel va a filo, sin degradado.** Se probó un puente de 140 px en las dos
   junturas (hero→ledger, Confianza→Contacto) y en ambas vela el fondo con una niebla gris en vez
   de suavizar. Entre las dos secciones claras basta un hairline.
1. **`overflow: hidden` en el contenedor de la foto del ledger.** El `<img>` se anima con
   `scale(1.06)`; sin recorte se desborda y aparece un borde duro en el hover.
2. **La foto del ledger termina en el borde del contenido, no en el de la ventana.**
3. **Un `<img>` con atributos `width`/`height` ignora `aspect-ratio`** salvo que el CSS declare
   `height: auto`.
4. **La foto del Manifiesto deriva su altura del texto** (`align-self: stretch` + `height: 100%`).
   Devolverle un `aspect-ratio` la vuelve a imponer sobre el layout.
5. **El nav y el sub-header miden el fondo en su propia posición**, no en un punto común: el nav a
   40 px de scroll, el sub-header a 100 px.
6. **Un solo índice de secciones por ancho**: sub-header ≥900 · hamburguesa <900. El rail lateral
   quedó **descartado** (HITL 2026-09-06) — no reintroducirlo: era un tercer índice para el mismo
   trabajo y arrastraba el umbral artificial de 1540 px.
7. **Ninguna etiqueta se repite** entre el menú de páginas y el índice de secciones ("Líneas" y
   "Manifiesto", no "Servicios" y "Nosotros").

## El muro de clientes — qué NO tocar al portarlo

- Es un **carrusel infinito** (decisión del cliente), no una retícula. Tres cosas lo sostienen y
  las tres son fáciles de perder al portar: **pausa** en `:hover`/`:focus-within`, copia duplicada
  con `aria-hidden` y sin `role`, y **retícula estática** bajo `prefers-reduced-motion` — parar la
  cinta sin más dejaría a la mayoría de los clientes fuera de pantalla.
- **Nada de `gap` en la cinta**: el aire va como `margin-inline` de cada `<li>`. Con `gap` el
  desplazamiento del 50 % queda desfasado medio hueco y el bucle salta en cada vuelta.
- **La duración se calcula en JS desde el ancho medido** (42 px/s). Fijarla en el CSS hace que la
  cinta corra más rápido en móvil.

- Los logos se sirven como **máscaras monocromas**, no como imágenes en color. El color sale de
  `currentColor` vía `mask-image`, y por eso la misma pieza vale en claro y en oscuro. Cambiarlas
  por `<img>` obliga a duplicar los 13 assets por tema.
- **`--w` / `--h` son tamaños ópticos ya equilibrados**, no cajas recortadas. Forzar una caja común
  desequilibra el muro: un wordmark fino y un símbolo macizo con el mismo alto no pesan igual.
- `--logo-scale` por breakpoint gobierna el tamaño en la cinta **y** el reparto en filas de la
  retícula de respaldo. 13 es primo: en esa retícula casi cualquier escala deja una fila final de
  uno, así que los valores salen de barrer escalas contando filas en el navegador.
- El pipeline y el porqué de cada política están en `mockup/assets/logos/prepare-logos.py`. Ese
  script viaja con los assets.

## Método que funcionó, y conviene repetir

Los defectos reales no los detectó ninguna captura: **las capturas JPEG comprimidas inventaron
costuras que no existían y ocultaron las que sí**. Lo que funcionó fue medir en el navegador —
`getBoundingClientRect`, perfiles de píxeles a resolución nativa, barridos de scroll — y una
grabación de pantalla del usuario. `requirements.md` debería declarar los gates de medición como
criterios de aceptación explícitos, no dejarlos a la inspección visual.

## Estado del repositorio

- Rama `first-iteration-dev`, **sin commits pendientes de push**.
- Sin commitear: `docs/specs/changes/` (esta spec, nueva — incluye la variante clara) y
  `client/package.json` +
  `package-lock.json` (script `start:dev` de otra sesión, dejado fuera a propósito).

## Pendientes previos del proyecto, ajenos a esta spec

- **PR #4** abierto hacia `dev` sin mergear (el merge dispara deploy a Pages; espera el OK de AMD).
- Rama `bugfix/topnav-overflow-mobile` **sin abrir**: el topnav desborda a 375 px. Es un bug
  preexistente que el mockup hereda, y conviene resolverlo antes o en paralelo a esta spec.
- 7 ítems de kaizen pendientes en `docs/specs/kaizen/`, esperando fase Apply en `main`.
- CodeGraph pendiente de re-indexar.
