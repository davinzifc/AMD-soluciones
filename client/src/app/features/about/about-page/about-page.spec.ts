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
  it('renders the aboutPageTitle heading and lead (T011 page hero)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('aboutPageTitle');
    expect(root.querySelector('.page-hero p')?.textContent).toContain('aboutPageLead');
  });

  it('renders misión and visión cards (REQ-006)', () => {
    const fixture = setup();
    const cards = fixture.nativeElement.querySelectorAll('.mv-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('missionLabel');
    expect(cards[0].textContent).toContain('missionBody');
    expect(cards[1].textContent).toContain('visionLabel');
    expect(cards[1].textContent).toContain('visionBody');
  });

  it('renders all three leaders by name in the DOM, not only as unused i18n keys (REQ-006 / evidence disqualifier)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const name of ['Ana María Daza', 'María Camila Sanchez', 'Leidy Yurani Villamil']) {
      expect(root.textContent).toContain(name);
    }
  });

  it('renders a role for each leader (i18n)', () => {
    const fixture = setup();
    const leaders = fixture.nativeElement.querySelectorAll('.leader');
    expect(leaders.length).toBe(3);
    expect(leaders[0].textContent).toContain('roleGg');
    expect(leaders[1].textContent).toContain('roleGc');
    expect(leaders[2].textContent).toContain('roleGf');
  });

  it('renders the closing statement (aboutClosing)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('.about-closing')?.textContent).toContain('aboutClosing');
  });

  it('the Contactar CTA routes to the Home #contacto fragment (not a Nest submission)', () => {
    const fixture = setup();
    const cta = fixture.nativeElement.querySelector('a.btn--gold') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#contacto');
    expect(cta.textContent).toContain('aboutCta');
  });

  it('the Ver servicios CTA routes to /services', () => {
    const fixture = setup();
    const ghostLinks = fixture.nativeElement.querySelectorAll('a.btn--ghost') as NodeListOf<HTMLAnchorElement>;
    expect(ghostLinks[0].getAttribute('href')).toBe('/services');
    expect(ghostLinks[0].textContent).toContain('viewServices');
  });

  it('the Volver al Home CTA routes to /', () => {
    const fixture = setup();
    const ghostLinks = fixture.nativeElement.querySelectorAll('a.btn--ghost') as NodeListOf<HTMLAnchorElement>;
    expect(ghostLinks[1].getAttribute('href')).toBe('/');
    expect(ghostLinks[1].textContent).toContain('backHome');
  });

  it('does not render SectionNav on this deep page (REQ-008)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('app-section-nav')).toBeNull();
  });
});
