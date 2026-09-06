# Mockup — Servicios redesign v0.1

Referencia visual para `docs/specs/changes/services-page-redesign`.
**Opción A — catálogo editorial con índice sticky.**

## Abrir

```bash
open docs/specs/changes/services-page-redesign/mockup/index.html
```

Self-contained: solo Google Fonts (Sora + DM Sans). Sin build, sin framework.

## Qué demuestra

| # | Decisión | Reemplaza |
|---|----------|-----------|
| 1 | Índice sticky con scroll-spy + conteo por línea | Chips TOC estáticos sin estado |
| 2 | Sub-servicios como filas de texto con hairline, no cards | 31 cards idénticas tipo hoja de cálculo |
| 3 | Progressive disclosure: 6 visibles + "ver N más" | 16 filas de Contabilidad de golpe |
| 4 | Ordinal editorial gigante en dorado 9% + regla dorada | Cero presencia de marca en la página |
| 5 | Cada fila enlaza a contacto con el servicio preseleccionado | Fila muerta, sin acción |
| 6 | CTA por grupo (`Cotizar <línea>` + WhatsApp) | Único CTA al final de la página |
| 7 | Numeración `01.` fuera del título | Ruido visual sin significado |

## Contratos que respeta

- **Anchor ids** idénticos a `SERVICE_GROUP_IDS`: `contabilidad`, `administrativa`, `riesgo`, `asesoria`, `marca` — los deep-links del road de Home siguen resolviendo.
- **Tokens** de `client/src/styles/tokens.css` (§7 design.md). Cero púrpura.
- **Copy** tomado de `client/src/assets/i18n/es.json` (mismas claves `subXXt`/`subXXd`).
- `GROUPS` en `services-redesign.js` refleja el modelo de datos de `services-page.ts`.

## Accesibilidad verificada en el mock

- Targets ≥ 44px en índice, filas, `ver más` y CTAs.
- `aria-current="true"` en la línea activa del índice; `aria-expanded` en el toggle.
- Focus ring dorado visible en todo elemento interactivo.
- `prefers-reduced-motion: reduce` desactiva transiciones.
- Rail colapsa a chips horizontales sticky `<1100px`; lista a 1 columna `<720px`.

## Correcciones v0.1.1 (HITL 2026-09-05)

- **Scroll-spy medido, no observado.** `IntersectionObserver` solo entrega las entradas cuyo estado cambió en ese tick: tras un salto por ancla el capítulo que queda arriba puede no re-emitir y el índice pintaba otra línea. Ahora se mide `getBoundingClientRect()` de los 5 capítulos contra una línea al 30% del viewport en `requestAnimationFrame`. **El puerto a Angular debe usar esta estrategia.**
- **Scroll suave.** `scroll-behavior: smooth` en `html`, `auto` bajo `prefers-reduced-motion`.
- El auto-centrado del chip activo solo corre cuando el índice desborda horizontalmente (móvil), nunca en desktop.

## Pendiente de validar con HITL

- Umbral de `VISIBLE` (hoy 6) por grupo.
- Si la fila lleva a `/#contacto` con preselección o abre WhatsApp directo.
- Orden de Contabilidad: el mock prioriza los servicios ancla (Estados Financieros, Declaraciones, Revisoría) sobre el orden original del brochure.
