/**
 * Key-parity helper for locale dictionaries (REQ-009 / design §6 i18n).
 * Flags divergence between two flat dictionaries so a missing key in either
 * locale fails the check instead of silently falling back to the raw key.
 */
export interface KeyParityResult {
  /** Keys present in `b` but missing from `a`. */
  missingInA: string[];
  /** Keys present in `a` but missing from `b`. */
  missingInB: string[];
  isEqual: boolean;
}

export function diffDictionaryKeys(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): KeyParityResult {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const missingInA = [...keysB].filter((key) => !keysA.has(key)).sort();
  const missingInB = [...keysA].filter((key) => !keysB.has(key)).sort();

  return {
    missingInA,
    missingInB,
    isEqual: missingInA.length === 0 && missingInB.length === 0,
  };
}
