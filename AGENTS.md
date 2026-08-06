# AGENTS.md — AMD Soluciones

Guía raíz para agentes. La **constitución AKILI-SPECS** de este repo es la fuente de verdad del producto y del proceso.

## Constitutional baseline

| Document | Purpose | When to consult |
|----------|---------|-----------------|
| `docs/prd.md` | Problema, personas, scope, métricas | Antes de proponer o especificar features |
| `docs/ux-ui/design.md` | Tokens, flows, glass/neuromorphism, i18n UX | Toda tarea UI |
| `docs/trd/trd.md` | Arquitectura LITE, fases, contratos | Toda tarea técnica; límites client/server |
| `docs/infrastructure.md` | Local/Docker/PROD rules | Arranque de stack, deploy |
| `docs/specs/general-setup/` | Plantillas requirements/design/task | Al escribir cualquier spec |

**Fase actual:** landing en `client/` (Angular + PrimeNG themed). `server/` NestJS = fase 2 — no improvisar API en fase 1.

### Spec taxonomy

`docs/specs/{domain,enhancement,bugfix}/<name>/` con `requirements.md`, `design.md`, `tasks.md`, `execution.md`.

### CodeGraph

CLI no instalado. Código de fase 1 vive en `client/`. Opcional: `npm i -g @colbymchenry/codegraph` → `codegraph init -i` (o re-index) para reflejar el grafo. No commitear DB generada.

### Local stack

Ver contrato `## Local Environment` en `docs/infrastructure.md`. No adivinar puertos/comandos.

### Agent-lean verification

Tras scaffold, preferir:

- `cd client && npm run test:agent` (o reporter dot/silent)
- `cd client && npm run lint -- --quiet`

**Asimetría:** fallos siempre completos y verbatim; solo se silencia ruido en verde.

### Concurrency

- Una sesión AKILI por checkout; extras en `git worktree`.
- No correr build/benchmark/Lighthouse/E2E mientras un subagente delegado está activo.

### Personas

`.agents/{leader,implementer,reviewer,tester}.md` — harness de `/akili-execute` y `/akili-test`.

## Module Guides

| Module | Guide | Notes |
|--------|-------|-------|
| `client/` | *(none — conventions still match root)* | Angular + PrimeNG landing SPA (phase 1 archived as `domain/landing`). Shared ambient field at `core/ambient/` (archived `changes/hero-floating-orbs`). Add `client/AGENTS.md` only when conventions diverge. |
| `server/` | *(none — not scaffolded)* | NestJS = phase 2 (ADR-003). |

## Skill Map

Stack skills para este proyecto. Durante `/akili-specify`, derivar skills por tarea desde este mapa. En `/akili-execute` y `/akili-test`, el Leader las asigna; Implementer/Tester deben cargarlas antes de escribir.

| Skill | Applies To | When to load |
|-------|------------|--------------|
| `angular-developer` | `client/` | Componentes, routing, signals, forms, i18n Angular |
| `ui-ux-pro-max` | Landing UI | Tokens, layout, a11y, motion UX |
| `frontend-design` | Landing UI | Craft visual si hace falta complemento |
| `gsap-animation` | Parallax / scroll | Cuando la tarea pide ScrollTrigger/timelines |
| `tailwind-design-system` | Theme | Solo si el scaffold adopta Tailwind v4 tokens |
| `api-design-principles` | `server/` | Fase 2 — contratos leads/API |
| `nestjs-expert` | `server/` | Fase 2 — módulos Nest |
| `error-handling-patterns` | API / forms | Validación y errores resilientes |
| `aws-serverless` | — | **No** — no es el stack actual |

Environment-provided skills: no confirmados — no listar hasta que el usuario lo confirme.

## Model Routing

Criteria-first: match the dominant demand; **ARCHITECT = BUILDER** for deep design work; **author ≠ auditor**; reserve deep reasoning for propose/specify/verify **and the orchestrating Leader**; fast & cheap only for archive/formatting — **`tasks.md` decomposition is T1, not cheap formatting**.

### Capability tiers

