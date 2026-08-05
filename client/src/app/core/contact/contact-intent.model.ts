import { SERVICE_GROUP_IDS } from '../../features/services/services-page/services-page';
import type { LocaleId } from '../i18n/locale.model';

/**
 * Selectable service line id (design §3 `ServiceGroupId`). Reused from
 * `ServicesPage` (single source of truth for the five group ids) so the
 * Contact form's optional service select can never drift from the real
 * catalog.
 */
export type ContactServiceId = (typeof SERVICE_GROUP_IDS)[number];

/**
 * Contact handoff payload (REQ-008 / design contract). Fully client-side —
 * this shape only ever feeds a `wa.me` or `mailto:` URL; it is never sent
 * to a server (phase 1 has no leads API, `docs/trd/trd.md` "Fase actual").
 */
export interface ContactIntent {
  readonly fullName: string;
  readonly email: string;
  readonly message: string;
  readonly serviceInterest?: ContactServiceId;
  readonly locale: LocaleId;
}
