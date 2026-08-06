import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Shared legal stub page (REQ-014). Both `/privacy` and `/terms`
 * (see `app.routes.ts`) load this same component and only differ by the
 * `titleKey` in route `data` — avoids duplicating the identical stub shell.
 * Body is an explicit "content pending" placeholder, never invented final
 * legal copy.
 */
@Component({
  selector: 'app-legal-stub-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './legal-stub-page.html',
  styleUrl: './legal-stub-page.css',
})
export class LegalStubPage {
  protected readonly titleKey = (inject(ActivatedRoute).snapshot.data['titleKey'] as string | undefined) ?? 'ftPrivacy';
}
