import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LocalizePipe } from '../../i18n/localize.pipe';
import { LocaleService } from '../../i18n/locale.service';
import { DrawerStateService } from '../drawer-state.service';
import type { LocaleId } from '../../i18n/locale.model';

/**
 * Glass sticky top nav (REQ-002): brand, site page links, language toggle,
 * Contactar CTA, and the `<900px` hamburger that opens `MobileDrawer`.
 */
@Component({
  selector: 'app-top-nav',
  imports: [RouterLink, RouterLinkActive, LocalizePipe],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css',
})
export class TopNav {
  @ViewChild('menuBtn') private readonly menuBtn?: ElementRef<HTMLButtonElement>;

  protected readonly locale = inject(LocaleService);
  protected readonly drawerState = inject(DrawerStateService);

  protected setLocale(next: LocaleId): void {
    void this.locale.setLocale(next);
  }

  protected toggleDrawer(): void {
    this.drawerState.toggle(this.menuBtn?.nativeElement ?? null);
  }
}
