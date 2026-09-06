import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { AboutTeaserSection } from './about-teaser-section';

// Dynamic Node module loader without @types/node dependency (matches ledger-section.spec.ts pattern)
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

  it('renders all five mockup blocks: eyebrow, quote, body, three pillars, and two CTAs (REQ-004, REQ-006)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;

    // 1. eyebrow
    const eyebrow = root.querySelector('.eyebrow.eyebrow--ink');
    expect(eyebrow).toBeTruthy();
    expect(eyebrow?.textContent).toContain('aboutEyebrow');

    // 2. quote
    const quote = root.querySelector('.about__quote');
    expect(quote).toBeTruthy();
    expect(quote?.textContent).toContain('aboutQuote');

    // 3. body
    const body = root.querySelector('.about__body');
    expect(body).toBeTruthy();
    expect(body?.textContent).toContain('aboutLeadBody');

    // 4. exactly three pillars with ord, h3, p
    const pillars = root.querySelectorAll('.pillars li');
    expect(pillars.length).toBe(3);

    const expectedPillars = [
      { ord: '01', title: 'aboutPillar1Title', desc: 'aboutPillar1Desc' },
      { ord: '02', title: 'aboutPillar2Title', desc: 'aboutPillar2Desc' },
      { ord: '03', title: 'aboutPillar3Title', desc: 'aboutPillar3Desc' },
    ];

    pillars.forEach((li, idx) => {
      const ord = li.querySelector('.pillars__ord');
      const h3 = li.querySelector('h3');
      const p = li.querySelector('p');

      expect(ord?.textContent).toContain(expectedPillars[idx].ord);
      expect(h3?.textContent).toContain(expectedPillars[idx].title);
      expect(p?.textContent).toContain(expectedPillars[idx].desc);
    });

    // 5. two CTA buttons with their destinations
    const meetTeam = root.querySelector('.about__cta a.btn--ink') as HTMLAnchorElement;
    expect(meetTeam).toBeTruthy();
    expect(meetTeam.getAttribute('href')).toBe('/about-us');
    expect(meetTeam.textContent).toContain('aboutMeetTeam');

    const contact = root.querySelector('.about__cta a.btn--ghost-ink') as HTMLAnchorElement;
    expect(contact).toBeTruthy();
    expect(contact.getAttribute('href')).toBe('/#contacto');
    expect(contact.textContent).toContain('aboutCta');

    const allCtas = root.querySelectorAll('.about__cta a');
    expect(allCtas.length).toBe(2);
  });

  it('template class inventory contains all mockup classes (REQ-004)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const templatePath = path.resolve(
      rootDir,
      'src/app/features/home/about-teaser/about-teaser-section.html',
    );
    const rawHtml = fs.readFileSync(templatePath, 'utf8');
    const classMatches = rawHtml.matchAll(/class="([^"]+)"/g);
    const classSet = new Set<string>();
    for (const match of classMatches) {
      match[1]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cls) => classSet.add(cls));
    }

    const requiredMockupClasses = [
      'about__lead',
      'about__figure',
      'about__copy',
      'about__quote',
      'about__body',
      'pillars',
      'pillars__ord',
      'about__cta',
      'eyebrow',
      'eyebrow--ink',
      'btn--ink',
      'btn--ghost-ink',
    ];

    for (const cls of requiredMockupClasses) {
      expect(classSet.has(cls), `Missing mockup class "${cls}" in template`).toBe(true);
    }
  });

  it('does not dump the deep-page misión/visión/leaders content on Home (REQ-006 anti-pattern)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const key of ['missionLabel', 'visionLabel', 'leadersTitle']) {
      expect(root.textContent).not.toContain(key);
    }
  });

  it('retired teaser keys (aboutTitle, aboutBody, seeMore) are not referenced in template', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const key of ['aboutTitle', 'aboutBody', 'seeMore']) {
      expect(root.textContent).not.toContain(key);
    }
  });

  it('carries .section--light theme marker on root section (REQ-004, DD-041)', () => {
    const fixture = setup();
    const section = fixture.nativeElement.querySelector('#sobre-amd');
    expect(section).toBeTruthy();
    expect(section.classList.contains('section--light')).toBe(true);
  });

  it('renders figure with responsive image, alt text, and caption via i18n keys (REQ-004, REQ-011)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    const figure = root.querySelector('.about__figure');
    const img = figure?.querySelector('img');
    const figcaption = figure?.querySelector('figcaption');

    expect(figure).toBeTruthy();
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('media/about-asesoria.webp');
    expect(img?.getAttribute('alt')).toBe('aboutFigureAlt');
    expect(figcaption?.textContent).toContain('aboutFigureCaption');
  });

  // ── Reparto de dorado (REQ-009, DD-031) ──────────────────────────────────────
  describe('reparto de dorado en CSS portado (REQ-009, DD-031)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const cssPath = path.resolve(
      rootDir,
      'src/app/features/home/about-teaser/about-teaser-section.css',
    );
    const rawCss = fs.readFileSync(cssPath, 'utf8');
    const cleanCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');

    it('never uses var(--amd-gold) or var(--amd-gold-soft) as color: in about-teaser CSS', () => {
      const lines = cleanCss.split('\n');
      for (const line of lines) {
        if (/(?<![a-zA-Z-])color\s*:/.test(line)) {
          const forbiddenGold = /(?<![a-zA-Z-])color\s*:[^;]*var\(--amd-gold(-soft)?\)(?!\s*-\s*ink)/;
          expect(line).not.toMatch(forbiddenGold);
        }
      }
    });

    it('accent text on .btn--ghost:hover resolves to var(--amd-gold-ink-deep)', () => {
      const match = cleanCss.match(/\.btn--ghost:hover\s*\{([^}]*)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(match![1]).not.toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-soft\)/);
      expect(match![1]).not.toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold\)(?!-ink)/);
    });

    it('eyebrow and pillars__ord resolve to var(--amd-gold-ink-deep) (REQ-009)', () => {
      const eyebrowInkMatch = cleanCss.match(/\.eyebrow--ink\s*\{([^}]*)\}/);
      expect(eyebrowInkMatch).toBeTruthy();
      expect(eyebrowInkMatch![1]).toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(eyebrowInkMatch![1]).not.toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);

      const pillarsOrdMatch = cleanCss.match(/\.pillars__ord\s*\{([^}]*)\}/);
      expect(pillarsOrdMatch).toBeTruthy();
      expect(pillarsOrdMatch![1]).toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(pillarsOrdMatch![1]).not.toMatch(/(?<![a-zA-Z-])color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);
    });

    it('never contains #8a7a2e or #6f6224 literals anywhere in about-teaser CSS (REQ-009)', () => {
      expect(cleanCss).not.toMatch(/#8a7a2e/i);
      expect(cleanCss).not.toMatch(/#6f6224/i);
    });

    it('does not declare aspect-ratio in base CSS (>= 901px) so height derives from text (REQ-004)', () => {
      const [baseCss] = cleanCss.split(/@media/);
      expect(baseCss).not.toMatch(/aspect-ratio/);
    });

    it('declares aspect-ratio: 4 / 3 accompanied by height: auto on img in mobile stacked block (REQ-004)', () => {
      const mediaBlocks = cleanCss.split(/@media\s*/);
      const mobileBlock = mediaBlocks.find((b) => /max-width\s*:\s*(?:899|900)px/.test(b));
      expect(mobileBlock).toBeTruthy();

      const imgMatch = mobileBlock!.match(/\.about-visual\s+img\s*\{([^}]*)\}/);
      expect(imgMatch).toBeTruthy();
      expect(imgMatch![1]).toMatch(/aspect-ratio\s*:\s*4\s*\/\s*3/);
      expect(imgMatch![1]).toMatch(/height\s*:\s*auto/);
    });

    it('orders text before photo in mobile stacked layout (REQ-004, design §5.5)', () => {
      const mediaBlocks = cleanCss.split(/@media\s*/);
      const mobileBlock = mediaBlocks.find((b) => /max-width\s*:\s*(?:899|900)px/.test(b));
      expect(mobileBlock).toBeTruthy();

      const copyMatch = mobileBlock!.match(/\.about-copy\s*\{([^}]*)\}/);
      expect(copyMatch).toBeTruthy();
      const copyOrderMatch = copyMatch![1].match(/order\s*:\s*(\d+)/);
      expect(copyOrderMatch).toBeTruthy();
      const copyOrder = parseInt(copyOrderMatch![1], 10);

      const visualMatch = mobileBlock!.match(/\.about-visual\s*\{([^}]*)\}/);
      expect(visualMatch).toBeTruthy();
      const visualOrderMatch = visualMatch![1].match(/order\s*:\s*(\d+)/);
      expect(visualOrderMatch).toBeTruthy();
      const visualOrder = parseInt(visualOrderMatch![1], 10);

      expect(copyOrder).toBeLessThan(visualOrder);
      expect(copyOrder).toBe(1);
      expect(visualOrder).toBe(2);
    });
  });

  // ── Zero hardcoded Spanish copy in template (REQ-011) ─────────────────────────
  describe('zero hardcoded Spanish copy in template (REQ-011)', () => {
    it('contains no hardcoded Spanish phrases or accented words in raw template text', () => {
      const rootDir = nodeProcess ? nodeProcess.cwd() : '';
      const templatePath = path.resolve(
        rootDir,
        'src/app/features/home/about-teaser/about-teaser-section.html',
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
        'Quiénes somos',
        'Una asesoría',
        'Ver más',
        'Contactar',
      ];

      for (const phrase of forbiddenPhrases) {
        expect(plainText).not.toContain(phrase);
      }

      // No accented Spanish characters in raw text outside interpolations
      expect(plainText).not.toMatch(/[áéíóúÁÉÍÓÚñÑ]/);
    });
  });
});
