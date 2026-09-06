# AKILI Drift Audit Report

- **Date of Audit:** 2026-08-06
- **Code Graph Used:** Yes — `.codegraph/` present (`codegraph.db` ~3.5 MB); CLI `@colbymchenry/codegraph@1.5.0`. Index: **77 files · 766 nodes · 1,564 edges** (status: up to date). Initial Glob/Grep + scout pass re-validated with `codegraph query` / `explore` / `files` the same day.
- **Overall Conformance Score:** 78%

## Executive Summary

Phase 1 landing is largely **implemented and on-constitution**: Angular SPA in `client/`, no Nest/`server/`, ES/EN i18n, gold tokens, multi-page IA, contact WhatsApp/mailto handoff, ambient orbs, and GitHub Pages preview match ADR-003 and `docs/infrastructure.md`. Drift is concentrated in **stale module paths** (TRD + `leader.md` still say `landing/**` / `shared/**` while code uses `features/**`), an **aspirational PrimeNG component inventory** (preset wired, zero template usage), and **agent-harness gaps** (no Antigravity Step 8E wrappers; `leader.md` lacks the packaged Delegation Ceiling section). Product risk is low; orchestration and future-host risk are medium.

**CodeGraph re-check (confirmed, no score change):**
| Claim | Graph evidence |
|-------|----------------|
| No Nest / no API client | Zero hits: `NestFactory`, `HttpClient`, `Controller`; no `server/` in indexed tree |
| Routes under `features/**` | `app.routes.ts` lazy-loads `HomePage`, `AboutPage`, `ServicesPage`, `LegalStubPage`, `NotFoundPage` |
| Ambient orbs present | `AmbientOrbsComponent` at `core/ambient/ambient-orbs/` |
| PrimeNG = config only | Sole `primeng/` import: `providePrimeNG` in `app.config.ts` (+ `theme-primeng.ts`) |
| ContactIntent client-side | Interface + `buildIntent` / handoff; no API edge |
| No GSAP symbol | `gsap` query returns motion/CSS helpers only — no GSAP package symbols |

## Identified Discrepancies

### 🔴 High Priority (Breaking/Critical)

