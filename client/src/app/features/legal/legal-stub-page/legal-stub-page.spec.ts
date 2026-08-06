import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import en from '../../../../assets/i18n/en.json';
import es from '../../../../assets/i18n/es.json';
import { LocaleService } from '../../../core/i18n/locale.service';
import { LegalStubPage } from './legal-stub-page';

function setup(titleKey?: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: LocaleService, useValue: { translate: (key: string) => key } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: titleKey ? { titleKey } : {} } },
      },
    ],
  });
  const fixture = TestBed.createComponent(LegalStubPage);
  fixture.detectChanges();
  return fixture;
}

describe('LegalStubPage', () => {
  it('renders the ftTerms title when route data supplies it (/terms)', () => {
    const fixture = setup('ftTerms');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('ftTerms');
  });

  it('renders the ftPrivacy title when route data supplies it (/privacy)', () => {
    const fixture = setup('ftPrivacy');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('ftPrivacy');
  });

  it('falls back to ftPrivacy when no titleKey is provided', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('ftPrivacy');
  });

  it('exposes a back link to Home', () => {
    const fixture = setup('ftTerms');
    const link = fixture.nativeElement.querySelector('a.btn') as HTMLAnchorElement;
    expect(link.textContent).toContain('backToHome');
    expect(link.getAttribute('href')).toBe('/');
  });

  it('labels both locale surfaces as provisional stubs rather than final signed legal copy (REQ-014)', () => {
    expect(es.legalStubLead).toMatch(/preparación.+versión final/i);
    expect(en.legalStubLead).toMatch(/preparation.+final version/i);
  });
});
