import { InjectionToken } from '@angular/core';

/**
 * WhatsApp E.164 number (digits only, no `+`) used to build `wa.me` deep
 * links. Default per design §4/§7: `+57 324 880 5290`. Originally declared
 * inline in `WhatsappFab` (T004); centralized here (T010) so the Home
 * Contact form shares the exact same token — `whatsapp-fab.ts` re-exports
 * it for the one existing import site, so no caller needs to change.
 */
export const WHATSAPP_NUMBER = new InjectionToken<string>('WHATSAPP_NUMBER', {
  providedIn: 'root',
  factory: () => '573248805290',
});

/**
 * Mailto fallback inbox (REQ-008 "mailto always visible" even if the
 * WhatsApp popup is blocked). Placeholder public address — swap via
 * `{ provide: CONTACT_MAILTO_INBOX, useValue: '...' }` once AMD confirms
 * the definitive mailbox; kept configurable on purpose.
 */
export const CONTACT_MAILTO_INBOX = new InjectionToken<string>('CONTACT_MAILTO_INBOX', {
  providedIn: 'root',
  factory: () => 'contacto@amdsoluciones.com',
});
