import type { Service } from '../types';
import { MonogramBadge } from './MonogramBadge';

export interface ServiceCardProps {
  service: Service;
}

/** One service inventory entry: monogram + name + description, whole card is the link. */
export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <li className="service-card">
      <a href={service.href}>
        <MonogramBadge monogram={service.monogram} />
        <span className="service-card-name">{service.name}</span>
        <span className="service-card-description">{service.description}</span>
      </a>
    </li>
  );
}
