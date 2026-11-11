/* Cskin — storefront sur mesure connecté à Shopify. */
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
const money = (n,currency='EUR') => shopifyEnabled && commerceState.status !== 'ready' ? '—' : new Intl.NumberFormat(window.CSkinI18n?.language || 'fr', {style:'currency',currency,minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findProduct = id => products.find(p=>p.id===id);
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const shopifyEnabled = Boolean(window.CSKIN_SHOPIFY?.enabled);
let commerce;
let commerceState = {status:'loading',busy:false,cart:null,notice:''};
let cart = [];
if (shopifyEnabled) products.forEach(p=>{p.available=false;});

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

const faqMarkup = () => `<div class="faq-list"><details><summary>Comment choisir mon premier soin ?</summary><p>Commencez par votre besoin principal et le nombre de gestes que vous souhaitez adopter. Notre découverte de routine présente des exemples ; Céline pourra ensuite vous orienter vers un choix adapté. <button class="text-link" data-action="quiz">Explorer une routine <span class="ui-arrow" aria-hidden="true"></span></button></p></details><details><summary>Dans quel ordre utiliser mes soins ?</summary><p>Le rituel présenté ici suit trois étapes : nettoyer, appliquer le sérum, puis la crème. Consultez les instructions propres à chaque produit pour sa fréquence d’utilisation et ses précautions.</p></details><details><summary>Où sont fabriqués les soins Cskin ?</summary><p>Selon la présentation de la marque, les formulations Cskin sont fabriquées en Espagne.</p></details><details><summary>Comment fonctionne la livraison ?</summary><p>La boutique annonce la livraison offerte à partir de 100 €. Pour les destinations et délais, écrivez-nous depuis la <a class="text-link" href="#/contact">page contact <span class="ui-arrow" aria-hidden="true"></span></a>.</p></details></div>`;

function homeSelection() {
  const essentials = [products[2], products[0], products[1]];
  return `<section class="section selection" aria-labelledby="selection-title">
    <div class="selection-heading"><p>La sélection <span class="brand-word">Cskin</span></p><h2 id="selection-title">Le soin juste. <em>Pour vous.</em></h2><p class="selection-intro">Nettoyer, cibler, accompagner. Trois essentiels à découvrir.</p></div>
    <div class="selection-products" id="selection-rail" role="group" aria-label="Trois soins essentiels" tabindex="0">${essentials.map((p,i)=>`<article class="gallery-product"><a class="product-stage" href="#/produit/${p.id}" aria-label="Découvrir ${esc(p.title)}" data-cursor="VIEW"><img src="${editorialPhotos[p.id]}" alt="${esc(p.title)} sur un socle en marbre" width="1086" height="1448" loading="lazy" decoding="async"></a><div class="gallery-description"><p class="product-type"><span class="essential-number">0${i+1}</span>${esc(p.subtitle)}</p><h3><a href="#/produit/${p.id}">${esc(p.title)}</a></h3><div class="gallery-purchase"><span>${money(p.price)}</span><button class="text-link" data-action="add" data-id="${p.id}" aria-label="Ajouter ${esc(p.title)} au panier">Ajouter <span aria-hidden="true">+</span></button></div></div></article>`).join('')}</div>
    <div class="selection-bottom"><a class="text-link selection-all" href="#/soins">Tous les soins <span class="ui-arrow" aria-hidden="true"></span></a><div class="selection-controls"><span id="selection-position" aria-live="polite">01 / 03</span><button class="icon-button" data-action="selection-step" data-direction="-1" aria-label="Essentiel précédent" aria-controls="selection-rail" disabled>←</button><button class="icon-button" data-action="selection-step" data-direction="1" aria-label="Essentiel suivant" aria-controls="selection-rail">→</button></div></div>
  </section>`;
}

function dayNightStory() {
  const day=findProduct('creme-anti-aging-plus-day');
  const night=findProduct('creme-anti-aging-plus-night');
  const duo=findProduct('duo-pack-anti-aging-day-night');
  return `<section class="routine-duo routine-duo--study" aria-labelledby="duo-title">
    <div class="routine-duo-copy"><p class="routine-duo-kicker">AntiAging Plus · Day & Night</p><h2 id="duo-title">Jour & nuit.</h2>
      <dl class="routine-duo-facts">
        <div><dt>Le matin</dt><dd><a href="#/produit/${day.id}">AntiAging Plus Day</a><span>Sur peau propre, avant votre protection solaire.</span></dd></div>
        <div><dt>Le soir</dt><dd><a href="#/produit/${night.id}">AntiAging Plus Night</a><span>Après le nettoyage, selon la tolérance de votre peau.</span></dd></div>
        <div><dt>Actifs communs</dt><dd>Matrixyl 3000, isoflavones liposomales, aloe vera et hamamélis.</dd></div>
        <div><dt>Format</dt><dd>Deux soins de 50 ml.</dd></div>
      </dl>
      <div class="routine-duo-purchase"><span class="routine-duo-amount">${money(duo.price)}</span><button class="campaign-link" data-action="add" data-id="${duo.id}" ${!duo.available?'disabled':''}>${duo.available?'Ajouter le duo':'Indisponible'} <span aria-hidden="true">+</span></button></div>
      <details class="routine-duo-details"><summary>Détails du rituel <span aria-hidden="true">+</span></summary><div>
        <p class="routine-duo-product-links"><a href="#/produit/${day.id}">AntiAging Plus Day</a> · <a href="#/produit/${night.id}">AntiAging Plus Night</a></p><h3>Pourquoi les associer ?</h3><p>Deux formules complémentaires, des actifs communs et des gestes réguliers : c’est la cohérence de la routine qui donne du sens à chaque application.</p><p>Matrixyl 3000, isoflavones liposomales, aloe vera et hamamélis : une base commune aux deux formules.</p>
        <h3>Votre geste du matin</h3><p>Sur visage et cou propres, appliquez selon les instructions du soin, en évitant le contour des yeux. Complétez avec une protection solaire à large spectre SPF 30 minimum.</p>
        <h3>Votre geste du soir</h3><p>Après le nettoyage, appliquez sur le visage propre. Introduisez ce soin au rétinol progressivement, selon sa notice et la tolérance de votre peau.</p>
        <h3>Pour qui ?</h3><p>Pour les peaux normales à sèches qui souhaitent une routine anti-âge structurée. Le choix dépend de votre peau et de sa tolérance, pas d’un âge précis.</p>
        <h3>Les précautions du rétinol</h3><p>La crème Night ne convient pas aux peaux les plus sensibles. Introduisez les soins au rétinol progressivement, protégez votre peau du soleil et évitez leur utilisation pendant la grossesse. En cas de peau réactive ou d’irritation, demandez conseil avant de poursuivre.</p>
      </div></details>
      <a class="campaign-link routine-duo-link" href="#/produit/${duo.id}">Voir le duo <span class="ui-arrow" aria-hidden="true"></span></a>
    </div>
  </section>`;
}

function setupSelectionRail() {
  const rail = $('#selection-rail');
  if (!rail) return;
  const sync = () => {
    const cards = $$('.gallery-product', rail);
    const index = cards.reduce((nearest, card, i) => Math.abs(card.offsetLeft-rail.offsetLeft-rail.scrollLeft)<Math.abs(cards[nearest].offsetLeft-rail.offsetLeft-rail.scrollLeft)?i:nearest,0);
    $('#selection-position').textContent = `0${index+1} / 03`;
    $('[data-action="selection-step"][data-direction="-1"]').disabled = index === 0;
    $('[data-action="selection-step"][data-direction="1"]').disabled = index === cards.length-1;
  };
  rail.addEventListener('scroll', sync, {passive:true});
  rail.addEventListener('keydown', e => {
    if(e.target!==rail || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();stepSelection(e.key==='ArrowRight'?1:-1);
  });
  sync();
}

function stepSelection(direction) {
  const rail = $('#selection-rail');
  if(!rail) return;
  const cards = $$('.gallery-product', rail);
  const index = cards.reduce((nearest,card,i)=>Math.abs(card.offsetLeft-rail.offsetLeft-rail.scrollLeft)<Math.abs(cards[nearest].offsetLeft-rail.offsetLeft-rail.scrollLeft)?i:nearest,0);
  const next=cards[Math.max(0,Math.min(cards.length-1,index+direction))];
  rail.scrollTo({left:next.offsetLeft-rail.offsetLeft,behavior:reducedMotion.matches?'instant':'smooth'});
}


function campaignHero() {
  return `<section class="campaign-hero campaign-hero--film" aria-labelledby="campaign-title"><div class="campaign-film-media" aria-hidden="true"><picture><source media="(max-width: 782px)" srcset="assets/campaign/hero-higgsfield-mobile.jpg"><img src="assets/campaign/hero-higgsfield-desktop.jpg" alt="" width="1920" height="1080" fetchpriority="high"></picture><video id="serum-film" muted playsinline preload="none" data-priority="hero" data-preview-seconds="4.5" data-desktop-src="assets/campaign/hero-higgsfield-desktop.mp4" data-mobile-src="assets/campaign/hero-higgsfield-mobile.mp4" disablepictureinpicture disableremoteplayback></video></div><div class="campaign-film-copy"><div class="campaign-film-heading"><p class="campaign-film-kicker">Hydratation · Souplesse</p><h1 id="campaign-title">Sérum Age Plus</h1><p>Le geste précieux de votre routine.</p></div><a class="campaign-link" href="#/produit/serum-age-plus-1">Découvrir ce soin <span class="ui-arrow" aria-hidden="true"></span></a></div></section>`;
}

const campaignPortrait = 'assets/editorial/cskin-silk-portrait-cutout.webp';

function home() {
  const featured=[products[2],products[0],products[1],products[4]];
  return `<div class="campaign-home">${campaignHero()}
    <section class="campaign-essentials" aria-labelledby="essentials-title"><div class="campaign-section-intro"><p class="campaign-eyebrow">01 / La sélection Cskin</p><h2 id="essentials-title">Les essentiels.</h2><p>Nettoyer, cibler, accompagner. Trois gestes pour composer votre rituel.</p><a class="campaign-link" href="#/soins">Tous les soins <span class="ui-arrow" aria-hidden="true"></span></a></div><div class="campaign-grid">${featured.map(p=>`<article class="campaign-product"><a class="campaign-product-photo" href="#/produit/${p.id}" aria-label="Découvrir ${esc(p.title)}"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)} sur un socle en marbre" width="1024" height="1536" loading="lazy" decoding="async"></a><div class="campaign-product-info"><h3><a href="#/produit/${p.id}">${esc(p.title)}</a></h3><p>${esc(p.subtitle)}</p><div><span>${money(p.price)}</span><button data-action="add" data-id="${p.id}" aria-label="Ajouter ${esc(p.title)} au panier" ${!p.available?'disabled':''}>Ajouter <span aria-hidden="true">+</span></button></div></div></article>`).join('')}</div></section>
    <section class="campaign-editorial"><div class="campaign-portrait"><img src="${campaignPortrait}" alt="Modèle tenant la Crème Silk Effect Cskin Aesthetic" width="900" height="1207" loading="lazy" decoding="async"></div><div class="campaign-editorial-copy"><p class="campaign-eyebrow">02 / La philosophie</p><h2>Des actifs identifiés.<br> Des gestes expliqués.</h2><p>Au cœur de Cskin, une conviction : un soin commence par la compréhension de la peau. Des actifs identifiés, des formules expliquées et des gestes accompagnés.</p><button class="campaign-link" data-action="quiz">Trouver ma routine <span class="ui-arrow" aria-hidden="true"></span></button></div></section>
    <div class="campaign-cycle">${dayNightStory()}</div>
    <section class="campaign-founder campaign-founder--personal" aria-labelledby="founder-title"><p class="campaign-eyebrow">04 / La fondatrice</p><figure class="campaign-founder-portrait"><img src="assets/editorial/celine-founder.webp" alt="Céline, fondatrice de Cskin Aesthetic, dans son espace de soin" width="1254" height="1254" loading="lazy" decoding="async"><figcaption>Pharmacologie · Physiologie · CIBTAC</figcaption></figure><div class="campaign-founder-copy"><h2 id="founder-title">Céline AB.</h2><p class="founder-role">Fondatrice de Cskin Aesthetic</p><blockquote>« Tout a commencé par une fascination pour la science du vivant. »</blockquote><p>De la pharmacologie au soin quotidien, Céline rapproche la connaissance de la peau des gestes essentiels.</p><a class="campaign-link" href="#/marque">Notre histoire <span class="ui-arrow" aria-hidden="true"></span></a></div></section>
    <section class="campaign-faq"><div><p class="campaign-eyebrow">05 / Vos questions</p><h2>Le soin,<br>en clair.</h2></div>${faqMarkup()}</section>
  </div>`;
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
  if(sortOrder==='name')catalogItems.sort((a,b)=>(window.CSkinI18n?.translate(a.title)||a.title).localeCompare(window.CSkinI18n?.translate(b.title)||b.title,window.CSkinI18n?.language||'fr'));
  if(!catalogItems.some(p=>p.id===catalogSelectedId))catalogSelectedId=catalogItems[0].id;
  const selected=catalogItems.findIndex(p=>p.id===catalogSelectedId);
  return `<section class="catalog-showroom" aria-labelledby="catalog-title">
    <div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><span>Les soins</span></div>
    <div class="catalog-introduction ${category==='tous'||category==='visage'?'has-portrait':''}"><div class="catalog-introduction-copy"><p class="catalog-kicker">La collection <span class="brand-word">Cskin</span> Aesthetic</p><h1 id="catalog-title">${headings[category][0]}<br><em>${headings[category][1]}</em></h1><p>Une collection à découvrir, un soin à choisir. Explorez les formules à votre rythme.</p></div>${category==='tous'||category==='visage'?'<div class="catalog-introduction-portrait"><img src="${campaignPortrait}" alt="Modèle tenant la Crème Silk Effect Cskin Aesthetic" width="900" height="1207" decoding="async" fetchpriority="high"></div>':''}</div>
    <div class="catalog-toolbar"><div class="filter-tabs" role="group" aria-label="Catégories de soins">${[['tous','Tout explorer'],['visage','Visage'],['corps','Corps'],['coffrets','Coffrets']].map(([id,label])=>`<button class="filter-tab" data-action="filter" data-id="${id}" aria-pressed="${id===category}">${label}</button>`).join('')}</div><div class="catalog-tools"><span aria-live="polite">${catalogItems.length} ${catalogItems.length===1?'soin':'soins'}</span><div class="catalog-sort"><span>Trier par</span><select id="sort-products" aria-label="Trier les soins"><option value="selection">Notre sélection</option><option value="price-up">Prix croissant</option><option value="price-down">Prix décroissant</option><option value="name">Nom du soin</option></select></div></div></div>
    <div class="catalog-shop-grid product-grid">${catalogItems.map(p=>card(p)).join('')}</div>
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
  if(!p)return `<section class="section"><h1>Ce soin est introuvable.</h1><p>Retrouvez toute la collection Cskin.</p><a class="button" href="#/soins">Découvrir les soins <span class="ui-arrow" aria-hidden="true"></span></a></section>`;
  quantity=1;
  const related=products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,3);
  const image=catalogPhotos[p.id];
  const index=products.findIndex(item=>item.id===p.id);
  const previous=products[(index-1+products.length)%products.length];
  const next=products[(index+1)%products.length];
  const volumes={'creme-silk-effect':'50 ml','lait-nettoyant-hydratant':'200 ml','mousse-nettoyante-a-lacide-glycolique':'150 ml','creme-anti-aging-plus-day':'50 ml','creme-anti-aging-plus-night':'50 ml','creme-facial-acide-glycolique':'50 ml','creme-raffermissante-pour-le-corps':'200 ml','creme-anti-cellulite':'200 ml'};
  return `<section class="product-page product-editorial" aria-labelledby="product-title">
    <div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><a href="#/soins">Les soins</a><span aria-hidden="true">/</span><span>${esc(p.title)}</span></div>
    <div class="product-layout">
      <div class="product-detail product-introduction ${p.title.length>45?'is-long-title':''}"><p class="product-kicker">${esc(p.subtitle)}</p><h1 id="product-title">${esc(p.title)}</h1><p class="detail-price price">${money(p.price)} ${p.compare&&p.compare>p.price?`<s>${money(p.compare)}</s>`:''}${volumes[p.id]?`<span class="product-volume"> / ${volumes[p.id]}</span>`:''}</p><p class="summary">${esc(p.summary)}</p><a class="detail-source" href="#/contact">Une question sur ce soin ? Contacter Cskin <span class="ui-arrow" aria-hidden="true"></span></a></div>
      <div class="product-gallery"><img src="${image}" alt="${esc(p.title)} présenté sur un socle en marbre" width="1024" height="1536" fetchpriority="high" decoding="async"><nav class="product-browse" aria-label="Parcourez la collection"><a href="#/produit/${previous.id}" aria-label="Soin précédent">←</a><span>${String(index+1).padStart(2,'0')} <span aria-hidden="true">/</span> ${String(products.length).padStart(2,'0')}</span><a href="#/produit/${next.id}" aria-label="Soin suivant">→</a></nav></div>
      <div class="product-detail product-order"><div class="product-purchase"><label class="purchase-label" for="product-quantity">Quantité</label><div class="buy-row"><div class="quantity" aria-label="Quantité"><button data-action="qty-minus" aria-label="Diminuer la quantité">−</button><output id="product-quantity" aria-live="polite">1</output><button data-action="qty-plus" aria-label="Augmenter la quantité">+</button></div><button class="button" data-action="add-product" data-id="${p.id}" ${!p.available?'disabled':''}>${p.available?'Ajouter au panier':'Indisponible'} <span aria-hidden="true">+</span></button></div><div class="product-reassurance"><span>Livraison offerte dès 100 €</span><span>Paiement sécurisé par Shopify</span></div></div>
        <div class="faq-list"><details><summary>Le geste Cskin</summary><p>${esc(p.usage)}</p></details><details><summary>Les actifs à connaître</summary><p>${p.actives.length?p.actives.map(esc).join(' · '):'Ce coffret réunit plusieurs soins. Contactez Cskin pour une composition détaillée.'}</p></details><details><summary>Livraison et informations</summary><p>Les prix et la disponibilité sont actualisés depuis Shopify. Les frais et options de livraison ainsi que les taxes applicables sont confirmés au paiement. Pour une question sur votre commande, contactez Cskin depuis ce site.</p></details></div>
      </div>
    </div>
  </section>${related.length?`<section class="section related-section"><div class="section-head"><h2>Les gestes<br><em>se complètent.</em></h2><a class="text-link" href="#/soins">Explorer les soins <span class="ui-arrow" aria-hidden="true"></span></a></div><div class="product-grid">${related.map(x=>card(x)).join('')}</div></section>`:''}`;
}

