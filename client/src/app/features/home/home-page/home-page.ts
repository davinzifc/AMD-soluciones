import { Component } from '@angular/core';

import { AboutTeaserSection } from '../about-teaser/about-teaser-section';
import { ContactSection } from '../contact/contact-section';
import { HeroSection } from '../hero/hero-section';
import { ServicesRoadSection } from '../services-road/services-road-section';
import { TrustSection } from '../trust/trust-section';

/**
 * Home route (`/`) composition root. Section ids match the Home dual-nav
 * anchor contract (`#inicio`, `#servicios`, `#sobre-amd`, `#confianza`,
 * `#contacto`) already consumed by `MobileDrawer`, `TopNav`'s Contactar CTA,
 * and the future `HomeSideNav` (T013).
 *
 * `#inicio` is the brand-first `HeroSection` (T006); `#servicios` is the
 * five-group `ServicesRoadSection` (T007); `#sobre-amd` is the short
 * `AboutTeaserSection` (T008); `#confianza` is metrics/marquee/testimonials
 * `TrustSection` (T009); `#contacto` is the WhatsApp/mailto handoff form
 * `ContactSection` (T010) — the last stub replaced.
 */
@Component({
  selector: 'app-home-page',
  imports: [HeroSection, ServicesRoadSection, AboutTeaserSection, TrustSection, ContactSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
