import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const dialog = page => page.locator('#aureum-lead-dialog');
const trigger = '#hdr .btn-hdr';
const close = '.aureum-lead-dialog__close';

test.beforeEach(async ({ page }) => {
  // The modal uses the local Inter font, independently of legacy Google Fonts.
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.route(/\/api\/leads(?:\?.*)?$/, route => route.request().method() === 'GET' ? route.continue() : route.abort());
});

async function load(page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#lead-main')).toHaveAttribute('data-aureum-lead-form', 'v1');
  await expect(dialog(page)).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
}
async function position(page, fraction) {
  await page.evaluate(f => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: 'instant' }), fraction);
  await page.waitForTimeout(60);
}
async function open(page) {
  // DOM activation preserves the test's chosen page position, even when the CTA
  // is offscreen. Separate CTA coverage below exercises pointer activation.
  await page.locator(trigger).evaluate(el => el.click());
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toHaveCSS('opacity', '1');
}
async function dismiss(page, method) {
  if (method === 'Escape') await page.keyboard.press('Escape');
  else if (method === 'backdrop') await page.mouse.click(2, 2);
  else await page.locator(close).click();
  await expect(dialog(page)).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/aureum-lead-dialog-open/);
}

test('ten cycles at top, middle and bottom preserve position, background, URL, history and form identity', async ({ page, browserName, isMobile }) => {
  test.setTimeout(180000); // Thirty complete cycles, including native mobile interaction delays.
  await load(page);
  await page.evaluate(() => { window.originalForm = document.querySelector('#lead-main'); });
  for (const fraction of [0, .5, 1]) {
    await position(page, fraction);
    const before = await page.evaluate(() => ({ x: scrollX, y: scrollY, url: location.href, history: history.length, body: document.body.style.cssText, root: document.documentElement.style.cssText, rect: document.querySelector('#home').getBoundingClientRect().top }));
    await page.evaluate(() => {
      window.positions = [];
      window.monitor = true;
      function sample() { if (!window.monitor) return; positions.push(scrollY); requestAnimationFrame(sample); }
      sample();
    });
    for (let i = 0; i < 10; i++) {
      await open(page);
      expect(await page.evaluate(() => document.querySelector('#home').getBoundingClientRect().top)).toBeCloseTo(before.rect, 0);
      if (browserName === 'webkit' && isMobile) await dialog(page).evaluate(e => e.scrollBy(0, 250));
      else await page.mouse.wheel(0, 250);
      await dismiss(page, ['X', 'Escape', 'backdrop'][i % 3]);
      expect(await page.evaluate(() => scrollY)).toBeCloseTo(before.y, 0);
    }
    const after = await page.evaluate(() => {
      window.monitor = false;
      return { x: scrollX, y: scrollY, url: location.href, history: history.length, body: document.body.style.cssText, root: document.documentElement.style.cssText, rect: document.querySelector('#home').getBoundingClientRect().top, maxDelta: Math.max(...positions.map(y => Math.abs(y - scrollY))), identity: originalForm === document.querySelector('#lead-main') };
    });
    expect(after.identity).toBe(true);
    expect(after.maxDelta).toBeLessThanOrEqual(1);
    delete after.identity; delete after.maxDelta;
    expect(after).toEqual(before);
  }
});

