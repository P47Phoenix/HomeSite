// AC-1/AC-2 contrast gate: computes WCAG 2.1 relative-luminance contrast ratios
// for the shipped token pairs in BOTH color schemes (from src/styles/tokens.css),
// then audits src/**/*.css for the prohibited `color: var(--accent)` pattern
// (F2: light --accent is 4.24:1 on --bg — fails AA as small text).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensPath = join(repoRoot, 'src', 'styles', 'tokens.css');
const css = readFileSync(tokensPath, 'utf8');

const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
if (darkStart === -1) {
  console.error('contrast gate FAILED: no dark-scheme media block in tokens.css');
  process.exit(1);
}

function parseTokens(block) {
  const tokens = {};
  for (const match of block.matchAll(/--([a-z][a-z-]*)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

function channel(value) {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function contrastRatio(hexA, hexB) {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const schemes = {
  light: parseTokens(css.slice(0, darkStart)),
  dark: parseTokens(css.slice(darkStart)),
};

// [foreground token, background token, minimum ratio]
const pairs = [
  ['fg', 'bg', 4.5],
  ['fg', 'card-bg', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'card-bg', 4.5],
  ['muted', 'panel', 4.5],
  ['accent-fg', 'accent', 4.5],
  ['accent', 'bg', 3], // focus ring (non-text, 1.4.11)
  ['accent', 'card-bg', 3], // focus ring (non-text, 1.4.11)
];

const failures = [];
for (const [schemeName, tokens] of Object.entries(schemes)) {
  for (const [fg, bg, minimum] of pairs) {
    if (tokens[fg] === undefined || tokens[bg] === undefined) {
      failures.push(`${schemeName}: missing token --${tokens[fg] === undefined ? fg : bg}`);
      continue;
    }
    const ratio = contrastRatio(tokens[fg], tokens[bg]);
    const ok = ratio >= minimum;
    console.log(
      `${schemeName.padEnd(5)} --${fg} on --${bg}: ${ratio.toFixed(2)}:1 (min ${minimum}:1) ${ok ? 'PASS' : 'FAIL'}`,
    );
    if (!ok) failures.push(`${schemeName}: --${fg} on --${bg} = ${ratio.toFixed(2)}:1 < ${minimum}:1`);
  }
}

// AC-2 audit: no stylesheet may set accent as a text color (F2 prohibition).
const srcDir = join(repoRoot, 'src');
const cssFiles = readdirSync(srcDir, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.css'));
for (const file of cssFiles) {
  const content = readFileSync(join(srcDir, file), 'utf8');
  if (/(^|[^-])color:\s*var\(--accent\)/.test(content)) {
    failures.push(`AC-2: src/${file} sets \`color: var(--accent)\` — prohibited (F2)`);
  }
}
console.log(`AC-2 audit: scanned ${cssFiles.length} CSS file(s) for \`color: var(--accent)\``);

if (failures.length > 0) {
  for (const failure of failures) console.error(`contrast gate FAILED: ${failure}`);
  process.exit(1);
}
console.log('contrast gate passed (AC-1 ratios + AC-2 accent-as-text audit).');
