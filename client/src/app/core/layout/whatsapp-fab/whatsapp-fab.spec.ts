import { TestBed } from '@angular/core/testing';

import { LocaleService } from '../../i18n/locale.service';
import { WhatsappFab, WHATSAPP_NUMBER } from './whatsapp-fab';

function setup() {
  TestBed.configureTestingModule({
    providers: [{ provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(WhatsappFab);
  fixture.detectChanges();
  return fixture;
}

describe('WhatsappFab', () => {
  it('renders an anchor with an accessible name from waAria', () => {
    const fixture = setup();
    const link = fixture.nativeElement.querySelector('a.fab') as HTMLAnchorElement;
    expect(link.getAttribute('aria-label')).toBe('waAria');
  });

  it('opens WhatsApp via wa.me with the configured default number', () => {
    const fixture = setup();
    const link = fixture.nativeElement.querySelector('a.fab') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('https://wa.me/573248805290');
  });

  it('opens in a new tab without leaking window.opener', () => {
    const fixture = setup();
    const link = fixture.nativeElement.querySelector('a.fab') as HTMLAnchorElement;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('uses a WHATSAPP_NUMBER override when provided', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocaleService, useValue: { translate: (key: string) => key } },
        { provide: WHATSAPP_NUMBER, useValue: '5710000000' },
      ],
    });
    const fixture = TestBed.createComponent(WhatsappFab);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.fab') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('https://wa.me/5710000000');
  });
});
