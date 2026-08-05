import { Injectable, signal } from '@angular/core';

import {
  DEFAULT_LOCALE,
  isLocaleId,
  LOCALE_STORAGE_KEY,
  type LocaleDictionary,
  type LocaleId,
} from './locale.model';

/**
 * Hand-rolled i18n service (DD-004) — no `@ngx-translate`.
 * Loads runtime JSON dictionaries from `assets/i18n/{locale}.json`,
 * persists the chosen locale, and keeps `documentElement.lang` in sync.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly cache = new Map<LocaleId, LocaleDictionary>();
  private readonly localeSignal = signal<LocaleId>(this.readPersistedLocale());
  private readonly dictionarySignal = signal<LocaleDictionary>({});
  private ready: Promise<void>;

  readonly locale = this.localeSignal.asReadonly();
  readonly dictionary = this.dictionarySignal.asReadonly();

  constructor() {
    this.applyDocumentLang(this.localeSignal());
    this.ready = this.loadAndApply(this.localeSignal());
  }

  /** Resolves current translation for `key`, falling back to the key itself. */
  translate(key: string): string {
    return this.dictionarySignal()[key] ?? key;
  }

  /** Resolves once the currently active locale's dictionary has loaded. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  /** Switches locale, persists it, and updates `documentElement.lang`. Route/fragment untouched (caller's concern). */
  async setLocale(next: LocaleId): Promise<void> {
    if (next === this.localeSignal() && this.cache.has(next)) {
      return;
    }
    this.ready = this.loadAndApply(next);
    await this.ready;
  }

  private async loadAndApply(locale: LocaleId): Promise<void> {
    const dictionary = await this.getDictionary(locale);
    this.localeSignal.set(locale);
    this.dictionarySignal.set(dictionary);
    this.persistLocale(locale);
    this.applyDocumentLang(locale);
  }

  private async getDictionary(locale: LocaleId): Promise<LocaleDictionary> {
    const cached = this.cache.get(locale);
    if (cached) {
      return cached;
    }

    const response = await fetch(`/assets/i18n/${locale}.json`);
    if (!response.ok) {
      throw new Error(`LocaleService: unable to load dictionary for "${locale}" (${response.status})`);
    }

    const dictionary = (await response.json()) as LocaleDictionary;
    this.cache.set(locale, dictionary);
    return dictionary;
  }

  private applyDocumentLang(locale: LocaleId): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }

  private persistLocale(locale: LocaleId): void {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage unavailable (private mode / SSR) — locale stays active in-memory only.
    }
  }

  private readPersistedLocale(): LocaleId {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      return isLocaleId(stored) ? stored : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }
}
