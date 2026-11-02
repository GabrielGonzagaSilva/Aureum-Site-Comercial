// AUREUM — conversion-focused editorial split hero (isolated preview).
// Builds on the same validated public site pipeline; other routes and integrations preserved.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const steps = [
 'build-site.cjs',
 'footer-destinations-patch.cjs',
 'remove-image-credits.cjs',
 'aureum-site-release-v2.cjs',
 'aureum-contact-animation.cjs',
 'aureum-white-halo-patch.cjs',
 'aureum-hero-editorial-prototype.cjs'
];
if (process.env.AUREUM_PATCH_ONLY !== '1') {
  for (const step of steps) execFileSync(process.execPath, [step], { stdio:'inherit' });
}
const root=path.join(process.cwd(),'public');
const htmlFile=path.join(root,'index.html');
const cssFile=path.join(root,'assets/css/aureum-hero-split-conversion-20261102.css');
let html=fs.readFileSync(htmlFile,'utf8');
const check=(condition,msg)=>{if(!condition) throw new Error('Aureum split hero QA: '+msg);};
const originalTag='<section aria-label="Apresentação" class="hero hero-editorial-test" id="top">';
const start=html.indexOf(originalTag);
check(start!==-1,'Original verified hero missing');
const end=html.indexOf('</section>',start);
check(end>start,'Hero boundary missing');
const oldHero=html.slice(start,end+10);
const originalVideo=oldHero.match(/<video\b[\s\S]*?<\/video>/i);
check(Boolean(originalVideo),'Original hero video missing');
check(originalVideo[0].includes('/assets/hero-tower-bridge.mp4'),'Original London hero footage missing');
check(oldHero.includes('hero-actions'),'Hero structure changed unexpectedly');
check(html.includes('id="orientacao"'),'Scroll destination missing');
check(html.includes('id="contato"'),'CTA destination missing');
check(html.includes('/assets/brand/aureum-logo-ink.svg'),'Official dark logo missing');
check(!html.includes('aureum-hero-split-conversion-20261102.css'),'Preview CSS unexpectedly already present');
const hero=String.raw`
<section aria-label="Apresentação" class="hero hero-split-test" id="top">
  <div class="wrap hero-shell">
    <div class="hero-intro">
      <h1>Assessoria migratória segura para o seu próximo destino</h1>
      <p class="hero-support">Orientação individual para vistos e cidadania na Europa, América do Norte e Oceania.</p>
      <div class="hero-actions">
        <a class="btn hero-primary-action" href="#contato">Solicitar análise <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
      </div>
      <a class="hero-scroll-indicator" href="#orientacao" aria-label="Rolar para conhecer nossos serviços">
        <i class="ph ph-arrow-down" aria-hidden="true"></i><span>Explore nossos serviços</span>
      </a>
    </div>
    <figure class="hero-visual" aria-label="Vídeo de Londres">
      ${originalVideo[0]}
    </figure>
  </div>
</section>`;
html=html.slice(0,start)+hero+html.slice(end+10);
html=html.replace('<body>','<body class="aureum-split-preview">');
const phosphor='<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">';
const previewCss='<link rel="stylesheet" href="/assets/css/aureum-hero-split-conversion-20261102.css">';
html=html.replace('</head>',phosphor+'\n'+previewCss+'\n</head>');
const css=String.raw`/* AUREUM — Editorial split / conversion-focused hero experiment.
   Scoped to the homepage preview; no modifications to other sections or the original video. */
body.aureum-split-preview { --aureum-hero-bg:#F6F4EF; --aureum-hero-ink:#162C3C; --aureum-hero-cta:#123149; }
body.aureum-split-preview .site-hdr:not(.solid) {
  background:var(--aureum-hero-bg);
  color:var(--aureum-hero-ink);
  box-shadow:0 1px 0 rgba(22,44,60,.09);
}
body.aureum-split-preview .site-hdr:not(.solid) .logo-img--white {display:none!important;}
body.aureum-split-preview .site-hdr:not(.solid) .logo-img--ink {display:block!important;}
body.aureum-split-preview .site-hdr:not(.solid) .btn-hdr {
  background:var(--aureum-hero-cta);
  color:#fff;
}
body.aureum-split-preview .site-hdr:not(.solid) .btn-hdr:hover {background:#244861;}
body.aureum-split-preview .site-hdr :is(.nav,.hdr-cta,.btn,.menu-btn,.mega) {
  font-family:Inter,Arial,sans-serif;
}
#home .hero.hero-split-test {
  display:block;
  position:relative;
  overflow:hidden;
  min-height:0;
  background:#F6F4EF;
  color:#162C3C;
}
#home .hero-split-test .hero-shell {
  display:grid;
  grid-template-columns:repeat(12,minmax(0,1fr));
  gap:clamp(26px,3.8vw,58px);
  align-items:center;
  min-height:max(720px,100svh);
  box-sizing:border-box;
  padding-top:clamp(132px,15vh,177px);
  padding-bottom:clamp(90px,10vh,127px);
}
#home .hero-split-test .hero-intro {
  grid-column:span 7;
  min-width:0;
  position:relative;
  z-index:1;
}
#home .hero-split-test h1 {
  max-width:810px!important;
  max-inline-size:100%!important;
  margin:0!important;
  font-family:Inter,Arial,sans-serif!important;
  font-weight:700!important;
  font-size:clamp(43px,4.55vw,70px)!important;
  line-height:1.08!important;
  letter-spacing:-.055em;
  color:#162C3C!important;
  text-wrap:balance;
}
#home .hero-split-test .hero-support {
  margin:clamp(22px,3.3vh,31px) 0 0;
  max-width:530px;
  font-family:Inter,Arial,sans-serif;
  font-weight:400;
  font-size:clamp(16px,1.22vw,19px);
  line-height:1.68;
  color:#485A66;
}
#home .hero-split-test .hero-actions {
  margin:clamp(31px,4.8vh,44px) 0 0;
  display:flex;
  gap:0;
}
#home .hero-split-test .hero-primary-action {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:20px;
  min-height:58px;
  padding:0 25px;
  border:1px solid #123149;
  border-radius:6px;
  background:#123149!important;
  color:#fff!important;
  font-family:Inter,Arial,sans-serif!important;
  font-size:15px;
  font-weight:600;
  line-height:1.25;
  text-decoration:none;
  transition:background .2s ease,transform .2s ease;
}
#home .hero-split-test .hero-primary-action:hover {
  background:#244861!important;
  transform:translateY(-1px);
}
#home .hero-split-test .hero-primary-action:focus-visible,
#home .hero-split-test .hero-scroll-indicator:focus-visible {
  outline:3px solid #37688B;
  outline-offset:4px;
}
#home .hero-split-test .hero-primary-action .ph {
  font-size:20px;
  line-height:1;
  flex:0 0 auto;
}
#home .hero-split-test .hero-scroll-indicator {
  display:inline-flex;
  align-items:center;
  gap:11px;
  margin-top:clamp(46px,8vh,75px);
  font-family:Inter,Arial,sans-serif;
  font-size:13px;
  font-weight:500;
  color:#485A66;
  text-decoration:none;
  transition:color .2s ease;
}
#home .hero-split-test .hero-scroll-indicator:hover {color:#123149;}
#home .hero-split-test .hero-scroll-indicator .ph {
  display:inline-block;
  font-size:23px;
  line-height:1;
  animation:aureum-split-scroll 2.8s ease-in-out infinite;
}
@keyframes aureum-split-scroll {
  0%,100% {transform:translateY(0);}
  50% {transform:translateY(5px);}
}
#home .hero-split-test .hero-visual {
  grid-column:span 5;
  align-self:stretch;
  position:relative;
  min-width:0;
  min-height:510px;
  max-height:700px;
  aspect-ratio:4/5;
  margin:0;
  border-radius:10px;
  overflow:hidden;
  background:#D3D8D5 url("/assets/hero-tower-bridge-poster.jpg") center/cover no-repeat;
}
#home .hero-split-test .hero-visual .hero-video {
  display:block!important;
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:52% center;
  filter:none!important;
  transform:none!important;
}
@media(max-width:1050px) {
  #home .hero-split-test .hero-shell {gap:32px;}
  #home .hero-split-test h1 {font-size:clamp(38px,4.7vw,52px)!important;}
  #home .hero-split-test .hero-visual {min-height:450px;}
}
@media(max-width:850px) {
  #home .hero-split-test .hero-shell {
    gap:43px;
    min-height:0;
    padding-top:130px;
    padding-bottom:74px;
  }
  #home .hero-split-test .hero-intro,
  #home .hero-split-test .hero-visual {grid-column:span 12;}
  #home .hero-split-test h1 {font-size:clamp(38px,7vw,58px)!important;max-width:720px!important;}
  #home .hero-split-test .hero-scroll-indicator {margin-top:35px;}
  #home .hero-split-test .hero-visual {
    align-self:auto;
    width:100%;
    min-height:0;
    max-height:490px;
    aspect-ratio:16/9;
  }
}
@media(max-width:520px) {
  #home .hero-split-test .hero-shell {
    padding-top:112px;
    padding-bottom:48px;
    gap:32px;
  }
  #home .hero-split-test h1 {
    font-size:clamp(35px,9vw,44px)!important;
    letter-spacing:-.047em;
  }
  #home .hero-split-test .hero-support {
    font-size:16px;
    line-height:1.6;
    margin-top:19px;
  }
  #home .hero-split-test .hero-actions {margin-top:28px;}
  #home .hero-split-test .hero-primary-action {
    width:100%;
    max-width:320px;
    min-height:54px;
    justify-content:space-between;
  }
  #home .hero-split-test .hero-scroll-indicator {margin-top:30px;}
  #home .hero-split-test .hero-visual {
    aspect-ratio:4/3;
    max-height:340px;
    border-radius:8px;
  }
}
@media(prefers-reduced-motion:reduce) {
  #home .hero-split-test .hero-visual video {display:none!important;}
  #home .hero-split-test .hero-scroll-indicator .ph {animation:none!important;}
  #home .hero-split-test .hero-primary-action {transition:none!important;}
}
`;
fs.mkdirSync(path.dirname(cssFile),{recursive:true});
fs.writeFileSync(cssFile,css,'utf8');
fs.writeFileSync(htmlFile,html,'utf8');
const changedHero=html.slice(html.indexOf('class="hero hero-split-test"'),html.indexOf('</section>',html.indexOf('class="hero hero-split-test"')));
check(changedHero.includes('Assessoria migratória segura para o seu próximo destino'),'Exact H1 missing');
check(changedHero.includes('América do Norte e Oceania'),'Subtitle missing');
check(changedHero.includes('href="#contato"'),'Primary CTA missing');
check(changedHero.includes('ph ph-arrow-up-right')&&changedHero.includes('ph ph-arrow-down'),'Phosphor UI icons missing');
check(changedHero.includes('hero-tower-bridge.mp4'),'Original video missing');
check(!changedHero.includes('hero-bg hero-film')&&!changedHero.includes('hero-commitments'),'Old fullscreen hero elements remain');
check(html.includes('assets/brand/aureum-logo-ink.svg'),'Official logo lost');
check(css.includes('grid-column:span 7')&&css.includes('grid-column:span 5'),'12-column split missing');
check(css.includes('#F6F4EF'),'Required off-white token missing');
check(css.includes('@media(max-width:520px)'),'Mobile rules missing');
check(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced motion media rule missing');
const luminance=hex=>{
  const values=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255);
  return values.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((acc,v,i)=>acc+[.2126,.7152,.0722][i]*v,0);
};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
check(contrast('#162C3C','#F6F4EF')>=7,'H1 contrast below WCAG AAA');
check(contrast('#485A66','#F6F4EF')>=4.5,'Body contrast below WCAG AA');
check(contrast('#FFFFFF','#123149')>=4.5,'CTA contrast below WCAG AA');
console.log('AUREUM HERO SPLIT QA PASS: exact headline, short subtitle, off-white surface, 7/5 layout, responsive video, Inter UI, Phosphor, accessible CTA/scroll, reduced-motion and WCAG AA contrast. Other site sections intact.');
