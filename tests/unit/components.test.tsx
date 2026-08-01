import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CategoryHeading,
  EmptyState,
  MonogramBadge,
  ServiceCard,
  ServiceGrid,
  SiteFooter,
  SiteHeader,
} from '../../src/components';
import type { Service } from '../../src/types';

const service: Service = {
  name: 'Files',
  href: 'http://files.fixture.example/',
  description: 'Network file storage.',
  monogram: 'FI',
};

describe('MonogramBadge', () => {
  it('renders the label hidden from assistive tech', () => {
    const { container } = render(<MonogramBadge label="FI" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveTextContent('FI');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('clamps labels longer than 2 characters to 2 (content error tolerance)', () => {
    const { container } = render(<MonogramBadge label="ABCDE" />);
    expect(container.querySelector('.badge')).toHaveTextContent(/^AB$/);
  });
});

describe('ServiceCard', () => {
  it('renders a single link whose accessible name includes the service name, with exact href (CF-D3)', () => {
    render(
      <ul>
        <ServiceCard service={service} />
      </ul>,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(/Files/);
    expect(links[0]).toHaveAttribute('href', 'http://files.fixture.example/');
    expect(screen.getByText('Network file storage.')).toBeInTheDocument();
  });

  it('hides the decorative arrow glyph from assistive tech (a11y fix F1)', () => {
    const { container } = render(
      <ul>
        <ServiceCard service={service} />
      </ul>,
    );
    const arrow = container.querySelector('.arrow');
    expect(arrow).toHaveTextContent('↗');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CategoryHeading', () => {
  it('renders an h3 with the title', () => {
    render(<CategoryHeading title="Media" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Media' })).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders the default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No services listed yet.')).toBeInTheDocument();
  });

  it('renders a message override', () => {
    render(<EmptyState message="Inventory intentionally empty." />);
    expect(screen.getByText('Inventory intentionally empty.')).toBeInTheDocument();
    expect(screen.queryByText('No services listed yet.')).not.toBeInTheDocument();
  });
});

describe('SiteHeader', () => {
  it('renders the site name as h1 with the tagline, and no navigation', () => {
    render(<SiteHeader siteName="Connelly Lab" tagline="Home-lab services on the LAN" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Connelly Lab' })).toBeInTheDocument();
    expect(screen.getByText('Home-lab services on the LAN')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('omits the tagline element when the prop is absent', () => {
    const { container } = render(<SiteHeader siteName="Connelly Lab" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Connelly Lab' })).toBeInTheDocument();
    expect(container.querySelector('.tagline')).not.toBeInTheDocument();
  });
});

describe('SiteFooter', () => {
  it('renders the text prop in a contentinfo landmark', () => {
    render(<SiteFooter text="Connelly Lab · LAN only · served from the Talos cluster" />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Connelly Lab · LAN only · served from the Talos cluster',
    );
  });
});

describe('ServiceGrid', () => {
  it('renders EmptyState when the inventory is empty', () => {
    render(<ServiceGrid services={[]} />);
    expect(screen.getByText('No services listed yet.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders a single flat list when no service has a category', () => {
    render(<ServiceGrid services={[service]} />);
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('renders category headings when a category is present', () => {
    render(<ServiceGrid services={[{ ...service, category: 'Infrastructure' }]} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Infrastructure' })).toBeInTheDocument();
  });

  it('forces grouping with groupByCategory even when no service has a category', () => {
    render(<ServiceGrid services={[service]} groupByCategory={true} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Other' })).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(1);
  });
});
