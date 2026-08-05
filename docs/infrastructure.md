# Infrastructure — AMD Soluciones

Deriva del TRD (**tier LITE**, ADR-004/005). Fase 1: solo entorno local para la landing Angular. Dockerización está **planeada**; no hay deploy PROD improvisado por agentes.

## 1. Target Environment

| Entorno | Estado | Notas |
|---------|--------|-------|
| Local dev | **Activo (fase 1)** | Node + Angular CLI en `client/` |
| Docker local | **Planificado** | Primero client; compose full-stack en fase 2 |
| Staging / PROD | **TBD** | Elegir después de estabilizar diseño (Vercel/Netlify/static + API host, o un solo VPS Docker) |

Cloud provider: **no fijado** en constitución (usuario eligió local-first).

## 2. Core Cloud Components

*Ninguno provisionado aún.* Propuesta diferida:

| Componente | Fase | Candidatos |
|------------|------|------------|
| Static/SPA hosting | 2+ | CDN / object storage / Vercel-like |
| API runtime | 2 | Container Nest |
| Database | 2 | PostgreSQL managed o container |
| SMTP | 2 | Provider TBD |
| Secrets | 2 | Env / secret manager |

## 3. Deployment Strategy

| Tema | Decisión |
|------|----------|
| IaC | No en fase 1; Docker Compose como contrato local (y base de deploy futuro) |
| CI/CD | Añadir cuando exista `client/` (lint + test + build) |
| Agentes | **Local disposable** libre; **cloud/PROD governed** — nunca deploy improvisado |

## 4. Network & Security Architecture

Fase 1: app local `localhost`; sin superficie pública de API.

Fase 2 (borrador): reverse proxy → `client` (static) + `server` (API); TLS en el borde; DB no expuesta.

## 5. Infrastructure Rules & Constraints

1. No secrets en git.
2. No deploy a PROD desde un agente sin instrucción humana explícita.
3. Fase 1 no introduce servicios Nest “porque sí”.
4. Dockerfiles se añaden cuando el runtime exista; no placeholders engañosos.
5. Compose full-stack (`client` + `server` + `db`) es meta de fase 2.

## 6. Local Environment

Contrato para agentes y humanos. Hoy el repo **aún no tiene** `client/` scaffold — los comandos abajo son el contrato objetivo post-scaffold.

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

- Elegir host PROD y DNS (`amdsoluciones.com`).
- Definir imagen base Node LTS y multi-stage build cuando se dockerice.
- Certificados y correo transaccional.
