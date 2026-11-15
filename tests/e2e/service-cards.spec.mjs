import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const cards = page => page.locator('#servicos .service-grid > .service-category');
const allCards = page => page.locator('#servicos .service-grid > .dc');
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, r => r.abort());
  // These tests cover service photos and navigation, not the unrelated hero video.
  await page.route(/\/assets\/hero-tower-bridge\.mp4(?:\?.*)?$/, r => r.abort());
  await page.route(/\/api\/leads(?:\?.*)?$/, r => r.request().method() === 'GET' ? r.continue() : r.abort());
});
for (const width of [360, 430, 768, 1024, 1440, 1920]) {
  test(`five title-only services use full-photo destination cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(cards(page)).toHaveCount(5);
    await expect(allCards(page)).toHaveCount(6);
    await expect(cards(page).locator('.dc__title')).toHaveText(['Vistos', 'Cidadania', 'Passaporte e documentos', 'Intercâmbio', 'Viagens internacionais']);
    await expect(page.locator('#servicos .service-footer')).toHaveCount(0);
    await expect(cards(page).locator('p')).toHaveCount(0);
    expect(await page.locator('#aureum-services-title').innerText()).toContain(width < 1024 ? 'seu projeto' : 'seu');
    const positions = await allCards(page).evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: r.width }; }));
    expect(positions.filter(p => p.y === positions[0].y)).toHaveLength(width < 640 ? 1 : width < 1100 ? 2 : 3);
    if (width >= 1100) {
      expect(positions[3].x).toBe(positions[0].x);
      expect(positions[4].x).toBe(positions[1].x);
      expect(positions[5].x).toBe(positions[2].x);
      expect(positions[5].y).toBe(positions[3].y);
    }
    for (const card of await cards(page).all()) {
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      const layout = await card.evaluate(e => {
        const rect = e.getBoundingClientRect();
        const image = e.querySelector('.dc__photo').getBoundingClientRect();
        const body = e.querySelector('.dc__body').getBoundingClientRect();
        return { width: e.clientWidth, scrollWidth: e.scrollWidth, height: e.clientHeight, scrollHeight: e.scrollHeight, imageHeight: image.height, imageWidth: image.width, bodyTop: body.top - rect.top, bodyBottom: body.bottom - rect.top, photo: e.querySelector('img').getAttribute('src') };
      });
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
      expect(layout.scrollHeight).toBeLessThanOrEqual(layout.height + 1);
      expect(layout.imageHeight).toBeGreaterThanOrEqual(layout.height - 1);
      expect(layout.imageWidth).toBeGreaterThanOrEqual(layout.width - 1);
      expect(layout.bodyTop).toBeGreaterThanOrEqual(0);
      expect(layout.bodyBottom).toBeLessThanOrEqual(layout.height + 1);
      expect(layout.height / layout.width).toBeCloseTo(width < 640 ? 1 : 591 / 444, 2);
      expect(layout.photo).toMatch(/^\/assets\/photos\/services\//);
      await expect(card.locator('.dc__title')).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
    const guidance = allCards(page).last();
    await expect(guidance).toHaveCSS('background-color', 'rgb(28, 76, 60)');
    await expect(guidance.locator('img')).toHaveCount(0);
    expect(await guidance.evaluate(e => e.scrollHeight <= e.clientHeight + 1 && e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    expect(await guidance.evaluate(e => Math.round(e.getBoundingClientRect().height))).toBe(Math.round(positions[0].width * (width < 640 ? 1 : 591 / 444)));
  });
}
for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
  test(`five service cards navigate to their own pages in ${locale || 'pt/'}`, async ({ page }) => {
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await expect(cards(page)).toHaveCount(5);
    const audit = await new AxeBuilder({ page }).include('#servicos .service-grid').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations).toEqual([]);
    for (let index = 0; index < 5; index++) {
      const card = cards(page).nth(index);
      const link = card.locator('.dc__cta');
      const category = await card.locator('.dc__title').textContent();
      await expect(link).toHaveAccessibleName(new RegExp(category));
      const target = await link.getAttribute('href');
      expect(target).toMatch(new RegExp('^/' + locale + 'servicos/'));
      if (index % 2 === 0) await card.click({ position: { x: 40, y: 40 } });
      else await link.click();
      await expect(page).toHaveURL(new RegExp(target + '$'));
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('h1')).toHaveText(category);
      await expect(page.locator('form, #aureum-lead-dialog')).toHaveCount(0);
      if (index === 0) {
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(audit.violations).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.locator('.service-page-back').click();
      await expect(page).toHaveURL(new RegExp('/' + locale + '#servicos$'));
      await page.waitForLoadState('domcontentloaded');
      await expect(cards(page)).toHaveCount(5);
    }
    const guidance = page.locator('#servicos .service-guidance');
    const contact = guidance.locator('a');
    const before = page.url();
    await guidance.click({ position: { x: 40, y: 40 } });
    await expect(page.locator('#aureum-lead-dialog')).toBeVisible();
    await expect(page.locator('#lead-main [name=objetivo]')).toHaveValue(await contact.getAttribute('data-intent'));
    expect(page.url()).toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/aureum-lead-dialog-open/);
    await expect(contact).toBeFocused();
  });
}
