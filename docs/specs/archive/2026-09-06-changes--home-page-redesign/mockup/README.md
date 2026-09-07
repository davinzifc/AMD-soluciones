# Mockup — Home page redesign

Prototipo estático y navegable. **No es código de producción**: el HTML/CSS/JS de esta
carpeta existe para evaluar el diseño en un navegador real antes de escribir la spec.

## Cómo verlo

```bash
cd docs/specs/changes/home-page-redesign/mockup
python3 -m http.server 4310
# → http://localhost:4310/index.html
```

**El mockup es uno solo desde el 2026-09-06**, cuando el cliente eligió la versión clara. Antes
había dos entradas (`index.html` oscura + `index-claro.html` clara) y eso ya costó tener que
parchear dos archivos para un mismo cambio. Ahora `index.html` carga `home-redesign.css` (layout
y v1 oscura) más `home-redesign-claro.css` (la capa clara aprobada), y declara
`window.AMD_LIGHT_RANGES` para que el nav y el sub-header se inviertan desde `#servicios` en vez de
desde `#sobre-amd`.

Para ver la v1 oscura, quitar el `<link>` de `home-redesign-claro.css` en `index.html`.

Extra: `frame.html` renderiza el mockup en cuatro iframes — **1600 × 980** y **1200 × 900**
(sub-header), 375 × 812 y 768 × 812 (hamburguesa) — para revisar los dos modos de navegación sin
cambiar el tamaño de la ventana.

## Qué probar

| Interacción | Dónde |
|---|---|
| Campo de orbes difuminados (preservado del hero actual) | Sección `#inicio` |
| Revelado de foto al pasar el cursor / tabular por una línea | `#servicios`, filas 02–05 |
| Que la foto NO se salga del contenedor durante la animación | `#servicios`, entrar y salir del hover rápido |
| Que la foto NO llegue al borde derecho de la ventana | `#servicios`, comparar con el margen del texto |
| Acordeón **exclusivo**: abrir una cierra la anterior | `#servicios`, clic en 01, luego en 03 |
| Spine dorado que se llena con el scroll | `#servicios`, borde izquierdo |
| Video de fondo en bucle continuo, sin controles | `#cifras` |
| Conteo animado de las cifras al entrar en pantalla | `#cifras`, llegar haciendo scroll |
| Inversión del nav y del sub-header sobre los tramos claros | scroll a `#servicios` (variante clara) |

| Sub-header: aparece al salir del hero, no antes | ≥900 px, hacer scroll desde arriba |
| Hamburguesa: páginas y secciones agrupadas | <900 px, abrir el menú |
| Que NUNCA haya dos índices de sección a la vez | cruzar los 900 px de ancho |
| Ordinal en ámbar con la fila abierta, no sólo al hover | abrir una línea y alejar el cursor |
| Carrusel de testimonios | `#confianza`, los tres puntos |
| Muro de clientes: carrusel infinito sin salto en la costura | `#confianza`, mirar una vuelta entera |
| Muro de clientes: se PAUSA al pasar el cursor | `#confianza`, dejar el puntero sobre la cinta |
| Muro de clientes: corre al revés que el ticker de sectores | `#confianza`, los dos a la vez |
| Muro de clientes: con `prefers-reduced-motion` vuelve a retícula | activar en el SO y recargar |
| Teclado: `Tab` recorre nav → líneas → CTAs → formulario | toda la página |
| `prefers-reduced-motion` | activar en el SO y recargar |

## Archivos

```
index.html            estructura de las 6 secciones — carga la capa clara (versión aprobada)
home-redesign-claro.css  la capa clara: ritmo claro/oscuro del ledger (~150 líneas, sin
                      duplicar layout). Quitar su <link> de index.html devuelve la v1 oscura.
home-redesign.css     tokens espejo de client/src/styles/tokens.css + todo el layout
home-redesign.js      orbes, acordeón, spine, scroll-spy, video, cifras, ticker (desechable)
frame.html            visor responsive 375 / 768
assets/img/*.webp     5 fotos de línea + póster (2 sin usar, documentadas abajo)
assets/video/*.mp4    1 clip 720p, silencioso, en bucle (1.9 MB) — fondo de #cifras
assets/logos/*.webp   13 máscaras monocromas de logos de clientes (144 KB en total)
assets/logos/prepare-logos.py   pipeline reejecutable que las genera desde los originales
assets/logos/logos.json         tamaño óptico y política de máscara de cada logo
shots/*.jpg           13 capturas de referencia: cada sección, los dos modos de navegación,
                      el muro de clientes y su retícula bajo reduced-motion
```

## Licencia de los assets

Todo el material es de **Pexels** (licencia Pexels: uso comercial gratuito, sin
atribución obligatoria, no se puede revender el archivo tal cual). Origen exacto:

| Archivo | Pexels ID |
|---|---|
| `line-01-contabilidad.webp` | [590022](https://www.pexels.com/photo/590022/) |
| `line-02-administrativa.webp` | [7691715](https://www.pexels.com/photo/7691715/) |
| `line-03-riesgo.webp` | [6801648](https://www.pexels.com/photo/6801648/) |
| `line-04-asesoria.webp` | [3184465](https://www.pexels.com/photo/3184465/) |
| `about-asesoria.webp` | [7979438](https://www.pexels.com/photo/7979438/) |
| `line-05-marca.webp` | [7598017](https://www.pexels.com/photo/7598017/) |
| `about-cali.webp` (**sin usar** — ver proposal §5) | [190006](https://www.pexels.com/photo/boulevard-cali-colombia-defocused-190006/) — Bulevar del Río, Cali |
| `cali-torre.webp` (**sin usar**, alternativa) | [13808901](https://www.pexels.com/photo/cali-tower-in-cali-colombia-under-blue-sky-13808901/) |
| `manifiesto.mp4` + `manifiesto-poster.webp` | [7581380](https://www.pexels.com/video/man-checking-the-documents-7581380/) |

> Son **placeholders con licencia limpia**. La recomendación es reemplazarlos por
> fotografía propia de AMD antes de producción; la spec debe decidirlo (ver
> `../proposal.md` §7, decisión abierta D-2).
