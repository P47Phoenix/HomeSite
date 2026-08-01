// Accessibility E2E slice against the served dist/ (AC-3, AC-10, AC-11, AC-14 + axe).
// axe-core runs only in the JS-enabled chromium project — it needs page JS.
// The remaining checks are CSS/layout assertions and run in both projects.
import { createRequire } from 'node:module';

import { expect, test } from '@playwright/test';
import type { AxeResults } from 'axe-core';

const require = createRequire(import.meta.url);
const axeScriptPath = require.resolve('axe-core/axe.min.js');

interface AxeRunner {
  run: (context: Document) => Promise<AxeResults>;
}

declare global {
  interface Window {
    axe: AxeRunner;
  }
}

test('axe scan: zero serious/critical violations on the served page', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-no-js', 'axe-core requires page JavaScript');
  await page.goto('/');
  await page.addScriptTag({ path: axeScriptPath });
  const severe = await page.evaluate(async () => {
    const results = await window.axe.run(document);
    return results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
  expect(severe).toEqual([]);
});

test('AC-3: keyboard focus on a card shows the 2px offset focus ring', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLAnchorElement)) return null;
    const cs = getComputedStyle(el);
    return {
      className: el.className,
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineOffset: cs.outlineOffset,
    };
  });
  expect(ring).not.toBeNull();
  expect(ring?.className).toBe('card');
  expect(ring?.outlineStyle).toBe('solid');
  expect(ring?.outlineWidth).toBe('2px');
  expect(ring?.outlineOffset).toBe('2px');
});

for (const width of [320, 375, 1100]) {
  test(`AC-10: every card link is at least 44x44px at ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const links = await page.getByRole('link').all();
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
}

test('AC-11: no horizontal scroll at 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement;
    return el === null ? null : el.scrollWidth - el.clientWidth;
  });
  expect(overflow).not.toBeNull();
  expect(overflow ?? 1).toBeLessThanOrEqual(0);
});

test('AC-14: color schemes render the mock token backgrounds', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(lightBg).toBe('rgb(246, 247, 249)');

  await page.emulateMedia({ colorScheme: 'dark' });
  const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(darkBg).toBe('rgb(20, 22, 26)');

  expect(lightBg).not.toBe(darkBg);
});
