import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import en from '../../../../assets/i18n/en.json';
import es from '../../../../assets/i18n/es.json';
import { LocaleService } from '../../i18n/locale.service';
import { DrawerStateService } from '../drawer-state.service';
import { SECTION_NAV_ANCHORS } from '../section-nav/section-nav';
import { MobileDrawer } from './mobile-drawer';

@Component({ selector: 'app-test-empty', template: '' })
class EmptyRouteComponent {}

const fakeLocaleService = { translate: (key: string) => key };

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: EmptyRouteComponent }]),
      { provide: LocaleService, useValue: fakeLocaleService },
    ],
  });

  const fixture = TestBed.createComponent(MobileDrawer);
  fixture.detectChanges();
  return {
    fixture,
    router: TestBed.inject(Router),
    drawerState: TestBed.inject(DrawerStateService),
  };
}

describe('MobileDrawer', () => {
  it('is hidden while the drawer state is closed', () => {
    const { fixture } = setup();
    const drawer = fixture.nativeElement.querySelector('#drawer');
    expect(drawer.hidden).toBe(true);
  });

  it('renders the three site page links regardless of route', () => {
    const { fixture } = setup();
    const anchors = Array.from(fixture.nativeElement.querySelectorAll('#drawer a')) as HTMLAnchorElement[];
    const pageHrefs = anchors.map((a) => a.getAttribute('ng-reflect-router-link') ?? a.pathname);
    expect(anchors.length).toBeGreaterThanOrEqual(3);
    expect(pageHrefs.some((h) => h?.includes('about-us'))).toBe(true);
    expect(pageHrefs.some((h) => h?.includes('services'))).toBe(true);
  });

  it('shows Home section anchors (inicio/servicios/sobre-amd/cifras/confianza/contacto) while on "/"', () => {
    const { fixture } = setup();
    const anchors = Array.from(fixture.nativeElement.querySelectorAll('#drawer a')) as HTMLAnchorElement[];
    expect(anchors.length).toBe(9);

    const sectionAnchors = anchors.slice(3);
    const renderedFragments = sectionAnchors.map(
      (a) => a.getAttribute('ng-reflect-fragment') ?? a.getAttribute('href')?.split('#')[1],
    );
    expect(renderedFragments).toEqual(SECTION_NAV_ANCHORS.map((a) => a.id));
  });

  it('hides Home section anchors once navigated away from "/"', async () => {
    const { fixture, router } = setup();
    await router.navigateByUrl('/services');
    fixture.detectChanges();

    const anchors = fixture.nativeElement.querySelectorAll('#drawer a');
    expect(anchors.length).toBe(3);
  });

  describe('focus trap while open (REQ-013)', () => {
    it('moves focus to the first focusable link when opened', () => {
      const { fixture, drawerState } = setup();
      drawerState.open();
      fixture.detectChanges();
      TestBed.tick();

      const firstLink = fixture.nativeElement.querySelector('#drawer a');
      expect(document.activeElement).toBe(firstLink);
    });

    it('wraps Tab from the last link back to the first (forward trap)', () => {
      const { fixture, drawerState } = setup();
      drawerState.open();
      fixture.detectChanges();
      TestBed.tick();

      const links = Array.from(fixture.nativeElement.querySelectorAll('#drawer a')) as HTMLAnchorElement[];
      const first = links[0];
      const last = links[links.length - 1];
      last.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      fixture.nativeElement.querySelector('#drawer').dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(first);
    });

    it('wraps Shift+Tab from the first link back to the last (backward trap)', () => {
      const { fixture, drawerState } = setup();
      drawerState.open();
      fixture.detectChanges();
      TestBed.tick();

      const links = Array.from(fixture.nativeElement.querySelectorAll('#drawer a')) as HTMLAnchorElement[];
      const first = links[0];
      const last = links[links.length - 1];
      first.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      fixture.nativeElement.querySelector('#drawer').dispatchEvent(event);

      expect(document.activeElement).toBe(last);
    });

    it('closes on Escape and restores focus to the element that opened it', () => {
      const { fixture, drawerState } = setup();
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);

      drawerState.open(trigger);
      fixture.detectChanges();
      TestBed.tick();

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      fixture.nativeElement.querySelector('#drawer').dispatchEvent(event);
      fixture.detectChanges();

      expect(drawerState.isOpen()).toBe(false);
      expect(document.activeElement).toBe(trigger);

      document.body.removeChild(trigger);
    });

    it('clicking a link closes the drawer (and thus restores focus via DrawerStateService)', () => {
      const { fixture, drawerState } = setup();
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);

      drawerState.open(trigger);
      fixture.detectChanges();

      const firstLink = fixture.nativeElement.querySelector('#drawer a') as HTMLAnchorElement;
      firstLink.click();

      expect(drawerState.isOpen()).toBe(false);
      expect(document.activeElement).toBe(trigger);

      document.body.removeChild(trigger);
    });
  });
});

describe('navigation labels non-repetition & orphan keys (REQ-008 · T004)', () => {
  const PAGE_NAV_KEYS = ['navHome', 'navAboutPage', 'navServicesPage'] as const;

  const locales = [
    { code: 'es', dict: es as Record<string, string> },
    { code: 'en', dict: en as Record<string, string> },
  ] as const;

  for (const { code, dict } of locales) {
    it(`page navigation links and Home section anchors have disjoint labels in ${code}`, () => {
      const pageValues = PAGE_NAV_KEYS.map((key) => dict[key]);
      const sectionValues = SECTION_NAV_ANCHORS.map((anchor) => dict[anchor.labelKey]);
      const collision = pageValues.filter((value) => sectionValues.includes(value));

      expect(collision, `Colliding label value in ${code}: ${collision.join(', ')}`).toEqual([]);
    });
  }

  it('retired rail keys (sideHome, sideNavAria) do not exist in es.json or en.json', () => {
    expect('sideHome' in es).toBe(false);
    expect('sideNavAria' in es).toBe(false);
    expect('sideHome' in en).toBe(false);
    expect('sideNavAria' in en).toBe(false);
  });
});

