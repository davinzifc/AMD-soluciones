import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import en from '../../../../assets/i18n/en.json';
import es from '../../../../assets/i18n/es.json';
import { LocaleService } from '../../i18n/locale.service';
import { TopNav } from '../top-nav/top-nav';
import { SectionNav, SECTION_NAV_ANCHORS } from './section-nav';

interface SectionSpec {
  readonly id: string;
  readonly top: number;
  readonly bottom: number;
  readonly light: boolean;
  readonly height?: number;
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
  const el = document.createElement('section');
  el.id = spec.id;
  if (spec.light) {
    el.classList.add('section--light');
  }
  const height = spec.height ?? (spec.bottom - spec.top);
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true });
  mockRect(el, spec.top, spec.bottom);
  document.body.appendChild(el);
  return el;
}

function setViewport(scrollY: number, innerHeight: number): void {
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
}

const dictionaries: Record<'es' | 'en', Record<string, string>> = {
  es: es as Record<string, string>,
  en: en as Record<string, string>,
};

const activeLocale = signal<'es' | 'en'>('es');

const fakeLocaleService = {
  locale: activeLocale,
  translate: (key: string) => dictionaries[activeLocale()][key] ?? key,
};

function setup(scrollY = 0, innerHeight = 800) {
  setViewport(scrollY, innerHeight);
  const fixture = TestBed.createComponent(SectionNav);
  fixture.detectChanges();
  return { fixture, fakeLocaleService };
}

function linkFor(root: HTMLElement, id: string): HTMLAnchorElement {
  const link = root.querySelector(`a[data-anchor-id="${id}"]`) as HTMLAnchorElement | null;
  if (!link) {
    throw new Error(`SectionNav link for "${id}" not found`);
  }
  return link;
}

/**
 * Filter simulating keyboard sequential focus navigation order (tabbable elements):
 * An anchor is in the keyboard tab order if it is an <a> with href, its effective
 * tabIndex is not negative, it is not inside an [inert] container, and not [hidden].
 */
function getTabbableLinks(root: HTMLElement): HTMLAnchorElement[] {
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));
  return links.filter((link) => {
    if (link.tabIndex < 0 || link.getAttribute('tabindex') === '-1') {
      return false;
    }
    if (link.closest('[inert]') || (link.closest('nav') as HTMLElement & { inert?: boolean })?.inert) {
      return false;
    }
    if (link.closest('[hidden]')) {
      return false;
    }
    return true;
  });
}

