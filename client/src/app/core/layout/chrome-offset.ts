/**
 * Chrome dimensions (DD-029 · DD-030 · REQ-008 · T018).
 *
 * Single source of truth for sticky chrome dimensions and anchor scroll offset.
 * Reconciles the anchor offset reserved by ViewportScroller in app.config.ts
 * with the visibility threshold of SectionNav in section-nav.ts.
 */

export const TOP_NAV_HEIGHT = 69; // 68px min-height + 1px bottom border
export const SECTION_NAV_HEIGHT = 44; // sub-header height
export const SUB_HEADER_BREAKPOINT = 900;

/**
 * Tolerance in pixels added to the sub-header visibility threshold (T018 rework).
 *
 * Browsers round scroll positions to physical pixels while getBoundingClientRect()
 * can return fractional subpixel values (e.g. 137.4px instead of 137px).
 * A 2px tolerance absorbs subpixel rounding on anchor landing without altering
 * the exact anchor clearance offset computed by getChromeOffset().
 */
export const SUB_HEADER_THRESHOLD_TOLERANCE = 2;

/**
 * Returns sticky chrome height in pixels depending on viewport width (with/without SectionNav sub-header).
 */
export function getChromeHeight(viewportWidth?: number): number {
  const width = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return width >= SUB_HEADER_BREAKPOINT ? TOP_NAV_HEIGHT + SECTION_NAV_HEIGHT : TOP_NAV_HEIGHT;
}

/**
 * Returns anchor scroll clearance offset in pixels (chrome height + 1.5rem breathing room).
 * Consumed by app.config.ts for ViewportScroller and by SectionNav for its hero exit threshold.
 */
export function getChromeOffset(viewportWidth?: number): number {
  if (typeof window === 'undefined' && viewportWidth === undefined) {
    return 0;
  }
  const width = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  const chromeH = getChromeHeight(width);
  const rootFontSize =
    typeof document !== 'undefined' && document.documentElement
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;
  const breathingRoom = 1.5 * rootFontSize;
  return chromeH + breathingRoom;
}
