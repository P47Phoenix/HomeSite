// Integration layer (FR-06/F11): renders the FULL composed page (App + real child
// components) from services.json fixtures and asserts cross-component behavior —
// grouping order, card count, empty-state branch, heading hierarchy, href fidelity.
// This is NOT a renamed unit test: every assertion spans 2+ components via App.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import type { Service } from '../../src/types';
import defaultFixture from '../fixtures/default.json';
import emptyFixture from '../fixtures/empty.json';
import maxContentFixture from '../fixtures/max-content.json';

describe('composed page — default fixture (2 categories, 4 services)', () => {
  it('renders one card per fixture entry with exact href fidelity (CF-D3)', () => {
    render(<App services={defaultFixture as Service[]} />);
    for (const entry of defaultFixture) {
      const link = screen.getByRole('link', { name: new RegExp(entry.name) });
      expect(link).toHaveAttribute('href', entry.href);
    }
    const cardLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'));
    expect(cardLinks).toHaveLength(defaultFixture.length);
  });

  it('groups services under category headings in sorted order', () => {
    render(<App services={defaultFixture as Service[]} />);
    const categoryHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(categoryHeadings.map((h) => h.textContent)).toEqual(['Infrastructure', 'Media']);
  });

  it('places each service inside its own category list', () => {
    const { container } = render(<App services={defaultFixture as Service[]} />);
    const sections = container.querySelectorAll('.service-category');
    expect(sections).toHaveLength(2);
    const infra = within(sections[0] as HTMLElement);
    expect(infra.getByRole('heading', { level: 3, name: 'Infrastructure' })).toBeInTheDocument();
    expect(infra.getAllByRole('listitem').map((li) => li.querySelector('.service-card-name')?.textContent)).toEqual([
      'Files',
      'Router',
    ]);
    const media = within(sections[1] as HTMLElement);
    expect(media.getAllByRole('listitem').map((li) => li.querySelector('.service-card-name')?.textContent)).toEqual([
      'Movies',
      'Music',
    ]);
  });

  it('assembles the heading hierarchy: one h1, the services h2, category h3s', () => {
    render(<App services={defaultFixture as Service[]} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('composed page — empty fixture', () => {
  it('selects the EmptyState branch and renders no service lists', () => {
    render(<App services={emptyFixture as Service[]} />);
    expect(screen.getByText('No services configured yet.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });
});

describe('composed page — max-content fixture (19 entries)', () => {
  it('renders all 19 cards with unique hrefs, uncategorized bucket last', () => {
    render(<App services={maxContentFixture as Service[]} />);
    const cardLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('http'));
    expect(cardLinks).toHaveLength(19);
    const hrefs = cardLinks.map((a) => a.getAttribute('href'));
    expect(new Set(hrefs).size).toBe(19);
    const categoryHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(categoryHeadings[categoryHeadings.length - 1]?.textContent).toBe('Other');
  });
});
