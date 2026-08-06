import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../i18n/locale.service';
import { HomeSideNav } from './home-side-nav';

interface SectionSpec {
  readonly id: string;
  readonly offsetTop: number;
  readonly top: number;
  readonly bottom: number;
  readonly light: boolean;
}

function mockRect(el: HTMLElement, top: number, bottom: number): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom,
    height: bottom - top,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

function appendSection(spec: SectionSpec): HTMLElement {
  const el = document.createElement('div');
  el.id = spec.id;
  if (spec.light) {
    el.classList.add('section--light');
  }
  Object.defineProperty(el, 'offsetTop', { value: spec.offsetTop, configurable: true });
  mockRect(el, spec.top, spec.bottom);
  document.body.appendChild(el);
  return el;
}

function setViewport(scrollY: number, innerHeight: number): void {
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
}

/**
 * Reproduces the mockup `landing.js` layout closely enough to exercise the
 * scroll-spy math: five 800px-tall sections stacked back to back, `servicios`
 * and `confianza` marked `.section--light` (mist sections; the other three
 * stay dark/ink) — same pairing as the real `ServicesRoadSection` /
 * `TrustSection` vs `HeroSection` / `AboutTeaserSection` / `ContactSection`.
 */
function setupSections(scrollY: number): SectionSpec[] {
  const specs: SectionSpec[] = [
    { id: 'inicio', offsetTop: 0, light: false, top: 0 - scrollY, bottom: 800 - scrollY },
    { id: 'servicios', offsetTop: 800, light: true, top: 800 - scrollY, bottom: 1600 - scrollY },
    { id: 'sobre-amd', offsetTop: 1600, light: false, top: 1600 - scrollY, bottom: 2400 - scrollY },
    { id: 'confianza', offsetTop: 2400, light: true, top: 2400 - scrollY, bottom: 3200 - scrollY },
    { id: 'contacto', offsetTop: 3200, light: false, top: 3200 - scrollY, bottom: 4000 - scrollY },
  ];
  specs.forEach(appendSection);
  return specs;
}

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(HomeSideNav);
  fixture.detectChanges();
  return fixture;
}

function linkFor(root: HTMLElement, id: string): HTMLAnchorElement {
  const link = root.querySelector(`a[data-anchor-id="${id}"]`) as HTMLAnchorElement | null;
  if (!link) {
    throw new Error(`sidenav link for "${id}" not found`);
  }
  return link;
}

describe('HomeSideNav', () => {
  afterEach(() => {
    document.querySelectorAll('#inicio, #servicios, #sobre-amd, #confianza, #contacto').forEach((el) => el.remove());
  });

  it('renders exactly the five Home dual-nav anchors, in scroll order, as fragment links on "/"', () => {
    setupSections(0);
    const fixture = setup();
    const links = Array.from(fixture.nativeElement.querySelectorAll('.sidenav a')) as HTMLAnchorElement[];

    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/#inicio',
      '/#servicios',
      '/#sobre-amd',
      '/#confianza',
      '/#contacto',
    ]);
  });

  describe('scroll-spy active anchor (mockup updateSideNav parity)', () => {
    it('marks "inicio" active at the top of the page', () => {
      setupSections(0);
      setViewport(0, 800);
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'inicio').getAttribute('aria-current')).toBe('true');
      expect(linkFor(root, 'servicios').getAttribute('aria-current')).toBe('false');
    });

    it('moves the active anchor to "servicios" once scrolled past its offsetTop threshold', () => {
      // y = scrollY + innerHeight*0.35 = 850 + 280 = 1130 → offsetTop 800 <= 1130 < 1600.
      setupSections(850);
      setViewport(850, 800);
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'servicios').getAttribute('aria-current')).toBe('true');
      expect(linkFor(root, 'inicio').getAttribute('aria-current')).toBe('false');
      expect(linkFor(root, 'sobre-amd').getAttribute('aria-current')).toBe('false');
    });

    it('reaches "contacto" once scrolled to the last section', () => {
      setupSections(3300);
      setViewport(3300, 800);
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'contacto').getAttribute('aria-current')).toBe('true');
    });
  });

  describe('"is-on-light" contrast (REQ-002 sidenav contrast scenario)', () => {
    it('toggles is-on-light per dot based on which section sits under that dot\'s own midpoint', () => {
      const scrollY = 850;
      setupSections(scrollY);
      setViewport(scrollY, 800);
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      // Position each dot's own bounding rect at the vertical midpoint of its
      // own target section (independent of which anchor is "active").
      const midpoints: Record<string, number> = {
        inicio: (0 - scrollY + (800 - scrollY)) / 2,
        servicios: (800 - scrollY + (1600 - scrollY)) / 2,
        'sobre-amd': (1600 - scrollY + (2400 - scrollY)) / 2,
        confianza: (2400 - scrollY + (3200 - scrollY)) / 2,
        contacto: (3200 - scrollY + (4000 - scrollY)) / 2,
      };
      for (const [id, midY] of Object.entries(midpoints)) {
        mockRect(linkFor(root, id), midY - 10, midY + 10);
      }

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'inicio').classList.contains('is-on-light')).toBe(false);
      expect(linkFor(root, 'servicios').classList.contains('is-on-light')).toBe(true);
      expect(linkFor(root, 'sobre-amd').classList.contains('is-on-light')).toBe(false);
      expect(linkFor(root, 'confianza').classList.contains('is-on-light')).toBe(true);
      expect(linkFor(root, 'contacto').classList.contains('is-on-light')).toBe(false);
    });

    it('recomputes is-on-light after a further scroll moves a dot under a different section', () => {
      const scrollY = 850;
      setupSections(scrollY);
      setViewport(scrollY, 800);
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      // Park the "inicio" dot's rect over the light "servicios" section band first…
      mockRect(linkFor(root, 'inicio'), 800 - scrollY + 10, 800 - scrollY + 30);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(linkFor(root, 'inicio').classList.contains('is-on-light')).toBe(true);

      // …then move it back over the dark "inicio" band and re-scroll.
      mockRect(linkFor(root, 'inicio'), 0 - scrollY + 10, 0 - scrollY + 30);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(linkFor(root, 'inicio').classList.contains('is-on-light')).toBe(false);
    });
  });
});
