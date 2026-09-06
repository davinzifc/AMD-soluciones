import es from '../../../assets/i18n/es.json';
import en from '../../../assets/i18n/en.json';

/**
 * Gate de valores de diccionario (DC-9 / T003 / design §9).
 *
 * `i18n-key-parity` compara únicamente claves; este test valida la integridad de los valores
 * en los diccionarios español e inglés:
 * 1. Ningún título de sub-servicio (`sub*t`) contiene prefijo numérico ("NN. ").
 * 2. Exactamente 31 pares título/descripción existen en ambos idiomas (sin pérdidas ni duplicados).
 * 3. Paridad estructural 1:1 entre cada `sub*t` y su respectivo `sub*d`.
 *
 * LO QUE ESTE GATE NO PUEDE PROBAR:
 * Un remapeo semántico título↔descripción (p. ej. que subC06t corresponda a la descripción
 * de subC08d). Contra esa clase de defecto actúa la decisión arquitectónica DD-027 (el reorden
 * comercial se implementa moviendo las entradas del array en `service-catalog.data.ts`, nunca
 * reasignando valores entre claves en `es.json`/`en.json`) complementada con revisión humana (T3).
 */
describe('i18n values gate (DC-9)', () => {
  const NUMERIC_PREFIX_REGEX = /^\d+\.\s/;

  const dictionaries = [
    { locale: 'es', dict: es as Record<string, string> },
    { locale: 'en', dict: en as Record<string, string> },
  ];

  for (const { locale, dict } of dictionaries) {
    describe(`locale: ${locale}`, () => {
      it(`no sub*t service title starts with a numeric prefix (e.g. "01. ")`, () => {
        const titleEntries = Object.entries(dict).filter(([key]) => /^sub.*t$/.test(key));

        expect(titleEntries.length).toBe(31);

        const failing = titleEntries.filter(([, value]) => NUMERIC_PREFIX_REGEX.test(value));
        expect(failing).toEqual([]);
      });

      it(`has exactly 31 sub*t titles and 31 sub*d descriptions`, () => {
        const titleKeys = Object.keys(dict).filter((key) => /^sub.*t$/.test(key));
        const descKeys = Object.keys(dict).filter((key) => /^sub.*d$/.test(key));

        expect(titleKeys.length).toBe(31);
        expect(descKeys.length).toBe(31);
      });

      it(`every sub*t title has a matching sub*d description`, () => {
        const titleKeys = Object.keys(dict).filter((key) => /^sub.*t$/.test(key));

        for (const titleKey of titleKeys) {
          const descKey = titleKey.slice(0, -1) + 'd';
          expect(dict[descKey]).toBeDefined();
          expect(typeof dict[descKey]).toBe('string');
          expect(dict[descKey].length).toBeGreaterThan(0);
        }
      });
    });
  }
});
