import type { Service } from '../types';
import { MonogramBadge } from './MonogramBadge';

export interface ServiceCardProps {
  service: Service;
}

/**
 * One service entry; the whole card is a single anchor — one tap target per service.
 * The arrow glyph is decorative and aria-hidden (a11y fix F1), so the accessible name
 * is the service name followed by its description.
 */
export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <li>
      <a className="card" href={service.href}>
        <MonogramBadge label={service.monogram} />
        <span>
          <span className="card-name">
            {service.name}{' '}
            <span className="arrow" aria-hidden="true">
              {'↗'}
            </span>
          </span>
          <span className="card-desc">{service.description}</span>
        </span>
      </a>
    </li>
  );
}
