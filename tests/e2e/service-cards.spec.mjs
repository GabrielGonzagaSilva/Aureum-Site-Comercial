import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const cards = page => page.locator('#servicos .service-grid > a');
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, r => r.abort());
  await page.route(/\/api\/leads(?:\?.*)?$/, r => r.request().method() === 'GET' ? r.continue() : r.abort());
});

for (const width of [360, 430, 768, 1024, 1440, 1920]) {
  test(`service photo cards at ${width}px preserve readable content`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(cards(page)).toHaveCount(5);
    expect(await page.locator('#servicos .service-grid').evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(width < 640 ? 1 : width < 1100 ? 2 : 3);
    for (const card of await cards(page).all()) {
      const layout = await card.evaluate(async e => {
        const photo = getComputedStyle(e, '::before');
        const url = photo.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
        const image = new Image(); image.src = url; await image.decode();
        const rect = e.getBoundingClientRect();
        const title = e.querySelector('.card-title').getBoundingClientRect();
        const action = e.querySelector('.card-action').getBoundingClientRect();
        return { width: e.clientWidth, scrollWidth: e.scrollWidth, height: e.clientHeight, scrollHeight: e.scrollHeight, photoHeight: parseFloat(photo.height), mask: photo.maskImage || photo.webkitMaskImage, titleTop: title.top - rect.top, actionBottom: action.bottom - rect.top, loaded: image.naturalWidth > 0 };
      });
      expect(layout.loaded).toBe(true);
      expect(layout.mask).toContain('linear-gradient');
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
      expect(layout.scrollHeight).toBeLessThanOrEqual(layout.height + 1);
      expect(layout.photoHeight / layout.height).toBeGreaterThan(.35);
      expect(layout.photoHeight / layout.height).toBeLessThan(.60);
      expect(layout.titleTop).toBeGreaterThanOrEqual(layout.photoHeight - 1);
      expect(layout.actionBottom).toBeLessThanOrEqual(layout.height + 1);

    }
  });
}

test('service cards keep all five existing translations accessible and unclipped', async ({ page }) => {
  for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    for (const card of await cards(page).all()) {
      await expect(card).toHaveAccessibleName(/.+/);
      await expect(card.locator('.card-description')).not.toHaveText('');
      expect(await card.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
    }
    const audit = await new AxeBuilder({ page }).include('#servicos .service-grid').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations).toEqual([]);
  }
});
