// Accessibility slice of the integration layer (AC-5/AC-6/AC-7 automatable parts):
// axe-core over the composed page in all three content states, plus DOM assertions
// for landmarks, heading order, and aria-hidden decorative elements.
// color-contrast is disabled here — jsdom cannot compute it; scripts/check-contrast.mjs
// covers AC-1/AC-2 from the token file instead.
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import type { Service } from '../../src/types';
import defaultFixture from '../fixtures/default.json';
import emptyFixture from '../fixtures/empty.json';
import maxContentFixture from '../fixtures/max-content.json';

const fixtures: { label: string; services: Service[]; cardCount: number }[] = [
  { label: 'default', services: defaultFixture as Service[], cardCount: 4 },
  { label: 'empty', services: emptyFixture as Service[], cardCount: 0 },
  { label: 'max-content', services: maxContentFixture as Service[], cardCount: 19 },
];

async function severeViolations(container: HTMLElement): Promise<axe.Result[]> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

function headingLevels(container: HTMLElement): number[] {
  return [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) =>
    Number(h.tagName.slice(1)),
  );
}

describe.each(fixtures)('composed page a11y — $label fixture', ({ services, cardCount }) => {
  it('has zero serious/critical axe violations', async () => {
    const { container } = render(<App services={services} />);
    expect(await severeViolations(container)).toEqual([]);
  });

  it('renders exactly one banner, main, and contentinfo landmark and one h1', () => {
    render(<App services={services} />);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('never skips a heading level', () => {
    const { container } = render(<App services={services} />);
    const levels = headingLevels(container);
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect((levels[i] ?? 0) - (levels[i - 1] ?? 0)).toBeLessThanOrEqual(1);
    }
  });

  it(`hides every badge and arrow from assistive tech across all ${cardCount} cards`, () => {
    const { container } = render(<App services={services} />);
    const badges = container.querySelectorAll('.badge');
    const arrows = container.querySelectorAll('.arrow');
    expect(badges).toHaveLength(cardCount);
    expect(arrows).toHaveLength(cardCount);
    for (const el of [...badges, ...arrows]) {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
