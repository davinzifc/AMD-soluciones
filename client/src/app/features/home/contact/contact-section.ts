import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ANALYTICS_PORT } from '../../../core/analytics/analytics-port';
import { buildMailtoUrl, buildWhatsAppUrl, openHandoff, type WhatsAppContext } from '../../../core/contact/contact-handoff';
import { CONTACT_MAILTO_INBOX, WHATSAPP_NUMBER } from '../../../core/contact/contact.config';
import type { ContactIntent } from '../../../core/contact/contact-intent.model';
import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS, type ServiceGroupId } from '../../services/services-page/services-page';

interface ServiceOption {
  readonly id: (typeof SERVICE_GROUP_IDS)[number];
  readonly labelKey: string;
}

/** Order/copy mirrors `ServicesPage` groups (design §3 `ServiceGroupId`, REQ-004 order). */
const SERVICE_OPTIONS: readonly ServiceOption[] = [
  { id: 'contabilidad', labelKey: 'g1Title' },
  { id: 'administrativa', labelKey: 'g2Title' },
  { id: 'riesgo', labelKey: 'g3Title' },
  { id: 'asesoria', labelKey: 'g4Title' },
  { id: 'marca', labelKey: 'g5Title' },
];

type RequiredFieldName = 'fullName' | 'email' | 'message';

const isServiceGroupId = (id: string | null): id is ServiceGroupId =>
  typeof id === 'string' && (SERVICE_GROUP_IDS as readonly string[]).includes(id);

/**
 * Home Contact (T010 · REQ-008 · design.md §6 `ContactSection`). Reactive
 * Forms (DD-011) with client-side-only validation, then a WhatsApp handoff
 * (primary) plus a mailto link always visible as a fallback. Never calls a
 * Nest leads API or persists anything — phase 1 has neither
 * (`docs/trd/trd.md` "Fase actual").
 *
 * "Abrir WhatsApp" (mockup `#wa-btn` parity) intentionally skips the full
 * validation gate: it hands off whatever the visitor has typed so far (or
 * just the localized prefill) so the escape hatch to a human never blocks
 * on form completeness. Only the primary Submit path requires a valid
 * form, shows the success toast, and emits `contact_submit`.
 */
@Component({
  selector: 'app-contact-section',
  imports: [ReactiveFormsModule, LocalizePipe],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.css',
})
export class ContactSection {
  protected readonly serviceOptions = SERVICE_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly locale = inject(LocaleService);
  private readonly analytics = inject(ANALYTICS_PORT);
  private readonly number = inject(WHATSAPP_NUMBER);
  protected readonly inboxAddress = inject(CONTACT_MAILTO_INBOX);
  private readonly route = inject(ActivatedRoute, { optional: true });

  private readonly initialServicio: string = (() => {
    try {
      const raw = this.route?.snapshot?.queryParamMap?.get('servicio') ?? null;
      return isServiceGroupId(raw) ? raw : '';
    } catch {
      return '';
    }
  })();

  private readonly initialDetalle: string | null = (() => {
    try {
      return this.route?.snapshot?.queryParamMap?.get('detalle')?.trim() || null;
    } catch {
      return null;
    }
  })();

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    serviceInterest: [this.initialServicio],
    message: [this.initialDetalle ? this.locale.translate(this.initialDetalle) : '', Validators.required],
  });

  private readonly toastVisibleSignal = signal(false);
  protected readonly toastVisible = this.toastVisibleSignal.asReadonly();

  constructor() {
    if (this.initialDetalle) {
      effect(() => {
        // Track locale/dictionary signal updates (REQ-005, KZ-003)
        const dict = typeof this.locale.dictionary === 'function' ? this.locale.dictionary() : null;
        const loc = typeof this.locale.locale === 'function' ? this.locale.locale() : null;
        void dict;
        void loc;
        const translated = this.locale.translate(this.initialDetalle!);
        if (this.form.controls.message.pristine) {
          this.form.controls.message.setValue(translated);
        }
      });
    }
  }

  protected fieldInvalid(name: RequiredFieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Distinguishes "missing" from "malformed" so the announced error matches what actually happened. */
  protected emailErrorKey(): string {
    return this.form.controls.email.errors?.['required'] ? 'errRequired' : 'errEmail';
  }

  /** Recomputed each render from the current (possibly empty/partial) form — the fallback stays accurate even before submit. */
  protected mailtoHref(): string {
    return buildMailtoUrl(this.rawContext(), this.inboxAddress);
  }

  /** "Abrir WhatsApp" — no validation gate (see class doc); still an analytics-tracked handoff. */
  protected openWhatsApp(): void {
    const url = buildWhatsAppUrl(this.rawContext(), this.number, this.locale.translate('waPrefill'));
    openHandoff(url);
    this.analytics.track('whatsapp_click', { source: 'form' });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastVisibleSignal.set(false);
      this.focusFirstInvalidField();
      return;
    }

    const intent = this.buildIntent();
    const url = buildWhatsAppUrl(intent, this.number, this.locale.translate('waPrefill'));
    openHandoff(url);
    this.toastVisibleSignal.set(true);
    this.analytics.track('contact_submit', {
      locale: intent.locale,
      hasService: Boolean(intent.serviceInterest),
    });
  }

  /** REQ-013 keyboard path: an invalid submit must not just paint inline errors — it moves focus to the first offending field, mirroring native form validation UX. */
  private focusFirstInvalidField(): void {
    const order: readonly RequiredFieldName[] = ['fullName', 'email', 'message'];
    const firstInvalid = order.find((name) => this.form.controls[name].invalid);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
  }

  private buildIntent(): ContactIntent {
    const raw = this.form.getRawValue();
    return {
      fullName: raw.fullName,
      email: raw.email,
      message: raw.message,
      serviceInterest: raw.serviceInterest ? (raw.serviceInterest as ContactIntent['serviceInterest']) : undefined,
      locale: this.locale.locale(),
    };
  }

  private rawContext(): WhatsAppContext {
    const raw = this.form.getRawValue();
    return {
      fullName: raw.fullName || undefined,
      email: raw.email || undefined,
      message: raw.message || undefined,
      serviceInterest: raw.serviceInterest ? (raw.serviceInterest as ContactIntent['serviceInterest']) : undefined,
      locale: this.locale.locale(),
    };
  }
}