function brandPage() {
  return `<section class="brand-page-hero"><div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><span>Notre histoire</span></div><div class="brand-portrait-layout"><div class="brand-portrait-copy"><p class="section-title-small">Notre histoire</p><h1>Céline AB.</h1><p class="brand-founder-role">Fondatrice de Cskin Aesthetic</p><p>Cskin Aesthetic est née du parcours de Céline et de son envie de rapprocher expertise et soin quotidien.</p><a class="campaign-link" href="#/soins">Découvrir les soins <span class="ui-arrow" aria-hidden="true"></span></a></div><img class="brand-founder-photo" src="assets/editorial/celine-founder.webp" alt="Céline, fondatrice de Cskin Aesthetic, dans son espace de soin" width="1254" height="1254" decoding="async" fetchpriority="high"></div></section><section class="brand-story"><div class="brand-story-heading"><p class="section-title-small">Son parcours</p><h2>Une histoire de conviction.</h2></div><div class="brand-story-body"><p class="story-lead">« Tout a commencé par une fascination pour la science du vivant. »</p><p>Formée en pharmacologie et physiologie en France, Céline a ensuite travaillé comme déléguée médicale et formatrice auprès de laboratoires américains.</p><p>Son expérience auprès des professionnels de la peau, puis sa formation CIBTAC au Royaume-Uni, ont enrichi une approche qui relie la connaissance des actifs à la pratique du soin.</p><p>Cskin prolonge cette démarche : des formulations fabriquées en Espagne, des actifs expliqués et une attention portée au choix de chaque routine.</p></div></section><section class="routine-banner brand-contact-strip"><div><h2>L’expertise, <em>à votre écoute.</em></h2><p>Une question sur la gamme ? Retrouvez les coordonnées de Cskin ici.</p></div><a class="campaign-link" href="#/contact">Contacter Cskin <span class="ui-arrow" aria-hidden="true"></span></a></section>`;
}

