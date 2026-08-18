(() => {
  const header=document.getElementById('header');
  const menuButton=document.getElementById('menuButton');
  const mobileMenu=document.getElementById('mobileMenu');
  const isCountryPage=document.body.classList.contains('country-page');

  const setHeader=()=>{
    if (!header) return;
    header.classList.toggle('scrolled',isCountryPage || window.scrollY>30);
  };
  setHeader(); window.addEventListener('scroll',setHeader,{passive:true});

  if(menuButton && mobileMenu){
    menuButton.addEventListener('click',()=>{
      const open=mobileMenu.classList.toggle('open');
      menuButton.classList.toggle('open',open);
      menuButton.setAttribute('aria-expanded',String(open));
      mobileMenu.setAttribute('aria-hidden',String(!open));
      document.body.classList.toggle('menu-open',open);
    });
    mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      mobileMenu.classList.remove('open');menuButton.classList.remove('open');menuButton.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open');
    }));
  }

  document.querySelectorAll('.faq-q').forEach(button=>button.addEventListener('click',()=>{
    const item=button.closest('.faq-item');
    const open=item.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  }));

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -35px'});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  const config=window.AUREUM_CONFIG || {};
  document.querySelectorAll('[data-social]').forEach(link=>{
    const key=link.dataset.social;
    const url=config.social && config.social[key];
    if(url){ link.href=url; link.removeAttribute('aria-disabled'); }
    else { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); link.title='Canal oficial será adicionado'; }
  });

  const form=document.getElementById('contactForm');
  const status=document.getElementById('formStatus');
  if(form && status){
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const data=new FormData(form);
      const resumo=`Aureum — solicitação inicial\n\nNome: ${data.get('nome')}\nContato: ${data.get('contato')}\nDestino: ${data.get('destino')}\nObjetivo: ${data.get('objetivo')}\nContexto: ${data.get('contexto')||'Não informado'}`;
      if(navigator.clipboard){
        navigator.clipboard.writeText(resumo).then(()=>status.textContent='Resumo da solicitação copiado para sua área de transferência.').catch(()=>status.textContent='Solicitação preparada.');
      }else status.textContent='Solicitação preparada.';
    });
  }

  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
})();
