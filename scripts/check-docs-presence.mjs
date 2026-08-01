// M8a docs-presence gate: the docs tree's required files must exist.
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'docs/README.md',
  'docs/architecture/architecture.md',
  'docs/components/component-guide.md',
];

const missing = required.filter((rel) => !existsSync(join(repoRoot, rel)));
if (missing.length > 0) {
  console.error(`docs-presence gate FAILED: missing required file(s): ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`docs-presence gate passed (${required.length} required files present).`);