function contactPage() {
  return `<section class="contact-page"><div class="breadcrumb"><a href="#/">Accueil</a><span aria-hidden="true">/</span><span>Contact</span></div><div class="contact-heading"><p class="section-title-small">Restons en contact</p><h1>Parlons de<br><em>votre peau.</em></h1><p class="contact-intro">Une question sur un soin ou sur la marque ? Retrouvez ici l’adresse de contact de Cskin Aesthetic.</p></div><div class="contact-methods"><div class="contact-address"><span>Écrivez à Céline</span><strong>ab.frenchbeauty@gmail.com</strong><button class="campaign-link" data-action="copy-email">Copier l’adresse <span class="ui-arrow" aria-hidden="true"></span></button></div><p class="contact-note">Copiez l’adresse pour écrire depuis votre messagerie.</p><a class="campaign-link" href="#/soins">Explorer les soins <span class="ui-arrow" aria-hidden="true"></span></a></div></section>`;
}

function policiesPage(id) {
  const policies = window.CSkinPolicies;
  const current = policies.find(policy => policy.id === id);
  const links = policies.map(policy =>
    `<li><a href="#/politiques/${policy.id}" ${policy === current ? 'aria-current="page"' : ''}>${policy.title}</a></li>`
  ).join('');
  const documents = current
    ? `<article class="policy-document" lang="fr" data-i18n-ignore>${current.html}</article>`
    : policies.map(policy => `<article class="policy-document policy-document-overview" lang="fr" data-i18n-ignore>
        <h2>${policy.title}</h2>
        ${policy.html.replaceAll('<h2>', '<h3>').replaceAll('</h2>', '</h3>')}
      </article>`).join('');

  return `<section class="policy-page">
    <nav class="breadcrumb" aria-label="Fil d’Ariane">
      <a href="#/">Accueil</a><span aria-hidden="true">/</span>
      ${current ? '<a href="#/politiques">Politiques et confidentialité</a>' : '<span>Politiques et confidentialité</span>'}
    </nav>
    <h1>${current?.title || 'Politiques et confidentialité'}</h1>
    ${current ? documents : ''}
    <nav aria-label="Politiques et confidentialité"><ul class="policy-links">${links}</ul></nav>
    ${current ? '' : documents}
  </section>`;
}

