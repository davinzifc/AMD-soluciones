# Execution Log — Landing v1 (Phase 1)

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/domain/landing/` |
| Started | 2026-08-05 |
| Approval Mode | gated |
| Leader session | `/akili-execute` |

## Document Control

| Field | Value |
|-------|-------|
| Spec | `requirements.md` + `design.md` + `tasks.md` (Approved) |
| Budget | 14 tasks · ~3 200–4 200 LOC · 16–20 review rounds |
| Directory rule | `client/` only — never `server/` |

## Task Execution History

### T001 — Scaffold Angular `client/` + scripts + fonts

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-001 (runnable local) · NFR-006 · NFR-001/002 (font-display via `display=swap`) |
| Design refs | DD-012 · §1 Overview · §2 Container |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: medium
- Files: full `client/` scaffold (Angular 22.1.x standalone); `package.json` scripts `start` / `build` / `lint` / `test:agent`; `index.html` Sora+DM Sans preconnect + Google Fonts `display=swap`; `styles.css` font CSS variables; minimal `app.*` skeleton; eslint via `@angular-eslint/schematics`
- Verification:
  - `npm install` → exit 0
  - `npm run lint -- --quiet` → exit 0
  - `npm run test:agent` → exit 0 (Vitest 4.1.10 · 1 file / 2 tests)
  - `npm run build` → exit 0
  - `npm start` → HTTP 200 at `http://localhost:4200`; server stopped after check
- No `server/` / Nest changes
- CLI default runner: Vitest via `@angular/build:unit-test`

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: Conforms to DD-012 and REQ-001/NFR-006 — Angular 22.1.x standalone in `client/` only; required scripts present with lean `test:agent`; Sora + DM Sans with preconnect and `display=swap`; ADR-003 holds (no Nest/`server/`).

**ADVISORY** (4R, non-gating — recorded only; do not mint tasks):

1. Google Fonts stylesheet is render-blocking — revisit under NFR-001/002 in later polish (T002/T014), not now.
2. `app.spec.ts` asserts placeholder hero copy; T006 will replace hero — expect assertion rewrite then.
3. Font vars live in CLI-default `src/styles.css`; T002 owns relocating token SoT to `src/styles/tokens.css`.

#### Decisions

- Accepted CLI default Vitest (DD-012).
- Google Fonts CDN (not self-host) allowed by DD-012.
- Did not pre-create empty feature folders (out of T001 scope).

#### Issues encountered

None (PASS on first attempt).

#### Final verification

`lint --quiet`, `test:agent`, and HTTP 200 on `:4200` all green.

## Constitution Impact: T001

- **Module created:** top-level `client/` (Angular SPA package).
- **Child guides:** not required yet — conventions still match root `AGENTS.md` / `CLAUDE.md` until feature folders diverge; `/akili-archive` may add `client/AGENTS.md` if needed.
- **Parent index:** root `## Module Guides` remains empty until archive sync decides a child guide is warranted.
- **CodeGraph:** re-index pending when CLI is available (`codegraph init -i`); do not commit generated DB.

### T002 — Design tokens + PrimeNG theme

| Field | Value |
|-------|-------|
| Final status | **PASS** |
| Date | 2026-08-05 |
| Attempts | 1 |
| Requirements covered | REQ-011 · NFR-003 |
| Design refs | §6 Design tokens · DD-002 |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`, `ui-ux-pro-max`
- Effort: medium
- Files: `client/src/styles/tokens.css` (AMD SoT); `client/src/styles/theme-primeng.ts` (Aura → gold primary + ink/mist); `styles.css` imports tokens; `app.config.ts` `providePrimeNG` + `provideAnimationsAsync`; deps `primeng`, `@primeuix/themes`, `@angular/cdk`, `@angular/animations`
- Verification: `npm run build` exit 0 (dist contains `--amd-gold:#CFBB66`); purple grep 0 matches; lint quiet pass

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: PASS**
- Summary: tokens.css matches UX §7 including `#CFBB66`; Aura preset seeded from gold with ink/mist surfaces; global import + `providePrimeNG`; no Zyro purples; ADR-003 intact.

**ADVISORY** (4R, non-gating):

1. Hex duplicated between `tokens.css` and preset — drift risk vs NFR-003; prefer CSS vars where possible.
2. Surface ramp mixes AMD ink endpoints with zinc mid-steps.
3. `@angular/animations` may be unnecessary for PrimeNG 22 — revisit if unused by T013.
4. Build/lint results accepted as Implementer claims (static evidence consistent).

#### Final verification

Build green; gold present; no forbidden purples in `client/src`.

### T003 — i18n LocaleService + ES/EN dictionaries

| Field | Value |
|-------|-------|
| Final status | *(in progress — attempt 1 FAIL)* |
| Date | 2026-08-05 |
| Attempts so far | 1 |
| Requirements covered (partial) | REQ-009 foundation (persist/lang/key-parity OK; pipe reactivity FAIL) |
| Design refs | DD-004 · DD-014 · §6 i18n |

#### Attempt 1

