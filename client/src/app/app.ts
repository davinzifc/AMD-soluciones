import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { MobileDrawer } from './core/layout/mobile-drawer/mobile-drawer';
import { SiteFooter } from './core/layout/site-footer/site-footer';
import { TopNav } from './core/layout/top-nav/top-nav';
import { WhatsappFab } from './core/layout/whatsapp-fab/whatsapp-fab';

/**
 * App shell host (T004): chrome (TopNav/MobileDrawer/WhatsappFab/SiteFooter)
 * wraps the routed page content.
 *
 * T005 Home-vs-deep shell flag: `isHomeRoute` (same URL check as
 * `MobileDrawer`) drives two things reserved for T013's `HomeSideNav`,
 * without implementing the sidenav itself here:
 * - `body.has-side-nav` toggles on navigation (design §6 breakpoint table).
 * - an empty `.sidenav-host` slot renders inside `<main>` only on `/`.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNav, MobileDrawer, WhatsappFab, SiteFooter],
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

  /** True only on Home (`/`) — no Home section sidenav host on deep pages (REQ-002). */
  protected readonly isHomeRoute = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '/' || path === '';
  });

  constructor() {
    effect(() => {
      document.body.classList.toggle('has-side-nav', this.isHomeRoute());
    });
  }
}
