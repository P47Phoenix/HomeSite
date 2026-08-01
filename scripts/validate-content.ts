// Build gate: src/content/services.json must satisfy services.schema.json
// (architecture section 1 config contract). Fails the build naming each violation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { validateServices } from '../src/lib/validateServices';

const contentPath = fileURLToPath(new URL('../src/content/services.json', import.meta.url));

let data: unknown;
try {
  data = JSON.parse(readFileSync(contentPath, 'utf8'));
} catch (error) {
  console.error(`services.json is not valid JSON: ${String(error)}`);
  process.exit(1);
}

const result = validateServices(data);
if (!result.valid) {
  for (const message of result.errors) {
    console.error(message);
  }
  console.error(`services.json failed schema validation with ${result.errors.length} violation(s).`);
  process.exit(1);
}

console.log(`services.json valid (${(data as unknown[]).length} entries).`);
