import type { Service } from '../types';
import { groupServices, hasAnyCategory, compareServices } from '../lib/grouping';
import { CategoryHeading } from './CategoryHeading';
import { EmptyState } from './EmptyState';
import { ServiceCard } from './ServiceCard';

export interface ServiceGridProps {
  /** Operator-provided inventory. Empty array renders EmptyState. */
  services: Service[];
  /** Force category grouping even when few services. Default: group only when any service has a category. */
  groupByCategory?: boolean;
}

/** Service inventory grid: flat list, or category-grouped sections when categories are present. */
export function ServiceGrid({ services, groupByCategory }: ServiceGridProps) {
  if (services.length === 0) {
    return <EmptyState />;
  }

  const grouped = groupByCategory ?? hasAnyCategory(services);
  if (!grouped) {
    return (
      <ul className="service-grid">
        {[...services].sort(compareServices).map((service) => (
          <ServiceCard key={service.href} service={service} />
        ))}
      </ul>
    );
  }

  return (
    <div className="service-grid-grouped">
      {groupServices(services).map((group) => (
        <section key={group.category} className="service-category">
          <CategoryHeading name={group.category} />
          <ul className="service-grid">
            {group.services.map((service) => (
              <ServiceCard key={service.href} service={service} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
