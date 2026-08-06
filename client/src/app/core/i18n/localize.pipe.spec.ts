import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocaleService } from './locale.service';
import { LocalizePipe } from './localize.pipe';

describe('LocalizePipe', () => {
  it('delegates to LocaleService.translate', () => {
    const fakeLocaleService = { translate: vi.fn((key: string) => `translated:${key}`) };
    TestBed.configureTestingModule({
      providers: [{ provide: LocaleService, useValue: fakeLocaleService }],
    });

    const pipe = TestBed.runInInjectionContext(() => new LocalizePipe());
    expect(pipe.transform('heroCtaPrimary')).toBe('translated:heroCtaPrimary');
    expect(fakeLocaleService.translate).toHaveBeenCalledWith('heroCtaPrimary');
  });

  it('falls back to the raw key for an unknown key', () => {
    const fakeLocaleService = { translate: (key: string) => key };
    TestBed.configureTestingModule({
      providers: [{ provide: LocaleService, useValue: fakeLocaleService }],
    });

    const pipe = TestBed.runInInjectionContext(() => new LocalizePipe());
    expect(pipe.transform('doesNotExist')).toBe('doesNotExist');
  });

  describe('rendered through a template (reactivity regression guard)', () => {
    const ES_DICT = { greeting: 'Hola' };
    const EN_DICT = { greeting: 'Hello' };

    @Component({
      selector: 'app-test-host',
      imports: [LocalizePipe],
      template: `{{ 'greeting' | localize }}`,
    })
    class TestHostComponent {}

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

    beforeEach(() => {
      localStorage.clear();
      stubFetch();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('updates the bound DOM text when the locale toggles ES -> EN', async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      const locale = TestBed.inject(LocaleService);

      // Regression guard for FAIL #2: this exercises `??pipeBind1` through a real
      // rendered binding, not an imperative `transform()` call.
      await locale.whenReady();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Hola');

      await locale.setLocale('en');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Hello');

      await locale.setLocale('es');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Hola');
    });
  });
});
