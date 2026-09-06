/**
 * Position record for a chapter element relative to the viewport.
 */
export interface ChapterPosition<T extends string = string> {
  readonly id: T;
  readonly top: number;
}

/**
 * Pure function that determines which service chapter should be marked active
 * in the TOC rail / chip bar (REQ-001 / DD-017 / defect class DC-1).
 *
 * Rules:
 * 1. If `atBottom` is true, the last chapter always wins (handles short final chapters
 *    whose top may never reach the reading line before scroll ends).
 * 2. Otherwise, the last chapter whose `top <= readingLine` wins.
 * 3. If no chapter has crossed the reading line, the first chapter wins.
 *
 * Pure, DOM-free, and window-free to allow deterministic jsdom testing.
 * Enforces a non-empty chapter list at the type level so an empty string is impossible.
 */
export function resolveActiveChapter<T extends string = string>(
  chapters: readonly [ChapterPosition<T>, ...ChapterPosition<T>[]],
  readingLine: number,
  atBottom: boolean,
): T {
  if (atBottom) {
    return chapters[chapters.length - 1].id;
  }

  let active = chapters[0].id;
  for (const chapter of chapters) {
    if (chapter.top <= readingLine) {
      active = chapter.id;
    }
  }

  return active;
}
