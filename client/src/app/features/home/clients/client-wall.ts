import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { MotionService } from '../../../core/motion/motion.service';
import { CLIENT_LOGOS, ClientLogo } from './client-logos.data';

export const DEFAULT_SPEED_PX_PER_SEC = 42;

/**
 * Pure function: calculates marquee animation duration in seconds from the
 * measured half-track width and speed (REQ-007, DD-033).
 *
 * @param anchoMitad Width of half the track (scrollWidth / 2) in pixels.
 * @param pxPorSegundo Target speed in pixels per second (default: 42 px/s).
 * @returns Duration in seconds (integer), or 0 if inputs are invalid or non-positive.
 */
export function duracion(anchoMitad: number, pxPorSegundo: number = DEFAULT_SPEED_PX_PER_SEC): number {
  if (!Number.isFinite(anchoMitad) || !Number.isFinite(pxPorSegundo) || anchoMitad <= 0 || pxPorSegundo <= 0) {
    return 0;
  }
  return Math.round(anchoMitad / pxPorSegundo);
}

export interface PreparedClientLogo extends ClientLogo {
  readonly logoSafe: SafeStyle;
}

@Component({
  selector: 'app-client-wall',
  imports: [LocalizePipe],
  templateUrl: './client-wall.html',
  styleUrl: './client-wall.css',
  host: {
    '[class.is-reduced-motion]': 'reducedMotion()',
  },
})
export class ClientWall implements AfterViewInit {
  @ViewChild('track') private readonly trackRef?: ElementRef<HTMLElement>;

  private readonly motion = inject(MotionService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly reducedMotion = this.motion.reducedMotion;

  protected readonly clients: readonly PreparedClientLogo[] = CLIENT_LOGOS.map((item) => ({
    ...item,
    logoSafe: this.sanitizer.bypassSecurityTrustStyle(`url(media/logos/${item.slug}.webp)`),
  }));

  ngAfterViewInit(): void {
    this.tuneMarquee();

    if (typeof window !== 'undefined') {
      const onResize = () => this.tuneMarquee();
      window.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));

      if (typeof document !== 'undefined' && 'fonts' in document && document.fonts?.ready) {
        document.fonts.ready.then(() => this.tuneMarquee()).catch(() => undefined);
      }
    }
  }

  tuneMarquee(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) return;
    const half = track.scrollWidth / 2;
    const durSec = duracion(half, DEFAULT_SPEED_PX_PER_SEC);
    if (durSec > 0) {
      track.style.setProperty('--marquee-dur', `${durSec}s`);
    }
  }
}