describe('SectionNav (T003 · REQ-008 · DD-029 · DD-030 · DD-037)', () => {
  beforeEach(() => {
    activeLocale.set('es');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LocaleService, useValue: fakeLocaleService }],
    });
  });

  afterEach(() => {
    document.querySelectorAll('section, [data-section]').forEach((el) => el.remove());
    vi.restoreAllMocks();
  });

  describe('i18n keys existence in real dictionaries', () => {
    it('all section nav anchor labelKeys and navSectionsAria exist in both es.json and en.json', () => {
      const requiredKeys = [...SECTION_NAV_ANCHORS.map((a) => a.labelKey), 'navSectionsAria'];
      for (const key of requiredKeys) {
        expect((es as Record<string, string>)[key], `Key "${key}" missing in es.json`).toBeDefined();
        expect((en as Record<string, string>)[key], `Key "${key}" missing in en.json`).toBeDefined();
        expect(typeof (es as Record<string, string>)[key]).toBe('string');
        expect(typeof (en as Record<string, string>)[key]).toBe('string');
      }
    });
  });

  describe('KZ-004 ancestry assertion & anchor integrity', () => {
    it('host element directly contains nav.subnav and all six section anchor links', () => {
      const { fixture } = setup();
      const host = fixture.nativeElement as HTMLElement;
      const nav = host.querySelector('nav.subnav');

      // KZ-004 ancestry assertion: host really contains the child nav
      expect(host.contains(nav)).toBe(true);

      const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('a[data-anchor-id]'));
      expect(links.length).toBe(6);

      // Verify each link is genuinely contained in the host and has the correct anchor id & href
      SECTION_NAV_ANCHORS.forEach((anchor, index) => {
        const link = links[index];
        expect(host.contains(link)).toBe(true);
        expect(link.getAttribute('data-anchor-id')).toBe(anchor.id);
        expect(link.getAttribute('href')).toBe(`/#${anchor.id}`);
      });
    });
  });

  describe('keyboard tabulability when hidden inside hero (DD-037 · REQ-008)', () => {
    it('links are NOT tabbable while inside hero, become tabbable upon exiting, and re-hide when reentering hero', () => {
      // Phase 1: Setup hero with 800px height at top of page (scrollY = 0)
      appendSection({ id: 'inicio', top: 0, bottom: 800, light: false, height: 800 });
      appendSection({ id: 'servicios', top: 800, bottom: 1600, light: true, height: 800 });

      const { fixture } = setup(0, 800);
      const root = fixture.nativeElement as HTMLElement;
      const nav = root.querySelector('nav.subnav') as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Inside hero: SectionNav must be inactive
      expect(fixture.componentInstance.isOn()).toBe(false);

      // Tabulability assertion over real focus order, NOT CSS class:
      // 1. Container has inert attribute and property
      expect(nav.hasAttribute('inert')).toBe(true);
      expect((nav as HTMLElement & { inert?: boolean }).inert).toBe(true);

      // 2. Each link has tabIndex == -1 (removed from sequential navigation)
      const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[data-anchor-id]'));
      for (const link of links) {
        expect(link.getAttribute('tabindex')).toBe('-1');
        expect(link.tabIndex).toBe(-1);
      }

      // 3. Tabbable links count is zero (an opacity:0-only mockup defect would fail here)
      expect(getTabbableLinks(root)).toEqual([]);

      // Phase 2: Now scroll past hero (scrollY = 850)
      setViewport(850, 800);
      document.querySelectorAll('section').forEach((el) => el.remove());
      appendSection({ id: 'inicio', top: -850, bottom: -50, light: false, height: 800 });
      appendSection({ id: 'servicios', top: -50, bottom: 750, light: true, height: 800 });

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Scrolled past hero: SectionNav becomes active
      expect(fixture.componentInstance.isOn()).toBe(true);
      expect(nav.hasAttribute('inert')).toBe(false);

      for (const link of links) {
        expect(link.getAttribute('tabindex')).toBeNull();
        expect(link.tabIndex).toBe(0);
      }

      // All 6 links are now in sequential keyboard focus order
      expect(getTabbableLinks(root).length).toBe(6);

      // Phase 3: Scroll back into the hero (scrollY = 0, hero back into view)
      setViewport(0, 800);
      document.querySelectorAll('section').forEach((el) => el.remove());
      appendSection({ id: 'inicio', top: 0, bottom: 800, light: false, height: 800 });
      appendSection({ id: 'servicios', top: 800, bottom: 1600, light: true, height: 800 });

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Back inside hero: SectionNav must become inactive again
      expect(fixture.componentInstance.isOn()).toBe(false);
      expect(nav.hasAttribute('inert')).toBe(true);
      expect((nav as HTMLElement & { inert?: boolean }).inert).toBe(true);

      for (const link of links) {
        expect(link.getAttribute('tabindex')).toBe('-1');
        expect(link.tabIndex).toBe(-1);
      }

      // Tabbable links count returns to zero
      expect(getTabbableLinks(root)).toEqual([]);
    });
  });

  describe('active anchor scroll-spy & aria-current (REQ-008)', () => {
    it('publishes aria-current="true" on the active section and ONLY on it', () => {
      // Five stacked sections
      appendSection({ id: 'inicio', top: 0, bottom: 800, light: false });
      appendSection({ id: 'servicios', top: 800, bottom: 1600, light: true });
      appendSection({ id: 'sobre-amd', top: 1600, bottom: 2400, light: false });
      appendSection({ id: 'cifras', top: 2400, bottom: 3200, light: false });
      appendSection({ id: 'confianza', top: 3200, bottom: 4000, light: true });
      appendSection({ id: 'contacto', top: 4000, bottom: 4800, light: false });

      const { fixture } = setup(0, 800);
      const root = fixture.nativeElement as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Active anchor at top is "inicio"
      expect(linkFor(root, 'inicio').getAttribute('aria-current')).toBe('true');
      expect(linkFor(root, 'servicios').getAttribute('aria-current')).toBeNull();
      expect(linkFor(root, 'sobre-amd').getAttribute('aria-current')).toBeNull();

      // Only ONE element has aria-current="true"
      const currentsTop = root.querySelectorAll('[aria-current="true"]');
      expect(currentsTop.length).toBe(1);
      expect(currentsTop[0]).toBe(linkFor(root, 'inicio'));

      // Scroll so servicios is in the spy range: spyY = innerHeight * 0.35 = 280
      document.querySelectorAll('section').forEach((el) => el.remove());
      appendSection({ id: 'inicio', top: -850, bottom: -50, light: false });
      appendSection({ id: 'servicios', top: -50, bottom: 750, light: true });
      appendSection({ id: 'sobre-amd', top: 750, bottom: 1550, light: false });
      appendSection({ id: 'cifras', top: 1550, bottom: 2350, light: false });
      appendSection({ id: 'confianza', top: 2350, bottom: 3150, light: true });
      appendSection({ id: 'contacto', top: 3150, bottom: 3950, light: false });

      setViewport(850, 800);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'servicios').getAttribute('aria-current')).toBe('true');
      expect(linkFor(root, 'inicio').getAttribute('aria-current')).toBeNull();
      expect(linkFor(root, 'sobre-amd').getAttribute('aria-current')).toBeNull();

      const currentsScrolled = root.querySelectorAll('[aria-current="true"]');
      expect(currentsScrolled.length).toBe(1);
      expect(currentsScrolled[0]).toBe(linkFor(root, 'servicios'));
    });

    it('activates the last section "contacto" when scrolled all the way to it', () => {
      // Stacked sections scrolled to the very end
      appendSection({ id: 'inicio', top: -4000, bottom: -3200, light: false });
      appendSection({ id: 'servicios', top: -3200, bottom: -2400, light: true });
      appendSection({ id: 'sobre-amd', top: -2400, bottom: -1600, light: false });
      appendSection({ id: 'cifras', top: -1600, bottom: -800, light: false });
      appendSection({ id: 'confianza', top: -800, bottom: 0, light: true });
      appendSection({ id: 'contacto', top: 0, bottom: 800, light: false });

      setViewport(4000, 800);
      const { fixture } = setup(4000, 800);
      const root = fixture.nativeElement as HTMLElement;

      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(linkFor(root, 'contacto').getAttribute('aria-current')).toBe('true');
      expect(linkFor(root, 'inicio').getAttribute('aria-current')).toBeNull();
      expect(linkFor(root, 'servicios').getAttribute('aria-current')).toBeNull();
      expect(linkFor(root, 'confianza').getAttribute('aria-current')).toBeNull();

      const currents = root.querySelectorAll('[aria-current="true"]');
      expect(currents.length).toBe(1);
      expect(currents[0]).toBe(linkFor(root, 'contacto'));
    });
  });

  describe('independent theme resolution: TopNav vs SectionNav (DD-030 · REQ-008)', () => {
    it('resolves theme separately: TopNav probes at 40px while SectionNav probes at 100px', () => {
      // Case A:
      // Section 1 (dark, id="inicio"): spans top: 0, bottom: 80
      // Section 2 (light, id="servicios"): spans top: 80, bottom: 200
      appendSection({ id: 'inicio', top: 0, bottom: 80, light: false });
      appendSection({ id: 'servicios', top: 80, bottom: 200, light: true });

      setViewport(0, 800);
      const topNavFixture = TestBed.createComponent(TopNav);
      const sectionNavFixture = TestBed.createComponent(SectionNav);

      topNavFixture.detectChanges();
      sectionNavFixture.detectChanges();

      topNavFixture.componentInstance.updateScrollSpy();
      sectionNavFixture.componentInstance.updateScrollSpy();

      // TopNav at y = 40 falls inside Section 1 (dark) -> isOnLight === false
      expect(topNavFixture.componentInstance['isOnLight']()).toBe(false);

      // SectionNav at y = 100 falls inside Section 2 (light) -> isOnLight === true
      expect(sectionNavFixture.componentInstance.isOnLight()).toBe(true);

      // Case B (inverted):
      // Section 1 (light): spans top: 0, bottom: 60
      // Section 2 (dark): spans top: 60, bottom: 200
      document.querySelectorAll('section').forEach((el) => el.remove());
      appendSection({ id: 'inicio', top: 0, bottom: 60, light: true });
      appendSection({ id: 'servicios', top: 60, bottom: 200, light: false });

      topNavFixture.componentInstance.updateScrollSpy();
      sectionNavFixture.componentInstance.updateScrollSpy();

      // TopNav at y = 40 falls inside Section 1 (light) -> isOnLight === true
      expect(topNavFixture.componentInstance['isOnLight']()).toBe(true);

      // SectionNav at y = 100 falls inside Section 2 (dark) -> isOnLight === false
      expect(sectionNavFixture.componentInstance.isOnLight()).toBe(false);
    });
  });
});
