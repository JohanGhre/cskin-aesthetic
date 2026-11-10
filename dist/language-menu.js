/* Accessible language menu; the original select remains a no-JavaScript fallback. */
'use strict';
(() => {
  const languages = [
    { code:'fr', name:'Français' },
    { code:'en', name:'English' },
    { code:'es', name:'Español' },
  ];
  const controls = [];
  let active;
  const labels = { fr:'Choisir la langue', en:'Choose language', es:'Elegir idioma' };

  function close(restoreFocus=false) {
    if (!active) return;
    const current=active;
    active=undefined;
    current.menu.hidden=true;
    current.trigger.setAttribute('aria-expanded','false');
    if (restoreFocus) current.trigger.focus({preventScroll:true});
  }
  function open(control, index) {
    close();
    active=control;
    control.menu.hidden=false;
    control.trigger.setAttribute('aria-expanded','true');
    const selected=languages.findIndex(l=>l.code===window.CSkinI18n.language);
    control.options[index ?? Math.max(0,selected)].focus({preventScroll:true});
  }
  function sync(language) {
    for (const control of controls) {
      const text=control.compact ? language.toUpperCase() : languages.find(l=>l.code===language).name;
      if (control.value.textContent!==text) control.value.textContent=text;
      const label=`${labels[language]} · ${language.toUpperCase()}`;
      if (control.trigger.getAttribute('aria-label')!==label) control.trigger.setAttribute('aria-label',label);
      if (control.menu.getAttribute('aria-label')!==labels[language]) control.menu.setAttribute('aria-label',labels[language]);
      for (const option of control.options) option.setAttribute('aria-checked',String(option.dataset.language===language));
    }
  }

  for (const [index, select] of [...document.querySelectorAll('[data-language-select]')].entries()) {
    const compact=Boolean(select.closest('.header'));
    // A label must not contain another interactive control beside its select.
    if (select.parentElement.tagName==='LABEL') {
      const old=select.parentElement, replacement=document.createElement('div');
      replacement.className=old.className;
      replacement.setAttribute('data-i18n-ignore','');
      old.replaceWith(replacement);
      replacement.append(select);
    }
    const footerLabel=select.id && document.querySelector(`label[for="${select.id}"]`);
    if (footerLabel) footerLabel.hidden=true;
    const wrapper=document.createElement('div');
    wrapper.className='language-switcher';
    wrapper.setAttribute('data-i18n-ignore','');
    select.before(wrapper);
    wrapper.append(select);
    const menuId=`language-menu-${index}`;
    const trigger=document.createElement('button');
    trigger.type='button'; trigger.className='language-trigger';
    trigger.setAttribute('aria-haspopup','menu');
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls',menuId);
    trigger.innerHTML='<span class="language-value"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
    const menu=document.createElement('div');
    menu.className='language-menu';menu.id=menuId;menu.hidden=true;
    menu.setAttribute('role','menu');
    const options=languages.map(language=>{
      const option=document.createElement('button');
      option.type='button';option.className='language-option';option.tabIndex=-1;
      option.dataset.language=language.code;option.lang=language.code;
      option.setAttribute('role','menuitemradio');
      option.innerHTML=`<span>${language.name}</span><span class="language-option-code">${language.code.toUpperCase()}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>`;
      menu.append(option);return option;
    });
    wrapper.append(trigger,menu);
    const control={wrapper,trigger,menu,options,compact,value:trigger.querySelector('.language-value')};
    controls.push(control);
    select.hidden=true;
    trigger.addEventListener('click',()=>active===control?close():open(control));
    trigger.addEventListener('keydown',event=>{
      if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
      event.preventDefault();open(control,event.key==='ArrowDown'?0:options.length-1);
    });
    options.forEach(option=>option.addEventListener('click',()=>{
      window.CSkinI18n.setLanguage(option.dataset.language);
      close(true);
    }));
    menu.addEventListener('keydown',event=>{
      const current=options.indexOf(document.activeElement);
      let next;
      if(event.key==='ArrowDown')next=(current+1)%options.length;
      if(event.key==='ArrowUp')next=(current+options.length-1)%options.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=options.length-1;
      if(next!==undefined){event.preventDefault();options[next].focus();}
    });
    wrapper.addEventListener('focusout',event=>{
      if(active===control && !wrapper.contains(event.relatedTarget))close();
    });
  }
  document.addEventListener('pointerdown',event=>{
    if(active && !active.wrapper.contains(event.target))close();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && active){event.preventDefault();close(true);}
  });
  window.addEventListener('hashchange',()=>close());
  window.CSkinLanguageMenu={sync};
  sync(window.CSkinI18n.language);
})();
