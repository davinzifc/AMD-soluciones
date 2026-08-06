import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS, ServicesPage } from './services-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(ServicesPage);
  fixture.detectChanges();
  return fixture;
}

describe('ServicesPage', () => {
  it('covers all five ServiceGroupId anchors as element ids (REQ-004/005 traceability)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(SERVICE_GROUP_IDS.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      expect(root.querySelector(`#${id}`)).toBeTruthy();
    }
  });

  it('does not render a nested route outlet for group anchors (fragment, not child route)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeNull();
  });

  it('renders an in-page TOC link for every ServiceGroupId on /services (not Home /#id)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const tocLinks = Array.from(root.querySelectorAll('.toc a')) as HTMLAnchorElement[];

    expect(tocLinks.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      // Plain href="#id" + <base href="/"> resolves to /#id (Home) — must use
      // routerLink="/services" [fragment] so chips stay on the Servicios page.
      const match = tocLinks.find((a) => a.getAttribute('href') === `/services#${id}`);
      expect(match).toBeTruthy();
    }
  });

  it('populates the Contabilidad sub-service catalog from the mockup content (16 items)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('#contabilidad') as HTMLElement;

    expect(article.querySelectorAll('.svc-subs li').length).toBe(16);
    expect(article.textContent).toContain('subC01t');
  });

  it('populates the Gestión Administrativa sub-service catalog from the mockup content (4 items)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('#administrativa') as HTMLElement;

    expect(article.querySelectorAll('.svc-subs li').length).toBe(4);
    expect(article.textContent).toContain('subA01t');
  });

  it('flags Riesgo and Marca sub-services with a visible placeholder note (REQ-005: MAY placeholder)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    const riesgo = root.querySelector('#riesgo') as HTMLElement;
    expect(riesgo.querySelector('.svc-note')?.textContent).toContain('g3Note');
    expect(riesgo.querySelectorAll('.svc-subs li').length).toBeGreaterThan(0);

    const marca = root.querySelector('#marca') as HTMLElement;
    expect(marca.querySelector('.svc-note')?.textContent).toContain('g5Note');
    expect(marca.querySelectorAll('.svc-subs li').length).toBeGreaterThan(0);
  });

  it('does not show a placeholder note on Contabilidad/Administrativa (real content, not placeholder)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    expect((root.querySelector('#contabilidad') as HTMLElement).querySelector('.svc-note')).toBeNull();
    expect((root.querySelector('#administrativa') as HTMLElement).querySelector('.svc-note')).toBeNull();
  });

  it('the "Hablar con un asesor" CTA routes to Home fragment #contacto', () => {
    const fixture = setup();
    const cta = fixture.nativeElement.querySelector('a.btn--gold') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#contacto');
  });

  it('the "Volver al road" link routes to Home fragment #servicios (matches road section id)', () => {
    const fixture = setup();
    const cta = fixture.nativeElement.querySelector('a.btn--ghost') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#servicios');
  });
});
