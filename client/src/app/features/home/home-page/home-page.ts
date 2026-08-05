import { Component } from '@angular/core';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Home route (`/`) composition root (T005 stub). Section ids match the
 * Home dual-nav anchor contract (`#inicio`, `#servicios`, `#sobre-amd`,
 * `#confianza`, `#contacto`) already consumed by `MobileDrawer`, `TopNav`'s
 * Contactar CTA, and reserved for the future `HomeSideNav` (T013). Real
 * section content (Hero, ServicesRoad, AboutTeaser, Trust, Contact) lands in
 * T006–T010 — this stub only guarantees the fragment scroll targets exist.
 */
@Component({
  selector: 'app-home-page',
  imports: [LocalizePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
