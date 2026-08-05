import { Component } from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { HeroSection } from '../hero/hero-section';
import { ServicesRoadSection } from '../services-road/services-road-section';

/**
 * Home route (`/`) composition root. Section ids match the Home dual-nav
 * anchor contract (`#inicio`, `#servicios`, `#sobre-amd`, `#confianza`,
 * `#contacto`) already consumed by `MobileDrawer`, `TopNav`'s Contactar CTA,
 * and reserved for the future `HomeSideNav` (T013).
 *
 * `#inicio` is the brand-first `HeroSection` (T006); `#servicios` is the
 * five-group `ServicesRoadSection` (T007). The remaining three sections stay
 * stubs until T008–T010 land.
 */
@Component({
  selector: 'app-home-page',
  imports: [LocalizePipe, HeroSection, ServicesRoadSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
