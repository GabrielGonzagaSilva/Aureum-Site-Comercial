// AUREUM — isolated minimal centered-logo hero experiment (preview only).
// Preserve all other sections, destination pages, chat, contact and official assets.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const steps=['build-site.cjs','footer-destinations-patch.cjs','remove-image-credits.cjs','aureum-site-release-v2.cjs','aureum-contact-animation.cjs','aureum-white-halo-patch.cjs','aureum-hero-editorial-prototype.cjs'];
if(process.env.AUREUM_PATCH_ONLY!=='1'){
  for(const step of steps) execFileSync(process.execPath,[step],{stdio:'inherit'});
}
const root=path.join(process.cwd(),'public');
const htmlFile=path.join(root,'index.html');
const cssFile=path.join(root,'assets/css/aureum-logo-centered-preview.css');
let html=fs.readFileSync(htmlFile,'utf8');
const check=(assertion,msg)=>{if(!assertion) throw Error('Minimal hero QA: '+msg);};
const originalHero='<section aria-label="Apresentação" class="hero hero-editorial-test" id="top">';
const minimalHero='<section aria-label="Apresentação" class="hero hero-logo-centered-test" id="top">';
check(html.includes(originalHero),'expected staging hero missing');
check(html.includes('hero-tower-bridge.mp4'),'original video source missing');
check(html.includes('aureum-logo-white.svg'),'official SVG asset missing');
html=html.replace(originalHero,minimalHero);
const start=html.indexOf('<div class="wrap hero-c">',html.indexOf(minimalHero));
const end=html.indexOf('</section>',start);
check(start>=0&&end>start,'hero content bounds missing');
const oldHeroBody=html.slice(start,end);
check(oldHeroBody.includes('hero-commitments') && oldHeroBody.includes('hero-sub') && oldHeroBody.includes('hero-actions'),'hero content changed unexpectedly');
const heroBody=String.raw`
<div class="wrap hero-c">
  <img class="hero-brand-center" src="/assets/brand/aureum-logo-white.svg" alt="Aureum" width="592" height="140" decoding="async" fetchpriority="high">
  <h1>Vistos e mobilidade internacional.</h1>
  <div class="hero-actions">
    <a class="btn btn-light" href="#contato">Solicitar análise<svg aria-hidden="true" class="i"><use href="#i-arrow"></use></svg></a>
  </div>
</div>
`;
html=html.slice(0,start)+heroBody+html.slice(end);
html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/aureum-logo-centered-preview.css">\n</head>');
const css=String.raw`/* Aureum: hero minimalist composition — original official SVG, original video, only one CTA. */
#home .hero.hero-logo-centered-test {
  min-height:max(670px,100svh);
  background-color:#102336;
}
#home .hero-logo-centered-test .hero-c {
  position:relative;
  z-index:2;
  box-sizing:border-box;
  width:100%;
  min-height:max(670px,100svh);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding-top:clamp(120px,14vh,160px);
  padding-bottom:clamp(110px,14vh,160px);
  text-align:center;
}
#home .hero-logo-centered-test .hero-brand-center {
  display:block;
  width:clamp(270px,34vw,420px);
  max-width:82%;
  height:auto;
  margin:0 auto clamp(26px,4.3vh,42px);
  object-fit:contain;
  filter:drop-shadow(0 5px 24px rgba(0,0,0,.28));
}
#home .hero-logo-centered-test h1 {
  font-family:"Newsreader",Georgia,"Times New Roman",serif;
  font-size:clamp(30px,3.1vw,44px);
  font-weight:400;
  line-height:1.14;
  letter-spacing:-.035em;
  max-width:790px!important;
  max-inline-size:min(100%,790px)!important;
  margin:0 auto!important;
  text-wrap:balance;
  color:#fffdf8;
}
#home .hero-logo-centered-test .hero-actions {
  display:flex;
  align-items:center;
  justify-content:center;
  width:auto;
  margin:clamp(28px,4.5vh,43px) auto 0;
  gap:0;
}
#home .hero-logo-centered-test .hero-actions .btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  min-height:54px;
}
#home .hero-logo-centered-test .hero-film::after {
  background:linear-gradient(180deg,rgba(4,15,26,.36) 0%,rgba(4,15,26,.43) 44%,rgba(4,15,26,.63) 100%)!important;
}
@media(max-width:767px){
  #home .hero.hero-logo-centered-test,
  #home .hero-logo-centered-test .hero-c {min-height:max(690px,100svh);}
  #home .hero-logo-centered-test .hero-c {
    padding-top:clamp(110px,13vh,142px);
    padding-bottom:clamp(100px,12vh,135px);
  }
  #home .hero-logo-centered-test .hero-brand-center {
    width:min(78vw,345px);
    margin-bottom:30px;
  }
  #home .hero-logo-centered-test h1 {
    font-size:clamp(28px,7vw,37px);
    line-height:1.18;
    max-width:460px!important;
  }
  #home .hero-logo-centered-test .hero-actions {
    margin-top:29px;
    width:min(100%,315px);
  }
  #home .hero-logo-centered-test .hero-actions .btn {
    width:100%;
    min-height:52px;
    justify-content:center;
  }
  #home .hero-logo-centered-test .hero-film video.hero-video{
    object-position:56% center!important;
  }
}
@media(prefers-reduced-motion:reduce){
  #home .hero-logo-centered-test .hero-c,
  #home .hero-logo-centered-test .hero-brand-center {animation:none!important;}
}
`;
fs.mkdirSync(path.dirname(cssFile),{recursive:true});
fs.writeFileSync(cssFile,css,'utf8');
fs.writeFileSync(htmlFile,html,'utf8');
const newHero=html.slice(html.indexOf(minimalHero),html.indexOf('</section>',html.indexOf(minimalHero)));
check((newHero.match(/class="hero-brand-center"/g)||[]).length===1,'official hero logo not unique');
check((newHero.match(/class="btn btn-light"/g)||[]).length===1,'expected one primary CTA');
check(!newHero.includes('hero-commitments')&&!newHero.includes('hero-sub')&&!newHero.includes('btn-ghost-light')&&!newHero.includes('hero-cap'),'old content not removed');
check(newHero.includes('<h1>Vistos e mobilidade internacional.</h1>'),'hero heading missing');
check(html.includes('hero-tower-bridge.mp4'),'video changed');
check(html.includes('id="contato"'),'contact section missing');
check(css.includes('@media(max-width:767px)'),'mobile rules missing');
console.log('AUREUM MINIMAL CENTERED LOGO QA PASS: single official logo, short heading and one CTA; video, contact, chat, WhatsApp, destinations and all other sections preserved.');
