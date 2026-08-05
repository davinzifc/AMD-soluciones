import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

interface Leader {
  readonly name: string;
  readonly roleKey: string;
}

/** Leader names are literal (mockup `quienes-somos.html` parity, same in both locales); only the role label localizes. */
const LEADERS: readonly Leader[] = [
  { name: 'Ana María Daza', roleKey: 'roleGg' },
  { name: 'María Camila Sanchez', roleKey: 'roleGc' },
  { name: 'Leidy Yurani Villamil', roleKey: 'roleGf' },
];

/**
 * Quiénes somos deep page (T011 · REQ-006 · design.md §6 Deep pages).
 * Page hero, misión/visión cards, and the three leaders with roles — the
 * full content the Home `AboutTeaserSection` ("Ver más") deliberately
 * defers to this route. No Home section sidenav renders here: `App`'s
 * `.sidenav-host` slot is gated to `/` only (REQ-002).
 */
@Component({
  selector: 'app-about-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {
  protected readonly leaders = LEADERS;
}
