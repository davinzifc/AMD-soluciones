import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { SERVICE_GROUP_IDS } from '../../services/services-page/services-page';
import { ROAD_DECO_FACTORS, ServicesRoadSection } from './services-road-section';

function setup(reduce = false) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: LocaleService, useValue: { translate: (key: string) => key } },
      { provide: MotionService, useValue: { reducedMotion: () => reduce } },
    ],
  });
  const fixture = TestBed.createComponent(ServicesRoadSection);
  fixture.detectChanges();
  return fixture;
}

function mockRoadRect(el: HTMLElement, top: number, height: number): void {
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

function itemFor(root: HTMLElement, id: string): HTMLElement {
  const item = root.querySelector(`.road__item[data-service="${id}"]`) as HTMLElement | null;
  if (!item) {
    throw new Error(`road__item for "${id}" not found`);
  }
  return item;
}

describe('ServicesRoadSection', () => {
  it('renders the #servicios fragment scroll target', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#servicios')).toBeTruthy();
  });

  it('covers all five ServiceGroupId groups as road items (REQ-004)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(SERVICE_GROUP_IDS.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      expect(root.querySelector(`.road__item[data-service="${id}"]`)).toBeTruthy();
    }
  });

  it('does not dump the full sub-service catalog on Home (REQ-004 anti-pattern)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    // Sub-service copy keys (e.g. subC01t…) only exist on the Servicios deep page (T012).
    expect(root.textContent).not.toContain('subC01t');
  });

  describe('expand/collapse — pointer', () => {
    it('starts collapsed and expands a card on click', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const card = item.querySelector('.road__card') as HTMLElement;

      expect(item.classList.contains('is-open')).toBe(false);
      expect(card.getAttribute('aria-expanded')).toBe('false');

      card.click();
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
      expect(card.getAttribute('aria-expanded')).toBe('true');
    });

    it('collapses on a second click of the same card (toggle)', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const card = item.querySelector('.road__card') as HTMLElement;

      card.click();
      fixture.detectChanges();
      expect(item.classList.contains('is-open')).toBe(true);

      card.click();
      fixture.detectChanges();
      expect(item.classList.contains('is-open')).toBe(false);
    });

    it('expanding one group closes any other open group (accordion)', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const contabilidad = itemFor(root, 'contabilidad');
      const marca = itemFor(root, 'marca');

      (contabilidad.querySelector('.road__card') as HTMLElement).click();
      fixture.detectChanges();
      expect(contabilidad.classList.contains('is-open')).toBe(true);

      (marca.querySelector('.road__card') as HTMLElement).click();
      fixture.detectChanges();
      expect(marca.classList.contains('is-open')).toBe(true);
      expect(contabilidad.classList.contains('is-open')).toBe(false);
    });

    it('expands via the road__node click', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'riesgo');
      const node = item.querySelector('.road__node') as HTMLElement;

      node.click();
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('expands via the road__pill click', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'asesoria');
      const pill = item.querySelector('.road__pill') as HTMLElement;

      pill.click();
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });
  });

  describe('expand/collapse — keyboard (REQ-012: not hover-only)', () => {
    it('expands the card on keydown Enter', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const card = item.querySelector('.road__card') as HTMLElement;

      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('expands the card on keydown Space', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'administrativa');
      const card = item.querySelector('.road__card') as HTMLElement;

      card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('expands the road__node on keydown Enter/Space (not mouse-only)', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'marca');
      const node = item.querySelector('.road__node') as HTMLElement;

      node.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('expands the road__pill on keydown Enter', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'riesgo');
      const pill = item.querySelector('.road__pill') as HTMLElement;

      pill.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(true);
    });

    it('ignores unrelated keys (e.g. Tab) on the card', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const card = item.querySelector('.road__card') as HTMLElement;

      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(item.classList.contains('is-open')).toBe(false);
    });
  });

  describe('"Más info" deep-links (REQ-004: /services + fragment, DD-014 English path)', () => {
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
        const item = itemFor(root, id);
        const link = item.querySelector('a.btn') as HTMLAnchorElement;

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe(expected[id]);
        expect(link.textContent).toContain('moreInfo');
      });
    }

    it('ignores an activation event whose target is the "Más info" link (guards against re-toggling under it)', () => {
      // A real DOM `.click()` on the anchor would also trigger RouterLink's own
      // navigation — irrelevant to this guard and noisy in a unit test (no
      // matching test route). Exercise `onActivateClick` directly instead,
      // asserting the exact "already open + link target" scenario the guard exists for.
      const fixture = setup();
      const instance = fixture.componentInstance as unknown as {
        onActivateClick(event: MouseEvent, id: string): void;
        isOpen(id: string): boolean;
      };
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const card = item.querySelector('.road__card') as HTMLElement;
      const link = item.querySelector('a.btn') as HTMLAnchorElement;

      card.click();
      fixture.detectChanges();
      expect(item.classList.contains('is-open')).toBe(true);

      instance.onActivateClick({ target: link } as unknown as MouseEvent, 'contabilidad');
      fixture.detectChanges();

      expect(instance.isOpen('contabilidad')).toBe(true);
    });
  });

  describe('collapsed detail is inert (REQ-013: no keyboard-focusable "Más info" hidden under a collapsed card)', () => {
    it('marks .road__detail inert while collapsed and clears it once expanded', () => {
      const fixture = setup();
      const root = fixture.nativeElement as HTMLElement;
      const item = itemFor(root, 'contabilidad');
      const detail = item.querySelector('.road__detail') as HTMLElement;
      const card = item.querySelector('.road__card') as HTMLElement;

      expect((detail as HTMLElement & { inert: boolean }).inert).toBe(true);

      card.click();
      fixture.detectChanges();

      expect((detail as HTMLElement & { inert: boolean }).inert).toBe(false);

      card.click();
      fixture.detectChanges();

      expect((detail as HTMLElement & { inert: boolean }).inert).toBe(true);
    });
  });

  describe('road progress + deco parallax (T013 · design.md Motion plan · DD-005 — no GSAP)', () => {
    afterEach(() => {
      setInnerHeight(768);
    });

    it('renders the three ambient deco elements', () => {
      const fixture = setup(false);
      const decos = fixture.nativeElement.querySelectorAll('.road__deco');
      expect(decos.length).toBe(3);
    });

    it('fills the progress bar based on scroll position when motion is allowed (mockup updateRoadScroll parity)', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const road = root.querySelector('#services-road') as HTMLElement;
      const progress = root.querySelector('#road-progress') as HTMLElement;

      setInnerHeight(800);
      // total = height(1000) + innerHeight*0.35(280) = 1280; traveled = clamp(280 - 400, 0, 1280) = 0.
      mockRoadRect(road, 400, 1000);
      window.dispatchEvent(new Event('scroll'));
      expect(progress.style.height).toBe('0%');

      // traveled = clamp(280 - (-200), 0, 1280) = 480; pct = 480/1280*100 = 37.5.
      mockRoadRect(road, -200, 1000);
      window.dispatchEvent(new Event('scroll'));
      expect(progress.style.height).toBe('37.5%');
    });

    it('sets the progress bar to a static full state under prefers-reduced-motion instead of tracking scroll (REQ-004/010)', () => {
      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;
      const road = root.querySelector('#services-road') as HTMLElement;
      const progress = root.querySelector('#road-progress') as HTMLElement;

      setInnerHeight(800);
      mockRoadRect(road, -600, 1000);
      window.dispatchEvent(new Event('scroll'));

      expect(progress.style.height).toBe('100%');
    });

    it('applies deco parallax transforms proportional to each factor when motion is allowed', () => {
      const fixture = setup(false);
      const root = fixture.nativeElement as HTMLElement;
      const road = root.querySelector('#services-road') as HTMLElement;
      const decos = root.querySelectorAll<HTMLElement>('.road__deco');

      mockRoadRect(road, 100, 1000);
      window.dispatchEvent(new Event('scroll'));

      ROAD_DECO_FACTORS.forEach((factor, index) => {
        expect(decos[index].style.transform).toBe(`translate3d(0, ${100 * -factor}px, 0)`);
      });
    });

    it('clears deco parallax transforms under prefers-reduced-motion (REQ-010: no motion-only content)', () => {
      const fixture = setup(true);
      const root = fixture.nativeElement as HTMLElement;
      const road = root.querySelector('#services-road') as HTMLElement;
      const decos = root.querySelectorAll<HTMLElement>('.road__deco');

      mockRoadRect(road, 250, 1000);
      window.dispatchEvent(new Event('scroll'));

      decos.forEach((deco) => expect(deco.style.transform).toBe(''));
    });
  });

  describe('scroll-in reveal (mockup IntersectionObserver is-in)', () => {
    it('marks every road item is-in immediately under prefers-reduced-motion (REQ-010: content reachable)', () => {
      const fixture = setup(true);
      const items = fixture.nativeElement.querySelectorAll('.road__item');
      expect(items.length).toBe(5);
      items.forEach((item: HTMLElement) => {
        expect(item.classList.contains('is-in')).toBe(true);
      });
    });

    it('observes each road item when motion is allowed (IntersectionObserver owns the reveal)', () => {
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
      const items = Array.from(fixture.nativeElement.querySelectorAll('.road__item')) as HTMLElement[];

      expect(items.length).toBe(5);
      expect(observed.length).toBe(5);
      items.forEach((item) => {
        expect(item.classList.contains('is-in')).toBe(false);
        expect(observed).toContain(item);
      });

      vi.unstubAllGlobals();
    });
  });
});
