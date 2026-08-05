import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../i18n/locale.service';
import { SiteFooter } from './site-footer';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(SiteFooter);
  fixture.detectChanges();
  return fixture;
}

describe('SiteFooter', () => {
  it('renders the current year in the copyright line', () => {
    const fixture = setup();
    expect(fixture.nativeElement.textContent).toContain(String(new Date().getFullYear()));
  });

  it('exposes Privacidad and Términos legal stub links', () => {
    const fixture = setup();
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.some((a) => a.textContent?.includes('ftPrivacy'))).toBe(true);
    expect(links.some((a) => a.textContent?.includes('ftTerms'))).toBe(true);
  });

  it('exposes page links to Quiénes somos and Servicios', () => {
    const fixture = setup();
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.some((a) => a.textContent?.includes('navAboutPage'))).toBe(true);
    expect(links.some((a) => a.textContent?.includes('navServicesPage'))).toBe(true);
  });
});
