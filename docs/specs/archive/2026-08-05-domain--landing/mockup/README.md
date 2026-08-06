# Landing mockup (pre-specify)

**Version: 0.1 — approved 2026-08-05** · visual source of truth for `/akili-specify docs/specs/domain/landing`

Multi-page HTML review mockup for `docs/specs/domain/landing`.

## Open

Serve the folder or open files directly in a browser:

| File | Role |
|------|------|
| `index.html` | Home / landing (scroll sections) |
| `quienes-somos.html` | Deep about: misión, visión, 3 líderes |
| `servicios.html` | 5 service groups + sub-services |
| `styles.css` / `landing.css` / `landing.js` / `i18n.js` | Shared chrome + landing behavior + ES/EN |

## Navigation model

| Chrome | Behavior |
|--------|----------|
| **Top nav** | Site pages: Home · Quiénes somos · Servicios · ES/EN |
| **Left float (Home only)** | Dots + labels; **no dark bar**; on light sections text+circles → `#0D141A` |
| **Ver más / Más info** | Landing teaser → deep page |

## Motion & i18n

| Element | Behavior |
|---------|----------|
| Client logos | Marquee loop; **fade only on card strip** (title sharp) |
| Testimonials | Crossfade with **~9s pause** |
| Services road | Scroll progress + reveal; node expands card |
| Hero brand | AMD Soluciones + Integrales S.A.S. |
| i18n ES/EN | Shared `i18n.js` + localStorage across all pages |
| Reduced motion | Animations suppressed via `prefers-reduced-motion` |

## Placeholders to validate with AMD

- Logos reales (hoy: pills de sector)
- Copy final de **Sistemas de Riesgo** y **Marca**
- Páginas legales (Privacidad / Términos) — links en footer, aún stub
