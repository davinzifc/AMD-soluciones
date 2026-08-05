# General Setup — Task Template

Plantilla para `tasks.md` generado por `/akili-specify` y ejecutado por `/akili-execute`.

## Document header

```markdown
# Tasks — <spec-name>

| Field | Value |
|-------|-------|
| Spec path | docs/specs/<taxonomy>/<name>/ |
| Execution log | execution.md (same folder) |
```

## Task format

```markdown
## T001 — <short title>

- **Status:** [ ] | [~] | [x]
- **Depends on:** none | T00X
- **Directory boundary:** `client/...` (fase 1) — never `server/` unless phase ≥ 2
- **Recommended skills:** angular-developer, ui-ux-pro-max, gsap-animation, …
- **Verification:** `<exact command>`
- **Evidence disqualifier:** (opcional — cuándo un green no cuenta)
- **Exemplar file:** (path a imitar si existe; si no, omitir)

### Done when
- [ ] …
```

## Status transitions

| From | To | Rule |
|------|----|------|
| `[ ]` | `[~]` | Implementer empezó |
| `[~]` | `[x]` | Solo tras Reviewer **PASS** registrado en `execution.md` (evidence before checkbox) |
| any | HALT | 3 rework fails o FATAL_FAIL |

## Dependency graph

- Orden documental = orden preferente.
- Paralelizar solo tareas con archivos/dominios disjuntos **y** sin shared build/ports.
- Soft ceiling: 2 workers concurrentes (ver `.agents/leader.md`).

## Testing expectations

- Cada tarea UI nombra comando de verificación real del `client/`.
- Tareas Nest solo en specs fase 2+.
- Lean reporters en verde; fallos verbatim.

## Execution conventions

1. Commit AKILI: `[SPEC:docs/specs/<path>] <message>`
2. Un checkout = una sesión AKILI; extras en `git worktree`.
3. No correr mediciones pesadas (build/Lighthouse/E2E) mientras un subagente escribe.
4. Leader mantiene `execution.md` con Attempt History.

## Example slice (landing)

```markdown
## T001 — Scaffold Angular client with PrimeNG theme tokens
- **Status:** [ ]
- **Directory boundary:** `client/`
- **Recommended skills:** angular-developer, tailwind-design-system (si se usa), ui-ux-pro-max
- **Verification:** `cd client && npm run build`

## T002 — Hero section full-bleed with brand-first composition
- **Depends on:** T001
- **Directory boundary:** `client/src/app/landing/hero/`
- **Verification:** `cd client && npm run test:agent -- hero`
```
