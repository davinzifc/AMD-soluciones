import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Wildcard 404 page (`/**`, see `app.routes.ts`). A real routed component —
 * not a silent `redirectTo: '/'` — with a single "Volver al inicio" CTA
 * (REQ-001 / design §6 Routes).
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {}
