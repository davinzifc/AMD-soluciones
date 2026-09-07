import { Component, OnDestroy, effect, inject, signal } from '@angular/core';

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
 * Reading pause for auto-advancing testimonials (T018 · T019 · REQ-006 · DD-034).
 * Reverted by HITL 2026-09-06: testimonials advance automatically every 6s,
 * but halt when hovered or focused so text is never replaced while being read.
 */
export const TESTIMONIAL_PAUSE_MS = 6000;

/**
 * Home Trust (T018 · REQ-006 · REQ-011 · design.md §5.5, §6 · DD-034 · mockup index.html#confianza).
 *
 * Centered layout with eyebrow, large centered quote with 4 dots and 9s auto-advance
 * with hover/focus-within pause, ClientWall, and flat-text ticker of 9 localized sectors (18 items).
 */
@Component({
  selector: 'app-trust-section',
  imports: [LocalizePipe, ClientWall],
  templateUrl: './trust-section.html',
  styleUrl: './trust-section.css',
})
export class TrustSection implements OnDestroy {
  protected readonly sectors = [...SECTOR_KEYS, ...SECTOR_KEYS];
  protected readonly testimonials = TESTIMONIALS;

  private readonly locale = inject(LocaleService);
  private readonly motion = inject(MotionService);
  protected readonly reducedMotion = this.motion.reducedMotion;

  private readonly activeIndexSignal = signal(0);
  protected readonly activeIndex = this.activeIndexSignal.asReadonly();

  private readonly isHoveredSignal = signal(false);
  protected readonly isHovered = this.isHoveredSignal.asReadonly();

  private readonly isFocusedSignal = signal(false);
  protected readonly isFocused = this.isFocusedSignal.asReadonly();

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    effect(() => {
      this.restartTimer();
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  protected onPointerEnter(): void {
    this.isHoveredSignal.set(true);
  }

  protected onPointerLeave(): void {
    this.isHoveredSignal.set(false);
  }

  protected onFocusIn(): void {
    this.isFocusedSignal.set(true);
  }

  protected onFocusOut(event?: FocusEvent): void {
    const currentTarget = event?.currentTarget as HTMLElement | null;
    const relatedTarget = event?.relatedTarget as Node | null;
    if (relatedTarget && currentTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    this.isFocusedSignal.set(false);
  }

  protected isActive(index: number): boolean {
    return this.activeIndexSignal() === index;
  }

  protected testimonialLabel(index: number): string {
    return this.locale.translate('testimonialDotLabel').replace('{n}', String(index + 1));
  }

  /** Dot click: manual selection sets active quote and resets the reading pause (REQ-006 · T018). */
  protected selectTestimonial(index: number): void {
    this.activeIndexSignal.set(index);
    this.restartTimer();
  }

  private restartTimer(): void {
    this.clearTimer();
    const isPaused = this.reducedMotion() || this.isHoveredSignal() || this.isFocusedSignal();
    if (isPaused || this.testimonials.length < 2) {
      return;
    }
    this.timer = setInterval(() => {
      this.activeIndexSignal.update((current) => (current + 1) % this.testimonials.length);
    }, TESTIMONIAL_PAUSE_MS);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
