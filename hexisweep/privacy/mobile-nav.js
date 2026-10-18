(() => {
  'use strict';
  const mobile=matchMedia('(max-width:760px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const data=JSON.parse(document.getElementById('translations').textContent);
  const labels={en:['Policy sections','Close sections'],ru:['Разделы политики','Закрыть разделы'],de:['Abschnitte der Datenschutzerklärung','Abschnitte schließen'],es:['Secciones de la política','Cerrar secciones'],fr:['Rubriques de la politique','Fermer les rubriques'],'pt-BR':['Seções da política','Fechar seções']};
  const button=document.createElement('button');button.type='button';button.className='mobile-sections';button.hidden=true;
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','policy-sections');button.setAttribute('aria-expanded','false');
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/></svg><span class="mobile-section-label"></span><svg class="mobile-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m7 14 5-5 5 5"/></svg>';
  const dialog=document.createElement('dialog');dialog.id='policy-sections';dialog.className='section-dialog';dialog.setAttribute('aria-labelledby','section-sheet-title');
  dialog.innerHTML='<div class="section-sheet"><div class="sheet-grip" aria-hidden="true"><span></span></div><header class="sheet-header"><h2 id="section-sheet-title"></h2><button type="button" class="sheet-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><nav class="sheet-links"></nav></div>';
  document.body.append(button,dialog);
  const panel=dialog.querySelector('.section-sheet'), list=dialog.querySelector('nav'), closeButton=dialog.querySelector('.sheet-close');
  const toc=document.querySelector('.toc-card'), title=dialog.querySelector('h2');
  let current='',lastY=scrollY,travel=0,frame=false,closing=false,lockedY=0,pending=null,returnFocus=null;
  const marker='hexiPrivacySections';
  const animate=(element,frames)=>element.animate(frames,{duration:reduced.matches?0:200,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  function sync(){
    const code=document.documentElement.lang;
    title.textContent=labels[code][0];closeButton.setAttribute('aria-label',labels[code][1]);list.setAttribute('aria-label',labels[code][0]);
    list.replaceChildren(...[...document.querySelectorAll('#toc a')].map(link=>{
      const copy=link.cloneNode(true);copy.addEventListener('click',event=>{event.preventDefault();dismiss(copy.hash);});return copy;
    }));
    updateCurrent();update();
  }
  function updateCurrent(){
    const active=document.querySelector('#toc a.active')||document.querySelector('#toc a');
    if(!active)return;
    current=active.hash;button.querySelector('span').textContent=active.textContent;
    button.setAttribute('aria-label',labels[document.documentElement.lang][0]+': '+active.textContent);
    list.querySelectorAll('a').forEach(link=>{const selected=link.hash===current;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  function update(){
    frame=false;if(dialog.open)return;
    const visible=mobile.matches&&toc.getBoundingClientRect().bottom<=document.querySelector('.site-header').offsetHeight;
    button.hidden=!visible;
    const delta=scrollY-lastY;if(Math.sign(delta)!==Math.sign(travel))travel=0;travel+=delta;
    if(Math.abs(travel)>32){button.classList.toggle('compact',travel>0);travel=0;}
    if(scrollY+innerHeight>=document.documentElement.scrollHeight-8)button.classList.remove('compact');
    lastY=scrollY;
  }
  function queue(){if(!frame){frame=true;requestAnimationFrame(update);}}
  function go(hash){window.hexiPrivacyNavigation.go(hash);}
  function open(){
    if(!mobile.matches||dialog.open||closing)return;
    returnFocus=document.activeElement;lockedY=scrollY;
    history.pushState({...history.state,[marker]:true},'',location.href);
    dialog.showModal();button.setAttribute('aria-expanded','true');document.body.classList.add('sheet-open');
    document.body.style.top=-lockedY+'px';
    animate(panel,[{transform:'translateY(100%)',opacity:0},{transform:'translateY(0)',opacity:1}]);
    const active=list.querySelector('.active');if(active)active.scrollIntoView({block:'nearest',behavior:'instant'});
    closeButton.focus({preventScroll:true});
  }
  async function finish(){
    if(!dialog.open||closing)return;closing=true;
    await animate(panel,[{transform:'translateY(0)',opacity:1},{transform:'translateY(100%)',opacity:0}]).finished;
    dialog.close();document.body.classList.remove('sheet-open');document.body.style.top='';
    window.scrollTo({top:lockedY,behavior:'instant'});button.setAttribute('aria-expanded','false');closing=false;
    returnFocus?.focus({preventScroll:true});
    const hash=pending;pending=null;if(hash)go(hash);update();
  }
  function dismiss(hash=null){
    if(!dialog.open||closing)return;pending=hash;
    if(history.state?.[marker])history.back();else finish();
  }
  button.addEventListener('click',open);closeButton.addEventListener('click',()=>dismiss());
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dismiss();});
  addEventListener('popstate',()=>{if(dialog.open&&!history.state?.[marker])finish();else if(!dialog.open&&history.state?.[marker])history.replaceState(null,'',location.href);});
  let start=null;
  panel.addEventListener('touchstart',event=>{const touch=event.touches[0];start=event.touches.length===1?{x:touch.clientX,y:touch.clientY,eligible:!event.target.closest('.sheet-links')||list.scrollTop<=0}:null;},{passive:true});
  panel.addEventListener('touchmove',event=>{
    if(!start?.eligible||event.touches.length!==1)return;
    const dy=event.touches[0].clientY-start.y,dx=event.touches[0].clientX-start.x;
    if(dy>10&&dy>Math.abs(dx)){event.preventDefault();panel.style.translate='0 '+Math.min(dy,180)+'px';}
  },{passive:false});
  panel.addEventListener('touchend',event=>{if(!start)return;const dy=event.changedTouches[0].clientY-start.y;panel.style.translate='';if(start.eligible&&dy>75)dismiss();start=null;},{passive:true});
  panel.addEventListener('touchcancel',()=>{start=null;panel.style.translate='';});
  document.addEventListener('privacy:section',()=>{queueMicrotask(updateCurrent);});
  document.addEventListener('privacy:language',sync);
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);visualViewport?.addEventListener('resize',queue);
  mobile.addEventListener('change',()=>{if(!mobile.matches&&dialog.open)dismiss();queue();});
  button.addEventListener('focus',()=>button.classList.remove('compact'));
  sync();
})();
