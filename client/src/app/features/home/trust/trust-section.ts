import { Component, inject, signal } from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { ClientWall } from '../clients/client-wall';

interface Testimonial {
  readonly textKey: string;
  readonly byKey: string;
}

/**
 * 9 sectors from mockup (home-redesign.js:268-276) localized via i18n keys (REQ-011).
 * Duplicated once for the 50% seamless marquee loop -> 18 elements.
 */
const SECTOR_KEYS: readonly string[] = [
  'sectorCommerce',
  'sectorServices',
  'sectorHealthcare',
  'sectorConstruction',
  'sectorTransport',
  'sectorEducation',
  'sectorManufacturing',
  'sectorTechnology',
  'sectorAgribusiness',
];

const TESTIMONIALS: readonly Testimonial[] = [
  { textKey: 'q1', byKey: 'q1By' },
  { textKey: 'q2', byKey: 'q2By' },
  { textKey: 'q3', byKey: 'q3By' },
  { textKey: 'q4', byKey: 'q4By' },
];

/**
 * Home Trust (T015 · REQ-006 · REQ-011 · design.md §5.5, §6 · DD-034 · mockup index.html#confianza).
 *
 * Centered layout with eyebrow, large centered quote with 4 dots (manual navigation only,
 * REQ-006 regression guard), ClientWall, and flat-text ticker of 9 localized sectors (18 items).
 *
 * Metrics cards and CTA button removed per mockup parity (HITL 2026-09-06).
 */
@Component({
  selector: 'app-trust-section',
  imports: [LocalizePipe, ClientWall],
  templateUrl: './trust-section.html',
  styleUrl: './trust-section.css',
})
export class TrustSection {
  protected readonly sectors = [...SECTOR_KEYS, ...SECTOR_KEYS];
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
