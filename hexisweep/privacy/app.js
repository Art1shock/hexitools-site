(() => {
  'use strict';
  const data=JSON.parse(document.getElementById('translations').textContent);
  const select=document.getElementById('language');
  const supported=Object.keys(data.meta);
  const normalize=value=>{
    if(!value)return null;
    const base=String(value).toLowerCase().replace('_','-').split('-')[0];
    if(base==='pt')return 'pt-BR';
    return supported.includes(base)?base:null;
  };
  let observer;
  const mobile=matchMedia('(max-width:760px)');
  const tocDetails=document.querySelector('.toc-card');
  tocDetails.open=!mobile.matches;
  mobile.addEventListener('change',event=>{tocDetails.open=!event.matches;});
  function applyLanguage(code,remember=false){
    code=normalize(code)||'en';
    document.documentElement.lang=code;
    document.title=data.meta[code].title+' · HexiTools';
    select.value=code;
    document.getElementById('page-title').textContent=data.meta[code].title;
    document.getElementById('update-date').textContent=data.meta[code].date;
    document.querySelectorAll('[data-ui]').forEach(el=>{el.textContent=data.ui[code][Number(el.dataset.ui)];});
    document.querySelectorAll('article[lang]').forEach(el=>{el.hidden=el.lang!==code;});
    const toc=document.getElementById('toc');toc.replaceChildren();
    toc.setAttribute('aria-label',data.ui[code][5]);
    data.headings[code].forEach((title,i)=>{
      const a=document.createElement('a');a.href='#'+code+'-section-'+(i+1);
      const number=document.createElement('span');number.className='toc-num';number.textContent=String(i+1).padStart(2,'0');
      const label=document.createElement('span');label.textContent=title;a.append(number,label);toc.append(a);
    });
    if(observer)observer.disconnect();
    if('IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        entries.filter(e=>e.isIntersecting).forEach(entry=>{
          toc.querySelectorAll('a').forEach(a=>{
            const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);
            if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
          });
        });
      },{rootMargin:'-100px 0px -65% 0px'});
      document.querySelectorAll('#policy-'+code+' section').forEach(el=>observer.observe(el));
    }
    if(remember){
      try{localStorage.setItem('hexitools.privacy.language',code);}catch{}
      const url=new URL(location.href);url.searchParams.set('lang',code);
      if(url.hash && /-section-/.test(url.hash))url.hash=url.hash.replace(/^#(?:en|ru|es|de|fr|pt-BR)-/,'#'+code+'-');
      history.replaceState(null,'',url);
    }
  }
  let saved;try{saved=localStorage.getItem('hexitools.privacy.language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  const detected=(navigator.languages||[navigator.language]).map(normalize).find(Boolean);
  applyLanguage(requested!==null?(normalize(requested)||'en'):(normalize(saved)||detected||'en'));
  select.addEventListener('change',()=>applyLanguage(select.value,true));
  let scheduled=false;
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    document.querySelector('.reading-progress').style.width=(max>0?100*scrollY/max:0)+'%';scheduled=false;
  };
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
  updateProgress();
})();
