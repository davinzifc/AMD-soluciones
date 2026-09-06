import { Component } from '@angular/core';

import { AboutTeaserSection } from '../about-teaser/about-teaser-section';
import { ContactSection } from '../contact/contact-section';
import { FiguresBand } from '../figures/figures-band';
import { HeroSection } from '../hero/hero-section';
import { LedgerSection } from '../ledger/ledger-section';
import { TrustSection } from '../trust/trust-section';

/**
 * Home route (`/`) composition root. Section ids match the Home dual-nav
 * anchor contract (`#inicio`, `#servicios`, `#sobre-amd`, `#cifras`, `#confianza`,
 * `#contacto`) already consumed by `MobileDrawer` and `TopNav`'s Contactar CTA.
 *
 * `#inicio` is the brand-first `HeroSection`; `#servicios` is the
 * editorial `LedgerSection`; `#sobre-amd` is the short
 * `AboutTeaserSection`; `#cifras` is the full-bleed video `FiguresBand`;
 * `#confianza` is metrics/marquee/testimonials `TrustSection`; `#contacto` is
 * the WhatsApp/mailto handoff form `ContactSection`.
 */
@Component({
  selector: 'app-home-page',
  imports: [HeroSection, LedgerSection, AboutTeaserSection, FiguresBand, TrustSection, ContactSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
