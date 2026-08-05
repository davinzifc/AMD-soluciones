import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MobileDrawer } from './core/layout/mobile-drawer/mobile-drawer';
import { SiteFooter } from './core/layout/site-footer/site-footer';
import { TopNav } from './core/layout/top-nav/top-nav';
import { WhatsappFab } from './core/layout/whatsapp-fab/whatsapp-fab';

/**
 * App shell host (T004): chrome (TopNav/MobileDrawer/WhatsappFab/SiteFooter)
 * wraps the routed page content. Home-only sidenav is out of scope here (T013).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNav, MobileDrawer, WhatsappFab, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
