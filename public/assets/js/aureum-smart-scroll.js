/* Aureum — content-aligned anchor navigation, 2026-11-03.
   Scroll to section content, not its outer padding. Preserve hash links, history and routing. */
(function(){
  'use strict';
  var reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)');
  var header=document.getElementById('hdr');
  function visibleTarget(id){
    var target=document.getElementById(id);
    if(!target)return null;
    var page=target.closest('.page');
    if(page&&page.hidden)return null;
    return target;
  }
  function contentStart(target){
    if(target.id==='top')return target;
    var inner=target.querySelector(':scope > .wrap')||target;
    return inner.querySelector(':scope > .sec-head, :scope > .ux-paths-head, :scope > .about, :scope > .contact, :scope > .faq, :scope > .ux-expect-head, :scope > h1, :scope > h2')||inner.firstElementChild||inner;
  }
  function smartScroll(target,instant){
    if(!target)return;
    var mode=instant||(reducedMotion&&reducedMotion.matches)?'auto':'smooth';
    if(target.id==='top'){
      window.scrollTo({top:0,left:0,behavior:mode});
      return;
    }
    var navbar=header&&header.querySelector('.navbar .wrap');
    var navHeight=navbar?Math.ceil(navbar.getBoundingClientRect().height):78;
    var breathing=Math.round(Math.min(26,Math.max(16,window.innerHeight*0.025)));
    var content=contentStart(target);
    var top=Math.max(0,Math.round(window.scrollY+content.getBoundingClientRect().top-navHeight-breathing));
    window.scrollTo({top:top,left:0,behavior:mode});
  }
  function hashTarget(){
    var hash=window.location.hash;
    if(!hash||hash.length<2)return null;
    var id;
    try{id=decodeURIComponent(hash.slice(1));}catch(err){return null;}
    return visibleTarget(id);
  }
  function alignHash(instant){
    var target=hashTarget();
    if(target)smartScroll(target,instant);
  }
  document.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var node=event.target;
    var link=node&&node.closest&&node.closest('a[href*="#"]');
    if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
    var url;
    try{url=new URL(link.href,window.location.href);}catch(err){return;}
    if(url.origin!==window.location.origin||url.pathname!==window.location.pathname||!url.hash)return;
    var id;
    try{id=decodeURIComponent(url.hash.slice(1));}catch(err){return;}
    var target=visibleTarget(id);
    if(!target)return; // Leave inter-page and hidden destination routing untouched.
    event.preventDefault();
    var destination=url.pathname+url.search+url.hash;
    if(window.location.pathname+window.location.search+window.location.hash!==destination){
      window.history.pushState(null,'',destination);
    }
    // Existing mobile drawer closes via its own link listener before the next frame.
    window.requestAnimationFrame(function(){smartScroll(target,false);});
  });
  window.addEventListener('hashchange',function(){
    window.requestAnimationFrame(function(){alignHash(false);});
  });
  window.addEventListener('popstate',function(){
    window.requestAnimationFrame(function(){alignHash(true);});
  });
  function initial(){
    if(!window.location.hash)return;
    window.requestAnimationFrame(function(){
      window.requestAnimationFrame(function(){alignHash(true);});
    });
  }
  if(document.readyState==='complete')initial();
  else window.addEventListener('load',initial,{once:true});
})();