import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const cards = page => page.locator('#servicos .service-grid > .dc');
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, r => r.abort());
  await page.route(/\/api\/leads(?:\?.*)?$/, r => r.request().method() === 'GET' ? r.continue() : r.abort());
});
for (const width of [360, 430, 768, 1024, 1440, 1920]) {
  test(`three service categories use full-photo destination cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator('#servicos .dc__title')).toHaveText(['Vistos', 'Cidadania', 'Passaporte e documentos']);
    expect(await page.locator('#servicos .service-grid').evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(width < 640 ? 1 : width < 1100 ? 2 : 3);
    for (const card of await cards(page).all()) {
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      const layout = await card.evaluate(e => {
        const rect = e.getBoundingClientRect();
        const image = e.querySelector('.dc__photo').getBoundingClientRect();
        const body = e.querySelector('.dc__body').getBoundingClientRect();
        return { width: e.clientWidth, scrollWidth: e.scrollWidth, height: e.clientHeight, scrollHeight: e.scrollHeight, imageHeight: image.height, imageWidth: image.width, bodyTop: body.top - rect.top, bodyBottom: body.bottom - rect.top };
      });
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
      expect(layout.scrollHeight).toBeLessThanOrEqual(layout.height + 1);
      expect(layout.imageHeight).toBeGreaterThanOrEqual(layout.height - 1);
      expect(layout.imageWidth).toBeGreaterThanOrEqual(layout.width - 1);
      expect(layout.bodyTop).toBeGreaterThanOrEqual(0);
      expect(layout.bodyBottom).toBeLessThanOrEqual(layout.height + 1);
      await expect(card.locator('.dc__title')).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  });
}
test('three service CTAs inherit the right category and stay accessible in all five languages', async ({ page }) => {
  test.setTimeout(120000);
  for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(cards(page)).toHaveCount(3);
    const audit = await new AxeBuilder({ page }).include('#servicos .service-grid').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations).toEqual([]);
    for (const card of await cards(page).all()) {
      const link = card.locator('.dc__cta');
      const category = await card.locator('.dc__title').textContent();
      await expect(link).toHaveAccessibleName(new RegExp(category));
      const before = page.url();
      await link.click();
      await expect(page.locator('#aureum-lead-dialog')).toBeVisible();
      await expect(page.locator('#lead-main [name=objetivo]')).toHaveValue(category);
      expect(page.url()).toBe(before);
      await page.keyboard.press('Escape');
      await expect(page.locator('body')).not.toHaveClass(/aureum-lead-dialog-open/);
    }
  }
});
