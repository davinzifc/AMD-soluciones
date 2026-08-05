import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AmdPreset } from '../styles/theme-primeng';
import { LocaleService } from './core/i18n/locale.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Fragment / scroll contract (design §6): Home "Más info" → /services#<group>,
    // deep-page Contactar → /#contacto (T005).
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AmdPreset,
        options: {
          darkModeSelector: false
        }
      }
    }),
    // Gate first paint on the active locale's dictionary (REQ-009 / T003 review fix):
    // without this, LocalizePipe bindings render raw keys until the async fetch resolves.
    provideAppInitializer(() => inject(LocaleService).whenReady())
  ]
};
