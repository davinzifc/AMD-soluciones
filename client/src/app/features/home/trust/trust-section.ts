import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { MotionService } from '../../../core/motion/motion.service';

interface Metric {
  readonly value: string;
  readonly labelKey: string;
}

interface Testimonial {
  readonly textKey: string;
  readonly byKey: string;
}

/** Values are locale-independent (mockup parity); only the labels are i18n keys. */
const METRICS: readonly Metric[] = [
  { value: '10+', labelKey: 'm1' },
  { value: '98%', labelKey: 'm2' },
  { value: 'ES/EN', labelKey: 'm3' },
  { value: 'Cali', labelKey: 'm4' },
];

/** Decorative sector pills (mockup `index.html` `.logo-pill`, `aria-hidden`) — not i18n'd. */
const SECTORS: readonly string[] = [
  'Cripto',
  'Moda',
  'Oro',
  'Educación',
  'Fundaciones',
  'Minimarket',
  'Ploteo',
  'Turismo',
];

const TESTIMONIALS: readonly Testimonial[] = [
  { textKey: 'q1', byKey: 'q1By' },
  { textKey: 'q2', byKey: 'q2By' },
  { textKey: 'q3', byKey: 'q3By' },
  { textKey: 'q4', byKey: 'q4By' },
];

/**
 * Production auto-advance pause (REQ-007 "~9s"; mockup `landing.js` `PAUSE_MS`).
 * Exported so the spec asserts against this single source instead of a
 * duplicated magic number, and so any future speed-up in tests documents
 * itself as a visible deviation from this constant rather than a silent one.
 */
export const TESTIMONIAL_PAUSE_MS = 9000;

/**
 * Home Trust (T009 · REQ-007 · design.md §6 `TrustSection` · DD-008).
 *
 * Two independent motion models on purpose (DD-008): the sector/logo strip
 * is a continuous CSS `logo-marquee` loop, edge-faded only on its own
 * `.logos__viewport` mask — the section title/lead sit outside that wrapper
 * and stay sharp. Testimonials are a timed crossfade (`~9000ms` pause, dots
 * for manual selection), never a horizontal marquee of quotes.
 *
 * `MotionService` (T013; replaces the T009-era `TrustMotionQuery` stub)
 * gates both: under `prefers-reduced-motion: reduce` the marquee loses its
 * CSS animation (`.is-reduced-motion` class + defense-in-depth `@media`
 * rule in the stylesheet) and the testimonial timer is never scheduled at
 * all — content still reaches every quote via the dots (REQ-010 "keep all
 * content ... reachable"). Because `MotionService.reducedMotion` is a live
 * signal (not a one-time read), an `effect()` re-evaluates the timer any
 * time the OS preference changes mid-session, not just once at construction.
 */
@Component({
  selector: 'app-trust-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './trust-section.html',
  styleUrl: './trust-section.css',
})
export class TrustSection {
  protected readonly metrics = METRICS;
  protected readonly logoTrack = [...SECTORS, ...SECTORS];
  protected readonly testimonials = TESTIMONIALS;

  private readonly motion = inject(MotionService);
  protected readonly reducedMotion = this.motion.reducedMotion;

  private readonly activeIndexSignal = signal(0);
  protected readonly activeIndex = this.activeIndexSignal.asReadonly();

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    effect(() => this.restartTimer());
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected isActive(index: number): boolean {
    return this.activeIndexSignal() === index;
  }

  protected testimonialLabel(index: number): string {
    return `Testimonio ${index + 1}`;
  }

  /** Dot click mirrors mockup `showQuote(idx); restartTestimonials();` — manual pick resets the pause window. */
  protected selectTestimonial(index: number): void {
    this.activeIndexSignal.set(index);
    this.restartTimer();
  }

  private restartTimer(): void {
    clearInterval(this.timer);
    const reduce = this.reducedMotion();
    this.timer =
      reduce || this.testimonials.length < 2
        ? undefined
        : setInterval(() => {
            this.activeIndexSignal.update((current) => (current + 1) % this.testimonials.length);
          }, TESTIMONIAL_PAUSE_MS);
  }
}
