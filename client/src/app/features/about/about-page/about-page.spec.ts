import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { AboutPage } from './about-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(AboutPage);
  fixture.detectChanges();
  return fixture;
}

describe('AboutPage', () => {
  it('renders the aboutPageTitle heading', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('aboutPageTitle');
  });

  it('the Contactar CTA routes to Home fragment #contacto', () => {
    const fixture = setup();
    const cta = fixture.nativeElement.querySelector('a.btn--gold') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#contacto');
  });
});
