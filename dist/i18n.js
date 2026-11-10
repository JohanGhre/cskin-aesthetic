/* Local translations: no external translation service or network request. */
'use strict';
window.CSkinI18n = (() => {
  const dictionary = window.CSKIN_TRANSLATIONS;
  const supported = ['fr','en','es'];
  const norm = s => s.replace(/\s+/g,' ').trim();
  const entries = Object.fromEntries(Object.entries(dictionary).map(([key,value])=>[norm(key),value]));
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const phrases = Object.keys(entries).sort((a,b)=>b.length-a.length);
  const pattern = new RegExp('(?<![\\p{L}])(?:'+phrases.map(escape).join('|')+')(?![\\p{L}])','gu');
  const sources = new WeakMap();
  const attributes = new WeakMap();
  let language = 'fr';
  try { language = new URL(location.href).searchParams.get('lang') || localStorage.getItem('cskin-language') || 'fr'; } catch {}
  if(!supported.includes(language)) language='fr';
  function translate(input,lang=language) {
    if(lang==='fr') return String(input);
    const source=String(input), key=norm(source);
    if(!key) return source;
    let output=entries[key]?.[lang];
    if(!output) {
      const pick=(en,es)=>lang==='en'?en:es;
      const cart=key.match(/^Ouvrir le panier, (\d+) articles?$/);
      const index=key.match(/^(Voir|Masquer) les (\d+) soins$/);
      const selection=key.match(/^Vous avez sélectionné (\d+) soin\(s\), pour un sous-total de$/);
      const routine=key.match(/^Vous privilégiez (une routine courte|trois gestes complémentaires)\. Voici un exemple pour découvrir la gamme\.$/);
      const missing=key.match(/^Aucun soin trouvé pour « (.*) »\. Essayez un nom de produit ou un actif\.$/);
      if(cart) output=pick(`Open bag, ${cart[1]} item${cart[1]==='1'?'':'s'}`,`Abrir la cesta, ${cart[1]} artículo${cart[1]==='1'?'':'s'}`);
      else if(index) output=pick(`${index[1]==='Voir'?'View':'Hide'} all ${index[2]} products`,`${index[1]==='Voir'?'Ver':'Ocultar'} los ${index[2]} cuidados`);
      else if(selection) output=pick(`You selected ${selection[1]} product(s), for a subtotal of`,`Has seleccionado ${selection[1]} cuidado(s), con un subtotal de`);
      else if(routine) output=pick(`You prefer ${routine[1].startsWith('une')?'a short routine':'three complementary steps'}. Here is an example to discover the range.`,`Prefieres ${routine[1].startsWith('une')?'una rutina corta':'tres gestos complementarios'}. Aquí tienes un ejemplo para descubrir la gama.`);
      else if(missing) output=pick(`No products found for “${missing[1]}”. Try a product name or ingredient.`,`No se han encontrado cuidados para «${missing[1]}». Prueba un nombre de producto o un activo.`);
      else output=key.replace(pattern,match=>entries[match][lang]);
    }
    return source.match(/^\s*/)[0]+output+source.match(/\s*$/)[0];
  }
  function original(record,current) {
    return !record || current!==record.last ? current : record.source;
  }
  function localize(root=document.body) {
    observer?.disconnect();
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()) {
      const node=walker.currentNode;
      if(node.parentElement?.closest('script,style,textarea,[data-i18n-ignore]')) continue;
      const source=original(sources.get(node),node.nodeValue);
      const last=translate(source);
      if(node.nodeValue!==last) node.nodeValue=last;
      sources.set(node,{source,last});
    }
    for(const element of [root,...root.querySelectorAll('[aria-label],[alt],[placeholder],[title]')]) {
      if(element.closest('[data-i18n-ignore]')) continue;
      const state=attributes.get(element)||{};
      for(const name of ['aria-label','alt','placeholder','title']) {
        if(!element.hasAttribute(name)) continue;
        const source=original(state[name],element.getAttribute(name));
        const last=translate(source);
        if(element.getAttribute(name)!==last)element.setAttribute(name,last);
        state[name]={source,last};
      }
      attributes.set(element,state);
    }
    document.documentElement.lang=language;
    for(const select of document.querySelectorAll('[data-language-select]'))select.value=language;
    window.CSkinLanguageMenu?.sync(language);
    window.CSkinSortMenu?.sync();
    const title=document.querySelector('title');
    const titleSource=original(sources.get(title),document.title);
    const titleLast=translate(titleSource);
    document.title=titleLast;sources.set(title,{source:titleSource,last:titleLast});
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','alt','placeholder','title']});
  }
  const observer=new MutationObserver(()=>localize());
  function setLanguage(next) {
    if(!supported.includes(next))return;
    language=next;
    try{localStorage.setItem('cskin-language',next);}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
    localize();
    window.ScrollTrigger?.refresh();
  }
  document.addEventListener('change',event=>{if(event.target.matches('[data-language-select]'))setLanguage(event.target.value);});
  localize();
  return {translate,apply:localize,setLanguage,get language(){return language;}};
})();
