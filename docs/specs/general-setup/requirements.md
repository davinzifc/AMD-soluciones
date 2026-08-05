# General Setup — Requirements Template

Plantilla canónica para `/akili-specify`. Cada spec bajo `docs/specs/` debe seguir esta estructura.

## Spec taxonomy (este repo)

```text
docs/specs/
├── general-setup/     ← estas plantillas (no es un feature)
├── domain/            ← capacidades de producto (landing, admin, leads…)
├── enhancement/       ← mejoras sobre algo ya entregado
└── bugfix/            ← correcciones acotadas
```

Ejemplo fase 1: `docs/specs/domain/landing/`.

## Document header

```markdown
# Requirements — <spec-name>

| Field | Value |
|-------|-------|
| Spec path | docs/specs/<taxonomy>/<name>/ |
| Status | Draft \| Approved |
| Phase | 1-landing \| 2-api \| 3-admin |
| Related PRD | docs/prd.md |
| Related UX | docs/ux-ui/design.md |
| Related TRD | docs/trd/trd.md |
```

## Writing standards

1. Requisitos **user-centric** y testeables.
2. IDs estables: `REQ-001`, `REQ-002`…
3. Cada requisito tiene escenarios Given/When/Then.
4. Incluir negativos: `BUT it must NOT` y estrictos: `AND IT MUST`.
5. No mezclar solución técnica en el requisito salvo constraint explícito.
6. Alinear copy/UX a `docs/ux-ui/design.md` cuando el requisito sea UI.
7. Respetar fase: specs de landing **no** exigen Nest.

## Required sections

### 1. Context & Goal

Una frase: qué cambia y por qué.

### 2. Actors

Tabla de actores afectados.

### 3. Requirements

#### REQ-XXX — <título>

- **Persona / actor:**
- **Descripción:**
- **Acceptance:**

**Scenario: <nombre>**

```text
GIVEN ...
WHEN ...
THEN ...
AND IT MUST ...
BUT it must NOT ...
```

### 4. Non-goals

Lista explícita.

### 5. Traceability

| REQ | UX section | TRD section |
|-----|------------|-------------|
| REQ-001 | … | … |

### 6. Open Questions

Solo lo que bloquea implementación.
