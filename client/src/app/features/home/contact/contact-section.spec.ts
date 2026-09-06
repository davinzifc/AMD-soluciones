import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ANALYTICS_PORT, type AnalyticsPort } from '../../../core/analytics/analytics-port';
import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS } from '../../services/services-page/services-page';
import { ContactSection } from './contact-section';

interface SetupOptions {
  readonly track?: ReturnType<typeof vi.fn>;
  readonly queryParams?: Record<string, string>;
  readonly localeService?: {
    translate?: (key: string) => string;
    locale?: unknown;
    dictionary?: unknown;
    [key: string]: unknown;
  };
}

function setup(optionsOrTrack: SetupOptions | ReturnType<typeof vi.fn> = {}): {
  fixture: ComponentFixture<ContactSection>;
  track: ReturnType<typeof vi.fn>;
} {
  const opts: SetupOptions = typeof optionsOrTrack === 'function' ? { track: optionsOrTrack } : optionsOrTrack;
  const track = opts.track ?? vi.fn();
  const analytics: AnalyticsPort = { track: track as AnalyticsPort['track'] };

  const defaultLocaleService = {
    translate: (key: string) => key,
    locale: () => 'es' as const,
  };

  const providers = [
    { provide: LocaleService, useValue: opts.localeService ?? defaultLocaleService },
    { provide: ANALYTICS_PORT, useValue: analytics },
    ...(opts.queryParams
      ? [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParamMap: convertToParamMap(opts.queryParams),
              },
            },
          },
        ]
      : []),
  ];

  TestBed.configureTestingModule({
    providers,
  });
  const fixture = TestBed.createComponent(ContactSection);
  fixture.detectChanges();
  return { fixture, track };
}

function fillValidForm(fixture: ComponentFixture<ContactSection>): void {
  const root = fixture.nativeElement as HTMLElement;
  const setValue = (id: string, value: string, eventName: 'input' | 'change' = 'input') => {
    const el = root.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    el.value = value;
    el.dispatchEvent(new Event(eventName));
  };
  setValue('fullName', 'Ana Pérez');
  setValue('email', 'ana@example.com');
  // <select> value accessors listen for "change", not "input".
  setValue('service', 'contabilidad', 'change');
  setValue('message', 'Necesito asesoría contable');
  fixture.detectChanges();
}

