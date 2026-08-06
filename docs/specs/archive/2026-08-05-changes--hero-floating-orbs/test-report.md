# Test Report — Hero floating ambient orbs

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/hero-floating-orbs/` |
| Date | 2026-08-05 |
| Overall status | **PASS** (automated frontend unit) · HITL visual / OS-motion gaps accepted |
| Leader | `/akili-test` (inline — Lite depth) |
| Testers spawned | 0 (Deployment Rule: Lite → inline) |
| Skills | `angular-developer` |
| Effort | medium |

## Summary

Client-only change. Automated proof is Angular Vitest (`npm run test:agent`).

| Suite | Status | Evidence |
|-------|--------|----------|
| Frontend unit | **PASS** | lint quiet · **194/194** tests · 26 files |
| Backend unit | **N/A** | Phase 1 — no `server/` |
| Integration (API) | **N/A** | No Nest/leads API |
| E2E | **BLOCKED** | No E2E runner in `client/package.json` (not invented here) |

**Answer first:** REQ-001…003 and NFR-001…003 have automated evidence for jsdom-provable clauses. Soft circular glow and brand-first composition remain **HITL** (design.md §9). No `PRODUCT_BUG`.

**Gap-fill this run:** one `durationSec` override assertion in `ambient-orbs.spec.ts` (closed T001 advisory #5). Author-era tests from `/akili-execute` cited, not rewritten.

---

## Backend Unit Tests

**N/A — phase 1.**

---

## Frontend Unit Tests

### Commands

```text
cd client && npm run lint -- --quiet
cd client && npm run test:agent
```

### Results

| Command | Result |
|---------|--------|
| lint `--quiet` | PASS — All files pass linting |
| `test:agent` | PASS — 26 files / **194** tests |

### Cited author coverage (`/akili-execute`)

| File | Guards |
|------|--------|
| `ambient-orbs.spec.ts` | Default count 8; size [300,560]; input overrides; clamp; `aria-hidden`; `pointer-events: none`; pause via MotionService; colors override |
| `hero-section.spec.ts` | Mount under `.parallax-layer` + live `span.orb`; parallax factor; reduced-motion clear; CTA count; no card/badge/stat anti-patterns |

### Added this run

| File | Guard |
|------|--------|
| `ambient-orbs.spec.ts` | `durationSec` override bounds on `animationDuration` (REQ-001 input contract) |

---

## Integration Tests

**N/A** as a separate suite. Hero ↔ AmbientOrbs mount is covered inside frontend unit.

---

## E2E Tests

**BLOCKED — missing infrastructure.** No Playwright/Cypress (etc.) in `client/package.json`. Choosing a runner is a TRD decision — not mid-test.

**Manual substitute:** HITL checklist — soft circular orbs (not square); brand-first first viewport; OS `prefers-reduced-motion` toggle.

---

## Coverage & Traceability

| Requirement | Scenario / clause | Test Type | Test File or Command | Result | Gap or Notes |
|-------------|-------------------|-----------|----------------------|--------|--------------|
| REQ-001 | Mount HITL defaults (8 · 300–560) | frontend unit | `ambient-orbs.spec.ts` | PASS | Mean duration ~16s wording vs formula scatter — accepted advisory (mock parity) |
| REQ-001 | Inputs override count/size/duration/colors | frontend unit | `ambient-orbs.spec.ts` | PASS | |
| REQ-001 | MUST NOT require GSAP | structural | grep `gsap` under `core/ambient` → none; CSS `@keyframes` only | PASS | |
| REQ-001 | Drop-in without HeroSection; no auto-mount | structural + unit | Component in `core/ambient/`; only hero imports it | PASS | Future sections not in scope |
| REQ-002 | Orbs behind brand/CTAs in parallax host | frontend unit | `hero-section.spec.ts` mount test | PASS | Visual dominance = HITL |
| REQ-002 | Parallax contract preserved | frontend unit | `hero-section.spec.ts` DD-015 suite | PASS | |
| REQ-002 | MUST keep brand/CTAs only interactive job | frontend unit | anti-pattern + CTA tests | PASS | |
| REQ-002 | must NOT add cards/badges/chips/overlays | frontend unit | `hero-section.spec.ts` | PASS | |
| REQ-002 | must NOT change nav/CTA/FAB geometry (KZ-001) | review + diff | `execution.md` T002 Reviewer PASS | PASS | Diff confined to hero ambient wire-up |
| REQ-002 | Dual-radial plate removed (DD-HFO-005) | CSS review | `.parallax-layer` no dual radial; `.hero__bg` wash kept | PASS | |
| REQ-003 | Orbit paused under reduced-motion | frontend unit | `ambient-orbs.spec.ts` | PASS | OS toggle = HITL |
| REQ-003 | Decorative: `aria-hidden` + no pointer capture | frontend unit | `ambient-orbs.spec.ts` | PASS | |
| NFR-001 | Gold/ink token colors | CSS review | `DEFAULT_COLORS` gold/gold-soft/cool ink rgba | PASS | |
| NFR-002 | ambient-orbit ~16s class | unit + CSS | `durationSec` default 16; `@keyframes ambient-orbit` | PASS | |
| NFR-003 | CSS/DOM only (DD-005) | structural | no GSAP import | PASS | |

---

## Remediation

None required for archive of automated gates.

---

## Accepted Gaps

| Gap | Reason | Follow-up |
|-----|--------|-----------|
| Soft circular glow (not square) | No reliable jsdom gate (mock v0.3 clip lesson) | HITL visual before/at archive |
| Brand-first composition | Visual judgment | HITL |
| OS reduced-motion toggle | Unit mocks `MotionService`; MQ defense-in-depth untested in browser | Manual OS toggle |
| E2E journey | No runner scaffolded | Future scaffolding task if product wants browser CI |
| Lighthouse soft gate | NFR soft; not blocking Lite ship | Optional post-ship |
| `durationSec` mean wording vs formula | Scatter mean ~25s at default 16 — matches mock | Doc polish optional; not a FAIL |
