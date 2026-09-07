import { AfterViewInit, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../i18n/localize.pipe';
import { probeSectionThemeAt, type SectionTone } from '../../motion/section-theme';
import { getChromeOffset, SUB_HEADER_THRESHOLD_TOLERANCE } from '../chrome-offset';

export interface SectionNavAnchor {
  readonly id: string;
  readonly labelKey: string;
}

/**
 * The six Home section anchors, in document scroll order (DD-029, DD-037, REQ-008, T018).
 * Labels do not repeat the main site page links ("Líneas" vs "Servicios", "Manifiesto" vs "Nosotros", "Arriba" vs "Inicio").
 */
export const SECTION_NAV_ANCHORS: readonly SectionNavAnchor[] = [
  { id: 'inicio', labelKey: 'navSectionInicio' },
  { id: 'servicios', labelKey: 'navServices' },
  { id: 'sobre-amd', labelKey: 'navAbout' },
  { id: 'cifras', labelKey: 'navSectionCifras' },
  { id: 'confianza', labelKey: 'navTrust' },
  { id: 'contacto', labelKey: 'navContact' },
];

/**
 * Sub-header section nav (REQ-008 · DD-029 · DD-030 · DD-037 · §5.4):
 * Single section index replacing the lateral dot rail, visible from 900px,
 * appearing upon scrolling past the hero.
 *
 * - Theme inversion: probes `probeSectionThemeAt` at its own vertical position (100px).
 * - Keyboard accessibility: completely removed from focus order when hidden inside hero.
 * - Active state: publishes `aria-current="true"` on the currently active section anchor.
 * - Breakpoint visibility: controlled strictly via CSS media queries per KZ-002.
 */
@Component({
  selector: 'app-section-nav',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './section-nav.html',
  styleUrl: './section-nav.css',
})
export class SectionNav implements AfterViewInit {
  protected readonly anchors = SECTION_NAV_ANCHORS;

  private readonly destroyRef = inject(DestroyRef);

  private readonly isOnSignal = signal(false);
  readonly isOn = this.isOnSignal.asReadonly();

  private readonly activeIdSignal = signal(SECTION_NAV_ANCHORS[0].id);
  readonly activeId = this.activeIdSignal.asReadonly();

  private readonly isOnLightSignal = signal(false);
  readonly isOnLight = this.isOnLightSignal.asReadonly();

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = (): void => this.updateScrollSpy();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });

    handler();
    const retryId = setTimeout(handler, 0);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      clearTimeout(retryId);
    });
  }

  isActive(id: string): boolean {
    return this.activeIdSignal() === id;
  }

  updateScrollSpy(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // 1. Hero visibility gate (hidden inside hero, appears after exiting, T018)
    const hero = document.getElementById('inicio');
    const chromeH = getChromeOffset();
    if (hero) {
      const heroRect = hero.getBoundingClientRect();
      this.isOnSignal.set(heroRect.bottom <= chromeH + SUB_HEADER_THRESHOLD_TOLERANCE);
    } else {
      this.isOnSignal.set(window.scrollY > chromeH);
    }

    const sectionTones = this.collectSectionTones();
    if (sectionTones.length === 0) {
      this.isOnLightSignal.set(false);
      return;
    }

    // 2. SectionNav theme inversion: probe at its own vertical position (100px viewport offset) per DD-030
    const toneAt100 = probeSectionThemeAt(sectionTones, 100);
    this.isOnLightSignal.set(toneAt100?.isLight ?? false);

    // 3. Active anchor scroll-spy
    const spyY = window.innerHeight ? window.innerHeight * 0.35 : 200;
    let currentId = this.anchors[0].id;
    for (const tone of sectionTones) {
      if (tone.top <= spyY) {
        currentId = tone.id;
      }
    }
    this.activeIdSignal.set(currentId);
  }

  private collectSectionTones(): SectionTone[] {
    const anchorElements = this.anchors
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => el !== null);

    return anchorElements.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.id,
        top: rect.top,
        bottom: rect.bottom,
        isLight: el.classList.contains('section--light'),
      };
    });
  }
}
