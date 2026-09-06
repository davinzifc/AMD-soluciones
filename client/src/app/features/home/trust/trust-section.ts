import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { ClientWall } from '../clients/client-wall';

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
 * Home Trust (T011 · REQ-006 · REQ-011 · design.md §5.5, §6 · DD-034).
 *
 * Testimonials are read statically without an auto-advancing timer (REQ-006:
 * content must not rotate while being read). The four dots serve as the primary
 * control for navigating quotes manually, each with translated accessible name
 * and programmatic active state (REQ-011).
 *
 * MotionService gates the logo marquee ticker for decorative sectors under
 * prefers-reduced-motion: reduce (.is-reduced-motion class + defense-in-depth
 * media query).
 *
 * Section hierarchy follows three degrees of concreteness:
 * what they say (testimonials) -> who they are (ClientWall) -> where they operate (sectors).
 */
@Component({
  selector: 'app-trust-section',
  imports: [RouterLink, LocalizePipe, ClientWall],
  templateUrl: './trust-section.html',
  styleUrl: './trust-section.css',
})
export class TrustSection {
  protected readonly metrics = METRICS;
  protected readonly logoTrack = [...SECTORS, ...SECTORS];
  protected readonly testimonials = TESTIMONIALS;

  private readonly locale = inject(LocaleService);
  private readonly motion = inject(MotionService);
  protected readonly reducedMotion = this.motion.reducedMotion;

  private readonly activeIndexSignal = signal(0);
  protected readonly activeIndex = this.activeIndexSignal.asReadonly();

  protected isActive(index: number): boolean {
    return this.activeIndexSignal() === index;
  }

  protected testimonialLabel(index: number): string {
    return this.locale.translate('testimonialDotLabel').replace('{n}', String(index + 1));
  }

  /** Dot click: manual selection is the only way to navigate testimonials (REQ-006). */
  protected selectTestimonial(index: number): void {
    this.activeIndexSignal.set(index);
  }
}
