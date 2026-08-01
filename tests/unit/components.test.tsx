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
  it('renders the monogram text hidden from assistive tech', () => {
    const { container } = render(<MonogramBadge monogram="FI" />);
    const badge = container.querySelector('.monogram-badge');
    expect(badge).toHaveTextContent('FI');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ServiceCard', () => {
  it('renders name, description, and the exact fixture href (CF-D3 fidelity)', () => {
    render(
      <ul>
        <ServiceCard service={service} />
      </ul>,
    );
    const link = screen.getByRole('link', { name: /Files/ });
    expect(link).toHaveAttribute('href', 'http://files.fixture.example/');
    expect(screen.getByText('Network file storage.')).toBeInTheDocument();
  });
});

describe('CategoryHeading', () => {
  it('renders an h3 with the category name', () => {
    render(<CategoryHeading name="Media" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Media' })).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('explains that no services are configured', () => {
    render(<EmptyState />);
    expect(screen.getByText('No services configured yet.')).toBeInTheDocument();
  });
});

describe('SiteHeader', () => {
  it('renders the h1 and the anchor nav link to #services', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '#services');
  });
});

describe('SiteFooter', () => {
  it('renders footer content in a contentinfo landmark', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('ServiceGrid', () => {
  it('renders EmptyState when the inventory is empty', () => {
    render(<ServiceGrid services={[]} />);
    expect(screen.getByText('No services configured yet.')).toBeInTheDocument();
  });

  it('renders a flat list when no service has a category', () => {
    render(<ServiceGrid services={[service]} />);
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('renders category headings when a category is present', () => {
    render(<ServiceGrid services={[{ ...service, category: 'Infrastructure' }]} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Infrastructure' })).toBeInTheDocument();
  });
});
