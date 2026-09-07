import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import es from '../../../../assets/i18n/es.json';
import en from '../../../../assets/i18n/en.json';
import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { TESTIMONIAL_PAUSE_MS, TrustSection } from './trust-section';

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

const SENTINELS: Record<string, string> = {
  testimonialDotLabel: '«TESTIMONIAL_{n}»',
};

function setup(reduce: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: LocaleService,
        useValue: {
          translate: (key: string) => SENTINELS[key] ?? key,
        },
      },
      { provide: MotionService, useValue: { reducedMotion: () => reduce } },
    ],
  });
  const fixture = TestBed.createComponent(TrustSection);
  fixture.detectChanges();
  return fixture;
}

describe('TrustSection (T015)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the #confianza fragment scroll target carrying .trust and .section--light', () => {
    const fixture = setup(false);
    const section = fixture.nativeElement.querySelector('#confianza') as HTMLElement;
    expect(section).toBeTruthy();
    expect(section.classList.contains('trust')).toBe(true);
    expect(section.classList.contains('section--light')).toBe(true);
  });

  // ── Test 1: Eyebrow presente; no hay h2 ni lead ─────────────────────────────
  it('renders eyebrow and has no h2 title or lead paragraph in section (Test 1)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const eyebrow = root.querySelector('.eyebrow.eyebrow--ink');
    expect(eyebrow).toBeTruthy();
    expect(eyebrow?.textContent).toContain('trustEyebrow');

    expect(root.querySelector('h2')).toBeNull();
    expect(root.querySelector('.section-head')).toBeNull();
  });

  // ── Test 2: Cero métricas en DOM y fuera de diccionarios ────────────────────
  it('has zero metric elements in DOM and m1..m4 are absent from both dictionaries (Test 2)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.metric').length).toBe(0);
    expect(root.querySelectorAll('.metrics').length).toBe(0);

    for (const key of ['m1', 'm2', 'm3', 'm4']) {
      expect((es as Record<string, string>)[key]).toBeUndefined();
      expect((en as Record<string, string>)[key]).toBeUndefined();
    }
  });

  // ── Test 3: La cita es figure.quote; 4 testimonios y 4 puntos ──────────────
  it('renders quote as figure.quote with four testimonials and four dots (Test 3)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    const quotes = root.querySelectorAll('figure.quote');
    expect(quotes.length).toBe(4);
    expect(quotes[0].classList.contains('is-active')).toBe(true);
    expect(quotes[1].classList.contains('is-active')).toBe(false);
    expect(quotes[0].querySelector('blockquote > p')).toBeTruthy();
    expect(quotes[0].querySelector('figcaption')).toBeTruthy();

    const dots = root.querySelectorAll('.quote__dots button');
    expect(dots.length).toBe(4);
    expect(dots[0].getAttribute('aria-selected')).toBe('true');
    expect(dots[1].getAttribute('aria-selected')).toBe('false');
  });

  it('clicking a dot selects that testimonial manually even under reduced motion (Test 3 manual selection)', () => {
    const fixture = setup(true);
    const root = fixture.nativeElement as HTMLElement;

    const dots = root.querySelectorAll<HTMLButtonElement>('.quote__dots button');
    dots[2].click();
    fixture.detectChanges();

    const quotes = root.querySelectorAll('figure.quote');
    expect(quotes[2].classList.contains('is-active')).toBe(true);
    expect(quotes[0].classList.contains('is-active')).toBe(false);
    expect(dots[2].getAttribute('aria-selected')).toBe('true');
  });

  it('exposes one dot per testimonial with translated accessible name and programmatic active state (REQ-006 / REQ-011)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const dots = root.querySelectorAll<HTMLButtonElement>('.quote__dots button');
    expect(dots.length).toBe(4);
    expect(dots[0].getAttribute('aria-selected')).toBe('true');
    expect(dots[1].getAttribute('aria-selected')).toBe('false');
    expect(dots[0].getAttribute('aria-label')).toBe('«TESTIMONIAL_1»');
    expect(dots[1].getAttribute('aria-label')).toBe('«TESTIMONIAL_2»');
    expect(dots[2].getAttribute('aria-label')).toBe('«TESTIMONIAL_3»');
    expect(dots[3].getAttribute('aria-label')).toBe('«TESTIMONIAL_4»');
    expect(dots[0].getAttribute('aria-label')).not.toBe('Testimonio 1');
  });

  // ── Test 4: Ticker con 18 spans de texto plano, sin tarjetas ni logo-pill ───
  it('renders ticker with 18 plain text span elements and no cards/logo-pill (Test 4)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    const spans = root.querySelectorAll('.ticker__track span');
    expect(spans.length).toBe(18);

    expect(root.querySelectorAll('.logo-pill').length).toBe(0);
    expect(root.querySelectorAll('.card').length).toBe(0);
  });

  // ── Test 5: Rótulo del ticker después de la cinta en orden de documento ─────
  it('places the ticker label after the ticker ribbon in document order (Test 5)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    const ticker = root.querySelector('.ticker');
    const label = root.querySelector('.ticker__label');

    expect(ticker).toBeTruthy();
    expect(label).toBeTruthy();

    const position = ticker!.compareDocumentPosition(label!);
    expect((position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true);
  });

  // ── Test 6: Fidelidad de inventario de clases del mockup ────────────────────
  it('contains the mockup class inventory (Test 6 inventory fidelity)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    const allElements = root.querySelectorAll('*');
    const classSet = new Set<string>();
    for (const el of Array.from(allElements)) {
      el.classList.forEach((cls) => classSet.add(cls));
    }
    root.classList.forEach((cls) => classSet.add(cls));
    const section = root.querySelector('#confianza');
    section?.classList.forEach((cls) => classSet.add(cls));

    const requiredMockupClasses = [
      'trust',
      'eyebrow',
      'eyebrow--ink',
      'quote',
      'quote__dots',
      'ticker',
      'ticker__track',
      'ticker__label',
      'clients__label',
      'wrap',
    ];

    for (const cls of requiredMockupClasses) {
      expect(classSet.has(cls)).toBe(true);
    }
  });

  // ── Test 7: Auto-rotación y pausas (T018 · REQ-006 · DD-034 · ClientWall, 44x44, tokens) ─
  it('auto-advances testimonials every 9s reading pause asserting against TESTIMONIAL_PAUSE_MS (T018 · REQ-006 · DD-034)', () => {
    vi.useFakeTimers();
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const quotes = () => root.querySelectorAll('figure.quote');

    expect(quotes()[0].classList.contains('is-active')).toBe(true);
    expect(quotes()[1].classList.contains('is-active')).toBe(false);

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(false);
    expect(quotes()[1].classList.contains('is-active')).toBe(true);

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[1].classList.contains('is-active')).toBe(false);
    expect(quotes()[2].classList.contains('is-active')).toBe(true);

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[2].classList.contains('is-active')).toBe(false);
    expect(quotes()[3].classList.contains('is-active')).toBe(true);

    // Cycles back to 0
    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[3].classList.contains('is-active')).toBe(false);
    expect(quotes()[0].classList.contains('is-active')).toBe(true);
  });

  it('does NOT auto-advance while pointer is over the section (hover pause)', () => {
    vi.useFakeTimers();
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('#confianza') as HTMLElement;
    const quotes = () => root.querySelectorAll('figure.quote');

    expect(quotes()[0].classList.contains('is-active')).toBe(true);

    section.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS * 2);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(true);
    expect(quotes()[1].classList.contains('is-active')).toBe(false);

    // Leaves hover
    section.dispatchEvent(new Event('pointerleave'));
    fixture.detectChanges();

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(false);
    expect(quotes()[1].classList.contains('is-active')).toBe(true);
  });

  it('does NOT auto-advance while focus is inside the section (focus-within pause)', () => {
    vi.useFakeTimers();
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const dots = root.querySelectorAll<HTMLButtonElement>('.quote__dots button');
    const quotes = () => root.querySelectorAll('figure.quote');

    expect(quotes()[0].classList.contains('is-active')).toBe(true);

    dots[0].dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS * 2);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(true);
    expect(quotes()[1].classList.contains('is-active')).toBe(false);

    // Focus moves outside
    dots[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(false);
    expect(quotes()[1].classList.contains('is-active')).toBe(true);
  });

  it('does NOT auto-advance under prefers-reduced-motion: reduce', () => {
    vi.useFakeTimers();
    const fixture = setup(true);
    const root = fixture.nativeElement as HTMLElement;
    const quotes = () => root.querySelectorAll('figure.quote');

    expect(quotes()[0].classList.contains('is-active')).toBe(true);

    vi.advanceTimersByTime(TESTIMONIAL_PAUSE_MS * 3);
    fixture.detectChanges();

    expect(quotes()[0].classList.contains('is-active')).toBe(true);
    expect(quotes()[1].classList.contains('is-active')).toBe(false);
  });

  it('activating a dot selects the testimonial and restarts the timer count', () => {
    vi.useFakeTimers();
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const dots = root.querySelectorAll<HTMLButtonElement>('.quote__dots button');
    const quotes = () => root.querySelectorAll('figure.quote');

    expect(quotes()[0].classList.contains('is-active')).toBe(true);

    // Advance 5 seconds into the 9s pause
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();

    // Click dot 2 (quote index 2)
    dots[2].click();
    fixture.detectChanges();

    expect(quotes()[2].classList.contains('is-active')).toBe(true);

    // Advance another 5 seconds (10s from test start, but only 5s since dot click)
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();

    // Must STILL be quote 2 because click restarted the timer count
    expect(quotes()[2].classList.contains('is-active')).toBe(true);

    // Advance remaining 4000ms to complete 9s from click
    vi.advanceTimersByTime(4000);
    fixture.detectChanges();

    // Now advances to quote 3
    expect(quotes()[2].classList.contains('is-active')).toBe(false);
    expect(quotes()[3].classList.contains('is-active')).toBe(true);
  });

  it('contains ClientWall within the #confianza section (KZ-004 ancestry)', () => {
    const fixture = setup(false);
    const section = fixture.nativeElement.querySelector('#confianza') as HTMLElement;
    expect(section).toBeTruthy();
    const clientWall = section.querySelector('app-client-wall');
    expect(clientWall).toBeTruthy();
    expect(section.contains(clientWall)).toBe(true);
  });

  it('controls retain 44x44 touch targets for dot navigation and use token for active pip without hex literals (KZ-001 / REQ-009)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const cssPath = path.resolve(rootDir, 'src/app/features/home/trust/trust-section.css');
    const rawCss = fs.readFileSync(cssPath, 'utf8');
    const cleanCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');

    const dotsBtnMatch = cleanCss.match(/\.quote__dots\s+button\s*\{([^}]*)\}/);
    expect(dotsBtnMatch).toBeTruthy();
    expect(dotsBtnMatch![1]).toMatch(/width\s*:\s*44px/);
    expect(dotsBtnMatch![1]).toMatch(/height\s*:\s*44px/);

    expect(cleanCss).not.toMatch(/#8a7a2e/i);
    expect(cleanCss).not.toMatch(/#6f6224/i);
    expect(cleanCss).not.toMatch(/(?<![a-zA-Z-])color\s*:[^;]*var\(--amd-gold(-soft)?\)(?!\s*-\s*ink)/);
  });

  // ── Test 8: Cero literales de copy en plantilla ────────────────────────────
  it('has zero hardcoded copy in trust-section.html template and uses localize pipe (Test 8)', () => {
    const rootDir = nodeProcess ? nodeProcess.cwd() : '';
    const templatePath = path.resolve(rootDir, 'src/app/features/home/trust/trust-section.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    expect(template).not.toMatch(/>\s*Confianza\s*</i);
    expect(template).not.toMatch(/>\s*Sectores\s*</i);
    expect(template).not.toMatch(/>\s*Comercio\s*</i);
    expect(template).toContain("'trustEyebrow' | localize");
    expect(template).toContain("'tickerLabel' | localize");
    expect(template).toContain('sectorKey | localize');
  });

  it('marks the ticker track reduced under prefers-reduced-motion (REQ-007/010)', () => {
    const fixture = setup(true);
    const track = fixture.nativeElement.querySelector('.ticker__track') as HTMLElement;
    expect(track.classList.contains('is-reduced-motion')).toBe(true);
  });

  it('defines TESTIMONIAL_PAUSE_MS as 6000ms for comfortable reading pace (T019 · REQ-006)', () => {
    expect(TESTIMONIAL_PAUSE_MS).toBe(6000);
  });
});
