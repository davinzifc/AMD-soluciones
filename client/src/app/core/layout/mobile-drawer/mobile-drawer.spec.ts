import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LocaleService } from '../../i18n/locale.service';
import { DrawerStateService } from '../drawer-state.service';
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
    expect(pageHrefs.some((h) => h?.includes('quienes-somos'))).toBe(true);
    expect(pageHrefs.some((h) => h?.includes('servicios'))).toBe(true);
  });

  it('shows Home section anchors (servicios/sobre-amd/confianza/contacto) while on "/"', () => {
    const { fixture } = setup();
    const anchors = Array.from(fixture.nativeElement.querySelectorAll('#drawer a')) as HTMLAnchorElement[];
    expect(anchors.length).toBe(7);
  });

  it('hides Home section anchors once navigated away from "/"', async () => {
    const { fixture, router } = setup();
    await router.navigateByUrl('/servicios');
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
