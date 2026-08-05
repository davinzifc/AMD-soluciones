# TRD — AMD Soluciones Integrales

Blueprint técnico del monorepo. **Tier: LITE.** Fase 1 entrega solo el marketing site en Angular; NestJS queda como contenedor vacío/reservado hasta fase 2.

## 1. System Overview

Monorepo orientado a producto digital de AMD Soluciones:

| Área | Path | Fase | Rol |
|------|------|------|-----|
| Marketing SPA | `client/` | **1 (ahora)** | Landing Angular + PrimeNG themed + i18n |
| API / dominio | `server/` | **2** | NestJS (leads, email, auth futura) |
| Docs / specs | `docs/` | continua | Constitución AKILI-SPECS |

Fase 1 no bloquea ni implementa endpoints Nest. El formulario de contacto opera en cliente (WhatsApp / mailto) hasta que exista la API de leads.

## 2. Architecture Overview & Decisions

### Tier & style

| Decisión | Valor |
|----------|-------|
| **Robust-vs-Lite** | **LITE** — un front deployable; API monolítica Nest cuando llegue fase 2 |
| **Style (client)** | Modular Angular feature folders + design-token theme |
| **Style (server, fase 2)** | Nest modular monolith (modules por bounded context) |

Escalación a ROBUST solo si escenarios futuros (multi-tenant admin, pagos, aislamiento regulatorio) lo exigen — ADR aparte.

### C4 — Context

```text
[Visitante ES/EN] → [AMD Landing (Angular SPA)] → (fase 1) WhatsApp / mailto
                                              ↘ (fase 2) [AMD API Nest] → Email / DB
[Equipo AMD] ---fase 3+--→ [Admin UI] → [AMD API]
```

### C4 — Container (objetivo)

| Contenedor | Tecnología | Notas |
|------------|------------|-------|
| Web client | Angular (standalone components preferidos) | i18n, PrimeNG, tokens |
| API | NestJS + TypeScript | Fase 2 |
| DB | PostgreSQL (propuesto fase 2) | No en fase 1 |
| Edge / reverse proxy | Traefik/nginx en Docker (plan) | Compose futuro |

### ADR index

| ID | Decisión | Estado |
|----|----------|--------|
| ADR-001 | Monorepo `client/` + `server/` | Aceptada |
| ADR-002 | Angular + PrimeNG themed (no React/shadcn) | Aceptada |
| ADR-003 | Nest diferido a fase 2; landing sin dependencia de API | Aceptada |
| ADR-004 | LITE modular monolith para API futura | Aceptada |
| ADR-005 | Dockerizar cuando exista runtime; compose full-stack en fase 2 | Aceptada |

#### ADR-001 — Monorepo layout

- **Issue:** Separar marketing y API sin fragmentar el producto.
- **Decision:** `client/` y `server/` en un solo repo.
- **Alternatives:** repos separados; meta-repo.
- **Why:** Un solo flujo AKILI/specs; fase 2 integra sin publicar paquetes.
- **Implications:** Boundaries de directorio estrictos en `.agents/leader.md`.

#### ADR-002 — Angular + PrimeNG

- **Issue:** Kit UI productivo con look custom (glass/neuromorphism + gold).
- **Decision:** PrimeNG + theme tokens CSS override.
- **Rejected:** React/shadcn (fuera de stack), Angular Material sin theme AMD.
- **Implications:** Skill Map carga `angular-developer`; no `shadcn-ui`.

#### ADR-003 — No server in phase 1

- **Issue:** Iterar diseños sin costo de API.
- **Decision:** Cero trabajo Nest en fase 1; contrato de leads documentado para fase 2.
- **Implications:** Formulario client-only; tests de API fuera de fase 1.

## 3. Quality Attribute Scenarios (NFRs)

Formato: **Source → Stimulus → Artifact → Environment → Response → Measure**.

### Performance

| Field | Value |
|-------|-------|
| Source | Visitante móvil 4G |
| Stimulus | Carga inicial de la landing |
| Artifact | Angular SPA |
| Environment | Build production local/CI |
| Response | Hero usable; lazy de below-fold |
| Measure | LCP ≤ 2.5s en perfil mid; Lighthouse Performance ≥ 85 (hero sin video autoplay pesado) |
| **Tactics** | Lazy routes/sections, image optimization, defer non-critical JS, `prefers-reduced-motion` |

### Accessibility

| Field | Value |
|-------|-------|
| Source | Usuario teclado / lector de pantalla |
| Stimulus | Navega y envía contacto |
| Artifact | Nav, form, FAB |
| Environment | Desktop + mobile |
| Response | Flujo completo sin mouse |
| Measure | WCAG 2.2 AA en flujos críticos; contraste 4.5:1 |
| **Tactics** | Focus rings, labels, aria en icon-only, order tab |

### Modifiability (fase diseño)

| Field | Value |
|-------|-------|
| Source | Diseñador/dev |
| Stimulus | Cambio de tokens o sección |
| Artifact | Theme + feature modules |
| Environment | Dev local |
| Response | Cambio localizado sin rewrite |
| Measure | Tokens en un solo theme file; sección = feature folder |
| **Tactics** | Design tokens, feature modules, PrimeNG preset central |

### Security (fase 1 vs 2)

