import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AmdPreset } from '../styles/theme-primeng';
import { LocaleService } from './core/i18n/locale.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
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
