/* Catalogue sort shares the language menu's visual and keyboard behaviour. */
'use strict';
(() => {
  let control;
  function close(restore=false) {
    if(!control)return;
    control.menu.hidden=true;control.trigger.setAttribute('aria-expanded','false');
    if(restore)control.trigger.focus({preventScroll:true});
  }
  function sync() {
    if(!control?.select.isConnected)return;
    const {select,trigger,value,options}=control;
    const label=window.CSkinI18n.translate('Trier les soins');
    if(trigger.getAttribute('aria-label')!==label)trigger.setAttribute('aria-label',label);
    const selected=select.selectedOptions[0].textContent;
    if(value.textContent!==selected)value.textContent=selected;
    options.forEach((option,i)=>{
      const text=select.options[i].textContent;
      if(option.firstElementChild.textContent!==text)option.firstElementChild.textContent=text;
      option.setAttribute('aria-checked',String(option.dataset.value===select.value));
    });
  }
  function mount() {
    close();control=undefined;
    const select=document.querySelector('#sort-products');
    if(!select)return;
    const wrapper=document.createElement('div');wrapper.className='language-switcher catalog-sort-menu';
    select.before(wrapper);wrapper.append(select);
    const trigger=document.createElement('button');trigger.type='button';
    trigger.className='language-trigger catalog-sort-trigger';
    trigger.setAttribute('data-i18n-ignore','');
    trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','catalog-sort-options');
    trigger.innerHTML='<span class="language-value"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
    const menu=document.createElement('div');menu.id='catalog-sort-options';menu.className='language-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('data-i18n-ignore','');
    const options=[...select.options].map(source=>{
      const option=document.createElement('button');option.type='button';option.className='language-option';option.tabIndex=-1;
      option.dataset.value=source.value;option.setAttribute('role','menuitemradio');
      option.innerHTML='<span></span><span aria-hidden="true"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>';
      menu.append(option);
      option.addEventListener('click',()=>{select.value=source.value;close();select.dispatchEvent(new Event('change',{bubbles:true}));});
      return option;
    });
    wrapper.append(trigger,menu);select.hidden=true;
    control={select,wrapper,trigger,menu,options,value:trigger.querySelector('.language-value')};sync();
    const open=index=>{menu.hidden=false;trigger.setAttribute('aria-expanded','true');options[index??select.selectedIndex].focus({preventScroll:true});};
    trigger.addEventListener('click',()=>menu.hidden?open():close());
    trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(e.key==='ArrowDown'?0:options.length-1);}});
    menu.addEventListener('keydown',e=>{
      const i=options.indexOf(document.activeElement);let next;
      if(e.key==='ArrowDown')next=(i+1)%options.length;
      if(e.key==='ArrowUp')next=(i+options.length-1)%options.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=options.length-1;
      if(next!==undefined){e.preventDefault();options[next].focus();}
    });
    wrapper.addEventListener('focusout',e=>{if(!wrapper.contains(e.relatedTarget))close();});
  }
  document.addEventListener('pointerdown',e=>{if(control && !control.wrapper.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && control && !control.menu.hidden){e.preventDefault();close(true);}});
  window.CSkinSortMenu={mount,sync};
})();