**Implementer** (T2 · `claude-sonnet-5-thinking-high`)

- Skills: `angular-developer`
- Effort: medium
- Files: `core/i18n/*` (LocaleService, LocalizePipe pure:true, key-parity helper + specs); `assets/i18n/{es,en}.json` (161 keys parity); `angular.json` asset glob; `tsconfig.json` `resolveJsonModule`
- Verification: `test:agent` 4 files / 19 tests pass; lint pass; build emits i18n JSON
- Assumption: no app.html toggle — unit tests only

**Reviewer** (T3 · `claude-opus-5-thinking-high`)

- Verdict: **STATUS: FAIL**

```text
STATUS: FAIL

ISSUES:

1.  **Discovered Issue:** `LocalizePipe` is declared `pure: true` and takes only the key
    as input, so Angular's pure-pipe memoization prevents `transform()` from ever
    re-running after the first evaluation of a given binding. Verified against the
    installed Angular 22 source, not from memory:

      `_debug_node-chunk.mjs:17669` - ??pipeBind1 → isPure(...) ? pureFunction1Internal(...) : transform(v1)
      `_debug_node-chunk.mjs:17571` - pureFunction1Internal → bindingUpdated(lView, i, exp)
                                    ? updateBinding(..., pureFn(exp))
                                    : getPureFunctionReturnValue(lView, i + 1)

    For `{{ 'heroCtaPrimary' | localize }}` the argument `exp` is a constant string
    literal, so `bindingUpdated` returns false on every cycle after the first and the
    cached slot value is returned. Reading `dictionarySignal()` inside `transform`
    does register the signal on the LView reactive node during the single first
    invocation, so the view is marked dirty on locale change - but change detection
    then short-circuits at the memoized binding and the DOM keeps the stale string.

    Two concrete failures follow:

    a) **Toggle ES↔EN does not update bound strings.** Directly contradicts the pipe's
       own doc comment (`localize.pipe.ts:6-9`), which asserts the opposite.

    b) **Initial render is permanently stuck on raw keys.** `LocaleService` starts with
       `dictionarySignal = signal({})` and fetches asynchronously in the constructor
       (`locale.service.ts:20,28`). The service is first instantiated when the pipe
       injects it during the first template pass, so the dictionary is still empty:
       `translate()` returns the key fallback, that fallback is memoized, and the
       resolved dictionary never reaches the DOM. There is no `provideAppInitializer`
       / `whenReady()` gate in `app.config.ts` to close this window.

    *   **Violated Rule:** `docs/specs/domain/landing/tasks.md#T003` Done-when
        "Toggle ES↔EN updates bound strings"; `docs/specs/domain/landing/requirements.md#REQ-009`
        ("THEN visible UI copy and CTAs update to the selected locale",
        "BUT it must NOT leave mixed-locale chrome").
    *   **Remediation Suggestion:** Either (a) switch to `pure: false` - acceptable cost
        for a landing, `transform` is a single Map lookup - or (b) drop the pipe in
        favour of a signal-read template method (`{{ t('heroCtaPrimary') }}` where `t`
        reads `dictionarySignal`), which stays OnPush/zoneless-correct without an
        impure pipe. Passing the locale as a second pipe argument also works but
        forces every consuming component to expose `locale()`, which will not age well
        across T004-T012. Separately, gate the first paint with
        `provideAppInitializer(() => inject(LocaleService).whenReady())` so the empty-
        dictionary window cannot render.

2.  **Discovered Issue:** No test exercises the pipe through a rendered template, so
    the defect in (1) is invisible to the green suite. `localize.pipe.spec.ts:13,24`
    calls `new LocalizePipe()` and invokes `transform()` imperatively, which bypasses
    `??pipeBind1` and its memoization entirely - it proves delegation to
    `LocaleService.translate`, not binding reactivity. Grep confirms `LocalizePipe` is
    not imported by any template in `client/src`, so the "19 tests passed" evidence
    carries zero signal on the Done-when clause. The Implementer's stated assumption
    that "unit tests are sufficient" does not hold for this specific clause.

    *   **Violated Rule:** `docs/specs/domain/landing/tasks.md#T003` Verification
        ("tests for persist, `documentElement.lang`, key-parity") read together with
        Done-when #1; `docs/specs/domain/landing/design.md#10` Test plan hooks -
        "Presence of CSS classes alone ≠ proof"; the same principle applies to a pipe
        instantiated outside a view.
    *   **Remediation Suggestion:** Add a TestBed host-component test:
        render `{{ 'greeting' | localize }}`, `detectChanges()`, assert `Hola`,
        `await setLocale('en')`, `detectChanges()`, assert `Hello`. Written against the
        current implementation this test fails, which is precisely the regression guard
        T003 is missing.
```

What Reviewer confirmed OK (do not re-litigate): key-parity real; persist/reload; `amd.locale`; no ngx-translate; dictionaries seeded from mockup; angular.json/tsconfig wiring.

Next: attempt 2 (effort high) — fix pipe reactivity + host-component test + initializer gate.
