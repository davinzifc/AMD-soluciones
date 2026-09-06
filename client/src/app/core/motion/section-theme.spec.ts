import { probeSectionThemeAt, SectionTone } from './section-theme';

describe('probeSectionThemeAt', () => {
  const sampleSections: readonly SectionTone[] = [
    { id: 'hero', top: 0, bottom: 500, isLight: false },
    { id: 'servicios', top: 500, bottom: 1200, isLight: true },
    { id: 'manifiesto', top: 1300, bottom: 1800, isLight: true },
  ];

  it('returns the section when y is strictly inside its vertical bounds', () => {
    const hit = probeSectionThemeAt(sampleSections, 250);
    expect(hit).toEqual({ id: 'hero', top: 0, bottom: 500, isLight: false });

    const hitLight = probeSectionThemeAt(sampleSections, 800);
    expect(hitLight).toEqual({ id: 'servicios', top: 500, bottom: 1200, isLight: true });
  });

  it('returns the last section in DOM order on the exact boundary between two adjacent sections', () => {
    // hero ends at 500, servicios starts at 500 -> both include 500; last in DOM order wins
    const hit = probeSectionThemeAt(sampleSections, 500);
    expect(hit?.id).toBe('servicios');
  });

  it('returns null when y is outside all sections (before first, in gaps, or after last)', () => {
    // Above all sections
    expect(probeSectionThemeAt(sampleSections, -50)).toBeNull();

    // In gap between servicios (ends at 1200) and manifiesto (starts at 1300)
    expect(probeSectionThemeAt(sampleSections, 1250)).toBeNull();

    // Below all sections
    expect(probeSectionThemeAt(sampleSections, 2000)).toBeNull();
  });

  it('returns null without throwing when given an empty section list', () => {
    expect(() => probeSectionThemeAt([], 100)).not.toThrow();
    expect(probeSectionThemeAt([], 100)).toBeNull();
  });

  it('returns the last matching section when sections overlap', () => {
    const overlappingSections: readonly SectionTone[] = [
      { id: 'parent-dark', top: 100, bottom: 600, isLight: false },
      { id: 'child-light', top: 200, bottom: 400, isLight: true },
    ];

    // Probing at y = 300 matches both parent-dark [100, 600] and child-light [200, 400]
    // The last match in DOM order MUST win (child-light)
    const hit = probeSectionThemeAt(overlappingSections, 300);
    expect(hit?.id).toBe('child-light');
  });
});
