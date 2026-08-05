import { Component } from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { AboutTeaserSection } from '../about-teaser/about-teaser-section';
import { HeroSection } from '../hero/hero-section';
import { ServicesRoadSection } from '../services-road/services-road-section';
import { TrustSection } from '../trust/trust-section';

/**
 * Home route (`/`) composition root. Section ids match the Home dual-nav
 * anchor contract (`#inicio`, `#servicios`, `#sobre-amd`, `#confianza`,
 * `#contacto`) already consumed by `MobileDrawer`, `TopNav`'s Contactar CTA,
 * and reserved for the future `HomeSideNav` (T013).
 *
 * `#inicio` is the brand-first `HeroSection` (T006); `#servicios` is the
 * five-group `ServicesRoadSection` (T007); `#sobre-amd` is the short
 * `AboutTeaserSection` (T008); `#confianza` is metrics/marquee/testimonials
 * `TrustSection` (T009). The remaining stub stays until T010 lands.
 */
@Component({
  selector: 'app-home-page',
  imports: [LocalizePipe, HeroSection, ServicesRoadSection, AboutTeaserSection, TrustSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
