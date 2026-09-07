import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';

@Component({ selector: 'app-test-empty', template: '' })
class EmptyRouteComponent {}

function stubFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({}),
        }) as Response,
    ),
  );
}

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    stubFetch();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: EmptyRouteComponent },
          { path: '**', component: EmptyRouteComponent },
        ]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('composes the shell chrome (top nav, drawer host, footer, FAB) around the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-top-nav')).toBeTruthy();
    expect(compiled.querySelector('app-mobile-drawer')).toBeTruthy();
    expect(compiled.querySelector('app-site-footer')).toBeTruthy();
    expect(compiled.querySelector('app-whatsapp-fab')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  describe('Home-vs-deep shell flag (T003 · REQ-008)', () => {
    it('mounts SectionNav inside <main> and does not add body.has-side-nav on Home ("/")', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const main = fixture.nativeElement.querySelector('main.app-shell');
      const sectionNav = fixture.nativeElement.querySelector('app-section-nav');
      expect(sectionNav).toBeTruthy();
      // KZ-004 ancestry assertion: main host contains SectionNav
      expect(main.contains(sectionNav)).toBe(true);
      expect(document.body.classList.contains('has-side-nav')).toBe(false);
    });

    it('removes SectionNav once navigated to deep routes like /about-us and /services (REQ-008)', async () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/about-us');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-section-nav')).toBeNull();
      expect(document.body.classList.contains('has-side-nav')).toBe(false);

      await router.navigateByUrl('/services');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-section-nav')).toBeNull();
      expect(document.body.classList.contains('has-side-nav')).toBe(false);
    });
  });
});
