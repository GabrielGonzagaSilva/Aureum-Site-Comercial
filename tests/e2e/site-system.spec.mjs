import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async({page})=>{
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  await page.route(/\/assets\/hero-tower-bridge\.mp4/,r=>r.abort());
  await page.route(/\/api\/leads(?:\?.*)?$/,r=>r.request().method()==='GET'?r.continue():r.abort());
});
for(const locale of ['','en/','es/','fr/','de/']) {
  for(const width of [390,1440]) {
    test(`shared type, grid and readable colors in ${locale||'pt/'} at ${width}px`,async({page})=>{
      await page.setViewportSize({width,height:900});
      await page.goto('/'+locale,{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>document.fonts.ready);
      const headings=await page.locator('#home .page-title,#home .h2').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return {font:s.fontSize,weight:s.fontWeight};}));
      expect(headings.length).toBeGreaterThan(8);
      expect(new Set(headings.map(h=>h.font)).size).toBe(1);
      expect(headings.every(h=>h.weight==='500')).toBe(true);
      const margins=await page.locator('#orientacao>.wrap,#servicos>.wrap,#destinos>.wrap,#como-funciona>.wrap,#depoimentos>.wrap,#sobre>.wrap,#diferenciais>.wrap,#perguntas>.wrap,#contato>.wrap').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return Math.round(r.left+parseFloat(s.paddingLeft));}));
      expect(new Set(margins).size).toBe(1);
      const outerPadding=await page.locator('#home>.aureum-refined').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).paddingTop)+parseFloat(getComputedStyle(e).paddingBottom)));
      expect(outerPadding.every(p=>p===0)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(locale==='') expect((await page.locator('#ux-paths-title').innerText()).replace(/\s+/g,' ')).toBe('Seu próximo passo começa aqui.');
      const footer=page.locator('.foot .f-grid>nav').nth(1);
      await expect(footer.locator('a')).toHaveCount(5);
      for(const link of await footer.locator('a').all())expect(await link.getAttribute('href')).toMatch(/\/servicos\/[a-z-]+\/$/);
      const rows=await footer.locator('a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));
      expect(rows.every((top,i)=>i===0||top>rows[i-1])).toBe(true);
      for(const image of await page.locator('#home #destinos .dc__flag').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
        expect(await image.getAttribute('src')).toMatch(/^\/assets\/flags\//);
      }
      const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(audit.violations).toEqual([]);
    });
  }
}
test('mobile drawer keeps keyboard focus and restores page interaction',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#mm-open').click();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  await expect(page.locator('html')).toHaveAttribute('data-aureum-motion','paused');
  const drawer=page.locator('#mmenu');
  const last=drawer.locator('a[href]').last();
  await last.focus();await page.keyboard.press('Tab');
  expect(await drawer.evaluate(e=>e.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();await expect(page.locator('#mm-open')).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
});
test('reduced motion keeps clear feedback without moving content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-aureum-motion','paused');
  await page.locator('#mm-open').click();
  await expect(page.locator('#mmenu')).toHaveCSS('animation-name','aureum-open-reduced');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mm-open')).toBeFocused();
  const photo=page.locator('#servicos .service-category').first();await photo.hover();
  await expect(photo.locator('img')).toHaveCSS('transform','none');
  const feedback=await page.locator('#servicos .service-guidance a').evaluate(e=>getComputedStyle(e).transitionDuration);
  expect(feedback).not.toContain('0.01ms');
});
test('malformed incoming fragments leave routing and contact usable',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#%E0%A4%A',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#home')).toBeVisible();
  await page.locator('#servicos .service-guidance a').click();
  await expect(page.locator('#aureum-lead-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#aureum-lead-dialog')).toBeHidden();
  expect(errors).toEqual([]);
});

test('late media loading never resets the visitor scroll position',async({page})=>{
  let release;
  const delayed=new Promise(resolve=>{release=resolve;});
  await page.route(/\/assets\/photos\/portugal-01\.webp/,async route=>{await delayed;await route.continue();});
  await page.setViewportSize({width:430,height:900});
  try {
    await page.goto('/es/destinos/portugal/',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(500);
    release();await page.waitForLoadState('load');
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(500);
    await expect(page.locator('#hdr')).toHaveClass(/solid/);
  } finally {release();}
});
