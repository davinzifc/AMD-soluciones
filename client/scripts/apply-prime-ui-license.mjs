/**
 * Applies optional local/CI PrimeUI license into the committed stub file.
 * Source order: env PRIME_UI_LICENSE → prime-ui-license.local.ts → empty.
 * The stub stays empty in git; this script only mutates the working tree.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envDir = join(root, 'src', 'environments');
const stubPath = join(envDir, 'prime-ui-license.ts');
const localPath = join(envDir, 'prime-ui-license.local.ts');

function extractKey(source) {
  const match = source.match(/PRIME_UI_LICENSE\s*=\s*['"]([^'"]*)['"]/);
  return match ? match[1] : '';
}

let key = process.env.PRIME_UI_LICENSE ?? '';
if (!key && existsSync(localPath)) {
  key = extractKey(readFileSync(localPath, 'utf8'));
}

const body = `/**
 * PrimeUI license key for PrimeNG 22+ (Community free or Commercial).
 *
 * This file is the import target for \`app.config.ts\`. Keep the committed
 * version empty. Real keys belong in \`prime-ui-license.local.ts\` (gitignored)
 * or in CI secret \`PRIME_UI_LICENSE\` — applied by \`npm run license:apply\`.
 *
 * Docs: https://primeng.dev/configuration → License
 */
export const PRIME_UI_LICENSE = '${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';
`;

writeFileSync(stubPath, body, 'utf8');
console.log(
  key
    ? 'PrimeUI license applied from local file or env.'
    : 'PrimeUI license stub left empty (no local file / env).',
);
