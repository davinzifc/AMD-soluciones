import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { MobileDrawer } from './core/layout/mobile-drawer/mobile-drawer';
import { SectionNav } from './core/layout/section-nav/section-nav';
import { SiteFooter } from './core/layout/site-footer/site-footer';
import { TopNav } from './core/layout/top-nav/top-nav';
import { WhatsappFab } from './core/layout/whatsapp-fab/whatsapp-fab';

/**
 * App shell host (T004): chrome (TopNav/MobileDrawer/WhatsappFab/SiteFooter)
 * wraps the routed page content.
 *
 * Home-vs-deep shell flag (T003): `isHomeRoute` gates `SectionNav`
 * rendering inside `<main>` only on `/` (REQ-008).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNav, MobileDrawer, WhatsappFab, SiteFooter, SectionNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** True only on Home (`/`) — gates SectionNav mounting on Home (REQ-008). */
  protected readonly isHomeRoute = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '/' || path === '';
  });
}
