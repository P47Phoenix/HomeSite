// E2E journey (CF-D3 policy): role + accessible-name selectors ONLY; runs against
// `vite preview` of the built dist/ (see playwright.config.ts webServer).
// Journey: load / -> h1 visible -> activate anchor -> fragment + target visible -> Back returns.
import { expect, test } from '@playwright/test';

test('load, anchor navigation, and browser Back', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.getByRole('heading', { name: 'Services' })).toBeInViewport();

  await page.goBack();
  await expect(page).not.toHaveURL(/#services/);
});

test('shipped page contains zero script tags (zero-JS by construction)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script')).toHaveCount(0);
});
