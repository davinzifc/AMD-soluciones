# Infrastructure — AMD Soluciones

Deriva del TRD (**tier LITE**, ADR-004/005). Fase 1: landing Angular en `client/` + **preview** en GitHub Pages. Dockerización está **planeada**; no hay deploy PROD improvisado por agentes.

## 1. Target Environment

| Entorno | Estado | Notas |
|---------|--------|-------|
| Local dev | **Activo (fase 1)** | Node + Angular CLI en `client/` |
| GitHub Pages preview | **Activo (fase 1 only)** | Auto-deploy del **client** en push a `dev` — **no es PROD** |
| Docker local | **Planificado** | Primero client; compose full-stack en fase 2 |
| Staging / PROD | **TBD** | Elegir al entrar en fase 2 (Vercel/Netlify/static + API host, o un solo VPS Docker) |

Cloud provider PROD: **no fijado** (local-first). Pages es solo vitrina de fase 1.

## 2. Core Cloud Components

*Ninguno provisionado para PROD.* Preview estático vía GitHub Pages en fase 1.

| Componente | Fase | Candidatos |
|------------|------|------------|
| Static/SPA hosting (PROD) | 2+ | CDN / object storage / Vercel-like — **reemplaza** Pages preview |
| API runtime | 2 | Container Nest |
| Database | 2 | PostgreSQL managed o container |
| SMTP | 2 | Provider TBD |
| Secrets | 2 | Env / secret manager |

## 3. Deployment Strategy

| Tema | Decisión |
|------|----------|
| IaC | No en fase 1; Docker Compose como contrato local (y base de deploy futuro) |
| CI/CD (fase 1) | Lint/test locales; **Pages preview** en push a `dev` (ver § Phase 1 preview) |
| CI/CD (fase 2+) | **Cortar** el workflow de Pages; pipeline nuevo hacia el host elegido (client + API) |
| Agentes | **Local disposable** libre; **cloud/PROD governed** — nunca deploy improvisado a PROD |

### Phase 1 preview (GitHub Pages)

**Qué es:** despliegue automático **solo del SPA** (`client/`) a GitHub Pages cuando hay push a la rama `dev`.

| Campo | Valor |
|-------|-------|
| Workflow | `.github/workflows/deploy-pages-phase1.yml` |
| Rama | `dev` (+ `workflow_dispatch` manual) |
| URL esperada | `https://davinzifc.github.io/AMD-soluciones/` |
| Build | `cd client && npm run build:pages` (`base-href` `/AMD-soluciones/`) |
| SPA deep links | el job copia `index.html` → `404.html` |
| PrimeUI license | Stub generado en CI (`license:apply`); opcional secret `PRIME_UI_LICENSE`. Local: `prime-ui-license.local.ts` (gitignored) |

**Qué no es:** no es `amdsoluciones.com`, no es staging con API, no sustituye la decisión de host PROD.

#### Corte obligatorio al empezar fase 2

Cuando exista Nest (`server/package.json`):

1. El workflow **deja de publicar** (job *Phase gate* → `allow_preview=false`).
2. Hay que **borrar o deshabilitar** `deploy-pages-phase1.yml` y apagar Pages si ya no se usa.
3. El preview de fase 1 **no** coexiste con el stack fase 2 (client + API + DB).

Regla para agentes: **no** reactivar este workflow en fase 2 ni apuntar DNS de producción a `github.io` sin decisión humana explícita.

## 4. Network & Security Architecture

Fase 1: app local `localhost`; sin superficie pública de API.

Fase 2 (borrador): reverse proxy → `client` (static) + `server` (API); TLS en el borde; DB no expuesta.

## 5. Infrastructure Rules & Constraints

1. No secrets en git.
2. No deploy a PROD desde un agente sin instrucción humana explícita.
3. Fase 1 no introduce servicios Nest “porque sí”.
4. Dockerfiles se añaden cuando el runtime exista; no placeholders engañosos.
5. Compose full-stack (`client` + `server` + `db`) es meta de fase 2.
6. GitHub Pages preview es **solo fase 1**; al scaffold de `server/` el auto-deploy se corta y el workflow se retira.

## 6. Local Environment

Contrato para agentes y humanos. Fase 1 activa: `client/` existe; `server/` aún no.

### Primary route (recomendado, post-Docker)

```bash
# Objetivo fase 2+
docker compose up -d
```

Pre-check: `docker info`. Si falla → ofrecer arrancar Docker o usar fallback nativo.

### Fallback / fase 1 (sin Docker — ruta actual)

```bash
cd client
npm install
npm start
```

Cuando exista scaffold Nest (fase 2):

```bash
cd server
npm install
npm run start:dev
```

### Seed / reset

| Fase | Acción |
|------|--------|
| 1 | N/A (sin DB) |
| 2 | `npm run seed` / `docker compose down -v && docker compose up -d` (definir en spec) |

### Health check

| Servicio | Check |
|----------|-------|
| Client | HTTP 200 en URL local del dev server |
| Server (f2) | `GET /health` → 200 |
| DB (f2) | `docker compose ps` healthy |

### URLs / ports (objetivo)

| Servicio | URL |
|----------|-----|
| Angular dev | `http://localhost:4200` |
| Nest API | `http://localhost:3000` (fase 2) |
| Postgres | `localhost:5432` (fase 2, no público) |

### Boundary rule

> El entorno local es **desechable**: se puede subir, seedear y resetear para verificar trabajo. Deployments a cloud/PROD siguen las secciones 1–5 y requieren decisión humana explícita.

## Open gaps

- Elegir host PROD y DNS (`amdsoluciones.com`) — **antes o al entrar en fase 2**; retirar Pages preview.
- Una vez: Settings → Pages → Source = **GitHub Actions** (necesario para el primer deploy).
- Definir imagen base Node LTS y multi-stage build cuando se dockerice.
- Certificados y correo transaccional.
