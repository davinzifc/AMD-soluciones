import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AmdPreset } from '../styles/theme-primeng';
import { LocaleService } from './core/i18n/locale.service';
import { PRIME_UI_LICENSE } from '../environments/prime-ui-license';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Fragment / scroll contract (design §6): Home "Más info" → /services#<group>,
    // deep-page Contactar → /#contacto (T005).
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideAnimationsAsync(),
    providePrimeNG({
      // PrimeNG 22+ / PrimeUI — Community or commercial key (https://primeng.dev/configuration).
      // Committed `prime-ui-license.ts` is an empty stub (CI-safe). Local key lives in
      // gitignored `prime-ui-license.local.ts` and is applied by `npm run license:apply`
      // (also via prestart/prebuild). Pages CI can inject secret `PRIME_UI_LICENSE`.
      ...(PRIME_UI_LICENSE ? { license: PRIME_UI_LICENSE } : {}),
      theme: {
        preset: AmdPreset,
        options: {
          darkModeSelector: false
        }
      }
    }),
    // ViewportScroller anchor offset function (REQ-002 / T008):
    // Offsets anchor scrolling dynamically so sticky chrome does not cover headings.
    // Adapts to breakpoint matching CSS scroll-margin-top: calc(var(--nav-h) + 1.5rem)
    // on desktop (>1099px) and calc(var(--nav-h) + 4.5rem) on mobile/tablet (<=1099px)
    // under the sticky chip rail.
    provideAppInitializer(() => {
      const scroller = inject(ViewportScroller);
      scroller.setOffset(() => {
        if (typeof window === 'undefined') {
          return [0, 0];
        }
        const navH = 72;
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const isMobileOrTablet = window.innerWidth <= 1099;
        const yOffset = isMobileOrTablet ? navH + 4.5 * rootFontSize : navH + 1.5 * rootFontSize;
        return [0, yOffset];
      });
    }),
    // Gate first paint on the active locale's dictionary (REQ-009 / T003 review fix):
    // without this, LocalizePipe bindings render raw keys until the async fetch resolves.
    provideAppInitializer(() => inject(LocaleService).whenReady())
  ]
};
