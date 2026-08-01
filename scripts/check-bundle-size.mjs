// M10/NFR-5 bundle-budget gate: fail when gzipped initial JS in dist/assets
// exceeds the budget. Budget lives in package.json "config" — versioned with code (M4 pattern).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const budgetKB = Number(pkg.config?.bundleBudgetGzipKB);
if (!Number.isFinite(budgetKB) || budgetKB <= 0) {
  console.error('bundle-size gate: package.json config.bundleBudgetGzipKB missing or invalid.');
  process.exit(1);
}

const distDir = join(repoRoot, 'dist');
if (!existsSync(distDir)) {
  console.error('bundle-size gate: dist/ not found — run npm run build first.');
  process.exit(1);
}

// Measure every JS file anywhere under dist/ — public/ passthrough files ship too.
const files = readdirSync(distDir, { recursive: true }).map(String);
let jsBytes = 0;
let cssBytes = 0;
for (const file of files) {
  if (!file.endsWith('.js') && !file.endsWith('.css')) continue;
  const gz = gzipSync(readFileSync(join(distDir, file))).length;
  if (file.endsWith('.js')) jsBytes += gz;
  if (file.endsWith('.css')) cssBytes += gz;
}

const jsKB = jsBytes / 1024;
console.log(`bundle-size gate: gzipped initial JS = ${jsKB.toFixed(1)} KB (budget ${budgetKB} KB); CSS (informational) = ${(cssBytes / 1024).toFixed(1)} KB`);
if (jsKB > budgetKB) {
  console.error(`bundle-size gate FAILED: gzipped initial JS ${jsKB.toFixed(1)} KB exceeds the ${budgetKB} KB budget.`);
  process.exit(1);
}
console.log('bundle-size gate passed.');
