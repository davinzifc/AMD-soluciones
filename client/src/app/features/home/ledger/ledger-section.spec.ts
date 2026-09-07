import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import {
  SERVICE_GROUPS,
  SERVICE_GROUP_IDS,
  type ServiceGroup,
} from '../../services/services-page/services-page';
import { buildLedgerLines, LedgerSection } from './ledger-section';

// Dynamic Node module loader without @types/node dependency (matches tokens.spec.ts pattern)
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

/**
 * Sentinel dictionary (Option b):
 * Prevents false-green passes when hardcoded Spanish strings exist in template.
 * Any hardcoded text immediately fails against these sentinel tokens.
 */
const SENTINELS: Record<string, string> = {
  ledgerEyebrow: '«LEDGER_EYEBROW»',
  ledgerTitle: '«LEDGER_TITLE»',
  ledgerAllCta: '«ALL_CTA_{n}»',
  ledgerCountUnit: '«UNIT»',
  ledgerHint: '«LEDGER_HINT»',
};

function setup(reduce = false) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: LocaleService,
        useValue: {
          translate: (key: string) => SENTINELS[key] ?? key,
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
  const fixture = TestBed.createComponent(LedgerSection);
  fixture.detectChanges();
  return fixture;
}

function lineFor(root: HTMLElement, id: string): HTMLElement {
  const line = root.querySelector(`.line[data-line="${id}"]`) as HTMLElement | null;
  if (!line) {
    throw new Error(`line[data-line="${id}"] not found in DOM`);
  }
  return line;
}

