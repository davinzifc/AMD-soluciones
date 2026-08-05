import es from '../../../assets/i18n/es.json';
import en from '../../../assets/i18n/en.json';

import { diffDictionaryKeys } from './i18n-key-parity';

function loadDictionary(locale: 'es' | 'en'): Record<string, string> {
  return (locale === 'en' ? en : es) as Record<string, string>;
}

describe('diffDictionaryKeys', () => {
  it('reports equal dictionaries as having no divergence', () => {
    const result = diffDictionaryKeys({ a: '1', b: '2' }, { a: 'x', b: 'y' });
    expect(result).toEqual({ missingInA: [], missingInB: [], isEqual: true });
  });

  it('fails when a key exists only in the second dictionary', () => {
    const result = diffDictionaryKeys({ a: '1' }, { a: '1', b: '2' });
    expect(result.isEqual).toBe(false);
    expect(result.missingInA).toEqual(['b']);
    expect(result.missingInB).toEqual([]);
  });

  it('fails when a key exists only in the first dictionary', () => {
    const result = diffDictionaryKeys({ a: '1', b: '2' }, { a: '1' });
    expect(result.isEqual).toBe(false);
    expect(result.missingInA).toEqual([]);
    expect(result.missingInB).toEqual(['b']);
  });

  it('is the disqualifier-buster: divergent real-shaped fixtures do NOT silently pass', () => {
    const es = { heroCtaPrimary: 'Hablar con un asesor', onlyEs: 'x' };
    const en = { heroCtaPrimary: 'Talk to an advisor', onlyEn: 'y' };
    const result = diffDictionaryKeys(es, en);
    expect(result.isEqual).toBe(false);
    expect(result.missingInA).toEqual(['onlyEn']);
    expect(result.missingInB).toEqual(['onlyEs']);
  });

  it('es.json and en.json have full key parity (fails this suite if a locale falls behind)', () => {
    const es = loadDictionary('es');
    const en = loadDictionary('en');
    const result = diffDictionaryKeys(es, en);
    expect(result.missingInA).toEqual([]);
    expect(result.missingInB).toEqual([]);
    expect(result.isEqual).toBe(true);
  });

  it('both real dictionaries are non-empty (guards against an accidental empty-file false pass)', () => {
    const es = loadDictionary('es');
    const en = loadDictionary('en');
    expect(Object.keys(es).length).toBeGreaterThan(50);
    expect(Object.keys(en).length).toBeGreaterThan(50);
  });
});
