import { TestBed } from '@angular/core/testing';

import { LOCALE_STORAGE_KEY } from './locale.model';
import { LocaleService } from './locale.service';

const ES_DICT = { greeting: 'Hola', heroCtaPrimary: 'Hablar con un asesor' };
const EN_DICT = { greeting: 'Hello', heroCtaPrimary: 'Talk to an advisor' };

function stubFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const locale = url.includes('en.json') ? 'en' : 'es';
      const body = locale === 'en' ? EN_DICT : ES_DICT;
      return {
        ok: true,
        status: 200,
        json: async () => body,
      } as Response;
    }),
  );
}

describe('LocaleService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to the default locale (es) when nothing is persisted', () => {
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('es');
  });

  it('restores a previously persisted locale on construction', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('en');
  });

  it('ignores an invalid persisted value and falls back to the default locale', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    const service = TestBed.inject(LocaleService);
    expect(service.locale()).toBe('es');
  });

  it('updates document.documentElement.lang synchronously on construction', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    TestBed.inject(LocaleService);
    expect(document.documentElement.lang).toBe('en');
  });

  it('persists the locale under the amd.locale storage key on setLocale', async () => {
    const service = TestBed.inject(LocaleService);
    await service.setLocale('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('updates document.documentElement.lang when the locale changes', async () => {
    const service = TestBed.inject(LocaleService);
    await service.whenReady();
    expect(document.documentElement.lang).toBe('es');

    await service.setLocale('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('loads the matching dictionary so translate() resolves bound strings per locale', async () => {
    const service = TestBed.inject(LocaleService);
    await service.whenReady();
    expect(service.translate('greeting')).toBe('Hola');

    await service.setLocale('en');
    expect(service.translate('greeting')).toBe('Hello');
  });

  it('falls back to the raw key when a translation is missing', async () => {
    const service = TestBed.inject(LocaleService);
    await service.whenReady();
    expect(service.translate('unknownKey')).toBe('unknownKey');
  });

  it('keeps the reload-persisted locale (no fresh service instance loses it)', async () => {
    const first = TestBed.inject(LocaleService);
    await first.setLocale('en');

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(LocaleService);
    expect(reloaded.locale()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
