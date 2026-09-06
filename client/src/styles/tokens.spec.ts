/**
 * Token contrast & usage unit tests (T001 · DD-031 · REQ-009).
 *
 * Verifies:
 * 1. Tokens are parsed dynamically from the single, unindented top-level `:root` block
 *    of `src/styles/tokens.css` (Source of Truth), strictly rejecting multiple `:root`
 *    blocks or at-rule overrides (e.g. `@media`, `@supports`) and duplicate token declarations.
 * 2. WCAG 2 relative luminance contrast ratios over `--amd-mist` (#F2F3F6):
 *    - `--amd-gold-ink-deep` (#6f6224) >= 4.5:1 (measures 5.49:1, satisfying WCAG AA normal
 *      text < 24px normal / < 18.66px bold per REQ-009).
 *    - `--amd-gold-ink` (#8a7a2e) >= 3:1 AND < 4.5:1 (measures 3.86:1, satisfying WCAG AA
 *      large text >= 24px normal / >= 18.66px bold per REQ-009; the upper bound strictly pins
 *      that this token does NOT qualify for normal text).
 *    - `--amd-gold` (#CFBB66) < 3:1 (measures 1.73:1, failing even large text and documenting
 *      why the ink tokens are required).
 * 3. Neither #8a7a2e nor #6f6224 appears hardcoded in any component templates or styles
 *    (src/app/ CSS and HTML templates, and src/styles/ CSS excluding tokens.css).
 */

interface NodeProcess {
  cwd(): string;
  getBuiltinModule?(name: string): unknown;
}

interface NodeFs {
  readFileSync(path: string, encoding: string): string;
  readdirSync(path: string, options?: unknown): { name: string; isDirectory(): boolean; isFile(): boolean }[];
  existsSync(path: string): boolean;
}

interface NodePath {
  resolve(...paths: string[]): string;
  join(...paths: string[]): string;
  relative(from: string, to: string): string;
}

const nodeProcess = (globalThis as unknown as { process?: NodeProcess }).process;

function getNodeModule<T>(name: string): T {
  if (nodeProcess?.getBuiltinModule) {
    return nodeProcess.getBuiltinModule(name) as T;
  }
  throw new Error(`Cannot load built-in Node module '${name}'`);
}

const fs = getNodeModule<NodeFs>('fs');
const path = getNodeModule<NodePath>('path');

