import { TestBed } from '@angular/core/testing';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import {
  SERVICE_GROUPS,
  type ServiceGroup,
} from '../../services/services-page/services-page';
import { FiguresBand, deriveCatalogTotal } from './figures-band';

// Dynamic Node module loader without @types/node dependency (matches about-teaser-section.spec.ts)
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

function setup(reduced = false) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: LocaleService,
        useValue: {
          translate: (key: string) => key,
          locale: () => 'es' as const,
        },
      },
      {
        provide: MotionService,
        useValue: {
          reducedMotion: () => reduced,
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(FiguresBand);
  fixture.detectChanges();
  return fixture;
}

describe('FiguresBand', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ── 1. Video attributes & controls absence (REQ-005) ─────────────────────────
  describe('video element attributes and controls absence (REQ-005)', () => {
    it('carries muted, loop, playsinline, poster, preload="none" and does NOT carry controls', () => {
      const fixture = setup();
      const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

      expect(video).toBeTruthy();
      expect(video.hasAttribute('muted')).toBe(true);
      expect(video.hasAttribute('loop')).toBe(true);
      expect(video.hasAttribute('playsinline')).toBe(true);
      expect(video.getAttribute('poster')).toBe('media/manifiesto-poster.webp');
      expect(video.getAttribute('src')).toBe('media/manifiesto.mp4');
      expect(video.getAttribute('preload')).toBe('none');
      expect(video.getAttribute('aria-hidden')).toBe('true');
      expect(video.getAttribute('tabindex')).toBe('-1');

      // Genuine absence of controls attribute (falsifiable with controls added)
      expect(video.hasAttribute('controls')).toBe(false);
      expect(video.getAttribute('controls')).toBeNull();
    });
  });

  // ── 2. Reduced motion (REQ-005) ──────────────────────────────────────────────
  describe('reduced motion behavior (REQ-005)', () => {
    it('does not play the video and displays final metric values on initial render', () => {
      const playSpy = vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined as unknown as void);

      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;

      // Video play() must NEVER be invoked under prefers-reduced-motion
      expect(playSpy).not.toHaveBeenCalled();

      // Metrics display final values from the very first render
      const metricElements = root.querySelectorAll('.band__metrics li b');
      expect(metricElements.length).toBe(3);

      const expectedCatalogTotal = deriveCatalogTotal(SERVICE_GROUPS);
      expect(metricElements[0].textContent?.trim()).toBe('+10');
      expect(metricElements[1].textContent?.trim()).toBe(String(expectedCatalogTotal));
      expect(metricElements[2].textContent?.trim()).toBe('100%');
    });
  });

  // ── 3. Section id and theme tone (REQ-003, DD-028) ───────────────────────────
  describe('section id and tone marker (REQ-003, DD-028)', () => {
    it('has id="cifras" and does NOT carry .section--light', () => {
      const fixture = setup();
      const section = fixture.nativeElement.querySelector('section#cifras');

      expect(section).toBeTruthy();
      expect(section.classList.contains('band')).toBe(true);
      // Punctuation dark section: must not carry .section--light
      expect(section.classList.contains('section--light')).toBe(false);
    });
  });

  // ── 4. Derived catalog total (REQ-005, DD-035) ───────────────────────────────
  describe('derived catalog total service count (REQ-005, DD-035)', () => {
    it('derives total services dynamically from SERVICE_GROUPS (fails if hardcoded to literal 31)', () => {
      const fixture = setup();
      const component = fixture.componentInstance;
      const expectedTotal = SERVICE_GROUPS.reduce((acc, g) => acc + g.subs.length, 0);

      // Must equal the dynamic sum across SERVICE_GROUPS, not a disconnected literal
      expect(component.totalServices).toBe(expectedTotal);

      // Verify dynamic derivation: altering catalog entries causes totalServices to reflect the change
      const firstGroup = SERVICE_GROUPS[0] as unknown as { subs: unknown[] };
      const originalSubs = firstGroup.subs;
      try {
        firstGroup.subs = [...originalSubs, { titleKey: 'extra', descKey: 'extraDesc' }];
        expect(component.totalServices).toBe(expectedTotal + 1);
        expect(component.totalServices).not.toBe(31);
      } finally {
        firstGroup.subs = originalSubs;
      }
    });

    it('deriveCatalogTotal sums arbitrary service group catalog inputs', () => {
      const mockGroups: ServiceGroup[] = [
        {
          id: 'contabilidad',
          titleKey: 'g1Title',
          leadKey: 'g1Lead',
          subs: [
            { titleKey: 'sub1', descKey: 'desc1' },
            { titleKey: 'sub2', descKey: 'desc2' },
          ],
        },
      ];
      expect(deriveCatalogTotal(mockGroups)).toBe(2);
      expect(deriveCatalogTotal(mockGroups)).not.toBe(31);
    });
  });

  // ── 5. IntersectionObserver video playback & pause ────────────────────────────
  describe('IntersectionObserver video handling when motion is allowed', () => {
    it('plays video upon intersection and pauses upon exiting viewport', () => {
      const callbacks: IntersectionObserverCallback[] = [];
      class StubIO {
        constructor(cb: IntersectionObserverCallback) {
          callbacks.push(cb);
        }
        observe(): void {
          /* no-op */
        }
        unobserve(): void {
          /* no-op */
        }
        disconnect(): void {
          /* no-op */
        }
        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
        readonly root = null;
        readonly rootMargin = '';
        readonly thresholds = [];
      }
      vi.stubGlobal('IntersectionObserver', StubIO);

      const playSpy = vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined as unknown as void);
      const pauseSpy = vi.spyOn(HTMLVideoElement.prototype, 'pause').mockImplementation(() => undefined);

      const fixture = setup(false);
      const videoCallback = callbacks[0];
      expect(videoCallback).toBeDefined();

      // Enter viewport: isIntersecting = true
      videoCallback(
        [{ isIntersecting: true, target: fixture.nativeElement } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(playSpy).toHaveBeenCalled();

      // Exit viewport: isIntersecting = false
      videoCallback(
        [{ isIntersecting: false, target: fixture.nativeElement } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('falls back to immediate play() when IntersectionObserver is undefined', () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      const playSpy = vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined as unknown as void);

      setup(false);
      expect(playSpy).toHaveBeenCalled();
    });
  });

  // ── 6. Zero hardcoded Spanish copy in template (REQ-011) ───────────────────────
  describe('zero hardcoded Spanish copy in template (REQ-011)', () => {
    it('contains no hardcoded Spanish phrases or accented words in raw template text', () => {
      const rootDir = nodeProcess ? nodeProcess.cwd() : '';
      const templatePath = path.resolve(
        rootDir,
        'src/app/features/home/figures/figures-band.html',
      );
      const rawHtml = fs.readFileSync(templatePath, 'utf8');

      // Strip comments
      const withoutComments = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
      // Strip Angular expressions {{ ... }} and HTML tags <...>
      const plainText = withoutComments
        .replace(/\{\{[\s\S]*?\}\}/g, '')
        .replace(/<[^>]+>/g, ' ');

      const forbiddenPhrases = [
        'Cali',
        'Colombia',
        'Diez años',
        'cerrando libros',
        'a tiempo',
        'años',
        'acompañando',
        'empresas',
        'servicios',
        'catálogo',
        'cumplimiento',
        'calendario',
        'tributario',
      ];

      for (const phrase of forbiddenPhrases) {
        expect(plainText).not.toContain(phrase);
      }

      // No accented Spanish characters in raw text outside interpolations
      expect(plainText).not.toMatch(/[áéíóúÁÉÍÓÚñÑ]/);
    });
  });
});
