import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { LocaleService } from './core/i18n/locale.service';
import { AboutPage } from './features/about/about-page/about-page';
import { LegalStubPage } from './features/legal/legal-stub-page/legal-stub-page';
import { HomePage } from './features/home/home-page/home-page';
import { NotFoundPage } from './features/not-found/not-found-page/not-found-page';
import { ServicesPage } from './features/services/services-page/services-page';

const fakeLocaleService = { translate: (key: string) => key };

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

/**
 * Router smoke suite (T005 verification). Exercises the REAL `app.routes.ts`
 * config with the SAME `withInMemoryScrolling` wiring as `app.config.ts`, so
 * this proves navigation resolves actual components — not just an
 * `Routes.length` assertion — and that the fragment/scroll contract is
 * configured for `/servicios#<group>` and `/#contacto`.
 */
describe('app.routes — router smoke', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    stubFetch();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(
          routes,
          withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
        ),
        { provide: LocaleService, useValue: fakeLocaleService },
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves HomePage at "/"', async () => {
    const home = await harness.navigateByUrl('/', HomePage);
    expect(home).toBeInstanceOf(HomePage);
  });

  it('resolves AboutPage at "/quienes-somos"', async () => {
    const about = await harness.navigateByUrl('/quienes-somos', AboutPage);
    expect(about).toBeInstanceOf(AboutPage);
  });

  it('resolves ServicesPage at "/servicios"', async () => {
    const services = await harness.navigateByUrl('/servicios', ServicesPage);
    expect(services).toBeInstanceOf(ServicesPage);
  });

  it('resolves the legal stub at "/privacidad" titled via ftPrivacy', async () => {
    const legal = await harness.navigateByUrl('/privacidad', LegalStubPage);
    expect(legal).toBeInstanceOf(LegalStubPage);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('ftPrivacy');
  });

  it('resolves the legal stub at "/terminos" titled via ftTerms', async () => {
    const legal = await harness.navigateByUrl('/terminos', LegalStubPage);
    expect(legal).toBeInstanceOf(LegalStubPage);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('ftTerms');
  });

  it('resolves NotFoundPage for an unknown path — a real page, not a silent redirect', async () => {
    const notFound = await harness.navigateByUrl('/this-route-does-not-exist', NotFoundPage);
    expect(notFound).toBeInstanceOf(NotFoundPage);

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/this-route-does-not-exist');
  });

  it('navigates to "/servicios#contabilidad" (fragment) and the anchor target exists in the DOM', async () => {
    const services = await harness.navigateByUrl('/servicios#contabilidad', ServicesPage);
    expect(services).toBeInstanceOf(ServicesPage);

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/servicios#contabilidad');
    expect(harness.routeNativeElement?.querySelector('#contabilidad')).toBeTruthy();
  });

  it('navigates to "/#contacto" (fragment) and the anchor target exists in the DOM', async () => {
    const home = await harness.navigateByUrl('/#contacto', HomePage);
    expect(home).toBeInstanceOf(HomePage);

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/#contacto');
    expect(harness.routeNativeElement?.querySelector('#contacto')).toBeTruthy();
  });

  it('does NOT declare a "/servicios/:group" (or any) child route — group anchors are fragments only', () => {
    const serviciosRoute = routes.find((route) => route.path === 'servicios');
    expect(serviciosRoute?.children ?? []).toEqual([]);
    expect(routes.some((route) => route.path?.startsWith('servicios/'))).toBe(false);
  });

  it('places the wildcard "**" route last (first-match-wins ordering)', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });
});
