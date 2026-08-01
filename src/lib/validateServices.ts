import { Ajv, type ErrorObject } from 'ajv';

import schema from '../content/services.schema.json';

export interface ValidationResult {
  valid: boolean;
  /** Human-readable violations, each naming the offending entry/field and constraint. */
  errors: string[];
}

function formatAjvError(error: ErrorObject): string {
  const where = error.instancePath === '' ? '(root)' : error.instancePath;
  return `services.json invalid at ${where}: ${error.message ?? 'schema violation'}`;
}

/**
 * Validates candidate services.json content against services.schema.json,
 * then applies the two checks JSON Schema cannot express cleanly:
 * href must parse as an absolute http(s) URL, and hrefs must be unique.
 */
export function validateServices(data: unknown): ValidationResult {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const errors: string[] = [];

  if (!validate(data)) {
    for (const error of validate.errors ?? []) {
      errors.push(formatAjvError(error));
    }
    return { valid: false, errors };
  }

  const entries = data as { name: string; href: string }[];
  const seen = new Set<string>();
  entries.forEach((entry, index) => {
    let parsed: URL | undefined;
    try {
      parsed = new URL(entry.href);
    } catch {
      parsed = undefined;
    }
    if (parsed === undefined || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
      errors.push(`services.json invalid at /${index}/href: must be an absolute http(s) URL (got "${entry.href}")`);
    }
    if (seen.has(entry.href)) {
      errors.push(`services.json invalid at /${index}/href: duplicate href "${entry.href}"`);
    }
    seen.add(entry.href);
  });

  return { valid: errors.length === 0, errors };
}
