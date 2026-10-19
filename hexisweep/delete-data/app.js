(() => {
  'use strict';
  const data=JSON.parse(document.getElementById('translations').textContent);
  const select=document.getElementById('language');
  const languageToggle=document.getElementById('language-toggle');
  const languageMenu=document.getElementById('language-menu');
  const languageNames=Object.fromEntries([...select.options].map(option=>[option.value,option.text]));
  const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
  let menuOpen=false,menuAnimation;
  const languageOptions=[];
  function setMenu(open,focusIndex){
    if(!open&&!menuOpen&&languageMenu.hidden)return;
    menuOpen=open;languageToggle.setAttribute('aria-expanded',String(open));
    if(menuAnimation)menuAnimation.cancel();
    languageMenu.inert=!open;
    if(open){languageMenu.hidden=false;}
    const frames=open?[{opacity:0,transform:'translateY(-7px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}]:[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-5px) scale(.98)'}];
    menuAnimation=languageMenu.animate(frames,{duration:reducedMotion.matches?0:180,easing:'cubic-bezier(.2,.8,.2,1)'});
    menuAnimation.onfinish=()=>{if(!menuOpen)languageMenu.hidden=true;};
    if(open&&focusIndex!==undefined)languageOptions[focusIndex]?.focus({preventScroll:true});
  }
  Object.entries(languageNames).forEach(([code,name])=>{
    const option=document.createElement('button');option.type='button';option.role='option';option.dataset.language=code;option.tabIndex=-1;
    const flag=document.createElement('img');flag.src='../privacy/assets/flags/'+code+'.svg';flag.alt='';flag.width=22;flag.height=16;
    const label=document.createElement('span');label.textContent=name;option.append(flag,label);
    option.addEventListener('click',()=>{applyLanguage(code,true);setMenu(false);languageToggle.focus({preventScroll:true});});
    languageMenu.append(option);languageOptions.push(option);
  });
  select.hidden=true;languageToggle.hidden=false;
  languageToggle.addEventListener('click',()=>setMenu(!menuOpen));
  languageToggle.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setMenu(true,Math.max(0,languageOptions.findIndex(o=>o.dataset.language===select.value)));}
    if(event.key==='Escape'){setMenu(false);}
  });
  languageMenu.addEventListener('keydown',event=>{
    let index=languageOptions.indexOf(document.activeElement);
    if(event.key==='Escape'){event.preventDefault();setMenu(false);languageToggle.focus({preventScroll:true});return;}
    if(event.key==='Tab'){setMenu(false);return;}
    if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Home')index=0;else if(event.key==='End')index=languageOptions.length-1;else index=(index+(event.key==='ArrowDown'?1:-1)+languageOptions.length)%languageOptions.length;
    languageOptions[index].focus({preventScroll:true});
  });
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.language'))setMenu(false);});
  document.querySelector('.language').addEventListener('focusout',event=>{if(!event.currentTarget.contains(event.relatedTarget))setMenu(false);});

  const supported=Object.keys(data);
  function normalize(value){const base=String(value||'').toLowerCase().replace('_','-').split('-')[0];return base==='pt'?'pt-BR':supported.includes(base)?base:null;}
  function applyLanguage(code,remember=false){
    code=normalize(code)||'en';const t=data[code];
    const old=document.querySelector('.delete-copy:not([hidden])');const line=document.querySelector('.site-header').offsetHeight+24;
    let position=null;
    if(remember&&scrollY>0&&old){const block=[...old.querySelectorAll('[data-block]')].reverse().find(el=>el.getBoundingClientRect().top<=line);if(block)position={key:block.dataset.block,ratio:(line-block.getBoundingClientRect().top)/block.offsetHeight};else position={y:scrollY};}
    document.documentElement.lang=code;document.title=t.title+' · HexiTools';select.value=code;
    document.getElementById('language-name').textContent=languageNames[code];document.getElementById('language-flag').src='../privacy/assets/flags/'+code+'.svg';
    languageToggle.setAttribute('aria-label',t.language+': '+languageNames[code]);languageMenu.setAttribute('aria-label',t.language);
    languageOptions.forEach(o=>o.setAttribute('aria-selected',String(o.dataset.language===code)));
    for(const [id,key] of [['page-title','title'],['page-lead','lead'],['developer-line','developer'],['footer-line','footer']])document.getElementById(id).textContent=data[code][key];
    document.querySelectorAll('.delete-copy').forEach(el=>el.hidden=el.lang!==code);
    if(position){const block=document.querySelector('#delete-'+code+' [data-block="'+position.key+'"]');scrollTo({top:block?scrollY+block.getBoundingClientRect().top+position.ratio*block.offsetHeight-line:position.y,behavior:'instant'});}
    if(remember){try{localStorage.setItem('hexitools.privacy.language',code);localStorage.setItem('hexitools.privacy.browser',JSON.stringify(navigator.languages||[navigator.language]));}catch{}const url=new URL(location.href);url.searchParams.set('lang',code);if(url.hash)url.hash=url.hash.replace(/^#(?:en|ru|de|es|fr|pt-BR)-/,'#'+code+'-');history.replaceState(history.state,'',url);}
  }
  let saved;try{if(localStorage.getItem('hexitools.privacy.browser')===JSON.stringify(navigator.languages||[navigator.language]))saved=localStorage.getItem('hexitools.privacy.language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');const detected=(navigator.languages||[navigator.language]).map(normalize).find(Boolean);
  const linked=location.hash.match(/^#(en|ru|de|es|fr|pt-BR)-/)?.[1];
  applyLanguage(requested!==null?(normalize(requested)||'en'):(linked||normalize(saved)||detected||'en'));
  select.addEventListener('change',()=>applyLanguage(select.value,true));
  addEventListener('popstate',()=>applyLanguage(normalize(new URLSearchParams(location.search).get('lang'))||detected||'en'));
})();