function renderRoute(keepScroll=false) {
  motionContext?.revert();
  closeDialogs();
  const [,route,id]=location.hash.replace(/^#/,'').split('/');
  document.body.classList.toggle('home-page', !['soins','produit','marque','contact','politiques'].includes(route));
  if(route==='soins') { main.innerHTML=catalog(id); $('#sort-products').value=sortOrder; document.title='Les soins — Cskin'; }
  else if(route==='produit') { main.innerHTML=productPage(id); document.title=`${findProduct(id)?.title||'Les soins'} — Cskin`; }
  else if(route==='marque') {main.innerHTML=brandPage();document.title='L’esprit Cskin — La fondatrice';}
  else if(route==='contact') {main.innerHTML=contactPage();document.title='Contact — Cskin';}
  else if(route==='politiques') {main.innerHTML=policiesPage(id);document.title=`${main.querySelector('h1').textContent} — Cskin`;}
  else {main.innerHTML=home();document.title='Cskin — L’expertise du soin';}
  if(!keepScroll)window.scrollTo({top:0,behavior:'instant'});
  window.CSkinI18n?.apply();window.CSkinSortMenu?.mount();syncMotionButton();setupSelectionRail();setupMotion();syncPurchaseControls();
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
function updateCartCount(){const count=cart.reduce((sum,x)=>sum+x.qty,0);$$('.cart-count').forEach(e=>e.textContent=count);$('.cart-button').dataset.count=String(count);$('.cart-button').setAttribute('aria-label',`Ouvrir le panier, ${count} article${count>1?'s':''}`);}
function commerceMessage(error){return ({unavailable:'Ce soin est actuellement indisponible.',quantity:'Shopify a ajusté ou refusé cette quantité selon le stock disponible.','cart-expired':'Votre panier a expiré. Ajoutez de nouveau vos soins.',checkout:'Le paiement est indisponible pour le moment.'})[error?.code] || 'Connexion à Shopify indisponible. Réessayez dans un instant.';}
function syncPurchaseControls(){
  $$('[data-action="add"],[data-action="add-product"],[data-action="add-routine"],[data-action="checkout"]').forEach(button=>{
    const p=button.dataset.id && findProduct(button.dataset.id);
    button.disabled=commerceState.status!=='ready'||commerceState.busy||Boolean(p&&!p.available)||(button.dataset.action==='checkout'&&(!cart.length||cart.some(l=>!l.available))); 
    button.setAttribute('aria-busy',String(commerceState.busy));
  });
}
async function addToCart(id,qty=1){
  if(!commerce)return false;
  try{await commerce.addItems([{id,qty}]);toast(commerceState.notice?commerceMessage({code:commerceState.notice}):`${findProduct(id).title} ajouté au panier`);return true;}
  catch(error){toast(commerceMessage(error));return false;}
}
function renderConnectedCart(){
  const empty=`<div class="empty-state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Zm4 0V5a3 3 0 0 1 6 0v2"/></svg><h3>Le début d’un rituel.</h3><p>Votre panier est encore vide. Découvrez le soin qui vous correspond.</p><a class="button" href="#/soins">Explorer les soins <span class="ui-arrow" aria-hidden="true"></span></a></div>`;
  if(commerceState.status!=='ready')return `<div class="empty-state"><p>${commerceState.status==='error'?'Connexion à Shopify indisponible. Réessayez dans un instant.':'Connexion à votre panier…'}</p>${commerceState.status==='error'?'<button class="button" data-action="retry-commerce">Réessayer</button>':''}</div>`;
  if(!cart.length)return empty;
  const disabled=commerceState.busy?'disabled':'';
  return `<p class="cart-disclaimer">${commerceState.busy?'Mise à jour du panier…':'Paiement sécurisé par Shopify'}</p>${commerceState.notice?`<p class="shipping-text" role="status">${commerceMessage({code:commerceState.notice})}</p>`:''}<div class="cart-lines">${cart.map(l=>{
    const p=findProduct(l.id);return `<article class="cart-line">${p?`<a href="#/produit/${p.id}"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)}"></a>`:''}<div><h3>${p?`<a href="#/produit/${p.id}">${esc(p.title)}</a>`:esc(l.title)}</h3><div class="quantity"><button data-action="cart-minus" data-id="${esc(l.id)}" aria-label="Diminuer la quantité de ${esc(p?.title||l.title)}" ${disabled}>−</button><output aria-label="Quantité">${l.qty}</output><button data-action="cart-plus" data-id="${esc(l.id)}" aria-label="Augmenter la quantité de ${esc(p?.title||l.title)}" ${l.qty>=20?'disabled':disabled}>+</button></div>${!l.available?'<p>Ce soin est actuellement indisponible.</p>':''}<button class="remove-item" data-action="remove" data-id="${esc(l.id)}" ${disabled}>Retirer</button></div><p class="line-price">${money(l.total,l.currency)}</p></article>`;
  }).join('')}</div><div class="cart-total"><span>Sous-total</span><strong>${money(commerceState.cart.subtotal,commerceState.cart.currency)}</strong></div><button class="button full" data-action="checkout" ${cart.some(l=>!l.available)?'disabled':disabled}>Passer commande <span class="ui-arrow" aria-hidden="true"></span></button><div class="cart-actions"><button class="text-link" data-action="close">Continuer la découverte <span class="ui-arrow" aria-hidden="true"></span></button><p>Livraison, taxes et réductions confirmées au paiement.</p></div>`;
}
async function startCommerce(){
  if(!commerce){
    if(!shopifyEnabled||!window.CSkinCommerce){commerceState.status='error';renderCart();syncPurchaseControls();return;}
    let storage;try{storage=localStorage;}catch{}
    commerce=window.CSkinCommerce.create(window.CSKIN_SHOPIFY,{storage,language:()=>String(window.CSkinI18n?.language||'fr').toUpperCase()});
    commerce.subscribe(state=>{
      commerceState=state;cart=state.cart?.lines||[];
      if(state.status==='ready')products.forEach(p=>{const remote=state.products[p.id];p.available=Boolean(remote?.available&&remote.currency==='EUR');if(remote&&Number.isFinite(remote.price)){p.price=remote.price;p.compare=remote.compare;}});
      updateCartCount();if($('#cart-dialog').open)renderCart();syncPurchaseControls();
    });
  }
  try{
    await commerce.init();
    const open=$('dialog[open]')?.id,qty=quantity;renderRoute(true);quantity=qty;
    if($('#product-quantity'))$('#product-quantity').textContent=qty;
    if(open){if(open==='cart-dialog')renderCart();openDialog('#'+open);}
  }catch(error){toast(commerceMessage(error));if($('#cart-dialog').open)renderCart();}
  syncPurchaseControls();
}
function openDialog(id){lastFocus=document.activeElement;$$('dialog[open]').forEach(d=>d.close());window.CSkinI18n?.apply();$(id).showModal();if(id==='#menu-dialog')$('.mobile-toggle').setAttribute('aria-expanded','true');}
function closeDialogs(){let wasOpen=false;$$('dialog[open]').forEach(d=>{d.close();wasOpen=true;});$('.mobile-toggle').setAttribute('aria-expanded','false');if(wasOpen&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
function renderCart(){$('#cart-content').innerHTML=renderConnectedCart();updateCartCount();window.CSkinI18n?.apply();syncPurchaseControls();}
function search(query=''){const q=normalize(query.trim());const result=products.filter(p=>normalize(`${p.title} ${p.subtitle} ${p.summary} ${p.actives.join(' ')} ${window.CSkinI18n?.translate(`${p.title} ${p.subtitle} ${p.summary} ${p.actives.join(' ')}`)||''}`).includes(q));$('#search-results').innerHTML=result.length?result.slice(0,q?13:5).map(p=>`<a class="search-result" href="#/produit/${p.id}"><img src="${catalogPhotos[p.id]}" alt="" width="65" height="78"><div><h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p></div><span>${money(p.price)} <span class="ui-arrow" aria-hidden="true"></span></span></a>`).join(''):`<p class="notice-empty">Aucun soin trouvé pour « ${esc(query)} ». Essayez un nom de produit ou un actif.</p>`;}

const quizQuestions=[
  {title:'Qu’aimeriez-vous privilégier ?',description:'Partons de votre envie du moment.',options:[['confort','Le confort et l’hydratation'],['fermete','La souplesse et la fermeté'],['eclat','L’éclat et le grain de peau'],['decouverte','Découvrir, tout simplement']]},
  {title:'Comment ressentez-vous votre peau ?',description:'Choisissez ce qui se rapproche le plus de votre ressenti.',options:[['seche','Elle tiraille ou manque de confort'],['mixte','Elle brille sur certaines zones'],['normale','Elle est plutôt équilibrée'],['sensible','Elle réagit facilement'],['inconnue','Je ne sais pas encore']]},
  {title:'Quel rythme vous ressemble ?',description:'Une routine qui trouve sa place dans votre quotidien.',options:[['simple','L’essentiel, en deux gestes'],['complet','Un rituel en trois gestes']]}
];
function startQuiz(){quiz={step:0,answers:[]};renderQuiz();openDialog('#quiz-dialog');}
function renderQuiz(){const q=quizQuestions[quiz.step];if(!q)return renderQuizResult();$('#quiz-content').innerHTML=`<p class="quiz-label">Votre rituel Cskin · ${quiz.step+1} / 3</p><div class="quiz-progress" aria-hidden="true">${quizQuestions.map((_,i)=>`<span class="${i<=quiz.step?'active':''}"></span>`).join('')}</div><h2 id="quiz-title" tabindex="-1">${q.title}</h2><p class="quiz-description">${q.description}</p><div class="quiz-options">${q.options.map(([id,label])=>`<button class="quiz-option" data-action="quiz-answer" data-id="${id}"><span>${label}</span><span class="ui-arrow" aria-hidden="true"></span></button>`).join('')}</div>${quiz.step?'<button class="quiz-back" data-action="quiz-back">← Question précédente</button>':'<p class="quiz-description">Une découverte de la gamme. Sans inscription.</p>'}`;}
function renderQuizResult(){const [goal,skin,length]=quiz.answers;const needsAdvice=['sensible','inconnue'].includes(skin);const ids=needsAdvice?[]:length==='simple'?['lait-nettoyant-hydratant','creme-silk-effect']:['lait-nettoyant-hydratant','serum-age-plus-1','creme-silk-effect'];quiz.resultIds=ids;const label={confort:'Le confort, au quotidien.',fermete:'Toute l’attention à votre peau.',eclat:'L’éclat d’un rituel.',decouverte:'Votre première découverte.'}[goal];$('#quiz-content').innerHTML=`<p class="quiz-label">Votre découverte Cskin</p><h2 id="quiz-title" tabindex="-1">${needsAdvice?'Commençons par un échange.':label}</h2><p class="quiz-description">${needsAdvice?'Pour une peau réactive ou un besoin encore incertain, un échange avec Céline est le meilleur point de départ dans cette démonstration.':`Vous privilégiez ${length==='simple'?'une routine courte':'trois gestes complémentaires'}. Voici un exemple pour découvrir la gamme.`}</p><p class="quiz-result-note">Aperçu de fonctionnalité : ces exemples ne constituent pas une recommandation personnalisée. Les règles seront validées par la fondatrice avant mise en ligne.</p>${ids.map((id,i)=>{const p=findProduct(id);return `<div class="routine-result-item"><img src="${catalogPhotos[p.id]}" alt="${esc(p.title)}"><div><h3>${i+1}. ${esc(p.title)}</h3><p>${esc(p.subtitle)} · ${money(p.price)}</p><a href="#/produit/${id}">Découvrir ce soin <span class="ui-arrow" aria-hidden="true"></span></a></div></div>`;}).join('')}<div class="quiz-result-actions">${ids.length?'<button class="button" data-action="add-routine">Ajouter cet exemple au panier <span class="ui-arrow" aria-hidden="true"></span></button>':'<a class="button" href="#/contact">Échanger avec Cskin <span class="ui-arrow" aria-hidden="true"></span></a>'}<button class="text-link" data-action="quiz">Recommencer <span class="ui-arrow" aria-hidden="true"></span></button></div>`;}

function info(title,html){$('#info-title').textContent=title;$('#info-content').innerHTML=html;openDialog('#info-dialog');}

document.addEventListener('click',async e=>{
  if(e.target.closest('.skip-link')){e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});return;}
  const anchor=e.target.closest('a[href^="#/"]');if(anchor&&anchor.hash===location.hash)closeDialogs();
  const button=e.target.closest('[data-action]');if(!button)return;
  const {action,id}=button.dataset;
  switch(action){
    case 'menu':openDialog('#menu-dialog');break;
    case 'search':search();openDialog('#search-dialog');$('#search-input').value='';$('#search-input').focus();break;
    case 'cart':renderCart();openDialog('#cart-dialog');if(commerceState.status==='ready')commerce.refresh().catch(error=>toast(commerceMessage(error)));break;
    case 'close':closeDialogs();break;
    case 'add':await addToCart(id);break;
    case 'selection-step':stepSelection(Number(button.dataset.direction));break;
    case 'add-product':if(await addToCart(id,quantity)){renderCart();openDialog('#cart-dialog');}break;
    case 'qty-minus':quantity=Math.max(1,quantity-1);$('#product-quantity').textContent=quantity;break;
    case 'qty-plus':quantity=Math.min(20,quantity+1);$('#product-quantity').textContent=quantity;break;
    case 'cart-minus':case 'cart-plus':case 'remove':{
      try{await commerce.changeQuantity(id,action==='remove'?'remove':action==='cart-plus'?1:-1);if(commerceState.notice)toast(commerceMessage({code:commerceState.notice}));}catch(error){toast(commerceMessage(error));}
      renderCart();restoreCartFocus(action,id);break;
    }
    case 'retry-commerce':await startCommerce();break;
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
    case 'add-routine':try{await commerce.addItems(quiz.resultIds.map(id=>({id,qty:1})));renderCart();openDialog('#cart-dialog');}catch(error){toast(commerceMessage(error));}break;
    case 'top':window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});break;
    case 'motion':motionPaused=!motionPaused;setupMotion();syncMotionButton();break;
    case 'copy-email':if(navigator.clipboard?.writeText)navigator.clipboard.writeText('ab.frenchbeauty@gmail.com').then(()=>toast('Adresse copiée')).catch(()=>toast('Sélectionnez l’adresse affichée pour la copier'));else toast('Sélectionnez l’adresse affichée pour la copier');break;
    case 'faq':info('Le soin, en clair.',faqMarkup());break;
    case 'demo':info('Cskin Aesthetic.',`<p>Ce site sur mesure est connecté à la boutique Shopify de Cskin Aesthetic pour les produits, la disponibilité, le panier et le paiement.</p><p>Les exemples de routine servent à découvrir la gamme. Pour un conseil adapté, échangez avec Céline.</p><a class="button" href="#/marque">Rencontrer la marque <span class="ui-arrow" aria-hidden="true"></span></a>`);break;
    case 'checkout':{
      if(!commerce)return;
      try{const url=await commerce.checkout();location.assign(url);}catch(error){toast(commerceMessage(error));renderCart();}break;
    }
  }
});
$('#search-input').addEventListener('input',e=>search(e.target.value));
document.addEventListener('change',e=>{if(e.target.id==='sort-products'){sortOrder=e.target.value;renderRoute(true);($('.catalog-sort-trigger')||$('#sort-products')).focus({preventScroll:true});}});
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
reducedMotion.addEventListener('change',()=>{motionContext?.revert();const b=$('[data-action="motion"]');if(b)b.disabled=false;syncMotionButton();setupSelectionRail();setupMotion();});
renderRoute();updateCartCount();startCommerce();