describe('LedgerSection', () => {
  it('renders the #servicios fragment scroll target with section--light (REQ-002, DD-035)', () => {
    const fixture = setup();
    const section = fixture.nativeElement.querySelector('section#servicios') as HTMLElement;
    expect(section).toBeTruthy();
    expect(section.classList.contains('ledger')).toBe(true);
    expect(section.classList.contains('section--light')).toBe(true);
  });

  // ── ARCHIVED GATE 1: Anti-drift Home ↔ /services ─────────────────────────────
  it('covers all five ServiceGroupId groups as ledger lines (anti-drift guard Home <-> /services)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(SERVICE_GROUP_IDS.length).toBe(5);
    const lines = root.querySelectorAll('.line');
    expect(lines.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      expect(root.querySelector(`.line[data-line="${id}"]`)).toBeTruthy();
    }
  });

  // ── ARCHIVED GATE 2: Deep-links /services#<id> ────────────────────────────────
  describe('"Más info" deep-links (REQ-003: /services#<id> preserves fragment)', () => {
    const expected: Record<(typeof SERVICE_GROUP_IDS)[number], string> = {
      contabilidad: '/services#contabilidad',
      administrativa: '/services#administrativa',
      riesgo: '/services#riesgo',
      asesoria: '/services#asesoria',
      marca: '/services#marca',
    };

    for (const id of SERVICE_GROUP_IDS) {
      it(`"${id}" More info link points to ${expected[id]}`, () => {
        const fixture = setup();
        const root = fixture.nativeElement as HTMLElement;
        const line = lineFor(root, id);
        const link = line.querySelector('a.linkarrow') as HTMLAnchorElement;

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe(expected[id]);
        expect(link.textContent).toContain('moreInfo');
      });
    }
  });

  // ── ARCHIVED GATE 3: Activating "Más info" does not toggle accordion ─────────
  describe('guard closest("a") against re-toggling (REQ-003)', () => {
    it('activating "Más info" with click does not toggle the accordion', () => {
      const fixture = setup();
      const instance = fixture.componentInstance;
      const root = fixture.nativeElement as HTMLElement;
      const item = lineFor(root, 'contabilidad');
      const link = item.querySelector('a.linkarrow') as HTMLAnchorElement;

      expect(instance.isOpen('contabilidad')).toBe(true);

      // Call onActivateClick with event.target being the anchor link
      instance.onActivateClick({ target: link } as unknown as MouseEvent, 'contabilidad');
      fixture.detectChanges();

      // Contabilidad remains open (did not toggle closed under the link)
      expect(instance.isOpen('contabilidad')).toBe(true);
      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('activating "Más info" with keyboard Enter/Space does not toggle the accordion', () => {
      const fixture = setup();
      const instance = fixture.componentInstance;
      const root = fixture.nativeElement as HTMLElement;
      const item = lineFor(root, 'contabilidad');
      const link = item.querySelector('a.linkarrow') as HTMLAnchorElement;

      expect(instance.isOpen('contabilidad')).toBe(true);

      // Call onActivateKeydown with event.target being the anchor link
      instance.onActivateKeydown(
        { key: 'Enter', target: link, preventDefault: vi.fn() } as unknown as KeyboardEvent,
        'contabilidad',
      );
      fixture.detectChanges();

      expect(instance.isOpen('contabilidad')).toBe(true);
      expect(item.classList.contains('is-open')).toBe(true);
    });
  });

  // ── Exclusive accordion tests ────────────────────────────────────────────────
  describe('exclusive accordion (REQ-002)', () => {
    it('exclusive accordion: opening 03 closes 01; aria-expanded is true on exactly one line', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line01 = lineFor(root, 'contabilidad');
      const line03 = lineFor(root, 'riesgo');

      // Starts with line 01 open per REQ-002 scenario and mockup parity
      expect(line01.classList.contains('is-open')).toBe(true);
      expect(line01.querySelector('.line__btn')?.getAttribute('aria-expanded')).toBe('true');
      expect(line03.classList.contains('is-open')).toBe(false);
      expect(line03.querySelector('.line__btn')?.getAttribute('aria-expanded')).toBe('false');

      // Open line 03
      const btn03 = line03.querySelector('.line__btn') as HTMLButtonElement;
      btn03.click();
      fixture.detectChanges();

      // Line 03 is open, line 01 is closed
      expect(line03.classList.contains('is-open')).toBe(true);
      expect(line03.querySelector('.line__btn')?.getAttribute('aria-expanded')).toBe('true');
      expect(line01.classList.contains('is-open')).toBe(false);
      expect(line01.querySelector('.line__btn')?.getAttribute('aria-expanded')).toBe('false');

      // Exactly one line in the entire ledger has aria-expanded="true"
      const expandedButtons = Array.from(root.querySelectorAll('.line__btn')).filter(
        (btn) => btn.getAttribute('aria-expanded') === 'true',
      );
      expect(expandedButtons.length).toBe(1);
    });

    it('reactivating the open row closes it (state "none open" allowed)', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line01 = lineFor(root, 'contabilidad');
      const btn01 = line01.querySelector('.line__btn') as HTMLButtonElement;

      expect(line01.classList.contains('is-open')).toBe(true);

      // Reactivate open line 01
      btn01.click();
      fixture.detectChanges();

      // Now line 01 is closed
      expect(line01.classList.contains('is-open')).toBe(false);
      expect(btn01.getAttribute('aria-expanded')).toBe('false');

      // All rows are closed
      const expandedButtons = Array.from(root.querySelectorAll('.line__btn')).filter(
        (btn) => btn.getAttribute('aria-expanded') === 'true',
      );
      expect(expandedButtons.length).toBe(0);
    });
  });

  // ── Keyboard activation tests ────────────────────────────────────────────────
  describe('keyboard activation (REQ-002, REQ-010: Enter and Space)', () => {
    it('expands row on keydown Enter', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line02 = lineFor(root, 'administrativa');
      const btn02 = line02.querySelector('.line__btn') as HTMLButtonElement;

      expect(line02.classList.contains('is-open')).toBe(false);

      btn02.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(line02.classList.contains('is-open')).toBe(true);
      expect(btn02.getAttribute('aria-expanded')).toBe('true');
    });

    it('expands row on keydown Space', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line04 = lineFor(root, 'asesoria');
      const btn04 = line04.querySelector('.line__btn') as HTMLButtonElement;

      expect(line04.classList.contains('is-open')).toBe(false);

      btn04.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(line04.classList.contains('is-open')).toBe(true);
      expect(btn04.getAttribute('aria-expanded')).toBe('true');
    });

    it('ignores unrelated keys (e.g. Tab) on the line', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line05 = lineFor(root, 'marca');
      const btn05 = line05.querySelector('.line__btn') as HTMLButtonElement;

      btn05.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(line05.classList.contains('is-open')).toBe(false);
    });
  });

  // ── Scale counter derivation tests ───────────────────────────────────────────
  describe('service counter derivation (REQ-002, DD-035)', () => {
    it('derives each service group counter from its catalog subs.length and not from a literal 16', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      // Evidence disqualifier: Must read rendered text from DOM, not just check class presence
      const contabilidadLine = lineFor(root, 'contabilidad');
      const contabilidadCount = contabilidadLine.querySelector('.line__count') as HTMLElement;
      expect(contabilidadCount).toBeTruthy();
      expect(contabilidadCount.textContent?.trim()).toContain('16');
      expect(contabilidadCount.textContent?.trim()).toContain('«UNIT»');

      // Non-contabilidad groups must render their own derived counts (4 and 3, proving it's not a literal 16)
      const marcaLine = lineFor(root, 'marca');
      const marcaCount = marcaLine.querySelector('.line__count') as HTMLElement;
      expect(marcaCount.textContent?.trim()).toContain('3');
      expect(marcaCount.textContent?.trim()).not.toContain('16');
      expect(marcaCount.textContent?.trim()).toContain('«UNIT»');

      const adminLine = lineFor(root, 'administrativa');
      const adminCount = adminLine.querySelector('.line__count') as HTMLElement;
      expect(adminCount.textContent?.trim()).toContain('4');
      expect(adminCount.textContent?.trim()).not.toContain('16');
      expect(adminCount.textContent?.trim()).toContain('«UNIT»');

      // Verify every group in SERVICE_GROUPS matches its rendered counter text
      for (const group of SERVICE_GROUPS) {
        const line = lineFor(root, group.id);
        const countEl = line.querySelector('.line__count') as HTMLElement;
        expect(countEl).toBeTruthy();
        expect(countEl.textContent?.trim()).toContain(String(group.subs.length));
        expect(countEl.textContent?.trim()).toContain('«UNIT»');
      }
    });

    it('derives the counter dynamically via buildLedgerLines (fails if literal 16 is used)', () => {
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
      const lines = buildLedgerLines(mockGroups);
      expect(lines[0].count).toBe(2);
      expect(lines[0].count).not.toBe(16);
    });

    it('derives the aggregate total service count (31) and interpolates into allCtaLabel', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const ctaLink = root.querySelector('.ledger__aside a.linkarrow') as HTMLAnchorElement;

      expect(ctaLink).toBeTruthy();
      // Total count across all 5 groups is 16 + 4 + 4 + 4 + 3 = 31
      // Evaluates via sentinel template '«ALL_CTA_{n}»' -> '«ALL_CTA_31»'
      expect(ctaLink.textContent?.trim()).toBe('«ALL_CTA_31» →');
    });
  });

  // ── Guard against dumping full catalog ───────────────────────────────────────
  it('does not dump the full sub-service catalog on Home (guard against subC01t)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Sub-service copy keys (e.g. subC01t…) only exist on the /services deep page
    expect(root.textContent).not.toContain('subC01t');
  });

  // ── Semantic key pairing (ISSUE 2: anti-tautology and reordered array) ────────
  describe('key pairing is semantic, not positional (REQ-002)', () => {
    it('pairs summaryKey and bodyKey to titleKey even when groups are reordered', () => {
      // Reversing the array places 'marca' (g5Title) at index 0.
      // Positional derivation (g${index+1}Sum) would yield g1Sum/g1Body and fail.
      const reversed = [...SERVICE_GROUPS].reverse();
      const lines = buildLedgerLines(reversed);

      expect(lines[0].id).toBe('marca');
      expect(lines[0].titleKey).toBe('g5Title');
      expect(lines[0].summaryKey).toBe('g5Sum');
      expect(lines[0].bodyKey).toBe('g5Body');
      expect(lines[0].ordinal).toBe('01'); // ordinal remains strictly positional

      expect(lines[4].id).toBe('contabilidad');
      expect(lines[4].titleKey).toBe('g1Title');
      expect(lines[4].summaryKey).toBe('g1Sum');
      expect(lines[4].bodyKey).toBe('g1Body');
      expect(lines[4].ordinal).toBe('05');
    });

    it('renders the corresponding bodyKey in each row detail', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      const canonicalBodyKeys: Record<string, string> = {
        contabilidad: 'g1Body',
        administrativa: 'g2Body',
        riesgo: 'g3Body',
        asesoria: 'g4Body',
        marca: 'g5Body',
      };

      for (const [id, expectedBody] of Object.entries(canonicalBodyKeys)) {
        const line = lineFor(root, id);
        const detailP = line.querySelector('.line__detail p');
        expect(detailP?.textContent?.trim()).toBe(expectedBody);
      }
    });

    it('displays the five required elements in row anatomy with canonical pairing', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      const canonicalPairs: Record<string, { title: string; summary: string }> = {
        contabilidad: { title: 'g1Title', summary: 'g1Sum' },
        administrativa: { title: 'g2Title', summary: 'g2Sum' },
        riesgo: { title: 'g3Title', summary: 'g3Sum' },
        asesoria: { title: 'g4Title', summary: 'g4Sum' },
        marca: { title: 'g5Title', summary: 'g5Sum' },
      };

      SERVICE_GROUP_IDS.forEach((id, index) => {
        const line = lineFor(root, id);
        const ordinal = String(index + 1).padStart(2, '0');

        // 1. Ordinal (01…05)
        const ordEl = line.querySelector('.line__ord');
        expect(ordEl?.textContent?.trim()).toBe(ordinal);

        // 2. Title matches canonical data
        const titleEl = line.querySelector('.line__title');
        expect(titleEl?.textContent?.trim()).toBe(canonicalPairs[id].title);

        // 3. One-line summary paired with title (asserted against canonical data, not production formula)
        const sumEl = line.querySelector('.line__sum');
        expect(sumEl?.textContent?.trim()).toBe(canonicalPairs[id].summary);

        // 4. Counter (rendered text)
        const countEl = line.querySelector('.line__count');
        expect(countEl?.textContent?.trim()).toContain(String(SERVICE_GROUPS[index].subs.length));
        expect(countEl?.textContent?.trim()).toContain('«UNIT»');

        // 5. Opening control
        const btn = line.querySelector('.line__btn');
        expect(btn).toBeTruthy();
        expect(btn?.getAttribute('id')).toBe(`btn-${id}`);
        const plusEl = line.querySelector('.line__plus');
        expect(plusEl).toBeTruthy();
      });
    });
  });

  // ── Collapsed detail is inert and accessible (REQ-002, DD-036) ───────────────
  describe('accessibility and inert state (REQ-002, DD-036)', () => {
    it('marks .line__detail inert while collapsed and clears it once expanded', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const line02 = lineFor(root, 'administrativa');
      const detail02 = line02.querySelector('.line__detail') as HTMLElement;
      const btn02 = line02.querySelector('.line__btn') as HTMLButtonElement;

      // Initially collapsed -> inert is true
      expect((detail02 as HTMLElement & { inert: boolean }).inert).toBe(true);

      // Expand line 02
      btn02.click();
      fixture.detectChanges();
      expect((detail02 as HTMLElement & { inert: boolean }).inert).toBe(false);

      // Collapse line 02
      btn02.click();
      fixture.detectChanges();
      expect((detail02 as HTMLElement & { inert: boolean }).inert).toBe(true);
    });

    it('labels the detail landmark region with aria-labelledby pointing to the toggle button', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;

      for (const id of SERVICE_GROUP_IDS) {
        const line = lineFor(root, id);
        const btn = line.querySelector('.line__btn') as HTMLElement;
        const detail = line.querySelector('.line__detail') as HTMLElement;

        expect(btn.getAttribute('id')).toBe(`btn-${id}`);
        expect(detail.getAttribute('role')).toBe('region');
        expect(detail.getAttribute('aria-labelledby')).toBe(`btn-${id}`);
      }
    });
  });

  // ── Zero hardcoded Spanish copy in template (ISSUE 1: Option a & b) ───────────
  describe('zero hardcoded Spanish copy in template (REQ-011, tasks.md)', () => {
    // Option (a): Raw template text assertion
    it('contains no hardcoded Spanish phrases or accented words in raw template text', () => {
      const rootDir = nodeProcess ? nodeProcess.cwd() : '';
      const templatePath = path.resolve(rootDir, 'src/app/features/home/ledger/ledger-section.html');
      const rawHtml = fs.readFileSync(templatePath, 'utf8');

      // Strip comments
      const withoutComments = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
      // Strip Angular expressions {{ ... }} and HTML tags <...>
      const plainText = withoutComments
        .replace(/\{\{[\s\S]*?\}\}/g, '')
        .replace(/<[^>]+>/g, ' ');

      const forbiddenPhrases = [
        'Cinco líneas',
        'Una sola operación',
        'Ver los',
        'servicios',
        'Lo que hacemos',
        'Clic en una línea',
        'abre el catálogo completo',
        'roadHint',
      ];

      for (const phrase of forbiddenPhrases) {
        expect(plainText).not.toContain(phrase);
      }

      // No accented Spanish characters in raw text outside interpolations
      expect(plainText).not.toMatch(/[áéíóúÁÉÍÓÚñÑ]/);
    });

    // Option (b): Sentinel DOM assertions — fails immediately if literal copy bypasses pipe
    it('uses sentinel strings via pipe without hardcoded literals in DOM', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const eyebrow = root.querySelector('.ledger__head .eyebrow') as HTMLElement;
      const h2 = root.querySelector('.ledger__head h2') as HTMLElement;
      const hint = root.querySelector('.ledger__hint') as HTMLElement;

      expect(eyebrow.textContent?.trim()).toBe('«LEDGER_EYEBROW»');
      expect(h2.textContent?.trim()).toBe('«LEDGER_TITLE»');
      expect(hint.textContent?.trim()).toBe('«LEDGER_HINT»');
      expect(root.textContent).not.toContain('roadHint');
    });
  });

  // ── Focus order & inert keyboard accessibility (REQ-002, REQ-010, DD-036) ─────
  describe('focus order and inert detail (REQ-002, REQ-010, DD-036)', () => {
    function getFocusableElements(container: HTMLElement): HTMLElement[] {
      const candidates = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      return candidates.filter((el) => {
        if (el.hasAttribute('disabled')) return false;
        if (el.tabIndex < 0 || el.getAttribute('tabindex') === '-1') return false;
        let curr: HTMLElement | null = el;
        while (curr && curr !== container) {
          if (curr.hasAttribute('inert') || (curr as HTMLElement & { inert?: boolean }).inert) {
            return false;
          }
          curr = curr.parentElement;
        }
        return true;
      });
    }

    it('the "Más info" link of a closed row is NOT reachable in sequential Tab focus order', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const closedLine = lineFor(root, 'administrativa');
      const closedLink = closedLine.querySelector('a.linkarrow') as HTMLAnchorElement;
      const openLine = lineFor(root, 'contabilidad');
      const openLink = openLine.querySelector('a.linkarrow') as HTMLAnchorElement;

      // 1. Initial state: contabilidad is open, administrativa is closed
      let focusable = getFocusableElements(root);
      expect(focusable).toContain(openLink);
      expect(focusable).not.toContain(closedLink);

      // 2. Open administrativa
      const btn02 = closedLine.querySelector('.line__btn') as HTMLButtonElement;
      btn02.click();
      fixture.detectChanges();

      focusable = getFocusableElements(root);
      expect(focusable).toContain(closedLink);
      expect(focusable).not.toContain(openLink);

      // 3. Re-close administrativa (none open)
      btn02.click();
      fixture.detectChanges();

      focusable = getFocusableElements(root);
      expect(focusable).not.toContain(closedLink);
      expect(focusable).not.toContain(openLink);
    });
  });

  // ── Spine scroll tracking and reduced motion (REQ-002, REQ-010) ──────────────
  describe('spine scroll tracking and reduced motion (REQ-002, REQ-010)', () => {
    function mockRect(el: HTMLElement, top: number, height: number): void {
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top,
        height,
        bottom: top + height,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: top,
        toJSON: () => ({}),
      } as DOMRect);
    }

    function setInnerHeight(value: number): void {
      Object.defineProperty(window, 'innerHeight', { value, configurable: true });
    }

    afterEach(() => {
      setInnerHeight(768);
      vi.restoreAllMocks();
    });

    it('under prefers-reduced-motion, spine stays fixed at 100% and does not follow scroll', () => {
      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;
      const body = root.querySelector('.ledger__body') as HTMLElement;
      const spine = root.querySelector('[data-spine]') as HTMLElement;

      expect(spine.style.height).toBe('100%');

      setInnerHeight(1000);
      mockRect(body, 720, 1000);
      window.dispatchEvent(new Event('scroll'));

      // In reduced motion, spine stays 100% fixed, does not become 0%
      expect(spine.style.height).toBe('100%');
    });

    it('when motion is allowed, spine height tracks passive scroll progress', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const body = root.querySelector('.ledger__body') as HTMLElement;
      const spine = root.querySelector('[data-spine]') as HTMLElement;

      setInnerHeight(1000);
      // vh = 1000, 0.72 * vh = 720
      // top = 720, height = 1000 -> (720 - 720) / 1000 = 0%
      mockRect(body, 720, 1000);
      window.dispatchEvent(new Event('scroll'));
      expect(spine.style.height).toBe('0%');

      // top = 220, height = 1000 -> (720 - 220) / 1000 = 500 / 1000 = 50%
      mockRect(body, 220, 1000);
      window.dispatchEvent(new Event('scroll'));
      expect(spine.style.height).toBe('50%');

      // top = -280, height = 1000 -> (720 - (-280)) / 1000 = 1000 / 1000 = 100%
      mockRect(body, -280, 1000);
      window.dispatchEvent(new Event('scroll'));
      expect(spine.style.height).toBe('100%');
    });
  });

  // ── Scroll reveal and IntersectionObserver parity (REQ-002, REQ-010) ──────────
  describe('scroll-in reveal and IntersectionObserver parity (REQ-002, REQ-010)', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('marks all content visible immediately when IntersectionObserver is undefined', () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const head = root.querySelector('.ledger__head') as HTMLElement;
      const lines = root.querySelectorAll('.line');

      expect(head.classList.contains('is-in')).toBe(true);
      expect(lines.length).toBe(5);
      lines.forEach((line) => {
        expect(line.classList.contains('is-in')).toBe(true);
      });
    });

    it('marks all content visible immediately under prefers-reduced-motion without observer', () => {
      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;
      const head = root.querySelector('.ledger__head') as HTMLElement;
      const lines = root.querySelectorAll('.line');

      expect(head.classList.contains('is-in')).toBe(true);
      lines.forEach((line) => {
        expect(line.classList.contains('is-in')).toBe(true);
      });
    });

    it('observes header and all lines when IntersectionObserver is available and motion is allowed', () => {
      const observed: Element[] = [];
      class StubIO {
        constructor(private readonly cb: IntersectionObserverCallback) {}
        observe(el: Element): void {
          observed.push(el);
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

      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const head = root.querySelector('.ledger__head') as HTMLElement;
      const lines = Array.from(root.querySelectorAll('.line'));

      expect(head.classList.contains('is-in')).toBe(false);
      expect(observed).toContain(head);
      lines.forEach((line) => {
        expect(line.classList.contains('is-in')).toBe(false);
        expect(observed).toContain(line);
      });
      expect(observed.length).toBe(6); // 1 header + 5 lines
    });
  });

  // ── Reparto de dorado (REQ-009) ──────────────────────────────────────────────
  describe('reparto de dorado en CSS portado (REQ-009)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const cssPath = path.resolve(rootDir, 'src/app/features/home/ledger/ledger-section.css');
    const rawCss = fs.readFileSync(cssPath, 'utf8');

    // Strip comments to ensure assertions test rules rather than explanatory text
    const cleanCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');

    it('.ledger .eyebrow resolves to var(--amd-gold-ink-deep)', () => {
      const match = cleanCss.match(/\.ledger\s+\.eyebrow\s*\{([^}]*)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(match![1]).not.toMatch(/color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);
    });

    it('.ledger .linkarrow resolves to var(--amd-gold-ink-deep)', () => {
      const match = cleanCss.match(/\.ledger\s+\.linkarrow\s*\{([^}]*)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(match![1]).not.toMatch(/color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);
    });

    it('.line__count b resolves to var(--amd-gold-ink-deep)', () => {
      const match = cleanCss.match(/\.line__count\s+b\s*\{([^}]*)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/color\s*:\s*var\(--amd-gold-ink-deep\)/);
      expect(match![1]).not.toMatch(/color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);
    });

    it('.line__ord activo resolves to var(--amd-gold-ink) in base rule (>= 900px)', () => {
      const [baseCss] = cleanCss.split(/@media/);
      const match = baseCss.match(/(?:\.line\.is-(?:hot|open)\s+\.line__ord)[^{]*\{([^}]*)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/color\s*:\s*var\(--amd-gold-ink\)(?!-deep)/);
    });

    it('.line__ord activo resolves to var(--amd-gold-ink-deep) inside < 900px media query', () => {
      const mediaMatch = cleanCss.match(/@media[^{]*max-width\s*:\s*(?:899|900)px[^{]*\{([\s\S]*?\}\s*\})/);
      expect(mediaMatch).toBeTruthy();
      const mediaBlock = mediaMatch![1];
      const ordMatch = mediaBlock.match(/(?:\.line\.is-(?:hot|open)\s+\.line__ord)[^{]*\{([^}]*)\}/);
      expect(ordMatch).toBeTruthy();
      expect(ordMatch![1]).toMatch(/color\s*:\s*var\(--amd-gold-ink-deep\)/);
    });

    it('never uses var(--amd-gold) or var(--amd-gold-soft) as color: in ledger CSS', () => {
      const lines = cleanCss.split('\n');
      for (const line of lines) {
        if (/(?<![a-zA-Z-])color\s*:/.test(line)) {
          const forbiddenGold = /(?<![a-zA-Z-])color\s*:[^;]*var\(--amd-gold(-soft)?\)(?!\s*-\s*ink)/;
          expect(line).not.toMatch(forbiddenGold);
        }
      }
    });
  });
});