| Field | Value |
|-------|-------|
| Source | Visitante / bot |
| Stimulus | Submit de formulario |
| Artifact | Client (f1) / API (f2) |
| Environment | Público |
| Response | Fase 1: sin persistencia server; fase 2: validación + rate limit + sanitización |
| Measure | Fase 2: rechazo de payload inválido 100%; rate limit documentado |
| **Tactics** | Client validation ahora; class-validator + throttle Nest después |

### Scalability / Availability

- **Fase 1:** estático/SPA — no arquitectónicamente significativo más allá de CDN futuro.
- **Fase 2:** Nest single instance + Postgres managed; HA solo si métricas lo exigen (revisitar).

### Observability

| Field | Value |
|-------|-------|
| Stimulus | Lead / WhatsApp click |
| Response | Evento analytics client-side |
| Measure | Eventos `contact_submit`, `whatsapp_click` presentes en capa analytics (proveedor TBD) |

## 4. Domain Modules & Responsibilities

### Client (fase 1)

| Módulo | Responsabilidad |
|--------|-----------------|
| `core` | Layout shell, i18n, tokens, analytics stub |
| `landing/hero` | Primer viewport |
| `landing/services` | Portafolio |
| `landing/about` | Sobre AMD |
| `landing/trust` | Métricas / testimonios |
| `landing/contact` | Form + WhatsApp handoff |
| `shared/ui` | Wrappers PrimeNG themed |

### Server (fase 2 — reserved)

| Módulo Nest | Responsabilidad |
|-------------|-----------------|
| `leads` | POST lead, validación, persistencia |
| `notifications` | Email a AMD |
| `health` | Healthchecks Docker |
| `auth` / `admin` | Fase 3+ |

## 5. Data Model & Entities

### Fase 1

Sin base de datos. Modelo solo en formularios TypeScript:

```text
ContactIntent {
  fullName: string
  email: string
  message: string
  serviceInterest?: string
  locale: 'es' | 'en'
}
```

### Fase 2 (propuesto)

```text
Lead {
  id, fullName, email, message, serviceInterest,
  locale, source, createdAt, status
}
```

## 6. API Surface & Contracts

### Fase 1

Ningún API propio. Integraciones:

- `https://wa.me/<e164>?text=...`
- `mailto:` fallback opcional

### Fase 2 (contrato previsto)

`POST /api/v1/leads`

```json
{
  "fullName": "string",
  "email": "string",
  "message": "string",
  "serviceInterest": "string?",
  "locale": "es|en",
  "source": "landing"
}
```

Respuestas: `201 Created` | `400 Validation` | `429 Too Many Requests`.

## 7. Backend Workflows & Business Rules

Fase 1: N/A.

Fase 2 (borrador): validar → persistir → notificar email → 201. Idempotencia no requerida v1 API.

## 8. Frontend Architecture & State Boundaries

- Angular standalone + lazy features por sección si el bundle lo justifica.
- Estado UI local (signals). Sin store global salvo i18n locale + preferencia mínima.
- Design tokens en CSS variables; PrimeNG preset mapea a tokens.
- Animación: CSS/Angular primero; GSAP + ScrollTrigger solo si parallax lo requiere (`gsap-animation` skill).

## 9. Integration Points

| Sistema | Fase | Uso |
|---------|------|-----|
| WhatsApp | 1 | CTA primario de mensajería |
| Email (mailto / Nest SMTP) | 1 / 2 | Fallback → transaccional |
| Analytics (TBD) | 1 | Eventos de conversión |
| Redes (FB/IG/LinkedIn) | 1 | Footer links |

## 10. Security & Authorization Model

| Fase | Modelo |
|------|--------|
| 1 | Sitio público; sin auth; no secretos en client salvo IDs públicos |
| 2 | API pública rate-limited para leads; admin JWT/session en fase 3 |
| 3+ | RBAC admin, pagos, auditoría |

## 11. Error Handling & Observability

- Form: errores de campo inline + toast.
- WhatsApp: si bloqueado, mostrar número y mailto.
- Fase 2: filtro Nest de excepciones + logs estructurados + `/health`.

## 12. Testing Strategy

| Capa | Herramienta (propuesta) | Fase |
|------|-------------------------|------|
| Unit UI | Angular TestBed / Jest o Vitest según scaffold | 1 |
| Component a11y smoke | Manual + lint a11y | 1 |
| E2E críticos | Playwright (cuando exista app) | 1 late |
| API e2e | Supertest | 2 |

Comandos lean (placeholders hasta scaffold):

- Client test: `cd client && npm run test:agent` (fail-only reporter)
- Client lint: `cd client && npm run lint -- --quiet`
- Fallos: output completo y verbatim.

## 13. Technical Constraints & Assumptions

1. No trabajo Nest en fase 1 (ADR-003).
2. Scaffold de `client/` ocurre post-constitución / durante specify-execute — no improvisar stack distinto.
3. `server/` puede crearse como stub vacío en fase 2, no ahora.
4. CodeGraph: CLI no instalado hoy; se podrá `codegraph init -i` cuando exista código.
5. i18n ES+EN desde v1 (archivos de traducción versionados).
6. Hosting prod TBD; local-only ahora (ver `docs/infrastructure.md`).
