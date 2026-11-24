import { test, expect } from '@playwright/test';

// Mia is paused while public contact channels remain available.
for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
  for (const width of [390, 1440]) {
    test(`Mia is paused and the contact panel offers a channel in ${locale || 'pt/'} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
      const mia = page.locator('#launch-assistant');
      await expect(mia).toBeHidden();
      await expect(mia).toBeDisabled();
      await expect(mia).toHaveAttribute('aria-hidden', 'true');
      const miaView = page.locator('#contact-panel .contact-view[data-view="assistant"]');
      await expect(miaView).toBeHidden();
      await expect(miaView).toHaveAttribute('inert', '');
      await page.locator('#launch-whatsapp').click();
      await expect(page.locator('#contact-panel')).toBeVisible();
      await expect(page.locator('#contact-panel')).toHaveAttribute('data-current-view', 'whatsapp');
      await expect(page.locator('#contact-panel a[href="https://www.instagram.com/aureum.assessoria/"]')).toBeVisible();
      await expect(page.locator('#aureum-callback-form')).toHaveCount(0);
      await page.locator('#contact-panel .contact-close').click();
      await expect(page.locator('#contact-panel')).toBeHidden();
    });
  }
}

test('Mia stays paused on an internal destination page', async ({ page }) => {
  await page.goto('/destinos/australia/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#launch-assistant')).toBeHidden();
  await expect(page.locator('#launch-assistant')).toBeDisabled();
  await expect(page.locator('#launch-whatsapp')).toBeVisible();
});
