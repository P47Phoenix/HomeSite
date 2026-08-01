// NOTE (TC-S3-08 litmus): these tests deliberately assert comparator PROPERTIES
// (identity, antisymmetry, membership) rather than sort direction. Rendered
// ordering is asserted by the integration suite — so inverting a comparator
// fails integration while this suite stays green, proving the layer is not hollow.
import { describe, expect, it } from 'vitest';

import {
  UNCATEGORIZED_LABEL,
  compareCategories,
  compareServices,
  groupServices,
  hasAnyCategory,
} from '../../src/lib/grouping';
import type { Service } from '../../src/types';

function svc(name: string, category?: string): Service {
  return {
    name,
    href: `http://${name.toLowerCase().replaceAll(' ', '-')}.fixture.example/`,
    description: `${name} description.`,
    monogram: name.slice(0, 2).toUpperCase(),
    ...(category === undefined ? {} : { category }),
  };
}

describe('compareCategories', () => {
  it('is zero for equal values and antisymmetric for distinct values', () => {
    expect(compareCategories('Media', 'Media')).toBe(0);
    const ab = compareCategories('Infrastructure', 'Media');
    const ba = compareCategories('Media', 'Infrastructure');
    expect(ab).not.toBe(0);
    expect(Math.sign(ab)).toBe(-Math.sign(ba));
  });

  it('is case-insensitive', () => {
    expect(compareCategories('media', 'MEDIA')).toBe(0);
  });
});

describe('compareServices', () => {
  it('compares by display name with identity and antisymmetry', () => {
    const a = svc('Files');
    const b = svc('Router');
    expect(compareServices(a, a)).toBe(0);
    expect(Math.sign(compareServices(a, b))).toBe(-Math.sign(compareServices(b, a)));
  });
});

describe('hasAnyCategory', () => {
  it('is false for empty and uncategorized inventories, true when any category exists', () => {
    expect(hasAnyCategory([])).toBe(false);
    expect(hasAnyCategory([svc('Files')])).toBe(false);
    expect(hasAnyCategory([svc('Files'), svc('Movies', 'Media')])).toBe(true);
  });
});

describe('groupServices', () => {
  const services = [svc('Movies', 'Media'), svc('Files', 'Infrastructure'), svc('Notes')];

  it('places every service in exactly its own category bucket', () => {
    const groups = groupServices(services);
    const byCategory = new Map(groups.map((g) => [g.category, g.services.map((s) => s.name)]));
    expect(byCategory.get('Media')).toEqual(['Movies']);
    expect(byCategory.get('Infrastructure')).toEqual(['Files']);
    expect(byCategory.get(UNCATEGORIZED_LABEL)).toEqual(['Notes']);
  });

  it('keeps the uncategorized bucket last regardless of comparator direction', () => {
    const groups = groupServices(services);
    expect(groups[groups.length - 1]?.category).toBe(UNCATEGORIZED_LABEL);
  });

  it('preserves the total service count across groups', () => {
    const total = groupServices(services).reduce((n, g) => n + g.services.length, 0);
    expect(total).toBe(services.length);
  });
});
