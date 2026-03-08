import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('homepage loads and shows YOGA.LIFE title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/YOGA\.LIFE/);
    await expect(page.locator('text=YOGA.LIFE')).toBeVisible();
  });

  test('homepage has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('navigation works — contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('navigation works — FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('404 page shown for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input')).toBeVisible();
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[type="text"], input[type="search"]')).toBeVisible();
  });
});

test.describe('SEO basics', () => {
  test('robots meta not set to noindex on homepage', async ({ page }) => {
    await page.goto('/');
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robotsMeta).not.toContain('noindex');
  });

  test('og:title meta tag present', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });
});

test.describe('Accessibility basics', () => {
  test('html lang attribute is set', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['ru', 'en', 'uk']).toContain(lang);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
