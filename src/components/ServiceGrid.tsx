import { Fragment } from 'react';

import type { Service } from '../types';
import { compareServices, groupServices, hasAnyCategory } from '../lib/grouping';
import { CategoryHeading } from './CategoryHeading';
import { EmptyState } from './EmptyState';
import { ServiceCard } from './ServiceCard';

export interface ServiceGridProps {
  /** Operator-provided inventory. Empty array renders EmptyState. */
  services: Service[];
  /** Force category grouping even when few services. Default: group only when any service has a category. */
  groupByCategory?: boolean;
}

/**
 * Service inventory grid as a semantic list (a11y fix F3): one `ul.grid` of cards,
 * or — when grouped — one `ul.grid` per category band with a CategoryHeading above
 * each, rendered as siblings so the mock's h3 spacing rules apply unchanged.
 */
export function ServiceGrid({ services, groupByCategory }: ServiceGridProps) {
  if (services.length === 0) {
    return <EmptyState />;
  }

  const grouped = groupByCategory ?? hasAnyCategory(services);
  if (!grouped) {
    return (
      <ul className="grid">
        {[...services].sort(compareServices).map((service) => (
          <ServiceCard key={service.href} service={service} />
        ))}
      </ul>
    );
  }

  return (
    <>
      {groupServices(services).map((group) => (
        <Fragment key={group.category}>
          <CategoryHeading title={group.category} />
          <ul className="grid">
            {group.services.map((service) => (
              <ServiceCard key={service.href} service={service} />
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
