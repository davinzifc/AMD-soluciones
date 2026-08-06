// @akili-spec docs/specs/changes/hero-floating-orbs
import { Component, computed, inject, input } from '@angular/core';

import { MotionService } from '../../motion/motion.service';

/** Default HITL palette (gold / gold-soft / cool ink) — `docs/ux-ui/design.md` §7 tokens (NFR-001). */
const DEFAULT_COLORS: readonly string[] = [
  'rgba(207, 187, 102, 0.42)', // --amd-gold
  'rgba(229, 213, 154, 0.32)', // --amd-gold-soft
  'rgba(45, 58, 70, 0.55)', // cool ink (parity with the hero parallax plate it replaces)
];

interface AmbientOrb {
  readonly id: number;
  readonly sizePx: number;
  readonly topPct: number;
  readonly leftPct: number;
  readonly background: string;
  readonly blurPx: number;
  readonly transformOrigin: string;
  readonly durationSec: number;
  readonly delaySec: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * AmbientOrbsComponent (T001 · REQ-001, REQ-003 · NFR-001…003 · design.md
 * DD-HFO-001…004) — reusable soft orbital bokeh field. Ports the mockup
 * `ambient-orbs.js`/`.css` (Mamboleoo rotate + radial-gradient/blur discs)
 * into an Angular standalone component so any positioned background host
 * can mount it via inputs, without depending on `HeroSection` (REQ-001
 * drop-in scenario).
 *
 * `aria-hidden` and `pointer-events: none` live on the host element itself
 * (see `ambient-orbs.css` `:host`) so the field never joins the a11y tree
 * or intercepts pointer/keyboard interaction (REQ-003 decorative-only
 * scenario). Orbit motion is CSS-only (`@keyframes ambient-orbit`, ~16s —
 * NFR-002/NFR-003, DD-HFO-001) — no GSAP.
 *
 * Reduced motion is gated twice (DD-HFO-004): the `is-paused` host class
 * (driven by `MotionService.reducedMotion()`, mirrored on every orb's
 * inline `animation-play-state` for a CSS-independent test seam) plus the
 * `@media (prefers-reduced-motion: reduce)` rule in `ambient-orbs.css` as
 * defense-in-depth for visitors this component's own reactive gate never
 * reaches (e.g. a mid-navigation OS toggle before `MotionService` settles).
 */
@Component({
  selector: 'app-ambient-orbs',
  imports: [],
  templateUrl: './ambient-orbs.html',
  styleUrl: './ambient-orbs.css',
  host: {
    'aria-hidden': 'true',
    '[class.is-paused]': 'paused()',
  },
})
export class AmbientOrbsComponent {
  readonly count = input(8);
  readonly sizeMin = input(300);
  readonly sizeMax = input(560);
  readonly durationSec = input(16);
  readonly colors = input<readonly string[] | undefined>(undefined);

  private readonly motion = inject(MotionService);

  protected readonly paused = computed(() => this.motion.reducedMotion());

  protected readonly orbs = computed<readonly AmbientOrb[]>(() => this.buildOrbs());

  private buildOrbs(): readonly AmbientOrb[] {
    const rawMin = this.sizeMin();
    const rawMax = this.sizeMax();
    const sizeMin = Math.min(rawMin, rawMax);
    const sizeMax = Math.max(rawMin, rawMax);
    const count = Math.max(1, Math.floor(this.count()));
    const baseDuration = Math.max(1, this.durationSec());
    const colors = this.colors() ?? DEFAULT_COLORS;

    return Array.from({ length: count }, (_, index) => {
      const sizePx = randomBetween(sizeMin, sizeMax);
      const duration = randomBetween(baseDuration * 0.85, baseDuration * 1.55) + baseDuration * 0.35;

      return {
        id: index,
        sizePx,
        topPct: randomBetween(5, 75),
        leftPct: randomBetween(5, 75),
        background: `radial-gradient(circle at 50% 50%, ${pick(colors)} 0%, transparent 68%)`,
        blurPx: Math.max(18, sizePx * 0.12),
        transformOrigin: `${randomBetween(-22, 22)}vw ${randomBetween(-22, 22)}vh`,
        durationSec: duration,
        delaySec: -randomBetween(0, duration),
      };
    });
  }
}
