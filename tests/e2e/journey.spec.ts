// E2E journey (CF-D3 policy): role + accessible-name selectors ONLY; runs against
// `vite preview` of the built dist/ (see playwright.config.ts webServer).
// Journey: load / -> h1 + list + service links visible -> open a service (stubbed
// network) -> URL changed -> browser Back returns to / with the h1 visible.
// Both projects (chromium, chromium-no-js) must pass — routing is browser-level,
// so it works with page JavaScript disabled.
import { expect, test } from '@playwright/test';

const HOME_ASSISTANT_HREF = 'http://192.168.11.24:30103/';

test('load, open a service card, and browser Back returns', async ({ page }) => {
  await page.route(`${HOME_ASSISTANT_HREF}**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><head><title>Stub service</title></head><body><h1>Stub service</h1></body></html>',
    }),
  );

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('list')).toBeVisible();
  await expect(page.getByRole('link', { name: /Home Assistant/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /TrueNAS/ })).toBeVisible();

  await page.getByRole('link', { name: /Home Assistant/ }).click();
  await expect(page).toHaveURL(HOME_ASSISTANT_HREF);

  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('shipped page contains zero script tags (zero-JS by construction)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script')).toHaveCount(0);
});
