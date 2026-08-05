import { Injectable } from '@angular/core';

/**
 * Local reduced-motion detector for Home Trust (T009 · REQ-007 · REQ-010).
 *
 * Reads `prefers-reduced-motion` once at construction — enough to gate
 * `TrustSection`'s marquee animation and testimonial auto-advance timer,
 * mirroring the mockup `landing.js` `const reduce = matchMedia(...).matches`
 * capture (not live-watched there either). T013 owns the shared reactive
 * `core/motion` `MotionService` that every scroll/motion consumer (hero
 * parallax, road progress, this pair) will migrate to so a mid-session OS
 * toggle updates everything at once; until then this class is the DI seam
 * `TrustSection` depends on instead of calling `matchMedia()` inline, so
 * specs can override it with `{ provide: TrustMotionQuery, useValue: {...} }`
 * (same pattern already used for `LocaleService` in sibling section specs).
 */
@Injectable({ providedIn: 'root' })
export class TrustMotionQuery {
  readonly reduce: boolean = TrustMotionQuery.readPreference();

  private static readPreference(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }
}
