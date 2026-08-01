import type { Service } from '../types';

/** Label used for services that carry no category. Always ordered last. */
export const UNCATEGORIZED_LABEL = 'Other';

export interface ServiceGroup {
  category: string;
  services: Service[];
}

/** Lexicographic category comparator (case-insensitive). */
export function compareCategories(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

/** Lexicographic service comparator by display name (case-insensitive). */
export function compareServices(a: Service, b: Service): number {
  return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
}

/** True when at least one service carries a category (grid grouping trigger, per spec). */
export function hasAnyCategory(services: readonly Service[]): boolean {
  return services.some((s) => s.category !== undefined && s.category !== '');
}

/**
 * Groups services by category. Categories are sorted with compareCategories,
 * except the uncategorized bucket which is always last. Services within a
 * group are sorted with compareServices.
 */
export function groupServices(services: readonly Service[]): ServiceGroup[] {
  const buckets = new Map<string, Service[]>();
  for (const service of services) {
    const key = service.category !== undefined && service.category !== '' ? service.category : UNCATEGORIZED_LABEL;
    const bucket = buckets.get(key);
    if (bucket === undefined) {
      buckets.set(key, [service]);
    } else {
      bucket.push(service);
    }
  }
  const categories = [...buckets.keys()].sort((a, b) => {
    if (a === UNCATEGORIZED_LABEL) return 1;
    if (b === UNCATEGORIZED_LABEL) return -1;
    return compareCategories(a, b);
  });
  return categories.map((category) => ({
    category,
    services: [...(buckets.get(category) ?? [])].sort(compareServices),
  }));
}
