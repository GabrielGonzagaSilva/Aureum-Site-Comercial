import {readFile, writeFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {filesUnder} from './verify.mjs';
import {localeFromPath} from './localized-copy.mjs';
import {serviceNavigation} from './service-cards.mjs';

const COPY = {
  pt: {title:'Conheça nossos serviços', cta:'Ver serviços'},
  en: {title:'Explore our services', cta:'View services'},
  es: {title:'Conoce nuestros servicios', cta:'Ver servicios'},
  fr: {title:'Découvrez nos services', cta:'Voir les services'},
  de: {title:'Unsere Leistungen', cta:'Leistungen ansehen'},
};
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function refineSiteHtml(html, locale) {
  const services=serviceNavigation(locale),copy=COPY[locale];
  const home=locale==='pt'?'/':'/'+locale+'/';
  let output=html.replace(/<link\b[^>]*href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*>\s*/gi,'');
  // Keep the same vector flags without a third-party request for every card.
  output=output.replace(/https:\/\/flagcdn\.com\/(pt|ca|gb|ie|es|au|de|fr|br)\.svg/g,'/assets/flags/$1.svg');
  if(!output.includes('href="/assets/css/aureum-site-system.css"')) {
    output=output.replace('</head>','<link rel="stylesheet" href="/assets/css/aureum-site-system.css">\n<script src="/assets/js/aureum-site-system.js" defer></script>\n</head>');
  }
  // The recovered marketing templates share one set of brand assets at build time.
  output=output.replace(/<link\b[^>]*\brel="icon"[^>]*>/g,'<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon-aureum.svg">');
  output=output.replace(/<img\b[^>]*src="\/assets\/brand\/aureum-(?:hero|wordmark)-outlined-v1-(?:white|ink)\.svg"[^>]*>/g, image => {
    const full=image.includes('aureum-hero-outlined');
    const color=image.includes('-ink.svg')?'preto':'branco';
    const logo = image.replace(/src="[^"]+"/,'src="/assets/brand/logo-'+(full?'completa':'reduzida')+'-'+color+'.svg"')
      .replace(/width="\d+"/,'width="764"')
      .replace(/height="\d+"/,full?'height="524"':'height="186"');
    if (!full) return logo;
    return '<picture class="hero-brand-picture"><source media="(prefers-reduced-motion: no-preference)" srcset="/assets/brand/aureum-motion-branco.svg?v=nascer-do-sol">' + logo + '</picture>';
  });
  // Keep the footer in sync with the same service catalog used by the cards.
  output=output.replace(/<footer\b(?=[^>]*\bclass=["']foot["'])[^>]*>[\s\S]*?<\/footer>/gi, footer =>
    footer.replace('/assets/brand/logo-reduzida-branco.svg','/assets/brand/logo-reduzida-bege.svg')
      // Keep social links directly below the logo, without the brand description.
      .replace(/(<div class="f-brand">\s*<a\b[^>]*>[\s\S]*?<\/a>)\s*<p>[\s\S]*?<\/p>(?=\s*<div class="f-social">)/, '$1\n')
      .replace(/<span class="f-social-link is-pending" role="img" aria-label="Facebook da Aureum[^"]*" title="[^"]*">([\s\S]*?)<\/span>/, '<a class="f-social-link" href="https://www.facebook.com/profile.php?id=61596232775892" target="_blank" rel="noopener noreferrer" aria-label="Facebook da Aureum">$1</a>')
      .replace(/<span class="f-social-link is-pending" role="img" aria-label="LinkedIn da Aureum[^"]*" title="[^"]*">([\s\S]*?)<\/span>/, '<a class="f-social-link" href="https://www.linkedin.com/company/aureum-assessoria-internacional/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn da Aureum">$1</a>')
      .replace(/<nav\b[^>]*><h4>[^<]+<\/h4>(?:<a href="(?:\/(?:(?:en|es|fr|de)\/)?)?#servicos">[^<]+<\/a>)+<\/nav>/g, nav => {
      const heading=nav.match(/<h4>[^<]+<\/h4>/)[0];
      const opening=nav.match(/^<nav\b[^>]*>/)[0];
      return opening+heading+services.map(s=>'<a href="'+s.href+'">'+escape(s.title)+'</a>').join('')+'</nav>';
    })
  );
  // Replace the obsolete programme teaser with a truthful route to the catalog.
  output=output.replace(/<a class="pcard" href="(?:\/(?:(?:en|es|fr|de)\/)?)?#destinos" style="justify-content:flex-end">[\s\S]*?<\/a>/g,
    '<a class="pcard site-service-overview" href="'+home+'#servicos"><b>'+escape(copy.title)+'</b><span>'+services.map(s=>escape(s.title)).join(' · ')+'.</span><span class="more">'+escape(copy.cta)+'<svg aria-hidden="true" class="i"><use href="#i-arrow"></use></svg></span></a>');
  // A malformed incoming fragment must not stop routing and the page controls.
  output=output.replace('var id = decodeURIComponent(location.hash.slice(1));',
    "var id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch (error) { id = ''; }");
  return output;
}

export async function applySiteRefinement(root='dist') {
  let pages=0;
  for(const file of (await filesUnder(root)).filter(file=>file.endsWith('.html'))) {
    const html=await readFile(file,'utf8');
    if(!/\sid=["']hdr["']/i.test(html)) continue;
    const locale=localeFromPath(relative(root,file).replace(/\\/g,'/'));
    await writeFile(file,refineSiteHtml(html,locale));pages++;
  }
  if(pages!==50) throw Error('Expected to refine 50 marketing pages; found '+pages);
  return {pages};
}
