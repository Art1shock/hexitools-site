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
    const flag=document.createElement('img');flag.src='assets/flags/'+code+'.svg';flag.alt='';flag.width=22;flag.height=16;
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
  const supported=Object.keys(data.meta);
  const normalize=value=>{
    if(!value)return null;
    const base=String(value).toLowerCase().replace('_','-').split('-')[0];
    if(base==='pt')return 'pt-BR';
    return supported.includes(base)?base:null;
  };
  let activeSections=[],activeSectionId='',navigationTarget=null;
  // The same reading line is used for anchor landing and manual scroll tracking.
  const readingLine=()=>document.querySelector('.site-header').offsetHeight+24;
  function setActiveSection(id){
    if(id===activeSectionId)return;
    activeSectionId=id;
    document.querySelectorAll('#toc a').forEach(a=>{
      const active=a.hash==='#'+id;a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    });
    document.dispatchEvent(new CustomEvent('privacy:section',{detail:{id}}));
  }
  function updateActiveSection(){
    if(!activeSections.length||document.body.classList.contains('sheet-open'))return;
    if(navigationTarget){
      const distance=Math.abs(scrollY-navigationTarget.top);
      if(distance<=2)navigationTarget.arrived=true;
      // Keep the clicked destination selected during smooth travel and when the
      // page end prevents its heading from reaching the reading line.
      if(!navigationTarget.arrived||distance<=2){setActiveSection(navigationTarget.id);return;}
      navigationTarget=null;
    }
    let selected=activeSections[0];
    if(scrollY+innerHeight>=document.documentElement.scrollHeight-3)selected=activeSections[activeSections.length-1];
    else for(const section of activeSections){
      if(section.querySelector('h2').getBoundingClientRect().top<=readingLine()+2)selected=section;else break;
    }
    setActiveSection(selected.id);
  }
  let navigationFrame=0;
  function watchNavigation(){
    cancelAnimationFrame(navigationFrame);
    const target=navigationTarget;
    function tick(){
      if(navigationTarget!==target)return;
      updateActiveSection();
      if(navigationTarget&&!navigationTarget.arrived){
        if(performance.now()>target.until){navigationTarget=null;updateActiveSection();return;}
        navigationFrame=requestAnimationFrame(tick);
      }
    }
    navigationFrame=requestAnimationFrame(tick);
  }
  function navigateToSection(hash,{historyEntry=true,smooth=true}={}){
    const target=document.getElementById(hash.slice(1));
    if(!target||!activeSections.includes(target))return false;
    const heading=target.querySelector('h2');
    const top=Math.max(0,Math.min(scrollY+heading.getBoundingClientRect().top-readingLine(),document.documentElement.scrollHeight-innerHeight));
    navigationTarget={id:target.id,top,arrived:false,until:performance.now()+2000};
    if(historyEntry&&location.hash!==hash){const url=new URL(location.href);url.hash=hash;history.pushState(null,'',url);}
    setActiveSection(target.id);
    window.scrollTo({top,behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});
    updateActiveSection();watchNavigation();return true;
  }
  window.hexiPrivacyNavigation={go:navigateToSection};
  document.getElementById('toc').addEventListener('click',event=>{
    const link=event.target.closest('a');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    if(navigateToSection(link.hash))event.preventDefault();
  });
  function cancelNavigation(){
    if(!navigationTarget)return;
    navigationTarget=null;
    // A reader interrupting smooth travel takes control immediately.
    window.scrollTo({top:scrollY,behavior:'instant'});updateActiveSection();
  }
  addEventListener('resize',()=>{navigationTarget=null;});
  addEventListener('wheel',cancelNavigation,{passive:true});
  addEventListener('touchstart',cancelNavigation,{passive:true});
  addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!event.target.closest('button,[role=listbox],select'))cancelNavigation();});
  addEventListener('pointerdown',event=>{if(event.clientX>=document.documentElement.clientWidth-18)cancelNavigation();},{passive:true});
  const mobile=matchMedia('(max-width:760px)');
  const tocDetails=document.querySelector('.toc-card');
  const tocSummary=tocDetails.querySelector('summary');
  let tocAnimation,tocExpanded=!mobile.matches;
  tocDetails.open=!mobile.matches;
  tocSummary.setAttribute('aria-expanded',String(tocExpanded));
  tocSummary.addEventListener('click',event=>{
    event.preventDefault();
    const start=tocDetails.getBoundingClientRect().height;
    if(tocAnimation)tocAnimation.cancel();
    tocExpanded=!tocExpanded;tocSummary.setAttribute('aria-expanded',String(tocExpanded));
    tocDetails.open=false;const collapsed=tocDetails.getBoundingClientRect().height;
    tocDetails.open=true;const expanded=tocDetails.getBoundingClientRect().height;
    tocDetails.style.overflow='hidden';
    tocAnimation=tocDetails.animate([{height:start+'px'},{height:(tocExpanded?expanded:collapsed)+'px'}],{duration:reducedMotion.matches?0:280,easing:'cubic-bezier(.25,.8,.25,1)'});
    tocAnimation.onfinish=()=>{tocDetails.open=tocExpanded;tocDetails.style.overflow='';};
  });
  mobile.addEventListener('change',event=>{
    if(tocAnimation)tocAnimation.cancel();tocExpanded=!event.matches;tocDetails.open=tocExpanded;tocDetails.style.overflow='';tocSummary.setAttribute('aria-expanded',String(tocExpanded));
  });
  function applyLanguage(code,remember=false){
    navigationTarget=null;
    const previous=activeSections;
    const header=readingLine();
    let position=null;
    if(remember&&previous.length&&scrollY>0){
      const current=[...previous].reverse().find(s=>s.getBoundingClientRect().top<=header);
      if(scrollY+innerHeight>=document.documentElement.scrollHeight-3)position={bottom:true};
      else if(current)position={index:previous.indexOf(current),ratio:Math.max(0,(header-current.getBoundingClientRect().top)/current.offsetHeight)};
      else position={y:scrollY};
    }
    code=normalize(code)||'en';
    document.documentElement.lang=code;
    document.title=data.meta[code].title+' · HexiTools';
    select.value=code;
    document.getElementById('language-name').textContent=languageNames[code];
    document.getElementById('language-flag').src='assets/flags/'+code+'.svg';
    languageToggle.setAttribute('aria-label',data.ui[code][8]+': '+languageNames[code]);
    languageMenu.setAttribute('aria-label',data.ui[code][8]);
    languageOptions.forEach(option=>option.setAttribute('aria-selected',String(option.dataset.language===code)));
    document.getElementById('page-title').textContent=data.meta[code].title;
    document.getElementById('update-date').textContent=data.meta[code].date;
    document.querySelectorAll('[data-ui]').forEach(el=>{el.textContent=data.ui[code][Number(el.dataset.ui)];});
    document.querySelectorAll('article[lang]').forEach(el=>{el.hidden=el.lang!==code;});
    const toc=document.getElementById('toc');toc.replaceChildren();
    toc.setAttribute('aria-label',data.ui[code][5]);
    data.headings[code].forEach((title,i)=>{
      const a=document.createElement('a');a.href='#'+code+'-section-'+(i+1);
      const number=document.createElement('span');number.className='site-hex toc-hex';number.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.textContent=title;a.append(number,label);toc.append(a);
    });
    activeSections=[...document.querySelectorAll('#policy-'+code+' section')];
    if(position){
      const target=activeSections[position.index];
      window.scrollTo({top:position.bottom?document.documentElement.scrollHeight:(target?scrollY+target.getBoundingClientRect().top+Math.min(position.ratio,1)*target.offsetHeight-header:position.y),behavior:'instant'});
    }
    activeSectionId='';updateActiveSection();
    document.dispatchEvent(new CustomEvent('privacy:language',{detail:{code}}));
    if(remember){
      try{localStorage.setItem('hexitools.privacy.language',code);localStorage.setItem('hexitools.privacy.browser',JSON.stringify(navigator.languages||[navigator.language]));}catch{}
      const url=new URL(location.href);url.searchParams.set('lang',code);
      if(url.hash && /-section-/.test(url.hash))url.hash=url.hash.replace(/^#(?:en|ru|es|de|fr|pt-BR)-/,'#'+code+'-');
      history.replaceState(history.state,'',url);
    }
  }
  let saved;try{
    if(localStorage.getItem('hexitools.privacy.browser')===JSON.stringify(navigator.languages||[navigator.language]))saved=localStorage.getItem('hexitools.privacy.language');
  }catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  const detected=(navigator.languages||[navigator.language]).map(normalize).find(Boolean);
  const linked=location.hash.match(/^#(en|ru|es|de|fr|pt-BR)-section-\d+$/)?.[1];
  applyLanguage(requested!==null?(normalize(requested)||'en'):(linked||normalize(saved)||detected||'en'));
  addEventListener('popstate',()=>{
    const code=normalize(new URLSearchParams(location.search).get('lang'))||location.hash.match(/^#(en|ru|es|de|fr|pt-BR)-section-\d+$/)?.[1];
    if(code&&code!==select.value)applyLanguage(code);
    if(!document.body.classList.contains('sheet-open'))requestAnimationFrame(()=>navigateToSection(location.hash,{historyEntry:false,smooth:false}));
  });
  addEventListener('hashchange',()=>{if(!document.body.classList.contains('sheet-open'))navigateToSection(location.hash,{historyEntry:false,smooth:false});});
  addEventListener('load',()=>{if(location.hash)navigateToSection(location.hash,{historyEntry:false,smooth:false});});
  select.addEventListener('change',()=>applyLanguage(select.value,true));
  let scheduled=false;
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    document.querySelector('.reading-progress').style.width=(max>0?100*scrollY/max:0)+'%';updateActiveSection();scheduled=false;
  };
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
  addEventListener('resize',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}});
  updateProgress();
})();
