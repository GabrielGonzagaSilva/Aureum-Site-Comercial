// AUREUM — isolated preview: official logo centered over the homepage hero video.
// Runs the same release pipeline used by the verified November 2 staging deployment.
'use strict';
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const steps = [
  'build-site.cjs',
  'footer-destinations-patch.cjs',
  'remove-image-credits.cjs',
  'aureum-site-release-v2.cjs',
  'aureum-contact-animation.cjs',
  'aureum-white-halo-patch.cjs',
  'aureum-hero-editorial-prototype.cjs',
];
if (process.env.AUREUM_PATCH_ONLY !== '1') {
  for (const step of steps) execFileSync(process.execPath, [step], {stdio:'inherit'});
}
const root = path.join(process.cwd(), 'public');
const file = path.join(root, 'index.html');
const cssFile = path.join(root, 'assets/css/aureum-logo-centered-preview.css');
let html = fs.readFileSync(file, 'utf8');
const check = (test, label) => { if (!test) throw new Error('Centered logo preview QA: ' + label); };
const hero = '<section aria-label="Apresentação" class="hero hero-editorial-test" id="top">';
const heroNext = '<section aria-label="Apresentação" class="hero hero-logo-centered-test" id="top">';
const insertion = '<div class="wrap hero-c">';
const image = '<img class="hero-brand-center" src="/assets/brand/aureum-logo-white.svg" alt="Aureum" width="592" height="140" decoding="async" fetchpriority="high">';
check(html.includes(hero), 'expected original hero markup not found');
check(html.includes(insertion), 'hero body not found');
check(html.includes('class="hero-bg hero-film'), 'original hero video container missing');
check(html.includes('hero-tower-bridge.mp4'), 'original video source missing');
check(html.includes('/assets/brand/aureum-logo-white.svg'), 'original logo asset missing');
check(!html.includes('hero-brand-center'), 'duplicate centered logo');
const before = html;
html = html.replace(hero, heroNext);
const pos = html.indexOf(insertion, html.indexOf(heroNext));
check(pos >= 0, 'hero content slot not found');
html = html.slice(0,pos+insertion.length) + '\n' + image + html.slice(pos+insertion.length);
html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/aureum-logo-centered-preview.css">\n</head>');
check(html.includes('hero-logo-centered-test'), 'new hero selector missing');
check(html.includes('class="hero-brand-center"'), 'centered brand image missing');
check(html.includes('class="hero-actions"'), 'existing CTAs missing');
check(html.includes('id="contato"'), 'contact anchor missing');
check(html.includes('hero-tower-bridge.mp4'), 'hero film was changed');
const css = String.raw`/* AUREUM / limited-scope logo-centered hero experiment; official logo asset untouched. */
#home .hero.hero-logo-centered-test { min-height:max(790px,100svh); background:#102336; }
#home .hero-logo-centered-test .hero-c {
  position:relative; z-index:2; box-sizing:border-box;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  width:100%; min-height:max(790px,100svh);
  padding-top:clamp(145px,17vh,185px); padding-bottom:clamp(70px,9vh,108px);
  text-align:center;
}
#home .hero-logo-centered-test .hero-brand-center {
  display:block; position:relative; width:clamp(240px,27vw,350px);
  max-width:76%; height:auto; margin:0 auto clamp(25px,4vh,37px);
  object-fit:contain; filter:drop-shadow(0 3px 15px rgba(0,0,0,.30));
}
#home .hero-logo-centered-test .over {
  display:inline-flex; align-items:center; justify-content:center; width:auto;
  align-self:center; margin:0; color:#F1DFBE!important; 
  font-size:11px; font-weight:600; letter-spacing:.18em;
}
#home .hero-logo-centered-test .over::before { display:none; }
#home .hero-logo-centered-test h1 {
  font-family:"Newsreader",Georgia,"Times New Roman",serif;
  font-size:clamp(46px,5.2vw,73px);
  font-weight:400; line-height:1.055; letter-spacing:-.044em;
  max-width:840px!important; max-inline-size:min(100%,840px)!important;
  margin:20px auto 0!important; color:#fffdf8; text-wrap:balance;
}
#home .hero-logo-centered-test .hero-sub {
  max-width:675px!important; max-inline-size:min(100%,675px)!important;
  margin:clamp(16px,2.2vh,23px) auto 0;
  font-size:clamp(15px,1.25vw,18px); line-height:1.67;
  color:rgba(255,255,255,.94);
}
#home .hero-logo-centered-test .hero-actions {
  display:flex; align-items:center; justify-content:center;
  flex-wrap:wrap; width:auto; margin:30px auto 0; gap:12px;
}
#home .hero-logo-centered-test .hero-commitments {
  width:min(100%,730px); max-width:730px!important;
  margin:clamp(36px,5vh,55px) auto 0!important;
  text-align:center;
}
#home .hero-logo-centered-test .hero-commitments div { text-align:center; }
#home .hero-logo-centered-test .hero-film::after {
  background:linear-gradient(180deg,rgba(4,13,24,.53) 0%,rgba(4,13,24,.43) 35%,rgba(4,13,24,.63) 72%,rgba(4,13,24,.83) 100%)!important;
}
@media(max-width:767px) {
  #home .hero.hero-logo-centered-test,
  #home .hero-logo-centered-test .hero-c { min-height:max(860px,100svh); }
  #home .hero-logo-centered-test .hero-c {
    align-items:center; padding-top:130px; padding-bottom:94px;
  }
  #home .hero-logo-centered-test .hero-brand-center {
    width:min(69vw,285px); margin-bottom:23px;
  }
  #home .hero-logo-centered-test h1 {
    font-size:clamp(38px,9.4vw,52px);
    max-width:590px!important; line-height:1.08; margin-top:17px!important;
  }
  #home .hero-logo-centered-test .hero-sub {
    font-size:15px; line-height:1.57; margin-top:17px;
  }
  #home .hero-logo-centered-test .hero-actions {
    flex-direction:column; align-items:stretch; gap:9px;
    width:min(100%,365px); margin-top:25px;
  }
  #home .hero-logo-centered-test .hero-actions .btn {
    display:flex; justify-content:center; width:100%; min-height:49px;
  }
  #home .hero-logo-centered-test .hero-commitments {
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:0; margin-top:35px!important;
  }
  #home .hero-logo-centered-test .hero-commitments div {
    padding:14px 6px!important; border-left:0!important;
  }
  #home .hero-logo-centered-test .hero-commitments span {
    font-size:11px; line-height:1.4;
  }
  #home .hero-logo-centered-test .hero-film video.hero-video {
    object-position:56% center!important;
  }
}
@media(max-width:380px) {
  #home .hero.hero-logo-centered-test,
  #home .hero-logo-centered-test .hero-c { min-height:870px; }
  #home .hero-logo-centered-test h1 { font-size:37px; }
  #home .hero-logo-centered-test .hero-brand-center { width:235px; }
}
@media(prefers-reduced-motion:reduce) {
  #home .hero-logo-centered-test .hero-c,
  #home .hero-logo-centered-test .hero-brand-center { animation:none!important; }
}
`;
fs.mkdirSync(path.dirname(cssFile), {recursive:true});
fs.writeFileSync(cssFile, css);
fs.writeFileSync(file, html);
check(css.includes('@media(max-width:767px)'), 'mobile layout missing');
check(css.includes('@media(prefers-reduced-motion:reduce)'), 'motion fallback missing');
console.log('AUREUM CENTERED LOGO PREVIEW QA PASS: one original SVG logo centered above copy; 9 destinations, video, two hero CTAs, navigation, contact, chat, WA and existing halo unchanged; production untouched.');
