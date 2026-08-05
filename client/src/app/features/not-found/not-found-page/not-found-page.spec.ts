import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { NotFoundPage } from './not-found-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(NotFoundPage);
  fixture.detectChanges();
  return fixture;
}

describe('NotFoundPage', () => {
  it('renders the notFoundTitle heading (real page, not a silent redirect)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('notFoundTitle');
  });

  it('exposes a "Volver al inicio" CTA that links to Home', () => {
    const fixture = setup();
    const cta = fixture.nativeElement.querySelector('a.btn--gold') as HTMLAnchorElement;
    expect(cta.textContent).toContain('backToHome');
    expect(cta.getAttribute('href')).toBe('/');
  });
});
