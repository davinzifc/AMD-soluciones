/** Supported UI locales (REQ-009). Path segments stay Spanish (DD-014); only copy flips. */
export type LocaleId = 'es' | 'en';

export const DEFAULT_LOCALE: LocaleId = 'es';

/** localStorage key for persisted locale (design §6 i18n). */
export const LOCALE_STORAGE_KEY = 'amd.locale';

export function isLocaleId(value: unknown): value is LocaleId {
  return value === 'es' || value === 'en';
}

/** Flat string dictionary as served from `assets/i18n/{locale}.json`. */
export type LocaleDictionary = Record<string, string>;
