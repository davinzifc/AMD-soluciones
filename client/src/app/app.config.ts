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
    // ViewportScroller anchor offset function (REQ-008 · T003):
    // Offsets anchor scrolling dynamically so sticky chrome does not cover headings.
    // Reconciles with actual geometry: TopNav (68px min-height + 1px border = 69px)
    // plus SectionNav sub-header (44px height = 113px total) visible only at >=900px.
    // At >=900px: clears 113px + 1.5rem breathing room (137px at 16px root).
    // At <900px: clears 69px + 1.5rem breathing room (93px at 16px root).
    provideAppInitializer(() => {
      const scroller = inject(ViewportScroller);
      scroller.setOffset(() => {
        if (typeof window === 'undefined') {
          return [0, 0];
        }
        const topNavH = 69; // 68px min-height + 1px bottom border
        const sectionNavH = 44; // sub-header height
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const breathingRoom = 1.5 * rootFontSize;
        const hasSubNav = window.innerWidth >= 900;
        const chromeH = hasSubNav ? topNavH + sectionNavH : topNavH;
        const yOffset = chromeH + breathingRoom;
        return [0, yOffset];
      });
    }),
    // Gate first paint on the active locale's dictionary (REQ-009 / T003 review fix):
    // without this, LocalizePipe bindings render raw keys until the async fetch resolves.
    provideAppInitializer(() => inject(LocaleService).whenReady())
  ]
};
