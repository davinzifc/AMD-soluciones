import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Quiénes somos route (`/about-us`) stub (T005). Misión/visión and the
 * three leaders land in T011; this stub only proves the route resolves.
 * No Home sidenav host renders here — `App`'s `.sidenav-host` slot is
 * gated to `/` only (REQ-002 deep page has no section sidenav).
 */
@Component({
  selector: 'app-about-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {}
