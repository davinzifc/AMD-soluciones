import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { MotionService } from '../../../core/motion/motion.service';
import {
  SERVICE_GROUPS,
  type ServiceGroup,
} from '../../services/services-page/services-page';

/**
 * Derives the total catalog services dynamically by summing subs.length across all groups (DD-035).
 * Prevents catalog duplication and drift between Home and /services.
 */
export function deriveCatalogTotal(groups: readonly ServiceGroup[] = SERVICE_GROUPS): number {
  return groups.reduce((acc, g) => acc + g.subs.length, 0);
}

/**
 * Figures band on Home (T009 · REQ-005 · REQ-003 · REQ-011 · REQ-013 · DD-028 · DD-039 · design.md §5.2).
 *
 * Full-bleed dark band (#cifras) with background looping video, scrim overlay,
 * location eyebrow, headline, and three animated counter metrics:
 * 1. "+10" (years accompanying companies)
 * 2. Dynamic catalog count (derived from SERVICE_GROUPS, never hardcoded 31)
 * 3. "100%" (tax calendar compliance)
 *
 * Video behavior:
 * - Ambient background loop without controls, muted, playsinline, preload="none".
 * - Under prefers-reduced-motion: reduce -> stays on poster, video.play() is NEVER called.
 * - Under motion allowed: plays when intersecting (threshold 0.2), pauses when exiting viewport
 *   to conserve CPU and battery.
 * - play() promise rejection is gracefully caught (autoplay policy fallback).
 *
 * Counter behavior:
 * - Under prefers-reduced-motion: reduce -> displays final values from the very first render.
 * - Under motion allowed: animates once over 1100ms with cubic ease-out upon viewport intersection.
 */
@Component({
  selector: 'app-figures-band',
  imports: [LocalizePipe],
  templateUrl: './figures-band.html',
  styleUrl: './figures-band.css',
})
export class FiguresBand implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') private readonly videoEl?: ElementRef<HTMLVideoElement>;
  @ViewChild('metricsList') private readonly metricsEl?: ElementRef<HTMLElement>;

  private readonly motion = inject(MotionService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private videoObserver?: IntersectionObserver;
  private counterObserver?: IntersectionObserver;
  private hasCounted = false;
  private rafIds: number[] = [];

  get totalServices(): number {
    return deriveCatalogTotal(SERVICE_GROUPS);
  }

  readonly metric1 = signal<string>(this.motion.reducedMotion() ? '+10' : '+0');
  readonly metric2 = signal<string>(this.motion.reducedMotion() ? String(this.totalServices) : '0');
  readonly metric3 = signal<string>(this.motion.reducedMotion() ? '100%' : '0%');

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      this.metric1.set('+10');
      this.metric2.set(String(this.totalServices));
      this.metric3.set('100%');
      return;
    }

    this.setupVideo();
    this.setupCounters();
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
    this.counterObserver?.disconnect();
    for (const id of this.rafIds) {
      cancelAnimationFrame(id);
    }
  }

  private setupVideo(): void {
    const video = this.videoEl?.nativeElement;
    const host = this.elementRef.nativeElement;
    if (!video) {
      return;
    }

    const catchAutoplay = (): void => {
      // Browser autoplay policy rejected playback; poster fallback remains visible
    };

    if (typeof IntersectionObserver === 'undefined') {
      video.play()?.catch(catchAutoplay);
      return;
    }

    this.videoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play()?.catch(catchAutoplay);
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.2 },
    );
    this.videoObserver.observe(host);
  }

  private setupCounters(): void {
    const targetEl = this.metricsEl?.nativeElement ?? this.elementRef.nativeElement;

    const startCounters = (): void => {
      if (this.hasCounted) {
        return;
      }
      this.hasCounted = true;
      this.runCount(10, '+', '', (v) => this.metric1.set(v));
      this.runCount(this.totalServices, '', '', (v) => this.metric2.set(v));
      this.runCount(100, '', '%', (v) => this.metric3.set(v));
    };

    if (typeof IntersectionObserver === 'undefined') {
      startCounters();
      return;
    }

    this.counterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startCounters();
            this.counterObserver?.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    this.counterObserver.observe(targetEl);
  }

  private runCount(
    target: number,
    prefix: string,
    suffix: string,
    update: (val: string) => void,
  ): void {
    if (this.motion.reducedMotion() || typeof requestAnimationFrame === 'undefined') {
      update(`${prefix}${target}${suffix}`);
      return;
    }

    let t0: number | null = null;
    const DUR = 1100;
    const step = (t: number): void => {
      if (t0 === null) {
        t0 = t;
      }
      const p = Math.min(1, (t - t0) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      update(`${prefix}${Math.round(target * eased)}${suffix}`);
      if (p < 1) {
        const id = requestAnimationFrame(step);
        this.rafIds.push(id);
      }
    };
    const id = requestAnimationFrame(step);
    this.rafIds.push(id);
  }
}
