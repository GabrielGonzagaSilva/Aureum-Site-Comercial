import { test, expect } from '@playwright/test';

for (const [locale, width] of [['', 1440], ['en/', 768], ['es/', 430], ['fr/', 1024], ['de/', 360]]) {
  test(`destination cards link from the entire surface in ${locale || 'pt/'} at ${width}px`, async ({ page, isMobile }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/assets/hero-tower-bridge.mp4*', route => route.abort());
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#destinos [data-destino]');
    await expect(cards).toHaveCount(9);
    for (const card of await cards.all()) {
      const slug = await card.getAttribute('data-destino');
      const link = card.getByRole('link');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', '/' + locale + 'destinos/' + slug + '/');
      const missed = await card.evaluate(element => {
        element.scrollIntoView({ block: 'center', behavior: 'instant' });
        const bounds = element.getBoundingClientRect();
        const points = [[0.08, 0.08], [0.92, 0.08], [0.5, 0.45], [0.08, 0.92], [0.92, 0.92]]
          .map(([x, y]) => [bounds.left + x * bounds.width, bounds.top + y * bounds.height]);
        for (const selector of ['.dc__tags li', '.dc__title', '.dc__text', '.dc__arrow']) {
          const box = element.querySelector(selector).getBoundingClientRect();
          points.push([box.left + box.width / 2, box.top + box.height / 2]);
        }
        const link = element.querySelector('a');
        return points.filter(([x, y]) => document.elementFromPoint(x, y)?.closest('a') !== link);
      });
      expect(missed, slug).toEqual([]);
    }
    const first = cards.first();
    const target = await first.getByRole('link').getAttribute('href');
    const position = { x: 40, y: 65 };
    if (isMobile) await first.tap({ position });
    else await first.click({ position });
    await expect.poll(() => new URL(page.url()).pathname).toBe(target);
    await page.goto('/' + locale, { waitUntil: 'domcontentloaded' });
    const last = cards.last().getByRole('link');
    const keyboardTarget = await last.getAttribute('href');
    await last.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => new URL(page.url()).pathname).toBe(keyboardTarget);
  });
}
