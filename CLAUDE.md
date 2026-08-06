# CLAUDE.md — AMD Soluciones

Constitución operativa para Claude Code / agentes en este repositorio. Mirror de `AGENTS.md` en routing y skills; lee ambos cuando trabajes aquí.

## Constitutional baseline

| Document | Purpose | When to consult |
|----------|---------|-----------------|
| `docs/prd.md` | Problema, personas, scope, métricas | Antes de proponer o especificar features |
| `docs/ux-ui/design.md` | Tokens, flows, glass/neuromorphism, i18n UX | Toda tarea UI |
| `docs/trd/trd.md` | Arquitectura LITE, fases, contratos | Toda tarea técnica; límites client/server |
| `docs/infrastructure.md` | Local/Docker/PROD rules | Arranque de stack, deploy |
| `docs/specs/general-setup/` | Plantillas requirements/design/task | Al escribir cualquier spec |

**Fase actual:** landing en `client/` (Angular + PrimeNG themed). `server/` NestJS = fase 2 — no improvisar API en fase 1. Preview estático: GitHub Pages en push a `dev` (**solo fase 1**; se corta al existir `server/` — ver `docs/infrastructure.md`).

Estas piezas forman la baseline constitucional para `/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-validate`, `/akili-test`.

### Spec taxonomy

`docs/specs/{domain,enhancement,bugfix}/<name>/` con `requirements.md`, `design.md`, `tasks.md`, `execution.md`.

### CodeGraph

CLI no instalado. Código de fase 1 vive en `client/`. Opcional: `npm i -g @colbymchenry/codegraph` → `codegraph init -i` (o re-index). No commitear la DB generada.

### Local stack

Contrato en `docs/infrastructure.md` → `## Local Environment`.

### Agent-lean verification

- `cd client && npm run test:agent` (post-scaffold)
- `cd client && npm run lint -- --quiet`

Fallos: output completo. Verde: mínimo ruido.

### Concurrency

Una sesión AKILI por checkout; adicionales en `git worktree`. No medir (build/Lighthouse/E2E) mientras un subagente escribe.

### Personas

`.agents/{leader,implementer,reviewer,tester}.md`

## Module Guides

| Module | Guide | Notes |
|--------|-------|-------|
| `client/` | *(none — conventions still match root)* | Angular + PrimeNG landing SPA (phase 1 archived as `domain/landing`). Shared ambient field at `core/ambient/` (archived `changes/hero-floating-orbs`). Add `client/AGENTS.md` only when conventions diverge. |
| `server/` | *(none — not scaffolded)* | NestJS = phase 2 (ADR-003). |

## Skill Map

| Skill | Applies To | When to load |
|-------|------------|--------------|
| `angular-developer` | `client/` | Componentes, routing, signals, forms, i18n Angular |
| `ui-ux-pro-max` | Landing UI | Tokens, layout, a11y, motion UX |
| `frontend-design` | Landing UI | Craft visual complementario |
| `gsap-animation` | Parallax / scroll | ScrollTrigger/timelines |
| `tailwind-design-system` | Theme | Solo si scaffold usa Tailwind v4 |
| `api-design-principles` | `server/` | Fase 2 |
| `nestjs-expert` | `server/` | Fase 2 |
| `error-handling-patterns` | API / forms | Errores y validación |
| `aws-serverless` | — | No aplica |

During `/akili-specify`, derive each task's required skills from this map. During `/akili-execute` and `/akili-test`, the Leader assigns these skills and the Implementer/Tester must load them before writing code or tests.

## Model Routing

Criteria-first: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; deep reasoning for propose/specify/verify **and Leader orchestration**; fast & cheap for archive/formatting only — **`tasks.md` decomposition is T1**.

### Capability tiers

| Tier | Role |
|------|------|
| T1 Architect | Architecture, task decomposition, live orchestration judgment |
| T2 Coder | Implementation & test authoring |
| T3 Auditor | Independent review |
| T4 Context-Ingest | Large ingestion |
| T5 Fast-Cheap | Archive / formatting |
| T6 Multimodal | Vision |

### Phase → tier

| Phase | Tier | Notes |
|-------|------|-------|
| Constitution ingest | T4 | Synthesis T1 |
| Propose / Specify | T1 | |
| Execute Leader | T1 | |
| Execute Implementer | T2 | |
| Execute Reviewer | T3 | ≠ Implementer model |
| Test Leader | T1 | |
| Tester(s) | T2 | Prefer ≠ Implementer |
| Archive | T5 | |

### Registry

Updated: **2026-08**

**Session host:** Cursor IDE (Claude-family models via the model picker). Use `opus` / `sonnet` / `haiku` (or current-generation equivalents Cursor exposes). Wrappers: `.claude/agents/akili-*.md`. In Cursor Agent, follow this registry when spawning workers (author ≠ auditor).

| Tier | Claude Code / Cursor | OpenCode | Antigravity | Fallback |
|------|----------------------|----------|-------------|----------|
| T1 Architect | `opus` | `<CONFIRM SLUG>` | Gemini Pro `<CONFIRM ID>` | strongest available |
| T2 Coder | `sonnet` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | mid-tier coder |
| T3 Auditor | `opus` | `<CONFIRM SLUG>` | Gemini Pro `<CONFIRM ID>` | ≠ T2 model |
| T4 Context-Ingest | `sonnet` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | long-context model |
| T5 Fast-Cheap | `haiku` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | cheapest |
| T6 Multimodal | `sonnet` | `<CONFIRM SLUG>` | Gemini Pro/Flash vision `<CONFIRM ID>` | vision-capable |

**CLI invocations:** Cursor IDE · Claude Code `<CONFIRM>` · OpenCode `<CONFIRM>` · Antigravity `agy`.

**Cross-host dispatch:** T6 → Antigravity (Gemini vision) when needed. Preference only — no dispatcher pin.

**Wrappers (Step 8E):** Leader/Reviewer `opus`, Implementer/Tester `sonnet`. Reviewer read-only (`tools: Read, Grep, Glob`).

**Guardrail (Step 8F):** Cursor `.cursor/hooks.json` (Node) + Claude Code `.claude/settings.json` (bash). PASS = v1 heuristic. Instructional on other hosts.

Edit only this registry to change models. No `model:` in command frontmatter; wrappers (Step 8E) enforce bindings.

### Effort dial

| Signal | Effort |
|--------|--------|
| Trivial / mechanical | `low` |
| Standard | `medium` |
| Complex | `xhigh` |
| Correctness-critical | `max` |

Defaults: T1 Leader/propose/specify `high`; T2 `medium`; T3 `high`; T5 `low`. Bump one level per rework retry. Never `max` a cheaper tier — escalate tier. Re-baseline when model generation changes. Effort ≠ verbosity control.
