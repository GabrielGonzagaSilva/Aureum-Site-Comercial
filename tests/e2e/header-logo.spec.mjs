import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const logo = page => page.locator('#hdr .navbar .logo');
const hero = page => page.locator('#home .hero-logo-centered-test');

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.route(/\/assets\/hero-tower-bridge\.mp4(?:\?.*)?$/, route => route.abort());
});

async function load(page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#aureum-final-ui-patch-style')).toBeAttached();
}

async function scrollPastHero(page) {
  // WebKit mobile can expose scrollY before queued scroll/render work settles.
  // Wait for that real event and the controller's render frames before checking
  // visibility; all logo, focus and geometry assertions below remain unchanged.
  await hero(page).evaluate(element => new Promise(resolve => {
    const top = element.getBoundingClientRect().bottom + scrollY;
    if (Math.abs(scrollY - top) < 1) { resolve(); return; }
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }, { once: true });
    scrollTo({ top, behavior: 'instant' });
  }));
  await expect(logo(page)).toBeVisible();
  await expect(logo(page)).toHaveCSS('opacity', '1');
  await expect(logo(page)).toHaveAttribute('aria-hidden', 'false');
  await expect(logo(page)).not.toHaveAttribute('inert');
}

async function oneLoadedVariant(parent, variant) {
  const images = parent.locator('.logo-img');
  await expect(images).toHaveCount(2);
  await expect(parent.locator('.logo-img--' + variant)).toBeVisible();
  await expect(parent.locator('.logo-img--' + (variant === 'ink' ? 'white' : 'ink'))).toBeHidden();
  const image = parent.locator('.logo-img--' + variant);
  await expect.poll(() => image.evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true);
  // A loaded SVG can briefly have zero rendered size during a WebKit variant
  // change. Recheck the same geometry requirements until layout has settled.
  await expect(async () => {
    await expect(image).toBeVisible();
    const size = await image.evaluate(e => ({
      width: e.getBoundingClientRect().width,
      height: e.getBoundingClientRect().height,
      ratio: e.naturalWidth / e.naturalHeight,
    }));
    expect(size.width).toBeGreaterThan(100);
    expect(size.width / size.height).toBeCloseTo(size.ratio, 1);
  }).toPass({ timeout: 5000 });
}

for (const width of [360, 430, 768, 1024, 1440, 1920]) {
  test(`hero, scroll, menu and return keep a single logo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await load(page);
    await expect(logo(page)).toBeHidden();
    await expect(logo(page)).toHaveAttribute('inert');
    await expect(page.locator('.hero-brand-center')).toBeVisible();
    await expect.poll(() => page.locator('.hero-brand-center').evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true);
    const menuBefore = width <= 1200 ? await page.locator('#mm-open').boundingBox() : null;
    await scrollPastHero(page);
    await oneLoadedVariant(logo(page), 'ink');
    const geometry = await logo(page).evaluate(e => {
      const box = e.getBoundingClientRect();
      return { left: box.left, right: box.right, bottom: box.bottom, headerBottom: document.querySelector('#hdr').getBoundingClientRect().bottom };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(width);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.headerBottom + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width <= 1200) {
      const menuAfter = await page.locator('#mm-open').boundingBox();
      expect(menuAfter.x).toBeCloseTo(menuBefore.x, 0);
      await page.locator('#mm-open').click();
      await oneLoadedVariant(page.locator('#mmenu .logo'), 'ink');
      await page.locator('#mm-close').click();
      await expect(page.locator('#mm-open')).toBeFocused();
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(logo(page)).toBeHidden();
    await expect(logo(page)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hero-brand-center')).toBeVisible();
  });
}

for (const locale of ['', 'en/', 'es/', 'fr/', 'de/']) {
  test(`home and destination preserve the logo in ${locale || 'pt/'}`, async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 900 });
    await load(page, '/' + locale);
    await expect(logo(page)).toBeHidden();
    await scrollPastHero(page);
    await oneLoadedVariant(logo(page), 'ink');
    await load(page, '/' + locale + 'destinos/portugal/');
    await oneLoadedVariant(logo(page), 'white');
    // Wait for WebKit's scroll event and variant swap, as on the home page.
    await page.evaluate(() => new Promise(resolve => {
      window.addEventListener('scroll', () => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }, { once: true });
      scrollTo({ top: 500, behavior: 'instant' });
    }));
    await oneLoadedVariant(logo(page), 'ink');
    await expect(logo(page)).toHaveAccessibleName(/Aureum/);
    await page.locator('#mm-open').click();
    await oneLoadedVariant(page.locator('#mmenu .logo'), 'ink');
    await page.locator('#mm-close').click();
    await logo(page).click();
    await expect(page).toHaveURL(new RegExp('/' + locale + '$'));
    await expect(logo(page)).toBeHidden();
  });
}

test('slow deferred scripts never flash the header logo over the mobile hero', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(/\/aureum-updates\.js(?:\?.*)?$/, async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('.hero-brand-center')).toBeVisible();
    await expect(page.locator('#aureum-final-ui-patch-style')).toHaveCount(0);
    await expect(logo(page)).toBeHidden();
  } finally {
    release();
  }
  await expect(page.locator('#aureum-final-ui-patch-style')).toBeAttached();
  await expect(logo(page)).toBeHidden();
  await scrollPastHero(page);
  await oneLoadedVariant(logo(page), 'ink');
});

test('breakpoint changes preserve visibility and menu position in both scroll states', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 900 });
  await load(page);
  for (const width of [761, 430, 1201, 360, 1440, 760]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(logo(page)).toBeHidden();
    await expect(logo(page)).toHaveAttribute('inert');
  }
  await scrollPastHero(page);
  for (const width of [761, 430, 1201, 360, 1440, 760]) {
    await page.setViewportSize({ width, height: 900 });
    await oneLoadedVariant(logo(page), 'ink');
    await expect(logo(page)).not.toHaveAttribute('inert');
  }
});

test('dark device preference and reduced motion preserve the white-surface logo and keyboard access', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 430, height: 900 });
  await load(page);
  await expect(logo(page)).toBeHidden();
  await expect(logo(page)).toHaveCSS('transition-duration', '0s');
  await page.locator('#mm-open').focus();
  await page.keyboard.press('Enter');
  await oneLoadedVariant(page.locator('#mmenu .logo'), 'ink');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mm-open')).toBeFocused();
  await scrollPastHero(page);
  await oneLoadedVariant(logo(page), 'ink');
  const audit = await new AxeBuilder({ page }).include('#hdr').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(audit.violations).toEqual([]);
});
