# Handoff — Rediseño de la Home

Estado al cierre de la sesión del **2026-09-06 (tarde)**. Punto de retoma.

## Dónde estamos

Fase **Execute en curso**. **3 de 13 tareas cerradas** con PASS del Reviewer independiente,
commiteadas en `dd09488`. Rama `first-iteration-dev`.

| Tarea | Estado | Rondas |
|---|---|---|
| T001 — tokens de dorado + assets | **[x] PASS** | 3 (una fue una Pivot) |
| T002 — `probeSectionThemeAt` | **[x] PASS** | 1 |
| T003 — `SectionNav` ← `HomeSideNav` | **[x] PASS** | 3 |
| T005 — `LedgerSection` datos/plantilla | **[x] PASS** | 3 |
| T004, T006–T013 | `[ ]` pendientes | — |

Verificado con el Node pineado del `.nvmrc` (**v24.20.0**, no el del shell):
**31 archivos · 270 tests · lint limpio · build 451.84 kB** inicial.

## Siguiente paso

```
/clear
/akili-resume            ← reconstruye estado desde execution.md
```

**Siguiente tarea: T004** (etiquetas de sección, `MobileDrawer`, claves huérfanas).
Su alcance **ya fue ampliado** con un hallazgo del cierre de T003 — leerlo antes de despachar.

**Cadencia acordada (HITL): una tarea a la vez.** Se probaron 3 workers de Antigravity en
paralelo: el trabajo salió bien y sin colisiones, pero la coordinación no compensó.

## Cómo se está ejecutando

**Implementer delegado a Antigravity** bajo orquestación **Orca**; Claude Code conserva **Leader**
y **Reviewer** (autor ≠ auditor). Run `run_ae0ab4caa1a3`.

Terminales de Orca en este worktree, con `agy --dangerously-skip-permissions` vivo:
`term_eaef2a67` · `term_0c9fa4ff` · `term_a13c44dd`. Coordinador: `term_d8fc0b20`.

### Trampas de esta vía, ya pagadas

- **`worker-start` devuelve siempre `agent_prompt_stalled`** a los 8 s y marca el dispatch `failed`.
  Es un **falso negativo**: Orca no reconoce el TUI de Antigravity. El prompt llega, el worker
  trabaja, pero su `worker_done` **rebota** por capability revocada. Orca igual entrega el mensaje
  rechazado a la bandeja del Run, con el reporte íntegro: se recupera de ahí y se cierra la Task a
  mano con `task-update`. **No hay bandera que lo arregle** — Antigravity no tiene modo `--no-tui`
  ni equivalente, y el único modo no interactivo (`-p`) elimina la orquestación entera.
- **`run-use` mata la escucha en curso** (`consumer_fenced`). Despachar todo antes de reabrirla.
- El buzón de Orca es casi todo ruido. **Esperar por `terminal wait --for tui-idle`** de los workers
  resultó más fiable que `check --wait`.
- **`agy --effort` aborta** si el slug del modelo ya lleva el nivel (`gemini-3.8-flash-high`).

### Reglas de brief que costaron un FAIL entero cada una

1. **El trabajo primero, la lista de "esto ya está bien" al final y corta.** Un brief que abre
   validando el intento anterior hace que el worker trate la tarea como ya hecha: en T003 intento 2
   **reportó éxito sin modificar ni un fichero**.
2. **Exigir `git diff --stat` antes y después, pegado verbatim en el reporte**, con instrucción de
   reportar `--outcome failed` si son iguales. Es lo que destapó el punto 1.
3. **Si la tarea produce texto visible, i18n es parte del entregable** y el boundary debe incluir
   `client/src/assets/i18n/`. Ver **KZ-005** en `docs/specs/kaizen/`.
4. **Medir sólo con TODOS los workers en idle.** Una medición tomada con un worker aún escribiendo
   quedó caduca y hubo que corregir el dato a dos Reviewers en vuelo.
5. **Para comprobar existencia de claves i18n, anclar el patrón (`"clave":`)**, no buscar el nombre
   suelto: `grep navSectionCifras` casa con `navSectionCifras_TEMP` y pasa en medio de una mutación.

## Correcciones de spec aplicadas durante la ejecución

Están todas en `execution.md`, pero conviene tenerlas presentes porque cambian el texto aprobado:

- **Pivot T001 — dos tokens de dorado, no uno.** `#8a7a2e` da 3.86:1 sobre mist: sólo alcanza el
  piso de texto grande, y tres de los cuatro usos del acento son texto pequeño. Se añadió
  `--amd-gold-ink-deep: #6f6224` (5.49:1). **D-8 no se revierte: se le añadió el caso que no
  cubría.** El reparto uso-por-uso está en REQ-009.
- **T006 y T008 recibieron REQ-009 y DD-031.** Ordenaban portar el CSS del mockup, donde los cuatro
  usos son `var(--amd-gold-ink)`: un port fiel **satisfacía la tarea e incumplía el requisito**, y
  sólo habría aflorado en T012, la última del grafo.
- **La prohibición de REQ-009 se amplió a `--amd-gold-soft`** (1.32:1, peor que el color que motivó
  la pivot; se usa hoy como texto en secciones que T003/T008/T011 vuelven claras).
- **T012 gana una novena medición**, y barre **por familia de tokens**: un gate que sólo mira los
  tokens correctos no puede detectar el uso del token equivocado.
- **El filtro de verificación de siete tareas no filtraba nada.** `ng test` quiere
  `--include=<glob>`; el argumento posicional se ignoraba en silencio.
- **T004 lleva la colisión `navHome` / `navSectionInicio`**, que en EN valen las dos "Home". Sin eso,
  el test de no-repetición que la propia tarea exige **no puede pasar**.
- **T005 y T003 tienen el boundary ampliado a `client/src/assets/i18n/`** (y T003 también a
  `app.config.ts`). T004 también toca los diccionarios: **serializar**.

## Pendiente de decidir (no bloquea)

- **`prepare-logos.py` acaba publicado** en `/media/logos/prepare-logos.py`. Inocuo (Pages sirve
  estático, no cuenta contra el budget), pero su docstring comenta el estado de los logos de
  clientes concretos. La tarea lo ordena explícitamente; moverlo a `client/scripts/` exige editar
  el spec.
- **`--nav-h: 72px` sobrevive en `services-page.css:21`**, fuera del boundary de T003. Sobre-libera
  3 px en página profunda. Tarea de seguimiento.
- **Dos copias de los seis ids de ancla** (`top-nav.ts` y `section-nav.ts`), sin test que las guarde
  contra deriva. T004 y T009 tocan ambas `#cifras`.

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
| D-8 | ¿`--amd-gold-ink` en `tokens.css`? | **Sí** — sin él el ledger claro no pasa contraste. **Ampliada en la Pivot T001 (2026-09-06): son dos tokens**, `--amd-gold-ink: #8a7a2e` (relleno y texto grande) y `--amd-gold-ink-deep: #6f6224` (texto normal) |
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
