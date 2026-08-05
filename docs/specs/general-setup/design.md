# General Setup — Design Template

Plantilla de diseño técnico/UX por spec. Refina — no reemplaza — `docs/trd/trd.md` y `docs/ux-ui/design.md`.

## Document header

```markdown
# Design — <spec-name>

| Field | Value |
|-------|-------|
| Spec path | docs/specs/<taxonomy>/<name>/ |
| Status | Draft \| Approved |
| Tier impact | none \| extends LITE \| proposes ROBUST (needs ADR) |
```

## Required sections

### 1. Overview

Qué se construye en este spec y en qué path (`client/` y/o `server/`).

### 2. Architecture Overview

- Contenedores tocados
- Diagramas C4 solo si el cambio es arquitectónicamente significativo
- Si toca solo UI: feature modules Angular afectados

### 3. Data Model

Entidades nuevas/cambiadas. Fase 1 landing: modelos TS de formulario / i18n keys.

### 4. API Contracts

Endpoints nuevos. Si fase 1: declarar “none” y el handoff WhatsApp/mailto.

### 5. Frontend Design

| Tema | Detalle |
|------|---------|
| Screens / sections | |
| Components (PrimeNG + custom) | |
| Tokens usados | citar `docs/ux-ui/design.md` |
| Motion / parallax | reduced-motion plan |
| i18n keys | es / en |

### 6. Backend Design

Solo si el spec toca `server/`. Si no: **N/A — phase boundary**.

### 7. Design Decisions (ADR-style)

| Decision | Choice | Rejected | Why |
|----------|--------|----------|-----|

### 8. NFR scenarios (si aplican)

Reusar formato six-part del TRD solo para lo que este spec altera.

### 9. Test plan hooks

Qué suites deberá cubrir `/akili-test` (frontend-unit, e2e…).

### 10. Risks & migations

Tabla corta.
