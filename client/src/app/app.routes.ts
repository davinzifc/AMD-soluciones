import { Routes } from '@angular/router';

/**
 * Route contract (design §6 Routes; DD-014 — HITL pivot 2026-08-05): English
 * path segments in both locales — only UI copy flips with `LocaleService`.
 * Services group anchors (`#contabilidad`…) are fragments handled by
 * `withInMemoryScrolling` (see `app.config.ts`), never a `/services/:group`
 * child route. The wildcard resolves to a real 404 page component, not a
 * `redirectTo`.
 *
 * Deep features are lazy-loaded (`loadComponent`) per NFR-001/002 — Home,
 * About, Services, and the legal stubs stay out of the initial bundle.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page/home-page').then((m) => m.HomePage),
    title: 'AMD Soluciones Integrales S.A.S.',
  },
  {
    path: 'about-us',
    loadComponent: () => import('./features/about/about-page/about-page').then((m) => m.AboutPage),
    title: 'Quiénes somos · AMD Soluciones',
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services-page/services-page').then((m) => m.ServicesPage),
    title: 'Servicios · AMD Soluciones',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/legal-stub-page/legal-stub-page').then((m) => m.LegalStubPage),
    data: { titleKey: 'ftPrivacy' },
    title: 'Privacidad · AMD Soluciones',
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/legal-stub-page/legal-stub-page').then((m) => m.LegalStubPage),
    data: { titleKey: 'ftTerms' },
    title: 'Términos · AMD Soluciones',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found-page/not-found-page').then((m) => m.NotFoundPage),
    title: 'Página no encontrada · AMD Soluciones',
  },
];
