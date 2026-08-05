import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { AboutTeaserSection } from './about-teaser-section';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(AboutTeaserSection);
  fixture.detectChanges();
  return fixture;
}

describe('AboutTeaserSection', () => {
  it('renders the #sobre-amd fragment scroll target', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#sobre-amd')).toBeTruthy();
  });

  it('renders the teaser title and short body copy (REQ-006)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toContain('aboutTitle');
    expect(root.querySelector('.about-copy p')?.textContent).toContain('aboutBody');
  });

  it('"Ver más" routes to the Quiénes somos deep page at /about-us (REQ-006 scenario, not #sobre-amd)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const seeMore = root.querySelector('a.btn--gold') as HTMLAnchorElement;

    expect(seeMore).toBeTruthy();
    expect(seeMore.getAttribute('href')).toBe('/about-us');
    expect(seeMore.textContent).toContain('seeMore');
  });

  it('"Contactar" routes to the Home #contacto fragment', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const contact = root.querySelector('a.btn--ghost') as HTMLAnchorElement;

    expect(contact).toBeTruthy();
    expect(contact.getAttribute('href')).toBe('/#contacto');
    expect(contact.textContent).toContain('aboutCta');
  });

  it('does not dump the deep-page misión/visión/leaders content on Home (REQ-006 anti-pattern)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const key of ['missionLabel', 'visionLabel', 'leadersTitle']) {
      expect(root.textContent).not.toContain(key);
    }
  });

  it('exposes exactly one Ver más + one Contactar action (teaser only, no clutter)', () => {
    const fixture = setup();
    const actions = fixture.nativeElement.querySelectorAll('.about-actions a');
    expect(actions.length).toBe(2);
  });
});
