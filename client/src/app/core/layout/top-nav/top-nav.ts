import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LocalizePipe } from '../../i18n/localize.pipe';
import { LocaleService } from '../../i18n/locale.service';
import { probeSectionThemeAt, type SectionTone } from '../../motion/section-theme';
import { DrawerStateService } from '../drawer-state.service';
import type { LocaleId } from '../../i18n/locale.model';

const SECTION_ANCHOR_IDS = ['inicio', 'servicios', 'sobre-amd', 'cifras', 'confianza', 'contacto'] as const;

/**
 * Glass sticky top nav (REQ-002, REQ-008, DD-030): brand, site page links,
 * language toggle, Contactar CTA, and the `<900px` hamburger that opens
 * `MobileDrawer`.
 *
 * Inverts chrome (DD-030) over light sections by probing `probeSectionThemeAt`
 * at its own vertical position (40px viewport offset).
 */
@Component({
  selector: 'app-top-nav',
  imports: [RouterLink, RouterLinkActive, LocalizePipe],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css',
})
export class TopNav implements AfterViewInit {
  @ViewChild('menuBtn') private readonly menuBtn?: ElementRef<HTMLButtonElement>;

  protected readonly locale = inject(LocaleService);
  protected readonly drawerState = inject(DrawerStateService);
  private readonly destroyRef = inject(DestroyRef);

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

  protected setLocale(next: LocaleId): void {
    void this.locale.setLocale(next);
  }

  protected toggleDrawer(): void {
    this.drawerState.toggle(this.menuBtn?.nativeElement ?? null);
  }

  updateScrollSpy(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    const sectionTones = this.collectSectionTones();
    if (sectionTones.length === 0) {
      this.isOnLightSignal.set(false);
      return;
    }
    // Probes at TopNav's vertical position: 40px viewport offset (DD-030, REQ-008)
    const tone = probeSectionThemeAt(sectionTones, 40);
    this.isOnLightSignal.set(tone?.isLight ?? false);
  }

  private collectSectionTones(): SectionTone[] {
    const anchorElements = SECTION_ANCHOR_IDS
      .map((id) => document.getElementById(id))
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
