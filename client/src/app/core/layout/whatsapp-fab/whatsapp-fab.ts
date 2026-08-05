import { Component, InjectionToken, computed, inject } from '@angular/core';

import { LocalizePipe } from '../../i18n/localize.pipe';

/**
 * WhatsApp E.164 number (digits only, no `+`) used to build the `wa.me` deep link.
 * Overridable per environment; default per design §4/§7: `+57 324 880 5290`.
 * Full contact/analytics wiring (`AnalyticsPort`, form prefill) lands in T010 —
 * this FAB only needs an accessible name and a working WA URL (T004 scope).
 */
export const WHATSAPP_NUMBER = new InjectionToken<string>('WHATSAPP_NUMBER', {
  providedIn: 'root',
  factory: () => '573248805290',
});

const DEFAULT_PREFILL = 'Hola AMD, quiero información';

/**
 * Persistent WhatsApp FAB (REQ-002 / REQ-008 / REQ-013). Fixed bottom-right,
 * offset from the viewport edge so it does not sit on top of primary CTAs.
 */
@Component({
  selector: 'app-whatsapp-fab',
  imports: [LocalizePipe],
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.css',
})
export class WhatsappFab {
  private readonly number = inject(WHATSAPP_NUMBER);

  protected readonly whatsappUrl = computed(
    () => `https://wa.me/${this.number}?text=${encodeURIComponent(DEFAULT_PREFILL)}`,
  );
}
