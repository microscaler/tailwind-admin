import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


test('📸 Leptos Home UI should match baseline', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('main'); // Default `cargo leptos new` template uses <main>
  await page.setViewportSize({ width: 1280, height: 720 });

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('leptos-home.png', { threshold: 0.01 });
});


test('visual check', async ({ page }) => {
  await page.goto('/dashboard');
  await percySnapshot(page, 'Dashboard Snapshot');
});