function parseTokensCss(cssContent: string): Map<string, string> {
  // Reject any multiple :root occurrences (e.g. nested in @media, @supports, or secondary overrides)
  const allRootMatches = cssContent.match(/:root/g);
  if (!allRootMatches || allRootMatches.length === 0) {
    throw new Error('No :root block found in tokens.css');
  }
  if (allRootMatches.length > 1) {
    throw new Error(
      `Multiple :root blocks found in tokens.css (${allRootMatches.length} occurrences). ` +
      'Nested at-rules (such as @media or @supports) or secondary overrides are forbidden in design tokens Source of Truth.'
    );
  }

  // Ensure the single :root block is strictly at the top level (unindented at start of line)
  const topLevelRootMatch = /^:root\s*\{([^}]+)\}/m.exec(cssContent);
  if (!topLevelRootMatch) {
    throw new Error('Top-level :root block must be unindented at the start of a line');
  }

  const rootContent = topLevelRootMatch[1];
  const tokens = new Map<string, string>();
  const tokenRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rootContent)) !== null) {
    const tokenName = match[1].trim();
    const rawValue = match[2].trim();
    // Strip trailing inline comments if present
    const tokenValue = rawValue.replace(/\/\*.*?\*\//g, '').trim();

    if (tokens.has(tokenName)) {
      throw new Error(`Duplicate token declaration found in :root: ${tokenName}`);
    }
    tokens.set(tokenName, tokenValue);
  }

  return tokens;
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function hexToLuminance(hex: string): number {
  const clean = hex.replace('#', '').trim();
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function findTargetFiles(dir: string, matcher: (fileName: string, fullPath: string) => boolean): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTargetFiles(fullPath, matcher));
    } else if (entry.isFile() && matcher(entry.name, fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Design Tokens — tokens.css (T001)', () => {
  const rootDir = nodeProcess ? nodeProcess.cwd() : '';
  const tokensPath = path.resolve(rootDir, 'src/styles/tokens.css');
  const tokensContent = fs.readFileSync(tokensPath, 'utf-8');
  const tokens = parseTokensCss(tokensContent);

  it('declares --amd-gold-ink, --amd-gold-ink-deep, --amd-gold, and --amd-mist in tokens.css', () => {
    expect(tokens.has('--amd-gold-ink')).toBe(true);
    expect(tokens.has('--amd-gold-ink-deep')).toBe(true);
    expect(tokens.has('--amd-gold')).toBe(true);
    expect(tokens.has('--amd-mist')).toBe(true);

    expect(tokens.get('--amd-gold-ink')).toBe('#8a7a2e');
    expect(tokens.get('--amd-gold-ink-deep')).toBe('#6f6224');
    expect(tokens.get('--amd-gold')).toBe('#CFBB66');
    expect(tokens.get('--amd-mist')).toBe('#F2F3F6');
  });

  it('verifies contrast: --amd-gold-ink-deep >= 4.5:1, --amd-gold-ink in [3:1, 4.5:1), and --amd-gold < 3:1 over --amd-mist', () => {
    const goldInkDeep = tokens.get('--amd-gold-ink-deep')!;
    const goldInk = tokens.get('--amd-gold-ink')!;
    const gold = tokens.get('--amd-gold')!;
    const mist = tokens.get('--amd-mist')!;

    const goldInkDeepOnMist = contrastRatio(goldInkDeep, mist);
    const goldInkOnMist = contrastRatio(goldInk, mist);
    const goldOnMist = contrastRatio(gold, mist);

    // --amd-gold-ink-deep (#6f6224) achieves 5.49:1 on mist, satisfying WCAG AA normal text (>= 4.5:1)
    expect(goldInkDeepOnMist).toBeGreaterThanOrEqual(4.5);

    // --amd-gold-ink (#8a7a2e) achieves 3.86:1 on mist, satisfying large text (>= 3:1)
    // while strictly failing normal text (< 4.5:1), pinning that it cannot be used for normal text
    expect(goldInkOnMist).toBeGreaterThanOrEqual(3.0);
    expect(goldInkOnMist).toBeLessThan(4.5);

    // --amd-gold (#CFBB66) fails WCAG contrast on mist (1.73:1 < 3:1), proving why ink tokens are required
    expect(goldOnMist).toBeLessThan(3.0);
  });

  it('ensures neither #8a7a2e nor #6f6224 is hardcoded in any component CSS/HTML or global styles', () => {
    const appDir = path.resolve(rootDir, 'src/app');
    const stylesDir = path.resolve(rootDir, 'src/styles');

    const appFiles = findTargetFiles(appDir, (name) => name.endsWith('.css') || name.endsWith('.html'));
    const stylesFiles = findTargetFiles(stylesDir, (name) => name.endsWith('.css') && name !== 'tokens.css');
    const globalStylesFile = path.resolve(rootDir, 'src/styles.css');
    const additionalFiles = fs.existsSync(globalStylesFile) ? [globalStylesFile] : [];

    const filesToScan = [...appFiles, ...stylesFiles, ...additionalFiles];

    expect(filesToScan.length).toBeGreaterThan(0);

    const hardcodedOccurrences: { file: string; line: number; content: string }[] = [];
    const forbiddenHexes = /(?:#8a7a2e|#6f6224)/i;

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((lineText, index) => {
        if (forbiddenHexes.test(lineText)) {
          hardcodedOccurrences.push({
            file: path.relative(rootDir, file),
            line: index + 1,
            content: lineText.trim(),
          });
        }
      });
    }

    expect(hardcodedOccurrences).toEqual([]);
  });
});
