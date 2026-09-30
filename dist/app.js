/* Cskin — démonstration locale. Aucun appel de paiement ni collecte de données. */
'use strict';
const products = window.CSKIN_PRODUCTS;
const editorialPhotos = {
  'lait-nettoyant-hydratant': 'assets/editorial/lait-nettoyant-cutout.webp',
  'serum-age-plus-1': 'assets/editorial/serum-age-plus-cutout.webp',
  'creme-silk-effect': 'assets/editorial/creme-silk-effect-cutout.webp',
};
const catalogPhotos = {
  ...editorialPhotos,
  'mousse-nettoyante-a-lacide-glycolique': 'assets/editorial/catalog/mousse-nettoyante-a-lacide-glycolique.webp',
  'creme-anti-aging-plus-day': 'assets/editorial/catalog/creme-anti-aging-plus-day.webp',
  'creme-anti-aging-plus-night': 'assets/editorial/catalog/creme-anti-aging-plus-night.webp',
  'creme-facial-acide-glycolique': 'assets/editorial/catalog/creme-facial-acide-glycolique.webp',
  'creme-raffermissante-pour-le-corps': 'assets/editorial/catalog/creme-raffermissante-pour-le-corps.webp',
  'creme-anti-cellulite': 'assets/editorial/catalog/creme-anti-cellulite.webp',
  'pack-peaux-sensibles-mixtes-a-grasses-nettoyant-creme-acide-glycolique': 'assets/editorial/catalog/pack-peaux-sensibles-mixtes-a-grasses-nettoyant-creme-acide-glycolique.webp',
  'trio-pack-anti-aging-serum-creme-jour-creme-nuit': 'assets/editorial/catalog/trio-pack-anti-aging-serum-creme-jour-creme-nuit.webp',
  'duo-pack-anti-aging-day-night': 'assets/editorial/catalog/duo-pack-anti-aging-day-night.webp',
  'duo-pack-remodelant-et-raffermissant': 'assets/editorial/catalog/duo-pack-remodelant-et-raffermissant.webp',
};
// Version marbre : les fichiers minéraux d'origine restent disponibles pour revenir en arrière.
for (const id of Object.keys(catalogPhotos)) catalogPhotos[id] = `assets/editorial/marble/${id}.webp`;
for (const id of Object.keys(editorialPhotos)) editorialPhotos[id] = catalogPhotos[id];
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const main = $('#main');
const money = n => new Intl.NumberFormat('fr-FR', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findProduct = id => products.find(p=>p.id===id);
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let cart = [];
try { const saved = JSON.parse(localStorage.getItem('cskin-demo-cart') || '[]'); if (Array.isArray(saved)) cart = saved.filter(x=>findProduct(x.id)&&Number.isInteger(x.qty)&&x.qty>0).map(x=>({id:x.id,qty:Math.min(20,x.qty)})); } catch {}
let quantity = 1;
let sortOrder = 'selection';
let catalogSelectedId = products[0].id;
let catalogIndexOpen = false;
let catalogItems = [];
let catalogSwipeStart = null;
let suppressCatalogClick = false;
let motionContext;
let motionPaused = false;
let toastTimer;
let lastFocus;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let quiz = {step:0,answers:[]};

function card(p, badge = '') {
  return `<article class="product-card"><div class="product-image"><a href="#/produit/${p.id}" aria-label="Découvrir ${esc(p.title)}" data-cursor="VIEW"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)} sur un socle en marbre" width="1024" height="1536" loading="lazy" decoding="async"></a>${badge?`<span class="product-badge">${esc(badge)}</span>`:''}<button class="quick-add" data-action="add" data-id="${p.id}" aria-label="Ajouter ${esc(p.title)} au panier" ${!p.available?'disabled':''}>+</button></div><div class="product-card-info"><p class="product-type">${esc(p.subtitle)}</p><h3><a href="#/produit/${p.id}">${esc(p.title)}</a></h3><p class="price">${money(p.price)}${p.compare&&p.compare>p.price?`<s>${money(p.compare)}</s>`:''}</p></div></article>`;
}

const faqMarkup = () => `<div class="faq-list"><details><summary>Comment choisir mon premier soin ?</summary><p>Commencez par votre besoin principal et le nombre de gestes que vous souhaitez adopter. Notre découverte de routine présente des exemples ; Céline pourra ensuite vous orienter vers un choix adapté. <button class="text-link" data-action="quiz">Explorer une routine <span>↗︎</span></button></p></details><details><summary>Dans quel ordre utiliser mes soins ?</summary><p>Le rituel présenté ici suit trois étapes : nettoyer, appliquer le sérum, puis la crème. Consultez les instructions propres à chaque produit pour sa fréquence d’utilisation et ses précautions.</p></details><details><summary>Où sont fabriqués les soins Cskin ?</summary><p>Selon la présentation de la marque, les formulations Cskin sont fabriquées en Espagne.</p></details><details><summary>Comment fonctionne la livraison ?</summary><p>La boutique annonce la livraison offerte à partir de 100 €. Les destinations, délais et modalités sont précisés dans sa <a class="text-link" href="https://cskinaesthetic.com/policies/shipping-policy" target="_blank" rel="noopener">politique d’expédition ↗︎</a>.</p></details></div>`;

function home() {
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-film" aria-hidden="true">
      <video id="serum-film" autoplay muted loop playsinline preload="auto" poster="assets/motion/hero-sept28-1080-seamless-poster.jpg" data-priority="hero" data-desktop-src="assets/motion/hero-sept28-1080-seamless.mp4" data-mobile-src="assets/motion/hero-sept28-1080-seamless-mobile.mp4" tabindex="-1"></video>
    </div>
    <div class="hero-copy">
      <h1 id="hero-title"><span class="line">La science</span><span class="line">au service de</span><span class="line"><em class="mark">votre peau.</em></span></h1>
      <p>Des soins ciblés. Des gestes qui ont du sens.<br>Une attention particulière à votre peau.</p>
      <div class="hero-actions"><a class="circle-link" href="#/soins"><span class="circle-link-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M8 5h11v11"/></svg></span><span>Découvrir les soins</span></a><button class="text-link" data-action="quiz">Trouver ma routine <span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 19 19 5M8 5h11v11"/></svg></span></button></div>
    </div>
    <div class="hero-bottom"><button class="film-control" data-cursor="PLAY" data-action="film" aria-controls="serum-film" aria-pressed="false"><span class="film-control-icon" aria-hidden="true">▷</span><span class="film-control-label">Lire le film</span></button></div>
  </section>
  <section class="section selection" aria-labelledby="selection-title"><div class="selection-heading"><p>La sélection <span class="brand-word">Cskin</span></p><h2 id="selection-title">Le soin juste. <em>Pour vous.</em></h2></div><div class="selection-products" aria-label="Trois soins essentiels">${[products[2],products[0],products[1]].map(p=>`<article class="gallery-product"><a class="product-stage" href="#/produit/${p.id}" aria-label="Découvrir ${esc(p.title)}" data-cursor="VIEW"><img src="${editorialPhotos[p.id]}" alt="${esc(p.title)} présenté sur un socle en marbre" width="1086" height="1448" loading="lazy" decoding="async"></a><p class="product-type">${esc(p.subtitle)}</p><h3><a href="#/produit/${p.id}">${esc(p.title)}</a></h3><div class="gallery-purchase"><span>${money(p.price)}</span><button class="text-link" data-action="add" data-id="${p.id}" aria-label="Ajouter ${esc(p.title)} au panier">Ajouter <span>+</span></button></div></article>`).join('')}</div><a class="text-link selection-all" href="#/soins">Découvrir tous les soins <span>↗︎</span></a></section>
  <section class="philosophy"><div class="philosophy-top"><h2>Comprendre la peau.<br>Choisir avec <em>justesse.</em></h2></div><div class="philosophy-bottom"><p>Au cœur de <span class="brand-word">Cskin</span>, une conviction : un soin commence par la compréhension de la peau. Des actifs identifiés, des formules expliquées et des gestes accompagnés.</p><div class="philosophy-details"><p><b>De la connaissance au quotidien.</b>L’approche de Céline, fondatrice de <span class="brand-word">Cskin</span>.</p><a class="text-link light" href="#/marque">Notre histoire <span>↗︎</span></a></div></div></section>
  <section class="section ritual"><div class="ritual-image" id="ritual-visual"><img src="${editorialPhotos[products[2].id]}" alt="Lait nettoyant Cskin sur un socle en marbre, le premier geste de la routine" width="1086" height="1448" loading="lazy" decoding="async"><a class="image-caption" href="#/produit/${products[2].id}"><span>Le premier geste. La douceur.</span><span aria-hidden="true">↗︎</span></a></div><div class="ritual-copy"><h2>Quelques gestes.<br><em>Toute l’attention.</em></h2><p>Votre routine n’a pas besoin d’être compliquée. Chaque soin trouve sa place, chaque geste a son rôle.</p><div class="ritual-list" role="group" aria-label="Les trois gestes du rituel">${ritualSteps.map((step,i)=>`<button data-action="ritual" data-id="${i}" aria-pressed="${i===0}" aria-controls="ritual-visual"><span class="ritual-number">0${i+1}</span><span class="ritual-label"><b>${step.title}</b>${step.text}</span><span class="ritual-arrow" aria-hidden="true">↗︎</span></button>`).join('')}</div><p id="ritual-status" class="sr-only" role="status"></p><button class="button" data-action="quiz">Explorer ma routine <span>↗︎</span></button></div></section>
  <section class="routine-banner"><div><h2>Le corps aussi,<br><em>mérite son rituel.</em></h2><p>Découvrez les soins corps et leurs formules ciblées.</p></div><a class="button outline" href="#/soins/corps">Les soins corps <span>↗︎</span></a></section>
  <section class="section founder"><div class="founder-side"><div class="section-title-small">Derrière les formules, une rencontre</div><p class="founder-name">Céline.</p><p>Fondatrice de Cskin Aesthetic</p></div><div><p class="founder-quote">« Tout a commencé par une fascination pour la science du vivant. »</p><p class="founder-body">Un parcours en pharmacologie et physiologie, une expérience auprès de laboratoires, puis une formation CIBTAC. Céline a créé Cskin pour rapprocher son expertise du soin de votre quotidien.</p><a class="text-link" href="#/marque">Rencontrer la marque <span>↗︎</span></a></div></section>
  <section class="section faq-section"><h2>Le soin, <em>en clair.</em></h2>${faqMarkup()}</section>`;
}

function catalogScene(items, index) {
  const current = items[index];
  const previous = items[(index - 1 + items.length) % items.length];
  const next = items[(index + 1) % items.length];
  const neighbor = (p, position) => items.length > 1
    ? `<button class="catalog-neighbor is-${position}" data-action="catalog-select" data-id="${p.id}" aria-label="Voir ${esc(p.title)}"><img src="${catalogPhotos[p.id]}" alt="" width="1086" height="1448" decoding="async"></button>`
    : '';
  return `${items.length>2?neighbor(previous,'previous'):''}<a class="catalog-current" href="#/produit/${current.id}" aria-label="Découvrir ${esc(current.title)}" data-cursor="VIEW"><img src="${catalogPhotos[current.id]}" alt="${esc(current.title)} sur un socle en marbre" width="1024" height="1536" decoding="async"></a>${neighbor(next,'next')}`;
}

function catalogDetails(items, index) {
  const p = items[index];
  return `<div class="catalog-feature-meta"><span>${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}</span><span>${esc(p.subtitle)}</span></div><div class="catalog-feature-title"><h2><a href="#/produit/${p.id}">${esc(p.title)}</a></h2><p>${esc(p.summary)}</p></div><div class="catalog-feature-purchase"><p class="price">${money(p.price)}${p.compare&&p.compare>p.price?` <s>${money(p.compare)}</s>`:''}</p><button class="catalog-add" data-action="add" data-id="${p.id}" aria-label="Ajouter ${esc(p.title)} au panier" ${!p.available?'disabled':''}>${p.available?'Ajouter au panier':'Indisponible'} <span aria-hidden="true">+</span></button></div>`;
}

function catalog(category='tous') {
  const headings = {
    tous: ['Tous les soins.', 'Le vôtre, ici.'],
    visage: ['Le visage.', 'Chaque geste compte.'],
    corps: ['Le corps.', 'Toute l’attention.'],
    coffrets: ['Les coffrets.', 'Les gestes réunis.'],
  };
  if (!headings[category]) category='tous';
  catalogItems=products.filter(p=>category==='tous'||p.category===category);
  if(sortOrder==='price-up')catalogItems.sort((a,b)=>a.price-b.price);
  if(sortOrder==='price-down')catalogItems.sort((a,b)=>b.price-a.price);
  if(sortOrder==='name')catalogItems.sort((a,b)=>a.title.localeCompare(b.title,'fr'));
  if(!catalogItems.some(p=>p.id===catalogSelectedId))catalogSelectedId=catalogItems[0].id;
  const selected=catalogItems.findIndex(p=>p.id===catalogSelectedId);
  return `<section class="catalog-showroom" aria-labelledby="catalog-title">
    <div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><span>Les soins</span></div>
    <div class="catalog-introduction ${category==='tous'||category==='visage'?'has-portrait':''}"><div class="catalog-introduction-copy"><p class="catalog-kicker">La collection <span class="brand-word">Cskin</span> Aesthetic</p><h1 id="catalog-title">${headings[category][0]}<br><em>${headings[category][1]}</em></h1><p>Une collection à découvrir, un soin à choisir. Explorez les formules à votre rythme.</p></div>${category==='tous'||category==='visage'?'<div class="catalog-introduction-portrait"><img src="assets/editorial/catalog/model-silk-effect-cutout.webp" alt="Modèle tenant la Crème Silk Effect Cskin Aesthetic" width="1037" height="1516" decoding="async" fetchpriority="high"></div>':''}</div>
    <div class="catalog-toolbar"><div class="filter-tabs" role="group" aria-label="Catégories de soins">${[['tous','Tout explorer'],['visage','Visage'],['corps','Corps'],['coffrets','Coffrets']].map(([id,label])=>`<button class="filter-tab" data-action="filter" data-id="${id}" aria-pressed="${id===category}">${label}</button>`).join('')}</div><div class="catalog-tools"><span aria-live="polite">${catalogItems.length} ${catalogItems.length===1?'soin':'soins'}</span><label for="sort-products">Trier par <select id="sort-products"><option value="selection">Notre sélection</option><option value="price-up">Prix croissant</option><option value="price-down">Prix décroissant</option><option value="name">Nom du soin</option></select></label></div></div>
    <div class="catalog-selector" role="group" aria-label="Sélecteur de soins"><div class="catalog-scene" id="catalog-scene">${catalogScene(catalogItems,selected)}</div><div class="catalog-feature" id="catalog-feature" aria-live="polite" aria-atomic="true">${catalogDetails(catalogItems,selected)}</div><div class="catalog-navigation"><div class="catalog-navigation-buttons"><button data-action="catalog-step" data-direction="-1" aria-label="Soin précédent" ${catalogItems.length<2?'disabled':''}>←</button><button data-action="catalog-step" data-direction="1" aria-label="Soin suivant" ${catalogItems.length<2?'disabled':''}>→</button></div><p>Parcourez la collection</p><button class="catalog-index-toggle" data-action="catalog-index" aria-controls="catalog-index" aria-expanded="${catalogIndexOpen}">${catalogIndexOpen?'Masquer':'Voir'} les ${catalogItems.length} soins <span aria-hidden="true">${catalogIndexOpen?'↑':'↓'}</span></button></div></div>
    <div class="catalog-index" id="catalog-index" role="group" ${catalogIndexOpen?'':'hidden'} aria-label="Index des soins">${catalogItems.map(p=>`<button class="catalog-index-item" data-action="catalog-select" data-id="${p.id}" aria-pressed="${p.id===catalogSelectedId}" title="${esc(p.title)}"><img src="${catalogPhotos[p.id]}" alt="" width="1086" height="1448" loading="lazy" decoding="async"><span class="catalog-index-copy"><span>${esc(p.title)}</span><small>${esc(p.subtitle)}</small></span><span class="catalog-index-price">${money(p.price)}</span></button>`).join('')}</div>
  </section>`;
}

function selectCatalogProduct(id, {fromIndex=false}={}) {
  const index=catalogItems.findIndex(p=>p.id===id);
  if(index<0)return;
  catalogSelectedId=id;
  const scene=$('#catalog-scene');
  const feature=$('#catalog-feature');
  if(!scene||!feature)return;
  const focusWasInScene=scene.contains(document.activeElement);
  scene.innerHTML=catalogScene(catalogItems,index);
  feature.innerHTML=catalogDetails(catalogItems,index);
  if(focusWasInScene)$('.catalog-current',scene).focus({preventScroll:true});
  $$('.catalog-index-item').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.id===id)));
  if(fromIndex){
    const toggle=$('.catalog-index-toggle');
    catalogIndexOpen=false;
    $('#catalog-index').hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML=`Voir les ${catalogItems.length} soins <span aria-hidden="true">↓</span>`;
    $('.catalog-selector').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});
    toggle.focus({preventScroll:true});
  }
}

function stepCatalog(direction) {
  if(catalogItems.length<2)return;
  const index=catalogItems.findIndex(p=>p.id===catalogSelectedId);
  selectCatalogProduct(catalogItems[(index+direction+catalogItems.length)%catalogItems.length].id);
}

function productPage(id) {
  const p=findProduct(id);
  if(!p)return `<section class="section"><h1>Ce soin est introuvable.</h1><p>Retrouvez toute la collection Cskin.</p><a class="button" href="#/soins">Découvrir les soins <span>↗︎</span></a></section>`;
  quantity=1;
  const related=products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,3);
  const image=catalogPhotos[p.id];
  return `<section class="product-page" aria-labelledby="product-title">
    <div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><a href="#/soins">Les soins</a><span aria-hidden="true">/</span><span>${esc(p.title)}</span></div>
    <div class="product-layout">
      <div class="product-gallery"><img src="${image}" alt="${esc(p.title)} présenté sur un socle en marbre" width="1024" height="1536" fetchpriority="high" decoding="async"><span class="product-gallery-label">Le soin juste · <span class="brand-word">Cskin</span></span></div>
      <div class="product-detail"><p class="product-kicker">${esc(p.type)} · ${esc(p.subtitle)}</p><h1 id="product-title">${esc(p.title)}</h1><p class="summary">${esc(p.summary)}</p>
        <div class="product-purchase"><p class="detail-price price">${money(p.price)} ${p.compare&&p.compare>p.price?`<s>${money(p.compare)}</s>`:''}</p><div class="buy-row"><div class="quantity" aria-label="Quantité"><button data-action="qty-minus" aria-label="Diminuer la quantité">−</button><output id="product-quantity" aria-live="polite">1</output><button data-action="qty-plus" aria-label="Augmenter la quantité">+</button></div><button class="button" data-action="add-product" data-id="${p.id}" ${!p.available?'disabled':''}>${p.available?'Ajouter au panier':'Indisponible'} <span aria-hidden="true">↗︎</span></button></div><div class="product-reassurance"><span>Livraison offerte dès 100 €</span><span>Panier de démonstration</span></div></div>
        ${p.actives.length?`<div class="active-chips" aria-label="Actifs clés">${p.actives.map(a=>`<span>${esc(a)}</span>`).join('')}</div>`:''}
        <div class="faq-list"><details open><summary>Le geste Cskin</summary><p>${esc(p.usage)}</p></details><details><summary>Les actifs à connaître</summary><p>${p.actives.length?p.actives.map(esc).join(' · '):'Ce coffret réunit plusieurs soins. Retrouvez la composition de chaque produit sur la boutique officielle.'}</p></details><details><summary>Livraison et informations</summary><p>Les prix présentés proviennent du catalogue public. Les disponibilités et les conditions de livraison seront confirmées sur la boutique officielle. Cette démonstration ne permet pas de passer commande.</p></details></div><a class="detail-source" href="${p.url}" target="_blank" rel="noopener">Informations complètes sur la boutique officielle <span aria-hidden="true">↗︎</span></a>
      </div>
    </div>
  </section>${related.length?`<section class="section related-section"><div class="section-head"><h2>Les gestes<br><em>se complètent.</em></h2><a class="text-link" href="#/soins">Explorer les soins <span>↗︎</span></a></div><div class="product-grid">${related.map(x=>card(x)).join('')}</div></section>`:''}`;
}

function brandPage() {
  return `<section class="brand-page-hero"><div class="breadcrumb"><a href="#/">Accueil</a><span>/</span><span>L’esprit Cskin</span></div><h1>La connaissance<br>de la peau.<br><em>Le sens du soin.</em></h1><p>Cskin Aesthetic est née du parcours de Céline et de son envie de rapprocher expertise et soin quotidien.</p></section><section class="brand-story"><p class="section-title-small">Céline AB · Fondatrice</p><h2>Une histoire de<br><em>conviction.</em></h2><p class="story-lead">« Tout a commencé par une fascination pour la science du vivant. »</p><p>Dans sa présentation de la marque, Céline raconte sa formation en pharmacologie et physiologie en France, puis son expérience comme déléguée médicale et formatrice auprès de laboratoires américains.</p><p>La rencontre avec les professionnels de la peau et sa formation CIBTAC au Royaume-Uni ont enrichi une approche qui associe connaissance des actifs et pratique du soin.</p><p>Cskin prolonge cette démarche : des formulations fabriquées en Espagne, des actifs expliqués et une attention portée au choix de la routine.</p><a class="text-link" href="https://cskinaesthetic.com/pages/la-marque" target="_blank" rel="noopener">Lire son histoire sur le site officiel <span>↗︎</span></a></section><section class="routine-banner"><div><h2>L’expertise, <em>à votre écoute.</em></h2><p>Un échange avec la fondatrice pour mieux connaître la gamme.</p></div><a class="button" href="https://cskinaesthetic.com/pages/contact" target="_blank" rel="noopener">Contacter Cskin <span>↗︎</span></a></section>`;
}

function renderRoute(keepScroll=false) {
  motionContext?.revert();
  closeDialogs();
  const [,route,id]=location.hash.replace(/^#/,'').split('/');
  document.body.classList.toggle('home-page', !['soins','produit','marque'].includes(route));
  if(route==='soins') { main.innerHTML=catalog(id); $('#sort-products').value=sortOrder; document.title='Les soins — Cskin'; }
  else if(route==='produit') { main.innerHTML=productPage(id); document.title=`${findProduct(id)?.title||'Les soins'} — Cskin`; }
  else if(route==='marque') {main.innerHTML=brandPage();document.title='L’esprit Cskin — La fondatrice';}
  else {main.innerHTML=home();document.title='Cskin — L’expertise du soin';}
  if(!keepScroll)window.scrollTo({top:0,behavior:'instant'});
  syncMotionButton();setupMotion();
}

function syncMotionButton(){const b=$('[data-action="motion"]');if(!b)return;b.setAttribute('aria-pressed',String(motionPaused));$('.motion-label',b).textContent=motionPaused?'Reprendre l’animation':'Mettre en pause';$('.motion-icon',b).textContent=motionPaused?'▷':'Ⅱ';if(reducedMotion.matches){b.disabled=true;$('.motion-label',b).textContent='Animations réduites';}}
function restoreCartFocus(action,id){const dialog=$('#cart-dialog');const preferred=$(`[data-action="${action}"][data-id="${id}"]`,dialog);const other=$(`[data-action="cart-minus"][data-id="${id}"]`,dialog);(preferred&&!preferred.disabled?preferred:other||$('.cart-line button',dialog)||$('.close-button',dialog))?.focus();}

function setupMotion() {
  motionContext = window.CSkinMotion?.init(main, { paused: motionPaused });
}
window.refreshCSkinMotion = setupMotion;

const ritualSteps = [
  {id:'lait-nettoyant-hydratant', title:'Nettoyer', text:'Faire place au soin.', caption:'Le premier geste. La douceur.'},
  {id:'serum-age-plus-1', title:'Cibler', text:'Appliquer votre sérum.', caption:'Le geste ciblé. Sérum Age Plus.'},
  {id:'creme-silk-effect', title:'Accompagner', text:'Compléter avec votre crème.', caption:'Le dernier geste. Le confort.'},
];

function selectRitual(index) {
  const step = ritualSteps[index];
  if (!step) return;
  const p = findProduct(step.id);
  const image = $('.ritual-image > img');
  if (!image) return;
  image.src = editorialPhotos[p.id] || p.image;
  image.alt = `${p.title} présenté sur un socle en marbre — Cskin Aesthetic`;
  $('.ritual-image .image-caption').href = `#/produit/${p.id}`;
  $('.ritual-image .image-caption span').textContent = step.caption;
  $$('[data-action="ritual"]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  $('#ritual-status').textContent = `${step.title} : ${p.title}, ${money(p.price)}.`;
  window.CSkinMotion?.revealImage(image, { paused: motionPaused });
}

function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function saveCart(){try{localStorage.setItem('cskin-demo-cart',JSON.stringify(cart));}catch{}updateCartCount();}
function updateCartCount(){const count=cart.reduce((sum,x)=>sum+x.qty,0);$$('.cart-count').forEach(e=>e.textContent=count);$('.cart-button').dataset.count=String(count);$('.cart-button').setAttribute('aria-label',`Ouvrir le panier, ${count} article${count>1?'s':''}`);}
function addToCart(id,qty=1){const p=findProduct(id);if(!p||!p.available)return;const line=cart.find(x=>x.id===id);if(line)line.qty=Math.min(20,line.qty+qty);else cart.push({id,qty:Math.min(20,qty)});saveCart();toast(`${p.title} ajouté au panier`);if($('#cart-dialog').open)renderCart();}
function openDialog(id){lastFocus=document.activeElement;$$('dialog[open]').forEach(d=>d.close());$(id).showModal();if(id==='#menu-dialog')$('.mobile-toggle').setAttribute('aria-expanded','true');}
function closeDialogs(){let wasOpen=false;$$('dialog[open]').forEach(d=>{d.close();wasOpen=true;});$('.mobile-toggle').setAttribute('aria-expanded','false');if(wasOpen&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
function renderCart(){const total=cart.reduce((sum,l)=>sum+findProduct(l.id).price*l.qty,0);$('#cart-content').innerHTML=cart.length?`<p class="cart-disclaimer">Panier de démonstration · Aucun paiement réel.</p><p class="shipping-text">${total>=100?'Le seuil de livraison offerte est atteint.':`Encore ${money(100-total)} pour la livraison offerte.`}</p><div class="shipping-progress"><span style="width:${Math.min(100,total)}%"></span></div><div class="cart-lines">${cart.map(l=>{const p=findProduct(l.id);return `<article class="cart-line"><a href="#/produit/${p.id}"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)}"></a><div><h3><a href="#/produit/${p.id}">${esc(p.title)}</a></h3><div class="quantity"><button data-action="cart-minus" data-id="${p.id}" aria-label="Diminuer la quantité de ${esc(p.title)}">−</button><output aria-label="Quantité de ${esc(p.title)}">${l.qty}</output><button data-action="cart-plus" data-id="${p.id}" aria-label="Augmenter la quantité de ${esc(p.title)}" ${l.qty>=20?'disabled':''}>+</button></div><button class="remove-item" data-action="remove" data-id="${p.id}">Retirer</button></div><p class="line-price">${money(l.qty*p.price)}</p></article>`;}).join('')}</div><div class="cart-total"><span>Sous-total</span><strong>${money(total)}</strong></div><button class="button full" data-action="checkout">Voir le récapitulatif <span>↗︎</span></button><div class="cart-actions"><button class="text-link" data-action="close">Continuer la découverte <span>↗︎</span></button><p>Les frais éventuels sont confirmés sur la boutique officielle.</p></div>`:`<div class="empty-state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Zm4 0V5a3 3 0 0 1 6 0v2"/></svg><h3>Le début d’un rituel.</h3><p>Votre panier est encore vide. Découvrez le soin qui vous correspond.</p><a class="button" href="#/soins">Explorer les soins <span>↗︎</span></a></div>`;updateCartCount();}
function search(query=''){const q=normalize(query.trim());const result=products.filter(p=>normalize(`${p.title} ${p.subtitle} ${p.summary} ${p.actives.join(' ')}`).includes(q));$('#search-results').innerHTML=result.length?result.slice(0,q?13:5).map(p=>`<a class="search-result" href="#/produit/${p.id}"><img src="${catalogPhotos[p.id]}" alt="" width="65" height="78"><div><h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p></div><span>${money(p.price)} ↗︎</span></a>`).join(''):`<p class="notice-empty">Aucun soin trouvé pour « ${esc(query)} ». Essayez un nom de produit ou un actif.</p>`;}

const quizQuestions=[
  {title:'Qu’aimeriez-vous privilégier ?',description:'Partons de votre envie du moment.',options:[['confort','Le confort et l’hydratation'],['fermete','La souplesse et la fermeté'],['eclat','L’éclat et le grain de peau'],['decouverte','Découvrir, tout simplement']]},
  {title:'Comment ressentez-vous votre peau ?',description:'Choisissez ce qui se rapproche le plus de votre ressenti.',options:[['seche','Elle tiraille ou manque de confort'],['mixte','Elle brille sur certaines zones'],['normale','Elle est plutôt équilibrée'],['sensible','Elle réagit facilement'],['inconnue','Je ne sais pas encore']]},
  {title:'Quel rythme vous ressemble ?',description:'Une routine qui trouve sa place dans votre quotidien.',options:[['simple','L’essentiel, en deux gestes'],['complet','Un rituel en trois gestes']]}
];
function startQuiz(){quiz={step:0,answers:[]};renderQuiz();openDialog('#quiz-dialog');}
function renderQuiz(){const q=quizQuestions[quiz.step];if(!q)return renderQuizResult();$('#quiz-content').innerHTML=`<p class="quiz-label">Votre rituel Cskin · ${quiz.step+1} / 3</p><div class="quiz-progress" aria-hidden="true">${quizQuestions.map((_,i)=>`<span class="${i<=quiz.step?'active':''}"></span>`).join('')}</div><h2 id="quiz-title" tabindex="-1">${q.title}</h2><p class="quiz-description">${q.description}</p><div class="quiz-options">${q.options.map(([id,label])=>`<button class="quiz-option" data-action="quiz-answer" data-id="${id}"><span>${label}</span><span aria-hidden="true">↗︎</span></button>`).join('')}</div>${quiz.step?'<button class="quiz-back" data-action="quiz-back">← Question précédente</button>':'<p class="quiz-description">Une découverte de la gamme. Sans inscription.</p>'}`;}
function renderQuizResult(){const [goal,skin,length]=quiz.answers;const needsAdvice=['sensible','inconnue'].includes(skin);const ids=needsAdvice?[]:length==='simple'?['lait-nettoyant-hydratant','creme-silk-effect']:['lait-nettoyant-hydratant','serum-age-plus-1','creme-silk-effect'];quiz.resultIds=ids;const label={confort:'Le confort, au quotidien.',fermete:'Toute l’attention à votre peau.',eclat:'L’éclat d’un rituel.',decouverte:'Votre première découverte.'}[goal];$('#quiz-content').innerHTML=`<p class="quiz-label">Votre découverte Cskin</p><h2 id="quiz-title" tabindex="-1">${needsAdvice?'Commençons par un échange.':label}</h2><p class="quiz-description">${needsAdvice?'Pour une peau réactive ou un besoin encore incertain, un échange avec Céline est le meilleur point de départ dans cette démonstration.':`Vous privilégiez ${length==='simple'?'une routine courte':'trois gestes complémentaires'}. Voici un exemple pour découvrir la gamme.`}</p><p class="quiz-result-note">Aperçu de fonctionnalité : ces exemples ne constituent pas une recommandation personnalisée. Les règles seront validées par la fondatrice avant mise en ligne.</p>${ids.map((id,i)=>{const p=findProduct(id);return `<div class="routine-result-item"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)}"><div><h3>${i+1}. ${esc(p.title)}</h3><p>${esc(p.subtitle)} · ${money(p.price)}</p><a href="#/produit/${id}">Découvrir ce soin ↗︎</a></div></div>`;}).join('')}<div class="quiz-result-actions">${ids.length?'<button class="button" data-action="add-routine">Ajouter cet exemple au panier <span>↗︎</span></button>':'<a class="button" href="https://cskinaesthetic.com/pages/contact" target="_blank" rel="noopener">Échanger avec Cskin <span>↗︎</span></a>'}<button class="text-link" data-action="quiz">Recommencer <span>↗︎</span></button></div>`;}

function info(title,html){$('#info-title').textContent=title;$('#info-content').innerHTML=html;openDialog('#info-dialog');}

document.addEventListener('click',e=>{
  if(e.target.closest('.skip-link')){e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});return;}
  const anchor=e.target.closest('a[href^="#/"]');if(anchor&&anchor.hash===location.hash)closeDialogs();
  const button=e.target.closest('[data-action]');if(!button)return;
  const {action,id}=button.dataset;
  switch(action){
    case 'menu':openDialog('#menu-dialog');break;
    case 'search':search();openDialog('#search-dialog');$('#search-input').value='';$('#search-input').focus();break;
    case 'cart':renderCart();openDialog('#cart-dialog');break;
    case 'close':closeDialogs();break;
    case 'add':addToCart(id);break;
    case 'add-product':addToCart(id,quantity);renderCart();openDialog('#cart-dialog');break;
    case 'qty-minus':quantity=Math.max(1,quantity-1);$('#product-quantity').textContent=quantity;break;
    case 'qty-plus':quantity=Math.min(20,quantity+1);$('#product-quantity').textContent=quantity;break;
    case 'cart-minus':case 'cart-plus':{const line=cart.find(l=>l.id===id);if(!line)break;line.qty+=action==='cart-plus'?1:-1;line.qty=Math.min(20,line.qty);cart=cart.filter(l=>l.qty>0);saveCart();renderCart();restoreCartFocus(action,id);break;}
    case 'remove':cart=cart.filter(l=>l.id!==id);saveCart();renderCart();restoreCartFocus(action,id);break;
    case 'filter':location.hash=id==='tous'?'#/soins':`#/soins/${id}`;break;
    case 'catalog-select':selectCatalogProduct(id,{fromIndex:Boolean(button.closest('.catalog-index'))});break;
    case 'catalog-step':stepCatalog(Number(button.dataset.direction));break;
    case 'catalog-index':{
      catalogIndexOpen=!catalogIndexOpen;
      $('#catalog-index').hidden=!catalogIndexOpen;
      button.setAttribute('aria-expanded',String(catalogIndexOpen));
      button.innerHTML=`${catalogIndexOpen?'Masquer':'Voir'} les ${catalogItems.length} soins <span aria-hidden="true">${catalogIndexOpen?'↑':'↓'}</span>`;
      break;
    }
    case 'ritual':selectRitual(Number(id));break;
    case 'quiz':startQuiz();break;
    case 'quiz-answer':quiz.answers[quiz.step]=id;quiz.step++;renderQuiz();$('#quiz-title').focus();break;
    case 'quiz-back':quiz.step=Math.max(0,quiz.step-1);renderQuiz();$('#quiz-title').focus();break;
    case 'add-routine':quiz.resultIds.forEach(id=>addToCart(id));renderCart();openDialog('#cart-dialog');break;
    case 'top':window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});break;
    case 'motion':motionPaused=!motionPaused;setupMotion();syncMotionButton();break;
    case 'film':window.CSkinMotion?.toggleFilm();break;
    case 'faq':info('Le soin, en clair.',faqMarkup());break;
    case 'demo':info('Une nouvelle vision de Cskin.',`<p>Cette version est une proposition de refonte à découvrir en privé. Les produits, images et prix proviennent du site Cskin.</p><p>Le panier fonctionne uniquement dans ce navigateur. Aucun paiement, email ou conseil personnalisé n’est envoyé. Les exemples de routine seront à valider avec la fondatrice.</p><p>La présentation associe Instrument Serif et General Sans, servies localement. Le film de l’accueil a été fourni pour cette démonstration.</p><a class="button" href="https://cskinaesthetic.com/" target="_blank" rel="noopener">Voir la boutique actuelle <span>↗︎</span></a>`);break;
    case 'checkout':{const total=cart.reduce((n,l)=>n+findProduct(l.id).price*l.qty,0);info('Votre sélection est prête.',`<p>Vous avez sélectionné ${cart.reduce((n,l)=>n+l.qty,0)} soin(s), pour un sous-total de <strong>${money(total)}</strong>.</p>${cart.map(l=>`<p>${l.qty} × ${esc(findProduct(l.id).title)} — ${money(findProduct(l.id).price*l.qty)}</p>`).join('')}<p>Fin du parcours de démonstration. Aucun paiement ni aucune commande n’a été effectué. Votre panier local n’est pas transféré vers la boutique officielle.</p><a class="button" href="https://cskinaesthetic.com/collections/all" target="_blank" rel="noopener">Visiter la boutique officielle <span>↗︎</span></a>`);break;}
  }
});
$('#search-input').addEventListener('input',e=>search(e.target.value));
document.addEventListener('change',e=>{if(e.target.id==='sort-products'){sortOrder=e.target.value;renderRoute(true);$('#sort-products').focus();}});
document.addEventListener('keydown',e=>{
  if(!e.target.closest('.catalog-selector')||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    e.preventDefault();
    stepCatalog(e.key==='ArrowRight'?1:-1);
  }
});
document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'||!e.target.closest('.catalog-scene'))return;
  catalogSwipeStart={x:e.clientX,y:e.clientY};
});
document.addEventListener('pointerup',e=>{
  if(!catalogSwipeStart||!e.target.closest('.catalog-scene')){catalogSwipeStart=null;return;}
  const dx=e.clientX-catalogSwipeStart.x;
  const dy=e.clientY-catalogSwipeStart.y;
  catalogSwipeStart=null;
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.3)return;
  suppressCatalogClick=true;
  stepCatalog(dx<0?1:-1);
  setTimeout(()=>{suppressCatalogClick=false;},350);
});
document.addEventListener('pointercancel',()=>{catalogSwipeStart=null;});
document.addEventListener('click',e=>{
  if(suppressCatalogClick&&e.target.closest('.catalog-scene')){
    e.preventDefault();
    e.stopImmediatePropagation();
    suppressCatalogClick=false;
  }
},true);
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialogs();});
  dialog.addEventListener('close',()=>{$('.mobile-toggle').setAttribute('aria-expanded','false');});
});
window.addEventListener('hashchange',e=>{
  const keepScroll=new URL(e.oldURL).hash.startsWith('#/soins')&&location.hash.startsWith('#/soins');
  renderRoute(keepScroll);
  (keepScroll?$('.filter-tab[aria-pressed="true"]'):main)?.focus({preventScroll:true});
});
reducedMotion.addEventListener('change',()=>{motionContext?.revert();const b=$('[data-action="motion"]');if(b)b.disabled=false;syncMotionButton();setupMotion();});
renderRoute();updateCartCount();
