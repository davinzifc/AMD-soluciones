import { DestroyRef, Injectable, inject, signal } from '@angular/core';

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Shared reduced-motion gate (T013 · REQ-010 · design.md §2 "Reduced motion"
 * tactic · DD-005). Every scroll/motion consumer — hero storytelling
 * parallax, services-road deco parallax + progress fill, Trust marquee and
 * testimonial timer — reads `reducedMotion()` instead of calling
 * `matchMedia` inline.
 *
 * Unlike the T009-era `TrustMotionQuery` stub it replaces (which read the
 * preference once at construction and never again), this service subscribes
 * to the media query's `change` event so a mid-session OS-level toggle takes
 * effect immediately across every consumer without a reload. That live
 * toggle is HITL-verifiable only — jsdom cannot dispatch a real OS
 * preference change, so unit coverage instead proves the wiring (initial
 * read + reactive update when the underlying `MediaQueryList` fires) using a
 * stubbed `matchMedia`.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly mediaQuery = MotionService.getMediaQueryList();
  private readonly reducedMotionSignal = signal(this.mediaQuery?.matches ?? false);

  readonly reducedMotion = this.reducedMotionSignal.asReadonly();

  constructor() {
    const mediaQuery = this.mediaQuery;
    if (!mediaQuery) {
      return;
    }
    const handleChange = (event: MediaQueryListEvent): void => this.reducedMotionSignal.set(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', handleChange));
  }

  private static getMediaQueryList(): MediaQueryList | undefined {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    try {
      return window.matchMedia(REDUCE_MOTION_QUERY);
    } catch {
      return undefined;
    }
  }
}
