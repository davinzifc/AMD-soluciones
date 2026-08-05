import { Component } from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { HeroSection } from '../hero/hero-section';

/**
 * Home route (`/`) composition root. Section ids match the Home dual-nav
 * anchor contract (`#inicio`, `#servicios`, `#sobre-amd`, `#confianza`,
 * `#contacto`) already consumed by `MobileDrawer`, `TopNav`'s Contactar CTA,
 * and reserved for the future `HomeSideNav` (T013).
 *
 * `#inicio` is now the real brand-first `HeroSection` (T006); the remaining
 * four sections stay stubs until T007–T010 land.
 */
@Component({
  selector: 'app-home-page',
  imports: [LocalizePipe, HeroSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
