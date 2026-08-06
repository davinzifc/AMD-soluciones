import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { HERO_PARALLAX_FACTOR, HeroSection } from './hero-section';

function setup(reduce = false) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: LocaleService, useValue: { translate: (key: string) => key } },
      { provide: MotionService, useValue: { reducedMotion: () => reduce } },
    ],
  });
  const fixture = TestBed.createComponent(HeroSection);
  fixture.detectChanges();
  return fixture;
}

function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, configurable: true });
}

describe('HeroSection', () => {
  it('renders the #inicio fragment scroll target', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#inicio')).toBeTruthy();
  });

  it('brand reads AMD Soluciones with the legal line Integrales S.A.S. (REQ-003)', () => {
    const fixture = setup();
    const brand = fixture.nativeElement.querySelector('.hero__brand') as HTMLElement;
    expect(brand.textContent?.replace(/\s+/g, ' ').trim()).toBe('AMD Soluciones');
    // "Soluciones" carries the gold-emphasis hook (mockup `em` parity).
    expect(brand.querySelector('em')?.textContent).toBe('Soluciones');

    const legal = fixture.nativeElement.querySelector('.hero__legal') as HTMLElement;
    expect(legal.textContent).toContain('brandSub');
  });

  it('renders one promise sentence bound to heroPromise', () => {
    const fixture = setup();
    const promise = fixture.nativeElement.querySelector('.hero__promise') as HTMLElement;
    expect(promise.textContent).toContain('heroPromise');
  });

  it('keeps brand and legal identity before promise and CTAs in DOM order (REQ-003 brand-first structure)', () => {
    const fixture = setup();
    const content = fixture.nativeElement.querySelector('.hero__content') as HTMLElement;
    const children = Array.from(content.children);

    expect(children.map((child) => child.className)).toEqual([
      'hero__brand',
      'hero__legal',
      'hero__promise',
      'hero__cta',
    ]);
  });

  it('primary CTA routes to Home fragment #contacto (heroCtaPrimary)', () => {
    const fixture = setup();
    const primary = fixture.nativeElement.querySelector('a.btn--gold') as HTMLAnchorElement;
    expect(primary.getAttribute('href')).toBe('/#contacto');
    expect(primary.textContent).toContain('heroCtaPrimary');
  });

  it('secondary CTA routes to Home fragment #servicios (heroCtaSecondary)', () => {
    const fixture = setup();
    const secondary = fixture.nativeElement.querySelector('a.btn--ghost') as HTMLAnchorElement;
    expect(secondary.getAttribute('href')).toBe('/#servicios');
    expect(secondary.textContent).toContain('heroCtaSecondary');
  });

  it('contains no cards, stat strips, or floating badges (REQ-003 anti-pattern)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('[class*="card"]').length).toBe(0);
    expect(root.querySelectorAll('[class*="stat"]').length).toBe(0);
    expect(root.querySelectorAll('[class*="badge"]').length).toBe(0);
    expect(root.querySelectorAll('[class*="metric"]').length).toBe(0);
  });

  it('exposes exactly one primary+secondary CTA pair (no extra hero clutter)', () => {
    const fixture = setup();
    const ctas = fixture.nativeElement.querySelectorAll('.hero__cta a');
    expect(ctas.length).toBe(2);
  });

  describe('storytelling parallax (T013 · design.md Motion plan · DD-015)', () => {
    afterEach(() => {
      setScrollY(0);
    });

    it('translates the parallax layer by scrollY * HERO_PARALLAX_FACTOR when motion is allowed', () => {
      const fixture = setup(false);
      const layer = fixture.nativeElement.querySelector('.parallax-layer') as HTMLElement;

      setScrollY(200);
      window.dispatchEvent(new Event('scroll'));

      expect(layer.style.transform).toBe(`translate3d(0, ${200 * HERO_PARALLAX_FACTOR}px, 0)`);
    });

    it('recomputes the transform on further scroll (passive listener, DD-005 — no GSAP)', () => {
      const fixture = setup(false);
      const layer = fixture.nativeElement.querySelector('.parallax-layer') as HTMLElement;

      setScrollY(50);
      window.dispatchEvent(new Event('scroll'));
      expect(layer.style.transform).toBe(`translate3d(0, ${50 * HERO_PARALLAX_FACTOR}px, 0)`);

      setScrollY(400);
      window.dispatchEvent(new Event('scroll'));
      expect(layer.style.transform).toBe(`translate3d(0, ${400 * HERO_PARALLAX_FACTOR}px, 0)`);
    });

    it('never applies a transform under prefers-reduced-motion (REQ-010)', () => {
      const fixture = setup(true);
      const layer = fixture.nativeElement.querySelector('.parallax-layer') as HTMLElement;

      setScrollY(500);
      window.dispatchEvent(new Event('scroll'));

      expect(layer.style.transform).toBe('');
    });
  });
});
