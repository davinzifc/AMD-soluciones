import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS, ServicesPage } from './services-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: LocaleService, useValue: { translate: (key: string) => key } },
    ],
  });
  const fixture = TestBed.createComponent(ServicesPage);
  fixture.detectChanges();
  return fixture;
}

describe('ServicesPage', () => {
  it('covers all five ServiceGroupId anchors as element ids on article elements (REQ-004/005/007, DD-025)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(SERVICE_GROUP_IDS.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      // Anchored to article#<id>: verifies the anchor id is on the real article, not an auxiliary 0px sentinel (DD-025).
      // WHAT THIS DOES NOT PROVE: jsdom does not calculate viewport offsets or actual scroll landing positions.
      const article = root.querySelector(`article#${id}`);
      expect(article).toBeTruthy();
    }
  });

  it('does not render a nested route outlet for group anchors (fragment, not child route)', () => {
    const fixture = setup();
    // Guard against child route regress: group targets are in-page fragments.
    // WHAT THIS DOES NOT PROVE: does not verify router navigation event handling.
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeNull();
  });

  it('renders an in-page TOC rail with exactly 5 links on /services (not Home /#id) (REQ-001, DD-026)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Exactly 5 rail links (guard against duplicate rails across breakpoints in DOM, DD-026).
    // WHAT THIS DOES NOT PROVE: does not verify CSS sticky position, chip styling, or horizontal scrolling in mobile.
    const tocLinks = Array.from(root.querySelectorAll('.rail__list a')) as HTMLAnchorElement[];

    expect(tocLinks.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      // Plain href="#id" + <base href="/"> resolves to /#id (Home) — must use
      // routerLink="/services" [fragment] so chips stay on the Servicios page.
      const match = tocLinks.find((a) => a.getAttribute('href') === `/services#${id}`);
      expect(match).toBeTruthy();
    }
  });

  it('populates the Contabilidad sub-service catalog from catalog data (16 items exact)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('#contabilidad') as HTMLElement;

    // Conteo exacto: 16 items en Contabilidad (gate de facto de NFR-003, nunca relajar a >=).
    // WHAT THIS DOES NOT PROVE: does not verify CSS display:none or visual layout of collapsed rows in jsdom.
    expect(article.querySelectorAll('.subs li').length).toBe(16);

    // Anclado al nodo de título específico de la primera fila (DC-6 fix: no tautológico con textContent).
    // WHAT THIS DOES NOT PROVE: does not test visual text styling or actual human readability.
    const firstTitle = article.querySelector('.subs li .sub__title strong') as HTMLElement;
    expect(firstTitle.textContent?.trim()).toBe('subC01t');
  });

  it('populates the Gestión Administrativa sub-service catalog from catalog data (4 items exact)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('#administrativa') as HTMLElement;

    // Conteo exacto: 4 items (gate de facto de NFR-003, nunca relajar a >=).
    // WHAT THIS DOES NOT PROVE: does not test layout reflow or mobile wrapping.
    expect(article.querySelectorAll('.subs li').length).toBe(4);

    // Anclado al nodo de título específico de la primera fila (DC-6 fix).
    // WHAT THIS DOES NOT PROVE: does not test visual typography.
    const firstTitle = article.querySelector('.subs li .sub__title strong') as HTMLElement;
    expect(firstTitle.textContent?.trim()).toBe('subA01t');
  });

  it('flags Riesgo and Marca sub-services with a visible placeholder note (REQ-005: MAY placeholder)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // WHAT THIS DOES NOT PROVE: does not test visual contrast or client copy validation status.
    const riesgo = root.querySelector('#riesgo') as HTMLElement;
    expect(riesgo.querySelector('.chapter__note')?.textContent).toContain('g3Note');
    expect(riesgo.querySelectorAll('.subs li').length).toBe(4);

    const marca = root.querySelector('#marca') as HTMLElement;
    expect(marca.querySelector('.chapter__note')?.textContent).toContain('g5Note');
    expect(marca.querySelectorAll('.subs li').length).toBe(3);
  });

  it('does not show a placeholder note on Contabilidad/Administrativa (real content, not placeholder)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // WHAT THIS DOES NOT PROVE: does not verify semantic correctness of brochure translations.
    expect((root.querySelector('#contabilidad') as HTMLElement).querySelector('.chapter__note')).toBeNull();
    expect((root.querySelector('#administrativa') as HTMLElement).querySelector('.chapter__note')).toBeNull();
  });

  it('the page-closing "Hablar con un asesor" CTA routes to Home fragment #contacto (anclado a .closer)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Anclado al panel de cierre para no colisionar con los CTAs de capítulo ni del rail (DC-6 fix).
    // WHAT THIS DOES NOT PROVE: does not verify click analytics or browser URL changes.
    const cta = root.querySelector('.closer a.btn--gold') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#contacto');
  });

  it('the page-closing ghost CTA routes to WhatsApp wa.me (anclado a .closer, T008)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Anclado al panel de cierre: sustituye el antiguo backRoad por el CTA de WhatsApp del mockup (T008).
    // WHAT THIS DOES NOT PROVE: does not test external WhatsApp deep-link execution in browser.
    const cta = root.querySelector('.closer a.btn--ghost') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toContain('https://wa.me/');
    expect(cta.getAttribute('href')).not.toContain('servicios');
  });

  it('renders per-chapter CTAs with quote link and WhatsApp link (anclado a .chapter__cta, DC-6 fix)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const contabilidad = root.querySelector('#contabilidad') as HTMLElement;

    // Anclado a los CTAs dentro de #contabilidad (DC-6 fix).
    // WHAT THIS DOES NOT PROVE: does not verify external WhatsApp deep-link execution in browser.
    const goldCta = contabilidad.querySelector('.chapter__cta a.btn--gold') as HTMLAnchorElement;
    expect(goldCta.getAttribute('href')).toContain('servicio=contabilidad');

    const ghostCta = contabilidad.querySelector('.chapter__cta a.btn--ghost') as HTMLAnchorElement;
    expect(ghostCta.getAttribute('href')).toContain('https://wa.me/');
  });

  it('renders all 31 rows in DOM even when Contabilidad is collapsed (NFR-003, DD-019)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // Las 31 filas deben existir en el DOM inicial para SEO y accesibilidad (NFR-003).
    // WHAT THIS DOES NOT PROVE: jsdom does not apply CSS display: none / visibility rules.
    const allRows = root.querySelectorAll('.subs li');
    expect(allRows.length).toBe(31);

    const contabilidadList = root.querySelector('#contabilidad .subs') as HTMLElement;
    expect(contabilidadList.getAttribute('data-collapsed')).toBe('true');
  });

  it('shows progressive disclosure control only on Contabilidad and toggles aria-expanded and data-collapsed', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // Control solo existe si el grupo supera el límite de 6 (solo Contabilidad).
    // WHAT THIS DOES NOT PROVE: does not test CSS animation or transitions.
    expect(root.querySelector('#contabilidad button.more')).toBeTruthy();
    expect(root.querySelector('#administrativa button.more')).toBeNull();
    expect(root.querySelector('#riesgo button.more')).toBeNull();
    expect(root.querySelector('#asesoria button.more')).toBeNull();
    expect(root.querySelector('#marca button.more')).toBeNull();

    const button = root.querySelector('#contabilidad button.more') as HTMLButtonElement;
    const list = root.querySelector('#contabilidad .subs') as HTMLElement;

    // Inicialmente colapsado
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(list.getAttribute('data-collapsed')).toBe('true');

    // Click para desplegar
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(list.getAttribute('data-collapsed')).toBeNull();

    // Click para colapsar
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(list.getAttribute('data-collapsed')).toBe('true');
  });

  it('links each sub-service row to Home #contacto with service and titleKey query params (DD-021)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Anclado a la primera fila de Contabilidad (DC-6 fix).
    // WHAT THIS DOES NOT PROVE: does not verify contact form preselection reception (that is covered by T007).
    const firstRowLink = root.querySelector('#contabilidad .subs li a.sub__link') as HTMLAnchorElement;

    expect(firstRowLink).toBeTruthy();
    const href = firstRowLink.getAttribute('href') ?? '';
    expect(href).toContain('servicio=contabilidad');
    expect(href).toContain('detalle=subC01t');
  });

  it('exposes activeGroup with aria-current on the matching TOC rail link (REQ-001, REQ-010)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // Inicialmente 'contabilidad' está activa en la señal
    // WHAT THIS DOES NOT PROVE: does not test dynamic scroll-spy updates (that is tested below).
    const contabilidadLink = root.querySelector('.rail a[data-rail="contabilidad"]') as HTMLAnchorElement;
    const adminLink = root.querySelector('.rail a[data-rail="administrativa"]') as HTMLAnchorElement;

    expect(contabilidadLink.getAttribute('aria-current')).toBe('true');
    expect(adminLink.getAttribute('aria-current')).toBeNull();
  });

  it('mounts and destroys cleanly without throwing (T005 lifecycle)', () => {
    const fixture = setup();
    // WHAT THIS DOES NOT PROVE: does not test actual browser paint or layout cycle.
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('guards against empty chapter list and does not call resolveActiveChapter or throw (T005 guard)', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    const initialActive = component.activeGroup();

    // Spying querySelectorAll to return empty list simulates environment without chapter articles
    // WHAT THIS DOES NOT PROVE: does not test whether DOM nodes are loaded asynchronously.
    const emptyList = fixture.nativeElement.querySelectorAll('.nonexistent-element');
    const querySpy = vi.spyOn(fixture.nativeElement, 'querySelectorAll').mockReturnValue(emptyList);

    expect(() => component.checkActiveChapter()).not.toThrow();
    expect(component.activeGroup()).toBe(initialActive);

    querySpy.mockRestore();
  });

  it('removes window scroll and resize listeners and cancels pending rAF on destroy (T005 / NFR-001)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const fixture = setup();
    fixture.componentInstance.initScrollSpy();
    fixture.componentInstance.scheduleUpdate();

    fixture.destroy();

    // WHAT THIS DOES NOT PROVE: does not test garbage collection timing in V8.
    const removedScroll = removeSpy.mock.calls.some(([type]) => type === 'scroll');
    const removedResize = removeSpy.mock.calls.some(([type]) => type === 'resize');
    expect(removedScroll).toBe(true);
    expect(removedResize).toBe(true);
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('schedules reading position re-evaluation when toggling group expansion (T005)', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    const scheduleSpy = vi.spyOn(component, 'scheduleUpdate');

    // WHAT THIS DOES NOT PROVE: does not test actual CSS animated expansion duration.
    component.toggleGroup('contabilidad');
    expect(scheduleSpy).toHaveBeenCalled();
  });

  it('updates activeGroup when a different chapter is resolved as active (T005 wiring)', () => {
    const fixture = setup();
    const component = fixture.componentInstance;

    const articles = fixture.nativeElement.querySelectorAll('article.chapter') as NodeListOf<HTMLElement>;
    expect(articles.length).toBe(5);

    // In jsdom without layout, scrollHeight defaults to 0, which makes atBottom true.
    // Stub documentElement.scrollHeight to simulate page content with normal scroll.
    const scrollHeightSpy = vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000);

    // Contabilidad is scrolled past, Riesgo is crossed at reading line
    const offsets: Record<string, number> = {
      contabilidad: -1200,
      administrativa: -600,
      riesgo: 50,
      asesoria: 800,
      marca: 1400,
    };

    const rectSpies = Array.from(articles).map((art) =>
      vi.spyOn(art, 'getBoundingClientRect').mockReturnValue({
        top: offsets[art.id] ?? 1000,
        bottom: (offsets[art.id] ?? 1000) + 200,
        left: 0,
        right: 0,
        width: 100,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect),
    );

    component.checkActiveChapter();
    fixture.detectChanges();

    // WHAT THIS DOES NOT PROVE: jsdom does not calculate true browser CSS offsets or scrolling physics.
    expect(component.activeGroup()).toBe('riesgo');

    scrollHeightSpy.mockRestore();
    rectSpies.forEach((s) => s.mockRestore());
  });

  describe('content fidelity gate (T008 / mockup parity)', () => {
    it('.page-hero contains an eyebrow, an h1, and a .hero-meta with exactly 3 entries', () => {
      const fixture = setup();
      const hero = fixture.nativeElement.querySelector('.page-hero') as HTMLElement;
      // DECLARACIÓN DE QUÉ NO PRUEBA:
      // Este gate verifica que los nodos existen en el DOM según la estructura del mockup,
      // NO que el copy sea el correcto ni que se vea bien en pantalla.
      expect(hero).toBeTruthy();

      const eyebrow = hero.querySelector('.eyebrow');
      const h1 = hero.querySelector('h1');
      const metaItems = hero.querySelectorAll('.hero-meta li');

      expect(eyebrow).toBeTruthy();
      expect(h1).toBeTruthy();
      expect(metaItems.length).toBe(3);
    });

    it('.closer__panel contains an eyebrow, an h2, a paragraph, and exactly 2 CTAs (ghost pointing to wa.me)', () => {
      const fixture = setup();
      const closerPanel = fixture.nativeElement.querySelector('.closer__panel') as HTMLElement;
      // DECLARACIÓN DE QUÉ NO PRUEBA:
      // Este gate verifica que los nodos existen en el DOM según la estructura del mockup,
      // NO que el copy sea el correcto ni que se vea bien en pantalla.
      expect(closerPanel).toBeTruthy();

      const eyebrow = closerPanel.querySelector('.eyebrow');
      const h2 = closerPanel.querySelector('h2');
      const paragraph = closerPanel.querySelector('p:not(.eyebrow)');
      const ctas = closerPanel.querySelectorAll('.closer__cta a');
      const ghostCta = closerPanel.querySelector('.closer__cta a.btn--ghost') as HTMLAnchorElement;

      expect(eyebrow).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(paragraph).toBeTruthy();
      expect(ctas.length).toBe(2);

      expect(ghostCta.getAttribute('href')).toContain('https://wa.me/');
      expect(ghostCta.getAttribute('href')).not.toContain('servicios');
    });
  });
});
