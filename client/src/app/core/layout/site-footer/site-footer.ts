import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../i18n/localize.pipe';

/**
 * Site footer chrome (REQ-002/REQ-014). Legal stub links target real routes
 * wired in T005; the page content itself stays a stub until AMD supplies copy.
 */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
