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
  <h1>Sua jornada internacional com segurança e previsibilidade.</h1>
  <p class="hero-support">Especialistas em vistos e cidadania para Europa, América do Norte e Oceania.</p>
  <div class="hero-actions">
    <a class="btn btn-light" href="#contato">Solicitar análise<i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
  </div>
</div>
<a class="hero-scroll-hint" href="#orientacao" aria-label="Rolar para conhecer a Aureum"><span>ROLE PARA EXPLORAR</span><i class="ph ph-arrow-down hero-scroll-arrow" aria-hidden="true"></i></a>
`;
html=html.slice(0,start)+heroBody+html.slice(end);
html=html.replace('</head>',`<script>document.documentElement.classList.add("aureum-hero-logo-active");</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
<link rel="stylesheet" href="/assets/css/aureum-logo-centered-preview.css">
</head>`);
html=html.replace('<body>','<body class="aureum-logo-refined-preview">');
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
#home .hero-logo-centered-test .hero-film video.hero-video {
  filter:blur(2.5px);
  transform:scale(1.035);
  transform-origin:center center;
}
#home .hero-logo-centered-test .hero-scroll-hint {
  position:absolute;
  z-index:4;
  bottom:clamp(22px,4vh,42px);
  left:50%;
  transform:translateX(-50%);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  padding:10px 18px;
  text-decoration:none;
  white-space:nowrap;
  font:600 10px/1.4 Manrope,Arial,sans-serif;
  letter-spacing:.18em;
  color:rgba(255,255,255,.86);
  transition:color .2s ease;
}
#home .hero-logo-centered-test .hero-scroll-hint:hover,
#home .hero-logo-centered-test .hero-scroll-hint:focus-visible { color:#fff; }
#home .hero-logo-centered-test .hero-scroll-hint:focus-visible { outline:2px solid #fff; outline-offset:3px; }
#home .hero-logo-centered-test .hero-scroll-arrow {
  font-size:23px;
  font-weight:400;
  line-height:1;
  letter-spacing:0;
  animation:aureum-scroll-prompt 2.5s ease-in-out infinite;
}
@keyframes aureum-scroll-prompt {
  0%,100% {translate:0 0;opacity:.7;}
  55% {translate:0 5px;opacity:1;}
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
  #home .hero-logo-centered-test .hero-scroll-hint { bottom:24px; font-size:9px; }
}
@media(prefers-reduced-motion:reduce){
  #home .hero-logo-centered-test .hero-c,
  #home .hero-logo-centered-test .hero-brand-center,
  #home .hero-logo-centered-test .hero-scroll-arrow {animation:none!important;}
}

/* Hero refined preview: centered brand, readable white copy, accessible moving video. */
#home .hero.hero-logo-centered-test,#home .hero-logo-centered-test .hero-c{min-height:max(800px,100svh)}
#home .hero-logo-centered-test .hero-c{
 padding-top:clamp(145px,16vh,175px);padding-bottom:clamp(140px,17vh,180px)
}
#home .hero-logo-centered-test .hero-brand-center{width:clamp(240px,26vw,350px);margin-bottom:clamp(25px,4vh,38px)}
#home .hero-logo-centered-test h1{
 font-family:Inter,Arial,sans-serif!important;font-weight:600!important;
 font-size:clamp(34px,3.4vw,55px)!important;line-height:1.12!important;
 max-width:930px!important;max-inline-size:min(100%,930px)!important;letter-spacing:-.04em
}
#home .hero-logo-centered-test .hero-support{
 font:400 clamp(16px,1.35vw,18px)/1.6 Inter,Arial,sans-serif;
 color:rgba(255,255,255,.96);max-width:720px;margin:24px auto 0;text-align:center;text-wrap:pretty
}
#home .hero-logo-centered-test .hero-actions{margin-top:32px}
#home .hero-logo-centered-test .hero-actions .btn.btn-light{
 background:#F6F4EF!important;border:1px solid #F6F4EF!important;color:#102A3D!important;
 min-height:54px;gap:14px;border-radius:5px;font:600 15px/1.3 Inter,Arial,sans-serif!important
}
#home .hero-logo-centered-test .hero-actions .btn.btn-light:hover{background:#fff!important;border-color:#fff!important}
#home .hero-logo-centered-test .hero-actions .btn .ph{font-size:19px;line-height:1}
#home .hero-logo-centered-test .hero-film::after,#home .hero-logo-centered-test .hero-bg::after{
 background:rgba(3,10,20,.66)!important
}
#home .hero-logo-centered-test .hero-scroll-hint{font-family:Inter,Arial,sans-serif}
#home .hero-logo-centered-test .hero-scroll-hint .ph{font-size:23px;line-height:1}
html.aureum-hero-logo-active body.aureum-logo-refined-preview #hdr .navbar .logo{
 width:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;pointer-events:none;
 transform:translateY(-3px);transition:opacity .35s ease,max-width .35s ease,width .35s ease,transform .35s ease,visibility .35s
}
html.aureum-hero-logo-active.aureum-logo-in-header body.aureum-logo-refined-preview #hdr .navbar .logo{
 width:clamp(175px,18vw,230px);max-width:230px;opacity:1;overflow:visible;
 visibility:visible;pointer-events:auto;transform:translateY(0)
}
body.aureum-logo-refined-preview #hdr :is(.nav a,.nav button,.hdr-cta .btn){
 font-family:Inter,Arial,sans-serif!important;font-weight:500
}
body.aureum-logo-refined-preview #hdr .hdr-cta .btn{font-weight:600}
@media(max-width:767px){
 #home .hero.hero-logo-centered-test,#home .hero-logo-centered-test .hero-c{min-height:max(800px,100svh)}
 #home .hero-logo-centered-test .hero-c{padding-top:clamp(135px,15vh,168px);padding-bottom:clamp(145px,17vh,180px)}
 #home .hero-logo-centered-test .hero-brand-center{width:min(69vw,280px);margin-bottom:26px}
 #home .hero-logo-centered-test h1{font-size:clamp(31px,7.7vw,44px)!important;line-height:1.16!important;max-width:580px!important}
 #home .hero-logo-centered-test .hero-support{font-size:16px;line-height:1.55;margin-top:20px}
 #home .hero-logo-centered-test .hero-actions{margin-top:28px}
 #home .hero-logo-centered-test .hero-scroll-hint{bottom:25px}
 html.aureum-hero-logo-active.aureum-logo-in-header body.aureum-logo-refined-preview #hdr .navbar .logo{
  width:clamp(135px,35vw,190px);max-width:190px
 }
}
@media(max-width:380px){
 #home .hero.hero-logo-centered-test,#home .hero-logo-centered-test .hero-c{min-height:850px}
 #home .hero-logo-centered-test h1{font-size:31px!important}
 #home .hero-logo-centered-test .hero-support{font-size:15px}
}
@media(prefers-reduced-motion:reduce){
 #home .hero-logo-centered-test .hero-film{background-image:url("/assets/hero-tower-bridge-poster.jpg")!important;background-size:cover!important;background-position:center!important}
 #home .hero-logo-centered-test .hero-film video.hero-video{display:none!important}
 html.aureum-hero-logo-active body.aureum-logo-refined-preview #hdr .navbar .logo{transition:none!important}
}
`;
fs.mkdirSync(path.dirname(cssFile),{recursive:true});
fs.writeFileSync(cssFile,css,'utf8');
html=html.replace('</body>',"<script>\n(()=>{\"use strict\";\nconst logo=document.querySelector(\"#home .hero-logo-centered-test .hero-brand-center\");\nconst nav=document.querySelector(\"#hdr .navbar .logo\");\nif(!logo||!nav){document.documentElement.classList.remove(\"aureum-hero-logo-active\");return;}\nconst isVisible=()=>{const r=logo.getBoundingClientRect(),home=document.querySelector(\"#home\");return !!home&&getComputedStyle(home).display!==\"none\"&&r.bottom>76&&r.top<innerHeight};\nconst apply=visible=>{document.documentElement.classList.toggle(\"aureum-logo-in-header\",!visible);nav.inert=visible;nav.setAttribute(\"aria-hidden\",visible?\"true\":\"false\")};\napply(isVisible());\nif(\"IntersectionObserver\" in window){new IntersectionObserver(es=>{if(es.length)apply(isVisible()&&es[0].isIntersecting)},{rootMargin:\"-76px 0px 0px 0px\",threshold:0}).observe(logo)}\nelse{addEventListener(\"scroll\",()=>apply(isVisible()),{passive:true})}\naddEventListener(\"pageshow\",()=>apply(isVisible()));\naddEventListener(\"hashchange\",()=>requestAnimationFrame(()=>apply(isVisible())));\naddEventListener(\"resize\",()=>apply(isVisible()),{passive:true});\n})();\n</script>"+'\n</body>');
fs.writeFileSync(htmlFile,html,'utf8');
const newHero=html.slice(html.indexOf(minimalHero),html.indexOf('</section>',html.indexOf(minimalHero)));
check((newHero.match(/class="hero-brand-center"/g)||[]).length===1,'official hero logo not unique');
check((newHero.match(/class="btn btn-light"/g)||[]).length===1,'expected one primary CTA');
check(!newHero.includes('hero-commitments')&&!newHero.includes('hero-sub')&&!newHero.includes('btn-ghost-light')&&!newHero.includes('hero-cap'),'old content not removed');
check(newHero.includes('<h1>Sua jornada internacional com segurança e previsibilidade.</h1>'),'hero heading missing');
check(newHero.includes('class="hero-support"'),'hero support missing');
check(newHero.includes('ph ph-arrow-up-right')&&newHero.includes('ph ph-arrow-down'),'Phosphor icons missing');
check(newHero.includes('class="hero-scroll-hint"')&&newHero.includes('href="#orientacao"'),'scroll indicator missing');
check(css.includes('filter:blur(2.5px)'),'subtle video blur missing');
check(html.includes('hero-tower-bridge.mp4'),'video changed');
check(html.includes('id="contato"'),'contact section missing');
check(css.includes('@media(max-width:767px)'),'mobile rules missing');
console.log('AUREUM MINIMAL HERO QA PASS: official logo, Cidadania e vistos, single CTA, scroll prompt and 2.5px video blur; all other sections preserved.');

console.log('AUREUM REFINED HERO QA PASS: updated copy, 66% video scrim, Phosphor controls, Inter typography and scroll-revealed header logo.');
