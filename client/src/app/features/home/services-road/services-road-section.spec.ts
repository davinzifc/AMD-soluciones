import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS } from '../../services/services-page/services-page';
import { ServicesRoadSection } from './services-road-section';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(ServicesRoadSection);
  fixture.detectChanges();
  return fixture;
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
});
