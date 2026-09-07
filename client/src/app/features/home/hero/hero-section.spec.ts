import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { HERO_PARALLAX_FACTOR, HeroSection } from './hero-section';

interface NodeProcess {
  cwd(): string;
  getBuiltinModule?(name: string): unknown;
}
interface NodeFs {
  readFileSync(path: string, encoding: string): string;
}
interface NodePath {
  resolve(...paths: string[]): string;
}

const nodeProcess = (globalThis as unknown as { process?: NodeProcess }).process;

function getNodeModule<T>(name: string): T {
  if (nodeProcess?.getBuiltinModule) {
    return nodeProcess.getBuiltinModule(name) as T;
  }
  throw new Error(`Cannot load built-in Node module '${name}'`);
}

const fs = getNodeModule<NodeFs>('fs');
const path = getNodeModule<NodePath>('path');

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

  it('mounts AmbientOrbsComponent inside the parallax layer, rendering live orbs (T002 · design.md §9)', () => {
    const fixture = setup();
    const ambientOrbs = fixture.nativeElement.querySelector('.parallax-layer app-ambient-orbs') as HTMLElement;
    expect(ambientOrbs).toBeTruthy();
    expect(ambientOrbs.querySelectorAll('span.orb').length).toBeGreaterThan(0);
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

  describe('hero layout and left alignment (T017 · KZ-007)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const cssPath = path.resolve(rootDir, 'src/app/features/home/hero/hero-section.css');
    const rawCss = fs.readFileSync(cssPath, 'utf8');
    const cleanCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');

    it('hero content container does not declare max-width in CSS, leaving alignment to the left of .wrap', () => {
      const contentMatch = cleanCss.match(/(?<![.\w-])\.hero__content\s*\{([^}]*)\}/);
      expect(contentMatch).toBeTruthy();
      expect(contentMatch![1]).not.toMatch(/max-width/);
    });

    it('hero promise declares max-width: 34rem in CSS to bound copy width without centering container', () => {
      const promiseMatch = cleanCss.match(/(?<![.\w-])\.hero__promise\s*\{([^}]*)\}/);
      expect(promiseMatch).toBeTruthy();
      expect(promiseMatch![1]).toMatch(/max-width\s*:\s*34rem/);
    });

    it('renders scroll indicator as a navigable accessible link to #servicios (T017 · REQ-013)', () => {
      const fixture = setup();
      const scrollLink = fixture.nativeElement.querySelector('a.hero__scroll') as HTMLAnchorElement;

      expect(scrollLink).toBeTruthy();
      expect(scrollLink.getAttribute('href')).toBe('/#servicios');
      expect(scrollLink.getAttribute('aria-hidden')).toBeNull();
      expect(scrollLink.textContent?.trim().length).toBeGreaterThan(0);

      const span = scrollLink.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.textContent).toContain('heroScroll');

      const line = scrollLink.querySelector('i');
      expect(line).toBeTruthy();
      expect(line?.getAttribute('aria-hidden')).toBe('true');
    });

    it('hero scroll rule in CSS is not inert (no pointer-events: none) and declares minimum 44px touch target (REQ-013)', () => {
      const scrollMatch = cleanCss.match(/(?<![.\w-])\.hero__scroll\s*\{([^}]*)\}/);
      expect(scrollMatch).toBeTruthy();
      expect(scrollMatch![1]).not.toMatch(/pointer-events\s*:\s*none/);
      expect(scrollMatch![1]).toMatch(/min-height\s*:\s*44px/);
    });

    it('hero scroll includes decorative line styling in CSS (1px width, 34px height, linear-gradient)', () => {
      const lineMatch = cleanCss.match(/(?<![.\w-])\.hero__scroll\s+i\s*\{([^}]*)\}/);
      expect(lineMatch).toBeTruthy();
      expect(lineMatch![1]).toMatch(/width\s*:\s*1px/);
      expect(lineMatch![1]).toMatch(/height\s*:\s*34px/);
      expect(lineMatch![1]).toMatch(/linear-gradient/);
    });
  });
});
