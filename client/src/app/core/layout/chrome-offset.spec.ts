import { describe, expect, it } from 'vitest';
import {
  getChromeHeight,
  getChromeOffset,
  SECTION_NAV_HEIGHT,
  SUB_HEADER_BREAKPOINT,
  SUB_HEADER_THRESHOLD_TOLERANCE,
  TOP_NAV_HEIGHT,
} from './chrome-offset';

describe('chrome-offset (T018 · REQ-008 · DD-029 · DD-030)', () => {
  describe('constants', () => {
    it('declares SUB_HEADER_THRESHOLD_TOLERANCE as 2px to absorb subpixel rounding on anchor landing', () => {
      expect(SUB_HEADER_THRESHOLD_TOLERANCE).toBe(2);
    });
  });

  describe('getChromeHeight', () => {
    it('returns TopNav + SectionNav height (113px) for viewports >= 900px', () => {
      expect(getChromeHeight(900)).toBe(TOP_NAV_HEIGHT + SECTION_NAV_HEIGHT);
      expect(getChromeHeight(1024)).toBe(113);
      expect(getChromeHeight(1440)).toBe(113);
    });

    it('returns only TopNav height (69px) for viewports < 900px', () => {
      expect(getChromeHeight(899)).toBe(TOP_NAV_HEIGHT);
      expect(getChromeHeight(768)).toBe(69);
      expect(getChromeHeight(375)).toBe(69);
    });
  });

  describe('getChromeOffset', () => {
    it('returns chrome height + 1.5rem breathing room (137px) at >= 900px with 16px root font', () => {
      // 113 + 1.5 * 16 = 113 + 24 = 137
      expect(getChromeOffset(1024)).toBe(137);
      expect(getChromeOffset(SUB_HEADER_BREAKPOINT)).toBe(137);
    });

    it('returns chrome height + 1.5rem breathing room (93px) at < 900px with 16px root font', () => {
      // 69 + 1.5 * 16 = 69 + 24 = 93
      expect(getChromeOffset(768)).toBe(93);
      expect(getChromeOffset(375)).toBe(93);
    });
  });
});