for (const width of [360, 430, 768, 1024, 1440, 1920]) {
  test(`layout at ${width}px, then short landscape viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await load(page);
    await position(page, .35);
    await open(page);
    const form = page.locator('#lead-main');
    const columns = await form.evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 800 ? 2 : 1);
    for (const height of [900, 360]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(60);
      const metrics = await dialog(page).evaluate(e => ({ width: e.clientWidth, scrollWidth: e.scrollWidth, height: e.clientHeight, scrollHeight: e.scrollHeight, top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1);
      expect(metrics.top).toBeGreaterThanOrEqual(0);
      expect(metrics.bottom).toBeLessThanOrEqual(height + 1);
      if (width >= 1024 && height === 900) expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.height + 1);
      await page.locator('#lead-main button[type=submit]').scrollIntoViewIfNeeded();
      await expect(page.locator('#lead-main button[type=submit]')).toBeInViewport();
      await expect(page.locator(close)).toBeInViewport();
      await dialog(page).evaluate(e => { e.scrollTop = 0; });
    }
    await dismiss(page, 'X');
  });
}

test('focus trap, restore, reduced motion, validation and local-only review', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await load(page);
  await position(page, .5);
  const posts = [];
  page.on('request', req => { if (req.method() === 'POST') posts.push(req.url()); });
  await open(page);
  await expect(page.locator(close)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#lead-main button[type=submit]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator(close)).toBeFocused();
  const backgroundFocus = await page.locator('#mm-open').evaluate(e => { e.focus(); return document.activeElement === e; });
  expect(backgroundFocus).toBe(false);
  await page.locator('#lead-main button[type=submit]').click();
  await expect(page.locator('#lead-main-name')).toBeFocused();
  await expect(page.locator('#lead-main-name')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#lead-main-name').fill('Teste Aureum');
  await page.locator('#lead-main [name=consentimento]').check();
  await page.locator('#lead-main button[type=submit]').click();
  await expect(page.locator('#lead-main-email')).toBeFocused();
  await page.locator('#lead-main [name=codigo_pais]').selectOption('other');
  await page.locator('#lead-main [name=codigo_pais_outro]').fill('+44');
  await page.locator('#lead-main [name=whatsapp]').fill('020 7946 0958');
  await page.locator('#lead-main button[type=submit]').click();
  const review = page.locator('.aureum-lead-dialog .aureum-lead-result');
  await expect(review).toBeVisible();
  await expect(review.locator('textarea')).toHaveValue(/\+442079460958/);
  await expect(review).toContainText('Nenhum dado foi enviado ou armazenado');
  expect(posts).toEqual([]);
  await dismiss(page, 'Escape');
  // Desktop CTA returns focus; on mobile its hidden header CTA is not focusable.
  if (await page.locator(trigger).isVisible()) await expect(page.locator(trigger)).toBeFocused();
  await open(page);
  await expect(review).toBeVisible();
  await review.getByRole('button', { name: 'Editar dados' }).click();
  await expect(page.locator('#lead-main-name')).toHaveValue('Teste Aureum');
  await dismiss(page, 'X');
});

test('all visible contact CTAs, context, mobile drawer and ordinary hash navigation', async ({ page }) => {
  await load(page);
  const links = page.locator('a[href$="#contato"]').filter({ visible: true });
  const count = await links.count();
  let checked = 0;
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    if (!await link.evaluate(e => e.matches('.btn, .more, .tlink, .primary-button, [data-subject], [data-intent], #contact-full-link'))) continue;
    await link.scrollIntoViewIfNeeded();
    const before = page.url();
    await link.click();
    await expect(dialog(page)).toBeVisible();
    const intent = await link.getAttribute('data-intent');
    if (intent) await expect(page.locator('#lead-main [name=objetivo]')).toHaveValue(intent);
    expect(page.url()).toBe(before);
    await dismiss(page, 'X');
    checked++;
  }
  expect(checked).toBeGreaterThan(5);
  await page.setViewportSize({ width: 430, height: 900 });
  await page.locator('#mm-open').click();
  await page.locator('#mmenu .btn[href$="#contato"]').click();
  await expect(dialog(page)).toBeVisible();
  await expect(page.locator('#mmenu')).toBeHidden();
  await dismiss(page, 'Escape');
  await expect(page.locator('#mm-open')).toBeFocused();
  await page.locator('#mm-open').click();
  await page.locator('#mmenu a[href$="#servicos"]').click();
  await expect(page).toHaveURL(/#servicos$/);
  await expect(dialog(page)).not.toBeVisible();
});

for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
  test(`localized home and destination: ${locale || 'pt'}`, async ({ page }) => {
    for (const path of ['/' + locale, '/' + locale + 'destinos/portugal/']) {
      await load(page, path);
      await position(page, .3);
      await open(page);
      await expect(dialog(page)).toHaveAccessibleName(/.+/);
      await expect(page.locator(close)).toHaveAccessibleName(/.+/);
      await expect(page.locator('#lead-main [name=codigo_pais]')).toHaveAccessibleName(/.+/);
      if (path.includes('destinos')) await expect(page.locator('#lead-main [name=destino]')).toHaveValue('Portugal');
      const results = await new AxeBuilder({ page }).include('#aureum-lead-dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
      await dismiss(page, 'X');
    }
  });
}

test('closing after local review at the page bottom preserves the original position', async ({ page }) => {
  await load(page);
  await position(page, 1);
  const y = await page.evaluate(() => scrollY);
  await open(page);
  await page.locator('#lead-main-name').fill('Teste Aureum');
  await page.locator('#lead-main-email').fill('teste@example.com');
  await page.locator('#lead-main [name=consentimento]').check();
  await page.locator('#lead-main button[type=submit]').click();
  await expect(page.locator('.aureum-lead-dialog .aureum-lead-result')).toBeVisible();
  await dismiss(page, 'X');
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
});

test('200 percent viewport zoom/reflow and pointer drag do not lose the form', async ({ page }) => {
  // A 1440x900 desktop at 200% browser zoom has a 720x450 CSS viewport.
  await page.setViewportSize({ width: 720, height: 450 });
  await load(page);
  await position(page, .5);
  await open(page);
  await page.locator('#lead-main-msg').fill('Mensagem preservada');
  const box = await page.locator('#lead-main-msg').boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(2, 2);
  await page.mouse.up();
  await expect(dialog(page)).toBeVisible();
  await page.locator('#lead-main button[type=submit]').scrollIntoViewIfNeeded();
  await expect(page.locator(close)).toBeInViewport();
  await dismiss(page, 'X');
  await open(page);
  await expect(page.locator('#lead-main-msg')).toHaveValue('Mensagem preservada');
  await dismiss(page, 'Escape');
});
