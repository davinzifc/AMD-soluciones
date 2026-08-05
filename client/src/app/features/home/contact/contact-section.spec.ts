import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ANALYTICS_PORT, type AnalyticsPort } from '../../../core/analytics/analytics-port';
import { LocaleService } from '../../../core/i18n/locale.service';
import { ContactSection } from './contact-section';

function setup(track = vi.fn()): { fixture: ComponentFixture<ContactSection>; track: ReturnType<typeof vi.fn> } {
  const analytics: AnalyticsPort = { track };
  TestBed.configureTestingModule({
    providers: [
      { provide: LocaleService, useValue: { translate: (key: string) => key, locale: () => 'es' as const } },
      { provide: ANALYTICS_PORT, useValue: analytics },
    ],
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
});
