import { TestBed } from '@angular/core/testing';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { CLIENT_LOGOS } from './client-logos.data';
import { ClientWall, duracion } from './client-wall';

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
      {
        provide: LocaleService,
        useValue: {
          translate: (key: string) => (key === 'clientsLabel' ? 'Empresas que ya operan con AMD' : key),
        },
      },
      {
        provide: MotionService,
        useValue: {
          reducedMotion: () => reduce,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ClientWall);
  fixture.detectChanges();
  return fixture;
}

describe('ClientWall', () => {
  // ── 1. Estructura de cinta y duplicación para bucle (REQ-007, Trampa 3) ─────────
  describe('estructura de cinta y accesibilidad (REQ-007, Trampa 3)', () => {
    it('renders exactly 26 items in track, exactly 13 with aria-hidden="true", and zero role="img" inside duplicates', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const trackItems = root.querySelectorAll('.clients__track > li');

      // 1. Exactamente 26 elementos en total (13 originales + 13 duplicados)
      expect(trackItems.length).toBe(26);

      // 2. Exactamente 13 marcados aria-hidden="true"
      const hiddenItems = root.querySelectorAll('.clients__track > li[aria-hidden="true"]');
      expect(hiddenItems.length).toBe(13);

      const originalItems = Array.from(trackItems).filter((li) => !li.hasAttribute('aria-hidden'));
      expect(originalItems.length).toBe(13);

      // 3. CERO role="img" dentro de la copia duplicada
      for (const hiddenLi of Array.from(hiddenItems)) {
        const rolesInCopy = hiddenLi.querySelectorAll('[role="img"]');
        expect(rolesInCopy.length).toBe(0);
      }
    });

    it('all 13 originals have accessible name with reason social matching CLIENT_LOGOS exactly', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const originalItems = Array.from(root.querySelectorAll('.clients__track > li')).filter(
        (li) => !li.hasAttribute('aria-hidden'),
      );

      expect(originalItems.length).toBe(13);
      expect(CLIENT_LOGOS.length).toBe(13);

      CLIENT_LOGOS.forEach((expectedLogo, index) => {
        const li = originalItems[index];
        const span = li.querySelector('.clients__logo');
        expect(span).toBeTruthy();
        expect(span?.getAttribute('role')).toBe('img');
        expect(span?.getAttribute('aria-label')).toBe(expectedLogo.name);
      });
    });
  });

  // ── 2. Sanitización y preservación de url() en --logo (Trampa de Angular) ───────
  describe('preservación de url() en variable CSS --logo (Trampa de Angular)', () => {
    it('retains url() with correct asset path in rendered DOM for all 13 client logos', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const originalSpans = Array.from(root.querySelectorAll('.clients__track > li:not([aria-hidden]) .clients__logo'));

      expect(originalSpans.length).toBe(13);

      CLIENT_LOGOS.forEach((expectedLogo, index) => {
        const span = originalSpans[index] as HTMLElement;
        const logoVar = span.style.getPropertyValue('--logo');

        expect(logoVar).toBeTruthy();
        expect(logoVar).toContain(`media/logos/${expectedLogo.slug}.webp`);
        expect(logoVar).toMatch(/^url\(["']?media\/logos\/.*\.webp["']?\)$/);

        // Optical w and h properties
        expect(span.style.getPropertyValue('--w')).toBe(String(expectedLogo.w));
        expect(span.style.getPropertyValue('--h')).toBe(String(expectedLogo.h));
      });
    });
  });

  // ── 3. Reduced-motion retícula estática (REQ-007) ──────────────────────────────
  describe('prefers-reduced-motion y retícula estática (REQ-007)', () => {
    it('sets animation to none and keeps all 13 originals visible while hiding duplicates', () => {
      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;
      const track = root.querySelector('.clients__track') as HTMLElement;

      expect(track).toBeTruthy();
      expect(track.style.animation).toBe('none');

      const originalItems = Array.from(root.querySelectorAll('.clients__track > li:not([aria-hidden])'));
      const duplicateItems = Array.from(root.querySelectorAll('.clients__track > li[aria-hidden="true"]'));

      expect(originalItems.length).toBe(13);
      expect(duplicateItems.length).toBe(13);

      // Los 13 originales permanecen visibles
      for (const orig of originalItems) {
        expect((orig as HTMLElement).style.display).not.toBe('none');
      }

      // La copia duplicada queda oculta (display: none)
      for (const dup of duplicateItems) {
        expect((dup as HTMLElement).style.display).toBe('none');
      }
    });
  });

  // ── 4. Función pura duracion(anchoMitad, pxPorSegundo) (Trampa 2) ───────────────
  describe('función pura duracion(anchoMitad, pxPorSegundo) (Trampa 2)', () => {
    it('calculates expected duration for standard half-track widths at 42 px/s', () => {
      // 420 px / 42 px/s = 10 s
      expect(duracion(420, 42)).toBe(10);
      // 1000 px / 42 px/s = 23.8 -> 24 s
      expect(duracion(1000, 42)).toBe(24);
      // 1932 px / 42 px/s = 46 s (matches mockup default 46s)
      expect(duracion(1932, 42)).toBe(46);
    });

    it('returns 0 for width 0 without returning NaN or Infinity', () => {
      const dur = duracion(0, 42);
      expect(dur).toBe(0);
      expect(Number.isFinite(dur)).toBe(true);
      expect(Number.isNaN(dur)).toBe(false);
    });

    it('returns 0 for invalid, negative, or non-finite inputs without crashing', () => {
      expect(duracion(-500, 42)).toBe(0);
      expect(duracion(420, 0)).toBe(0);
      expect(duracion(420, -10)).toBe(0);
      expect(duracion(NaN, 42)).toBe(0);
      expect(duracion(420, NaN)).toBe(0);
      expect(duracion(Infinity, 42)).toBe(0);
      expect(duracion(420, Infinity)).toBe(0);
    });

    it('proves constant speed: double width yields double duration', () => {
      const d1 = duracion(600, 50); // 12
      const d2 = duracion(1200, 50); // 24
      expect(d2).toBe(d1 * 2);
    });

    it('tuneMarquee() computes and applies --marquee-dur from track.scrollWidth', () => {
      const fixture = setup(false);
      const comp = fixture.componentInstance;
      const root = fixture.nativeElement as HTMLElement;
      const track = root.querySelector('.clients__track') as HTMLElement;

      // Mock scrollWidth to 840px (half = 420px -> 420 / 42 = 10s)
      Object.defineProperty(track, 'scrollWidth', { value: 840, configurable: true });
      comp.tuneMarquee();

      expect(track.style.getPropertyValue('--marquee-dur')).toBe('10s');
    });
  });

  // ── 5. Reglas CSS, Trampa 1 (sin gap) y fallback @supports ────────────────────
  describe('reglas CSS de la cinta y costura (Trampa 1, DD-032, DD-033)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const cssPath = path.resolve(
      rootDir,
      'src/app/features/home/clients/client-wall.css',
    );
    const rawCss = fs.readFileSync(cssPath, 'utf8');
    const cleanCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');

    it('never uses gap on .clients__track marquee; air is strictly margin-inline on li (Trampa 1)', () => {
      // Split off media queries to inspect base marquee rule
      const [baseCss] = cleanCss.split(/@media/);
      const trackMatch = baseCss.match(/\.clients__track\s*\{([^}]*)\}/);
      expect(trackMatch).toBeTruthy();

      // En la cinta de marquee NO debe haber gap (causa el salto de costura)
      expect(trackMatch![1]).not.toMatch(/(?<![a-zA-Z-])gap\s*:/);

      // El aire se declara estrictamente como margin-inline en los li
      const liMatch = baseCss.match(/\.clients__track\s*>\s*li\s*\{([^}]*)\}/);
      expect(liMatch).toBeTruthy();
      expect(liMatch![1]).toMatch(/margin-inline\s*:\s*1\.75rem/);
    });

    it('pauses animation on :hover and :focus-within (REQ-007)', () => {
      const hoverMatch = cleanCss.match(/\.clients:hover\s+\.clients__track[^{]*\{([^}]*)\}/);
      expect(hoverMatch).toBeTruthy();
      expect(hoverMatch![1]).toMatch(/animation-play-state\s*:\s*paused/);

      const focusMatch = cleanCss.match(/\.clients:focus-within\s+\.clients__track[^{]*\{([^}]*)\}/);
      expect(focusMatch).toBeTruthy();
      expect(focusMatch![1]).toMatch(/animation-play-state\s*:\s*paused/);
    });

    it('runs animation in reverse direction relative to sector ticker (DD-033)', () => {
      const [baseCss] = cleanCss.split(/@media/);
      const trackMatch = baseCss.match(/\.clients__track\s*\{([^}]*)\}/);
      expect(trackMatch).toBeTruthy();
      expect(trackMatch![1]).toMatch(/animation-direction\s*:\s*reverse/);
    });

    it('declares @supports not mask fallback rendering company text via attr(aria-label) (DD-032)', () => {
      const supportsMatch = cleanCss.match(/@supports\s+not\s*\(\s*\(\s*-webkit-mask-image:\s*none\s*\)\s*or\s*\(\s*mask-image:\s*none\s*\)\s*\)\s*\{([\s\S]*?)\n\}/);
      expect(supportsMatch).toBeTruthy();
      expect(supportsMatch![1]).toMatch(/content\s*:\s*attr\(aria-label\)/);
    });

    it('declares reduced-motion wrap grid and hides duplicates in CSS (DD-033)', () => {
      const mediaReducedMatch = cleanCss.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
      expect(mediaReducedMatch).toBeTruthy();
      expect(mediaReducedMatch![1]).toMatch(/flex-wrap\s*:\s*wrap/);
      expect(mediaReducedMatch![1]).toMatch(/max-width\s*:\s*52rem/);
      expect(mediaReducedMatch![1]).toMatch(/li\[aria-hidden=['"]?true['"]?\]\s*\{\s*display\s*:\s*none/);
    });
  });

  // ── 6. Cero literales de texto en plantilla e i18n (REQ-011) ──────────────────
  describe('cero literales en plantilla e i18n (REQ-011)', () => {
    it('uses LocalizePipe with clientsLabel key and renders localized label', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const label = root.querySelector('.clients__label');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Empresas que ya operan con AMD');
    });

    it('has zero hardcoded copy in client-wall.html template', () => {
      const rootDir = nodeProcess ? nodeProcess.cwd() : '';
      const templatePath = path.resolve(
        rootDir,
        'src/app/features/home/clients/client-wall.html',
      );
      const template = fs.readFileSync(templatePath, 'utf8');

      // Zero hardcoded Spanish words in template text nodes
      expect(template).not.toMatch(/>\s*Empresas/i);
      expect(template).not.toMatch(/>\s*operan/i);
      expect(template).not.toMatch(/>\s*Clientes/i);
      // Key is passed to localize pipe
      expect(template).toContain("'clientsLabel' | localize");
    });
  });
});
