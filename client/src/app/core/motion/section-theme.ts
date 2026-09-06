export interface SectionTone {
  readonly id: string;
  readonly top: number;
  readonly bottom: number;
  readonly isLight: boolean;
}

/**
 * Pure algorithm for determining which section is positioned under a vertical coordinate `y`.
 *
 * Implements behavior parity with the original `HomeSideNav.sectionAtY` (T002 · DD-030 · REQ-008):
 * - Pure function: strictly no DOM access (no `window`, `document`, or `getBoundingClientRect`).
 * - Inclusive boundaries: matches if `y >= section.top && y <= section.bottom`.
 * - Last match wins: when sections touch at an exact boundary or overlap, the later
 *   section in DOM/iteration order is returned.
 * - Viewport-relative contract: coordinates (`top`, `bottom`, and probe `y`) MUST be
 *   viewport-relative (e.g. from `getBoundingClientRect()`), never document `offsetTop`.
 * - Returns `null` if `y` falls outside all sections or if `sections` is empty.
 */
export function probeSectionThemeAt(
  sections: readonly SectionTone[],
  y: number,
): SectionTone | null {
  let hit: SectionTone | null = null;
  for (const section of sections) {
    if (y >= section.top && y <= section.bottom) {
      hit = section;
    }
  }
  return hit;
}