- **[Antigravity Step 8E wrappers missing]:** Personas live at `.agents/*.md`, but Antigravity discovers agents under `.agents/agents/` with `subagent: true`. Without wrappers, Antigravity silently falls back to an unprimed generic agent.
  - **Affected Spec File:** [AGENTS.md — Model Routing / Step 8E](file:///d:/REPOS/AMD-soluciones/AGENTS.md)
  - **Affected Code File:** [`.agents/` (personas only; no `agents/` wrappers)](file:///d:/REPOS/AMD-soluciones/.agents)
  - **Remediation:** Add `.agents/agents/akili-*/agent.md` wrappers (or document Antigravity as out-of-scope for this repo). Report-only here — do not invent wrappers in this audit.

### 🟡 Medium Priority (Inconsistencies/Gaps)

- **[TRD client module tree stale]:** TRD §4 lists `landing/hero|services|about|trust|contact` and `shared/ui`. Shipped layout is `features/{home,about,services,legal,not-found}` + `core/` (no `landing/`, no `shared/`).
  - **Affected Spec File:** [docs/trd/trd.md §4](file:///d:/REPOS/AMD-soluciones/docs/trd/trd.md)
  - **Affected Code File:** [client/src/app/features/](file:///d:/REPOS/AMD-soluciones/client/src/app/features) · [client/src/app/core/](file:///d:/REPOS/AMD-soluciones/client/src/app/core)
  - **Remediation:** Update TRD (and any still-active path references) to `features/**` + `core/**`; drop or re-scope `shared/ui` until wrappers exist.

- **[Leader directory boundaries stale]:** `leader.md` still parallelizes on `client/src/app/landing/**` and `shared/**`, so task-independence judgments can mis-scope writers.
  - **Affected Spec File:** [.agents/leader.md](file:///d:/REPOS/AMD-soluciones/.agents/leader.md)
  - **Affected Code File:** [client/src/app/features/](file:///d:/REPOS/AMD-soluciones/client/src/app/features)
  - **Remediation:** Rewrite boundaries to `features/**` + `core/**` (and note `core/ambient/`). Manual persona trim/update — never overwrite via constitution Safe Update alone.

- **[PrimeNG inventory aspirational]:** UX design §8 inventories `p-button`, `p-inputtext`, `p-toast`, `p-dialog`, `p-carousel`, etc. Runtime only calls `providePrimeNG` + Aura preset; templates are custom HTML/CSS (forms, nav, carousel).
  - **Affected Spec File:** [docs/ux-ui/design.md §8](file:///d:/REPOS/AMD-soluciones/docs/ux-ui/design.md)
  - **Affected Code File:** [client/src/app/app.config.ts](file:///d:/REPOS/AMD-soluciones/client/src/app/app.config.ts) (only PrimeNG import surface)
  - **Remediation:** Either adopt PrimeNG components where the inventory claims them, or revise §8 to “preset + custom chrome; components optional.”

- **[GSAP skill preference vs CSS-only motion]:** Skill Map and Leader/Implementer still prefer `gsap-animation` for landing UI. Product has no `gsap` dependency; motion is CSS + `MotionService` / passive scroll (matches TRD “CSS first; GSAP if needed” and archived landing/orbs decisions).
  - **Affected Spec File:** [AGENTS.md Skill Map](file:///d:/REPOS/AMD-soluciones/AGENTS.md) · [.agents/leader.md](file:///d:/REPOS/AMD-soluciones/.agents/leader.md)
  - **Affected Code File:** [client/src/app/core/motion/](file:///d:/REPOS/AMD-soluciones/client/src/app/core/motion) · [client/package.json](file:///d:/REPOS/AMD-soluciones/client/package.json)
  - **Remediation:** Demote GSAP to “load only if a task introduces ScrollTrigger”; keep skill available for future work.

- **[Delegation Ceiling section missing in leader persona]:** Packaged template has a named `### Delegation Ceiling`; project `leader.md` compresses thresholds into one bullet without that section title/rules table.
  - **Affected Spec File:** [.claude/akili/templates/leader.md](file:///d:/REPOS/AMD-soluciones/.claude/akili/templates/leader.md) (packaged baseline)
  - **Affected Code File:** [.agents/leader.md](file:///d:/REPOS/AMD-soluciones/.agents/leader.md)
  - **Remediation:** Manually restore Delegation Ceiling guardrails into `leader.md` (Model Generation Drift / persona template gap).

- **[OpenCode Step 8E wrappers absent]:** Registry has an OpenCode column (`<CONFIRM SLUG>`), but no `.opencode/` agent wrappers exist.
  - **Affected Spec File:** [AGENTS.md Model Routing](file:///d:/REPOS/AMD-soluciones/AGENTS.md)
  - **Affected Code File:** [repo root (no `.opencode/`)](file:///d:/REPOS/AMD-soluciones)
  - **Remediation:** Add OpenCode wrappers if the team uses that host; otherwise leave placeholders and treat as intentional non-install.

- **[PRD omits phase-1 Pages preview]:** PRD Out-of-scope still reads as local-only (+ Docker plan). `AGENTS.md` / `infrastructure.md` correctly document GitHub Pages on `dev` as non-PROD preview.
  - **Affected Spec File:** [docs/prd.md §5](file:///d:/REPOS/AMD-soluciones/docs/prd.md)
  - **Affected Code File:** [.github/workflows/deploy-pages-phase1.yml](file:///d:/REPOS/AMD-soluciones/.github/workflows/deploy-pages-phase1.yml)
  - **Remediation:** Add one In-scope line: “GitHub Pages preview (fase 1 only; not PROD).”

### 🟢 Low Priority (Style/Cleanups)

- **[Token name `--glass-blur` vs `--amd-glass-blur`]:** Design §7 lists `--glass-blur`; code SoT uses `--amd-glass-blur` (value matches intent).
  - **Affected Spec File:** [docs/ux-ui/design.md §7](file:///d:/REPOS/AMD-soluciones/docs/ux-ui/design.md)
  - **Affected Code File:** [client/src/styles/tokens.css](file:///d:/REPOS/AMD-soluciones/client/src/styles/tokens.css)
  - **Remediation:** Align the design table to `--amd-glass-blur` (prefer code as SoT).

- **[Stale i18n comment on path locale]:** `locale.model.ts` still says path segments stay Spanish (DD-014); routes are English (`about-us`, `services`) per UX design §2.
  - **Affected Spec File:** [docs/ux-ui/design.md §2](file:///d:/REPOS/AMD-soluciones/docs/ux-ui/design.md)
  - **Affected Code File:** [client/src/app/core/i18n/locale.model.ts](file:///d:/REPOS/AMD-soluciones/client/src/app/core/i18n/locale.model.ts)
  - **Remediation:** Fix the comment to “English path segments; copy flips.”

- **[Empty active change folder]:** `docs/specs/changes/services-page-redesign/` exists with empty `mockup/` and `visual-reference/` dirs and no `proposal.md` / requirements / design / tasks on disk (git clean).
  - **Affected Spec File:** [docs/specs/changes/services-page-redesign/](file:///d:/REPOS/AMD-soluciones/docs/specs/changes/services-page-redesign)
  - **Affected Code File:** [client/src/app/features/services/](file:///d:/REPOS/AMD-soluciones/client/src/app/features/services) (current shipped page)
  - **Remediation:** Remove the empty shell or complete `/akili-propose` artifacts before execute.

- **[AGENTS.md ↔ CLAUDE.md compression asymmetry]:** Same model bindings; CLAUDE.md is a shorter mirror (phase names, CLI CONFIRM strings). Non-contradictory.
  - **Affected Spec File:** [AGENTS.md](file:///d:/REPOS/AMD-soluciones/AGENTS.md) · [CLAUDE.md](file:///d:/REPOS/AMD-soluciones/CLAUDE.md)
  - **Affected Code File:** N/A (docs only)
  - **Remediation:** Optional sync pass for wording parity.

- **[Tester runner wording]:** Tester persona says “Jest / Vitest as scaffolded”; scaffold is Vitest only.
  - **Affected Spec File:** [.agents/tester.md](file:///d:/REPOS/AMD-soluciones/.agents/tester.md)
  - **Affected Code File:** [client/package.json](file:///d:/REPOS/AMD-soluciones/client/package.json)
  - **Remediation:** Say Vitest explicitly.

### Category sweep (clean or noted)

| Category | Result |
|----------|--------|
| Stale Specification | Findings above (TRD paths, PRD Pages, PrimeNG inventory, glass token name) |
| Undocumented Feature | **Clean for major surfaces** — ambient orbs indexed in Module Guides; multi-page IA in UX design; analytics stub matches TRD |
| Visual / Design Token Mismatch | Gold `#CFBB66` present; forbidden purples absent in `client/src`; blur token rename only |
| Technical Constraints Violation | **No Nest in phase 1** — aligned (ADR-003). No DB — aligned. Lean test/lint scripts present. Module-path doc vs tree = structural drift (above) |
| Agent Guide Drift | Stale `leader` boundaries; Module Guides correctly note no `client/AGENTS.md` and `core/ambient/` |
| Persona injection bleed | **Mostly clean** — tester does not audit tokens; leader has boundaries (stale paths). Phase-1 stack tables duplicated across personas (report-only hygiene) |
| Model Registry Drift | Host columns present; alias-first; T2≠T3 (`sonnet`/`opus`); `Updated: 2026-08`; Claude wrappers match registry |
| Antigravity wrapper gaps | **Fail** — no `.agents/agents/` (High above) |
| Missing host column | **Clean** — Claude/Cursor, OpenCode, Antigravity, Fallback present (IDs still `<CONFIRM>`) |
| Tier/model mismatch | **Clean** on Claude/Cursor axis — T1/T3 `opus`, T2 `sonnet`, T5 `haiku` |
| Model Generation Drift | Delegation Ceiling gap (Medium above); Scope Discipline present in implementer; no frontier pins; stamp current |

## Conformance Matrix

| Spec Section | Code Reality Status | Alignment Status | Notes |
| :--- | :--- | :--- | :--- |
| Product Requirements (PRD) | Hero → services → about → trust → contact; ES/EN; form + WhatsApp; no Nest | Aligned (minor drift) | Pages preview missing from PRD In-scope |
| UX/UI Design / Screen Inventory | Routes `/`, `/about-us`, `/services`, legal stubs, 404; dual nav; tokens gold/ink | Aligned (minor drift) | PrimeNG §8 unused; `--glass-blur` rename |
| TRD (APIs/DB) | No API, no DB, ContactIntent client-side, Pages in infra | Drifted (structure) | Module tree `landing/`/`shared/ui` ≠ `features/`/`core/` |
| Agent Guides (root + Module Guides) | Root guides + 4 personas; ambient noted; no child `client/AGENTS.md` | Drifted | `leader.md` path boundaries stale; GSAP preferred vs CSS reality |
| Model Routing (registry + Step 8E wrappers) | Claude wrappers OK; T2≠T3; Updated 2026-08 | Drifted (hosts) | Antigravity wrappers missing; OpenCode absent; Delegation Ceiling thin |

## Recommended Next Steps

1. **Doc sync (highest ROI):** Update `docs/trd/trd.md` §4 and `.agents/leader.md` boundaries to `features/**` + `core/**`.
2. **UX honesty pass:** Revise `docs/ux-ui/design.md` §8 (PrimeNG) and §7 (`--amd-glass-blur`); fix `locale.model.ts` path comment.
3. **Harness:** Add Antigravity (and optionally OpenCode) Step 8E wrappers if those hosts matter; restore Delegation Ceiling text in `leader.md`.
4. **PRD one-liner:** Document GitHub Pages as phase-1 preview (not PROD).
5. **Skill Map:** Demote `gsap-animation` to conditional.
6. **Active change hygiene:** Delete or complete `docs/specs/changes/services-page-redesign/`.
7. **Optional confidence upgrade:** `npm i -g @colbymchenry/codegraph` → `codegraph init -i`, then re-run `/akili-audit`.

Nothing in this audit was edited beyond writing this report.
