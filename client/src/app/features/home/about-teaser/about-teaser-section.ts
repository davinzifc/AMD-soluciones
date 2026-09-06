import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Home About teaser (T008 · REQ-006 · design.md §6 `AboutTeaserSection`).
 * Short visual + copy teaser for `#sobre-amd` — "Ver más" / "See more"
 * routes to the Quiénes somos deep page (`/about-us`, DD-014 English path),
 * which alone carries the full misión/visión/leaders content (T011). This
 * teaser deliberately stops at one lead paragraph; "Contactar" reuses the
 * Home fragment contract (`routerLink="/" fragment="contacto"`) already
 * proven by `HeroSection`/`LedgerSection`.
 */
@Component({
  selector: 'app-about-teaser-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './about-teaser-section.html',
  styleUrl: './about-teaser-section.css',
})
export class AboutTeaserSection {}