describe('ContactSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the #contacto fragment scroll target', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('#contacto')).toBeTruthy();
  });

  describe('invalid submit (REQ-008)', () => {
    it('shows inline field errors, does not open a handoff, and does not emit contact_submit', () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
      const { fixture, track } = setup();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelectorAll('.field-error').length).toBeGreaterThan(0);
      expect(openSpy).not.toHaveBeenCalled();
      expect(track).not.toHaveBeenCalledWith('contact_submit', expect.anything());
      expect(root.querySelector('.toast')).toBeNull();
    });

    it('associates the invalid field with its error via aria-describedby / aria-invalid (focus management)', () => {
      const { fixture } = setup();
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#fullName') as HTMLInputElement;
      expect(nameInput.getAttribute('aria-invalid')).toBe('true');
      expect(nameInput.getAttribute('aria-describedby')).toBe('fullName-error');
      expect(fixture.nativeElement.querySelector('#fullName-error')).toBeTruthy();
    });

    it('moves focus to the first invalid field (fullName) on invalid submit (REQ-013 keyboard path)', () => {
      const { fixture } = setup();
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#fullName') as HTMLInputElement;
      expect(document.activeElement).toBe(nameInput);
    });

    it('flags an invalid email format (errEmail) distinctly from a missing one (errRequired)', () => {
      const { fixture } = setup();
      const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
      email.value = 'not-an-email';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('#email-error');
      expect(error?.textContent).toContain('errEmail');
    });
  });

  describe('valid submit (REQ-008 successful handoff)', () => {
    it('opens a wa.me handoff with the number + encoded context, emits contact_submit, and shows the toast', () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
      const { fixture, track } = setup();
      fillValidForm(fixture);

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(openSpy).toHaveBeenCalledTimes(1);
      const [url, target, features] = openSpy.mock.calls[0] as [string, string, string];
      expect(target).toBe('_blank');
      expect(features).toContain('noopener');
      expect(url).toContain('https://wa.me/573248805290?text=');

      const text = decodeURIComponent(url.split('?text=')[1]);
      expect(text).toContain('Ana Pérez');
      expect(text).toContain('ana@example.com');
      expect(text).toContain('contabilidad');
      expect(text).toContain('Necesito asesoría contable');
      expect(text).toContain('es');

      expect(track).toHaveBeenCalledWith('contact_submit', expect.objectContaining({ locale: 'es', hasService: true }));
      expect(fixture.nativeElement.querySelector('.toast')).toBeTruthy();
    });

    it('hands off client-side without issuing a fetch or XHR request to a Nest leads API (REQ-008 phase boundary)', () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
      vi.spyOn(window, 'open').mockReturnValue(null);
      const { fixture } = setup();
      fillValidForm(fixture);

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrOpenSpy).not.toHaveBeenCalled();
    });

    it('clears the earlier inline errors once the form becomes valid', () => {
      const { fixture } = setup();
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBeGreaterThan(0);

      vi.spyOn(window, 'open').mockReturnValue(null);
      fillValidForm(fixture);
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(0);
    });
  });

  describe('"Abrir WhatsApp" form button (mockup #wa-btn parity)', () => {
    it('opens a WhatsApp handoff and emits whatsapp_click without requiring a valid form', () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
      const { fixture, track } = setup();

      const waBtn = fixture.nativeElement.querySelector('.form__actions .btn--ghost') as HTMLButtonElement;
      waBtn.click();
      fixture.detectChanges();

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith('whatsapp_click', expect.objectContaining({ source: 'form' }));
      expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(0);
    });
  });

  describe('mailto fallback (REQ-008 "always visible")', () => {
    it('renders a working mailto link even before the form is touched', () => {
      const { fixture } = setup();
      const link = fixture.nativeElement.querySelector('.mailto-fallback') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toContain('mailto:contacto@amdsoluciones.com');
    });
  });

  describe('service preselection & query parameters (T007 · REQ-005 · design §4)', () => {
    it('preselects the service line when servicio corresponds to a valid ServiceGroupId (REQ-005)', () => {
      const { fixture } = setup({ queryParams: { servicio: 'contabilidad' } });
      const select = fixture.nativeElement.querySelector('#service') as HTMLSelectElement;

      // WHAT THIS DOES NOT PROVE: does not test user interaction or click event in the native select control.
      expect(select).toBeTruthy();
      expect(select.value).toBe('contabilidad');
    });

    it('preselects each of the five valid ServiceGroupIds accurately', () => {
      for (const id of SERVICE_GROUP_IDS) {
        TestBed.resetTestingModule();
        const { fixture } = setup({ queryParams: { servicio: id } });
        const select = fixture.nativeElement.querySelector('#service') as HTMLSelectElement;

        // WHAT THIS DOES NOT PROVE: does not verify change events being triggered on manual user selection.
        expect(select).toBeTruthy();
        expect(select.value).toBe(id);
      }
    });

    it('silently ignores invalid servicio=noexiste without throwing, leaving default unselected state (robustness gate)', () => {
      let threw = false;
      let fixture: ComponentFixture<ContactSection> | undefined;
      try {
        fixture = setup({ queryParams: { servicio: 'noexiste' } }).fixture;
      } catch {
        threw = true;
      }

      // WHAT THIS DOES NOT PROVE: does not test server-side query parameter sanitization.
      expect(threw).toBe(false);
      // WHAT THIS DOES NOT PROVE: does not test component lifecycle hooks after initial render.
      expect(fixture).toBeDefined();

      const select = fixture!.nativeElement.querySelector('#service') as HTMLSelectElement;
      // WHAT THIS DOES NOT PROVE: does not test whether invalid query parameters are stripped from the browser URL bar.
      expect(select).toBeTruthy();
      // Distinguishes "ignorado correctamente" (empty string) from "roto" (e.g. accepting invalid value or crashing).
      expect(select.value).toBe('');
      const form = (fixture!.componentInstance as unknown as { form: { controls: { serviceInterest: { value: string } } } }).form;
      expect(form.controls.serviceInterest.value).toBe('');
    });

    it('prefills message with localized sub-service when detalle key is provided (REQ-005)', () => {
      const dictionary: Record<string, string> = {
        subC06t: 'Declaraciones',
      };
      const { fixture } = setup({
        queryParams: { servicio: 'contabilidad', detalle: 'subC06t' },
        localeService: {
          translate: (key: string) => dictionary[key] ?? key,
          locale: () => 'es' as const,
          dictionary: signal(dictionary).asReadonly(),
        },
      });

      const textarea = fixture.nativeElement.querySelector('#message') as HTMLTextAreaElement;
      // WHAT THIS DOES NOT PROVE: does not verify user perception or spell-checking of the localized copy.
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('Declaraciones');
    });

    it('survives language switch: updates prefilled message to the new locale when untouched (REQ-005, KZ-003)', () => {
      const dictSignal = signal<Record<string, string>>({
        subC06t: 'Declaraciones',
      });
      const localeSignal = signal<'es' | 'en'>('es');
      const mockLocale = {
        translate: (key: string) => dictSignal()[key] ?? key,
        locale: localeSignal.asReadonly(),
        dictionary: dictSignal.asReadonly(),
      };

      const { fixture } = setup({
        queryParams: { servicio: 'contabilidad', detalle: 'subC06t' },
        localeService: mockLocale,
      });

      const select = fixture.nativeElement.querySelector('#service') as HTMLSelectElement;
      const textarea = fixture.nativeElement.querySelector('#message') as HTMLTextAreaElement;

      // Initial ES state
      // WHAT THIS DOES NOT PROVE: does not verify network HTTP latency of dictionary download.
      expect(textarea).toBeTruthy();
      // WHAT THIS DOES NOT PROVE: does not test browser dropdown option list rendering.
      expect(select).toBeTruthy();
      expect(textarea.value).toBe('Declaraciones');
      expect(select.value).toBe('contabilidad');

      // Switch language to EN
      dictSignal.set({ subC06t: 'Tax returns' });
      localeSignal.set('en');
      fixture.detectChanges();

      // WHAT THIS DOES NOT PROVE: does not verify typography or layout shifting during language transition.
      expect(textarea.value).toBe('Tax returns');
      // Service preselection survives intact across language change
      expect(select.value).toBe('contabilidad');
    });

    it('does not overwrite user message customizations when language switches if message is dirty', () => {
      const dictSignal = signal<Record<string, string>>({
        subC06t: 'Declaraciones',
      });
      const localeSignal = signal<'es' | 'en'>('es');
      const mockLocale = {
        translate: (key: string) => dictSignal()[key] ?? key,
        locale: localeSignal.asReadonly(),
        dictionary: dictSignal.asReadonly(),
      };

      const { fixture } = setup({
        queryParams: { servicio: 'contabilidad', detalle: 'subC06t' },
        localeService: mockLocale,
      });

      const textarea = fixture.nativeElement.querySelector('#message') as HTMLTextAreaElement;
      // User modifies the message
      textarea.value = 'Texto personalizado sobre declaraciones';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Switch language to EN
      dictSignal.set({ subC06t: 'Tax returns' });
      localeSignal.set('en');
      fixture.detectChanges();

      // WHAT THIS DOES NOT PROVE: does not verify undo/redo stack in the browser.
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('Texto personalizado sobre declaraciones');
    });

    it('preselects service and leaves message empty when arriving from line CTA (only servicio, no detalle) (REQ-006)', () => {
      const { fixture } = setup({ queryParams: { servicio: 'riesgo' } });
      const select = fixture.nativeElement.querySelector('#service') as HTMLSelectElement;
      const textarea = fixture.nativeElement.querySelector('#message') as HTMLTextAreaElement;

      // WHAT THIS DOES NOT PROVE: does not test smooth scrolling behavior to the anchor.
      expect(select).toBeTruthy();
      // WHAT THIS DOES NOT PROVE: does not test autofocus behavior on message field.
      expect(textarea).toBeTruthy();
      expect(select.value).toBe('riesgo');
      expect(textarea.value).toBe('');
    });

    it('leaves form in default state when no query parameters are present (regression check)', () => {
      const { fixture } = setup();
      const select = fixture.nativeElement.querySelector('#service') as HTMLSelectElement;
      const textarea = fixture.nativeElement.querySelector('#message') as HTMLTextAreaElement;

      // WHAT THIS DOES NOT PROVE: does not verify form restoration from previous browser session.
      expect(select).toBeTruthy();
      // WHAT THIS DOES NOT PROVE: does not test form validation on untouched fields.
      expect(textarea).toBeTruthy();
      expect(select.value).toBe('');
      expect(textarea.value).toBe('');
    });

    it('does not call any backend API or emit extra analytics on query param preselection (phase 1 boundary, ADR-003)', () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const track = vi.fn();

      const { fixture } = setup({
        track,
        queryParams: { servicio: 'contabilidad', detalle: 'subC06t' },
      });

      // WHAT THIS DOES NOT PROVE: does not verify third-party tracking scripts loaded outside Angular.
      expect(fixture.nativeElement.querySelector('#contacto')).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(track).not.toHaveBeenCalled();
    });
  });
});
