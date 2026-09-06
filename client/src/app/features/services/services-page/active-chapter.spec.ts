import { ChapterPosition, resolveActiveChapter } from './active-chapter';

type NonEmptyPositions = readonly [ChapterPosition, ...ChapterPosition[]];

describe('resolveActiveChapter', () => {
  const SAMPLE_CHAPTERS: NonEmptyPositions = [
    { id: 'contabilidad', top: 100 },
    { id: 'administrativa', top: 800 },
    { id: 'riesgo', top: 1500 },
    { id: 'asesoria', top: 2200 },
    { id: 'marca', top: 2900 },
  ];

  describe('Scenario 1: Scroll normal (REQ-001 — index follows reading position)', () => {
    it('marks Contabilidad active when only Contabilidad has crossed the reading line', () => {
      const positions: NonEmptyPositions = [
        { id: 'contabilidad', top: 150 },
        { id: 'administrativa', top: 750 },
        { id: 'riesgo', top: 1400 },
        { id: 'asesoria', top: 2100 },
        { id: 'marca', top: 2800 },
      ];
      expect(resolveActiveChapter(positions, 200, false)).toBe('contabilidad');
    });

    it('marks chapter active progressively as user scrolls through each section', () => {
      const readingLine = 250;

      // Scrolled to Administrativa
      const atAdmin: NonEmptyPositions = [
        { id: 'contabilidad', top: -350 },
        { id: 'administrativa', top: 200 },
        { id: 'riesgo', top: 850 },
        { id: 'asesoria', top: 1500 },
        { id: 'marca', top: 2200 },
      ];
      expect(resolveActiveChapter(atAdmin, readingLine, false)).toBe('administrativa');

      // Scrolled to Asesoría
      const atAsesoria: NonEmptyPositions = [
        { id: 'contabilidad', top: -1800 },
        { id: 'administrativa', top: -1100 },
        { id: 'riesgo', top: -400 },
        { id: 'asesoria', top: 180 },
        { id: 'marca', top: 900 },
      ];
      expect(resolveActiveChapter(atAsesoria, readingLine, false)).toBe('asesoria');
    });
  });

  describe('Scenario 2: Salto por ancla (REQ-001 / DC-1 gate — anchor jump bugfix)', () => {
    it('returns target chapter when it is just above the reading line and next chapter is already in viewport', () => {
      // Bug from mockup v0.1: clicking #riesgo lands with target top just at/above readingLine (180 <= 200),
      // while the following chapter (Asesoría at 520) is already partially visible inside an 800px viewport.
      const jumpToRiesgo: NonEmptyPositions = [
        { id: 'contabilidad', top: -1400 },
        { id: 'administrativa', top: -650 },
        { id: 'riesgo', top: 180 },
        { id: 'asesoria', top: 520 },
        { id: 'marca', top: 1200 },
      ];
      const readingLine = 200;

      expect(resolveActiveChapter(jumpToRiesgo, readingLine, false)).toBe('riesgo');
    });

    it('returns target chapter when its top is exactly on the reading line', () => {
      const jumpExact: NonEmptyPositions = [
        { id: 'contabilidad', top: -1200 },
        { id: 'administrativa', top: -500 },
        { id: 'riesgo', top: 200 },
        { id: 'asesoria', top: 480 },
        { id: 'marca', top: 1100 },
      ];
      expect(resolveActiveChapter(jumpExact, 200, false)).toBe('riesgo');
    });

    it('returns target chapter when positioned higher up and next chapter has entered viewport below reading line', () => {
      const jumpHigher: NonEmptyPositions = [
        { id: 'contabilidad', top: -1600 },
        { id: 'administrativa', top: -900 },
        { id: 'riesgo', top: 80 },
        { id: 'asesoria', top: 420 },
        { id: 'marca', top: 950 },
      ];
      expect(resolveActiveChapter(jumpHigher, 200, false)).toBe('riesgo');
    });
  });

  describe('Scenario 3: Final de página corto (REQ-001 — atBottom = true)', () => {
    it('always selects the last chapter atBottom even if it never crosses the reading line', () => {
      // The last chapter (Marca) is short and never reaches readingLine (200) before reaching page end.
      const atPageBottom: NonEmptyPositions = [
        { id: 'contabilidad', top: -2500 },
        { id: 'administrativa', top: -1800 },
        { id: 'riesgo', top: -1100 },
        { id: 'asesoria', top: -400 },
        { id: 'marca', top: 380 },
      ];
      const readingLine = 200;

      expect(resolveActiveChapter(atPageBottom, readingLine, true)).toBe('marca');
    });

    it('returns the last chapter atBottom regardless of readingLine value', () => {
      const atPageBottom: NonEmptyPositions = [
        { id: 'contabilidad', top: -3000 },
        { id: 'administrativa', top: -2200 },
        { id: 'riesgo', top: -1500 },
        { id: 'asesoria', top: -800 },
        { id: 'marca', top: 500 },
      ];
      expect(resolveActiveChapter(atPageBottom, 100, true)).toBe('marca');
    });
  });

  describe('Edge cases and invariants', () => {
    it('returns the first chapter if no chapter has crossed the reading line', () => {
      const aboveAll: NonEmptyPositions = [
        { id: 'contabilidad', top: 400 },
        { id: 'administrativa', top: 1100 },
        { id: 'riesgo', top: 1800 },
        { id: 'asesoria', top: 2500 },
        { id: 'marca', top: 3200 },
      ];
      expect(resolveActiveChapter(aboveAll, 200, false)).toBe('contabilidad');
    });

    it('handles a single-element list when not atBottom and not crossed', () => {
      const single: NonEmptyPositions = [{ id: 'solo', top: 500 }];
      expect(resolveActiveChapter(single, 200, false)).toBe('solo');
    });

    it('handles a single-element list when crossed', () => {
      const single: NonEmptyPositions = [{ id: 'solo', top: 50 }];
      expect(resolveActiveChapter(single, 200, false)).toBe('solo');
    });

    it('handles a single-element list when atBottom is true', () => {
      const single: NonEmptyPositions = [{ id: 'solo', top: 600 }];
      expect(resolveActiveChapter(single, 200, true)).toBe('solo');
    });

    it('never returns undefined, null, or empty string', () => {
      const result = resolveActiveChapter(SAMPLE_CHAPTERS, 200, false);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
