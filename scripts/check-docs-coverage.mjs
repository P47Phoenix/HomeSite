// M2 docs-coverage gate (OQ-M3, name-based rule): every component exported from the
// components barrel must have a matching "## <ComponentName>" heading in
// docs/components/component-guide.md — and vice versa (set equality, renames fail loudly).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const barrelPath = join(repoRoot, 'src', 'components', 'index.ts');
const guidePath = join(repoRoot, 'docs', 'components', 'component-guide.md');

const barrel = readFileSync(barrelPath, 'utf8');
const exported = new Set();
for (const match of barrel.matchAll(/export\s*\{\s*([^}]+)\}/g)) {
  for (const name of match[1].split(',')) {
    const trimmed = name.trim();
    if (trimmed !== '') exported.add(trimmed);
  }
}

const guide = readFileSync(guidePath, 'utf8');
const documented = new Set();
for (const match of guide.matchAll(/^## (.+)$/gm)) {
  documented.add(match[1].trim());
}

const missingDocs = [...exported].filter((name) => !documented.has(name));
const staleHeadings = [...documented].filter((name) => !exported.has(name));

console.log(`docs-coverage gate: exported=${exported.size}, documented=${documented.size}`);
if (missingDocs.length > 0 || staleHeadings.length > 0) {
  if (missingDocs.length > 0) {
    console.error(`docs-coverage gate FAILED: exported component(s) without a "## <name>" heading in component-guide.md: ${missingDocs.join(', ')}`);
  }
  if (staleHeadings.length > 0) {
    console.error(`docs-coverage gate FAILED: guide heading(s) with no matching export (stale/renamed): ${staleHeadings.join(', ')}`);
  }
  const covered = exported.size === 0 ? 0 : (exported.size - missingDocs.length) / exported.size;
  console.error(`docs coverage = ${(covered * 100).toFixed(0)}% (< 100% required)`);
  process.exit(1);
}
console.log('docs-coverage gate passed (100%).');
