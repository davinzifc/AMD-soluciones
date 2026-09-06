# AMD Soluciones Integrales — sitio web

Rework del sitio público de **AMD Soluciones Integrales S.A.S.** (Cali, Colombia): una landing bilingüe (ES/EN) en Angular que explica el portafolio contable/administrativo y convierte visitantes en leads vía formulario y WhatsApp.

**Fase actual: 1 — solo el SPA de marketing en `client/`.** La API NestJS (`server/`), el panel admin y la persistencia de leads son fase 2+ y **no** se improvisan aquí.

## Quick start

```bash
cd client
npm install          # postinstall genera el stub de licencia PrimeUI
npm start            # http://localhost:4200
```

La versión de Node está pineada en `.nvmrc` (**v24.20.0**). Si usas nvm:

```bash
nvm use     # o `nvm install` la primera vez
```

> La CLI de Angular 22 exige **≥ v22.22.3 / v24.15.0 / v26**. Con una menor la suite no arranca:
> `The Angular CLI requires a minimum Node.js version of v22.22.3 or v24.15.0 or v26.0.0.`

## Comandos

Todos se ejecutan dentro de `client/`.

| Comando | Qué hace |
|---------|----------|
| `npm start` | Dev server con recarga en `http://localhost:4200` |
| `npm run build` | Build de producción a `client/dist/client/browser` |
| `npm run build:pages` | Build para GitHub Pages (`--base-href /AMD-soluciones/`) |
| `npm test` | Vitest en modo watch |
| `npm run test:agent` | Vitest one-shot, reporter `dot` — verificación de agentes |
| `npm run lint` | ESLint (angular-eslint + typescript-eslint) |

### Licencia PrimeUI (opcional)

El stub `src/environments/prime-ui-license.ts` está **vacío en git** y se rellena en tiempo de build por `scripts/apply-prime-ui-license.mjs`, en este orden:

1. Variable de entorno `PRIME_UI_LICENSE`
2. `src/environments/prime-ui-license.local.ts` (gitignored)
3. Vacío — la app arranca igual

## Stack

| Capa | Elección |
|------|----------|
| Framework | Angular 22, componentes standalone, señales |
| UI | PrimeNG 22 + `@primeuix/themes`, tematizado con tokens de marca |
| Estilos | `src/styles/tokens.css` + `theme-primeng.ts` (dorado AMD + neutros premium) |
| i18n | Diccionarios JSON en `src/assets/i18n/{es,en}.json` vía `LocaleService` |
| Tests | Vitest + jsdom |
| Lint/format | ESLint 10, Prettier 3 |

Decisiones y ADRs: `docs/trd/trd.md` (tier **LITE**, ADR-001…005).

## Estructura

```
client/src/app/
  core/          # transversal: i18n, layout (nav, footer, WhatsApp FAB),
                 # ambient (orbs), motion, analytics, contact
  features/      # páginas lazy-loaded: home, about, services, legal, not-found
docs/            # constitución AKILI-SPECS (PRD, TRD, UX/UI, infra, specs)
.agents/         # personas de agente: leader, implementer, reviewer, tester
server/          # fase 2 — aún no scaffolded
```

### Rutas

Los segmentos son **en inglés en ambos idiomas**; solo el copy cambia con el locale (DD-014).

| Ruta | Página |
|------|--------|
| `/` | Home (hero, servicios, trust, contacto) |
| `/about-us` | Quiénes somos |
| `/services` | Servicios (grupos por fragmento `#contabilidad`, …) |
| `/privacy`, `/terms` | Stubs legales |
| `**` | 404 real (no redirect) |

## Deploy

| Entorno | Estado |
|---------|--------|
| Local dev | Activo |
| GitHub Pages preview | Activo — **solo fase 1**, no es producción |
| Docker | Planificado |
| Staging / PROD | Sin definir |

El push a `dev` dispara `.github/workflows/deploy-pages-phase1.yml` y publica el SPA en `https://davinzifc.github.io/AMD-soluciones/`. Es una vitrina, **no** `amdsoluciones.com` ni un staging con API.

> **Corte obligatorio:** cuando exista `server/package.json`, el workflow se auto-deshabilita y debe retirarse. No reactivarlo en fase 2 ni apuntar DNS de producción a `github.io` sin decisión humana. Ver `docs/infrastructure.md`.

## Documentación

| Documento | Cuándo leerlo |
|-----------|---------------|
| `docs/prd.md` | Problema, personas, scope, métricas |
| `docs/trd/trd.md` | Arquitectura, ADRs, límites client/server |
| `docs/ux-ui/design.md` | Tokens, flows, glass/neumorfismo, UX de i18n |
| `docs/infrastructure.md` | Entorno local, Docker, reglas de deploy |
| `docs/specs/` | Specs por feature (`requirements`, `design`, `tasks`, `execution`) |

## Contribuir

El repo opera bajo **AKILI-SPECS**: el trabajo se especifica antes de codificarse. Flujo por feature:

```
/akili-propose → /akili-specify → /akili-execute → /akili-validate → /akili-test → /akili-archive
```

Antes de tocar código, lee `CLAUDE.md` y `AGENTS.md` (routing de modelos, mapa de skills, personas de agente). Cambios triviales (copy, color) van por `/akili-quick`.

Verificación mínima antes de dar por cerrado un cambio:

- [ ] `npm run test:agent` en verde
- [ ] `npm run lint -- --quiet` sin errores
- [ ] Cambios de UI alineados con `docs/ux-ui/design.md`
- [ ] ES y EN actualizados en `src/assets/i18n/`

Ramas: `main` (estable) · `dev` (dispara el preview de Pages) · ramas de trabajo por iteración.
