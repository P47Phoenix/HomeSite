import { describe, expect, it } from 'vitest';

import { validateServices } from '../../src/lib/validateServices';

const valid = {
  name: 'Files',
  href: 'http://files.fixture.example/',
  description: 'Network file storage.',
  monogram: 'FI',
};

describe('validateServices', () => {
  it('accepts a valid inventory including the 2-char monogram boundary', () => {
    const result = validateServices([valid, { ...valid, href: 'https://other.fixture.example/', monogram: 'AB' }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts an empty inventory', () => {
    expect(validateServices([]).valid).toBe(true);
  });

  it('rejects a missing description, naming the field', () => {
    const { description: _description, ...noDescription } = valid;
    const result = validateServices([noDescription]);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/description/);
  });

  it('rejects a 3-char monogram, naming the constraint', () => {
    const result = validateServices([{ ...valid, monogram: 'ABC' }]);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/monogram/);
  });

  it('rejects a relative href, naming the field', () => {
    const result = validateServices([{ ...valid, href: '/grafana' }]);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/href/);
  });

  it('rejects duplicate hrefs', () => {
    const result = validateServices([valid, { ...valid, name: 'Copy' }]);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/duplicate href/);
  });

  it('rejects non-array root and unknown properties', () => {
    expect(validateServices({}).valid).toBe(false);
    expect(validateServices([{ ...valid, extra: true }]).valid).toBe(false);
  });
});
