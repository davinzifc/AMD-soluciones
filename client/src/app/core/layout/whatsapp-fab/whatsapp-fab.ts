import { Component, computed, inject } from '@angular/core';

import { ANALYTICS_PORT } from '../../analytics/analytics-port';
import { WHATSAPP_NUMBER } from '../../contact/contact.config';
import { LocalizePipe } from '../../i18n/localize.pipe';
import { LocaleService } from '../../i18n/locale.service';

/** Re-exported for the existing import site (`WhatsappFab, WHATSAPP_NUMBER`) — token now lives in `core/contact/contact.config.ts` (T010). */
export { WHATSAPP_NUMBER };

/**
 * Persistent WhatsApp FAB (REQ-002 / REQ-008 / REQ-013). Fixed bottom-right,
 * offset from the viewport edge so it does not sit on top of primary CTAs.
 *
 * T010: the prefill text now comes from the active locale's `waPrefill`
 * key instead of a hardcoded Spanish string, and every click emits the
 * `whatsapp_click` analytics stub (NFR-004) before the native anchor
 * navigation opens the chat in a new tab.
 */
@Component({
  selector: 'app-whatsapp-fab',
  imports: [LocalizePipe],
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.css',
})
export class WhatsappFab {
  private readonly number = inject(WHATSAPP_NUMBER);
  private readonly locale = inject(LocaleService);
  private readonly analytics = inject(ANALYTICS_PORT);

  protected readonly whatsappUrl = computed(
    () => `https://wa.me/${this.number}?text=${encodeURIComponent(this.locale.translate('waPrefill'))}`,
  );

  protected onClick(): void {
    this.analytics.track('whatsapp_click', { source: 'fab' });
  }
}
