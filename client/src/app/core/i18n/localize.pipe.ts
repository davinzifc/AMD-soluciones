import { Pipe, PipeTransform, inject } from '@angular/core';

import { LocaleService } from './locale.service';

/**
 * Template pipe for the hand-rolled i18n foundation (DD-004): `{{ 'heroCtaPrimary' | localize }}`.
 *
 * Declared `pure: false` on purpose: the pipe's only input is a constant string
 * key, so Angular's pure-pipe memoization (`bindingUpdated`) would return the
 * cached result on every change-detection pass after the first and never
 * re-invoke `transform()` when the locale changes — even though reading
 * `LocaleService.dictionary()` inside `transform` marks the view dirty. Impure
 * pipes re-run on every check instead; the cost is a single `Map`/object
 * lookup, which is negligible for this landing.
 */
@Pipe({ name: 'localize', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(key: string): string {
    return this.localeService.translate(key);
  }
}