| Tier | Role |
|------|------|
| T1 Architect | Architecture, **task decomposition**, live orchestration judgment |
| T2 Coder | Implementation & test authoring throughput |
| T3 Auditor | Independent review depth |
| T4 Context-Ingest | Large repo/doc ingestion |
| T5 Fast-Cheap | Archive, formatting, mechanical transforms |
| T6 Multimodal | Vision / image-heavy work |

### Phase → tier

| Phase | Tier | Notes |
|-------|------|-------|
| `/akili-constitution` ingest | T4 | Synthesis T1 |
| `/akili-propose`, `/akili-specify` | T1 | |
| `/akili-execute` Leader | T1 | Orchestration judgment |
| `/akili-execute` Implementer | T2 | |
| `/akili-execute` Reviewer | T3 | **Different model than Implementer** |
| `/akili-test` Leader | T1 | |
| `/akili-test` Tester(s) | T2 | Prefer ≠ Implementer model |
| `/akili-archive` | T5 | |

### Registry

Updated: **2026-08**

**Session host:** Cursor IDE (Claude-family models via the model picker). Claude Code column aliases apply when Cursor exposes them (`opus` / `sonnet` / `haiku` or the current generation equivalents). Step 8E wrappers live under `.claude/agents/` for Claude Code / compatible loaders; in Cursor Agent, the Leader still follows this registry when spawning Task workers (author ≠ auditor).

| Tier | Claude Code / Cursor | OpenCode | Antigravity | Fallback |
|------|----------------------|----------|-------------|----------|
| T1 Architect | `opus` | `<CONFIRM SLUG>` | Gemini Pro `<CONFIRM ID>` | strongest available |
| T2 Coder | `sonnet` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | mid-tier coder |
| T3 Auditor | `opus` | `<CONFIRM SLUG>` | Gemini Pro `<CONFIRM ID>` | ≠ T2 model |
| T4 Context-Ingest | `sonnet` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | long-context model |
| T5 Fast-Cheap | `haiku` | `<CONFIRM SLUG>` | Gemini Flash `<CONFIRM ID>` | cheapest |
| T6 Multimodal | `sonnet` | `<CONFIRM SLUG>` | Gemini Pro/Flash vision `<CONFIRM ID>` | vision-capable |

**CLI invocations:** Cursor IDE (this checkout) · Claude Code `<CONFIRM: claude?>` · OpenCode `<CONFIRM: opencode?>` · Antigravity **`agy`** (confirm if different).

**Cross-host dispatch:** T6 Multimodal → prefer Antigravity (Gemini vision) when the session host lacks vision. Routing preference only — no named dispatcher tool.

**Wrappers (Step 8E):** `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` — Leader/Reviewer `opus`, Implementer/Tester `sonnet`. Reviewer is read-only (`tools: Read, Grep, Glob`).

**Guardrail (Step 8F):** enforced in Cursor via `.cursor/hooks.json` → `node .cursor/hooks/akili-tasks-gate.js`; also wired for Claude Code via `.claude/settings.json` + `bash .claude/hooks/akili-tasks-gate.sh`. Instructional on OpenCode/Antigravity. PASS check = v1 heuristic (any `PASS` in `execution.md`).

To change models, edit **only** this registry table. Never pin a dated model name where a floating alias exists. Model selection is guidance in commands — never add `model:` to command frontmatter; enforced bindings live only in Step 8E wrappers.

### Effort dial

Effort is per-task, orthogonal to tier.

| Signal | Effort |
|--------|--------|
| Trivial / mechanical | `low` |
| Standard scope | `medium` |
| Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
| Correctness-critical | `max` |

Defaults by role: T1 propose/specify/Leader `high`; T2 Implementer/Tester `medium` (flex); T3 Reviewer `high`; T5 `low`.

- Bump effort **one level on every rework retry**.
- Never `max` a cheaper tier — escalate the tier.
- Re-baseline effort defaults when the underlying model generation changes.
- Effort is **not** a verbosity dial — fix long reports via brief/`caveman`/`cognitive-doc-design`.
