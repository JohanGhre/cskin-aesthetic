import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.CSKIN_PLAYWRIGHT || 'playwright');
const local = process.env.CSKIN_PREVIEW_URL || 'http://localhost:4173';
const output = process.env.CSKIN_SCREENSHOT_DIR || join(tmpdir(), 'cskin-test-captures');
mkdirSync(output, { recursive:true });
const world = {window:{}};
runInNewContext(readFileSync(new URL('../dist/data/products.js',import.meta.url),'utf8'),world);
const products = world.window.CSKIN_PRODUCTS;
const euros = amount => ({amount:String(amount),currencyCode:'EUR'});
const all = (available=true) => ({pageInfo:{hasNextPage:false},nodes:products.map(p=>({
  id:p.id,handle:p.id,availableForSale:available,descriptionHtml:p.id==='serum-age-plus-1'?
    "<ul><li><strong>Relaxant musculaire</strong> — effet Botox naturel pour lisser les rides d'expression</li></ul>":"",
  variants:{nodes:[{id:p.id,availableForSale:available,price:euros(p.price),compareAtPrice:null}]},
}))});
const checkoutUrl = 'https://checkout.cskinaesthetic.com/checkouts/cskin-preview-test';
async function fixture(context, state) {
  const makeCart = () => {
    const lines = [...state.quantities.entries()].map(([id, quantity])=>{
      const p = products.find(product=>product.id===id);
      return { id:'line-'+id, quantity, cost:{totalAmount:euros(p.price*quantity),amountPerQuantity:euros(p.price)},
        merchandise:{id,title:p.title,availableForSale:true,product:{handle:id,title:p.title}} };
    });
    return { id:'preview-cart',totalQuantity:lines.reduce((sum,line)=>sum+line.quantity,0),checkoutUrl,
      lines:{pageInfo:{hasNextPage:false},nodes:lines},cost:{subtotalAmount:euros(lines.reduce((sum,line)=>sum+Number(line.cost.totalAmount.amount),0))} };
  };
  await context.route('**/graphql.json',async route=>{
    const {query,variables}=route.request().postDataJSON();
    if (query.includes('query Catalog')) {
      if (state.delay) await new Promise(resolve=>setTimeout(resolve,state.delay));
      if (state.error) return route.fulfill({status:503,body:'Preview error'});
      return route.fulfill({json:{data:{products:all(state.available)}}});
    }
    if (query.includes('query Cart')) return route.fulfill({json:{data:{cart:makeCart()}}});
    const type=query.match(/(cartCreate|cartLinesAdd|cartLinesUpdate|cartLinesRemove)\(/)?.[1];
    if (type==='cartLinesUpdate') for(const line of variables.lines) state.quantities.set(line.id.replace(/^line-/,''),line.quantity);
    else if(type==='cartLinesRemove') for(const id of variables.lineIds) state.quantities.delete(id.replace(/^line-/,''));
    else for(const line of variables.input?.lines||variables.lines||[]) state.quantities.set(line.merchandiseId,(state.quantities.get(line.merchandiseId)||0)+line.quantity);
    return route.fulfill({json:{data:{[type]:{cart:makeCart(),userErrors:[],warnings:[]}}}});
  });
  await context.route(checkoutUrl, route=>route.fulfill({body:'<!doctype html><h1>Shopify checkout fixture</h1>',contentType:'text/html'}));
  await context.route('https://cdn.judge.me/**', route=>route.fulfill({json:{product_external_id:10523242561883,widget:"<div class='jdgm-rev-widg' data-number-of-reviews='0'></div>"}}));
}
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const use = { ...devices['iPhone 13'], reducedMotion:'reduce' };
  const ctx=await browser.newContext(use);
  const errors=[];
  const state={available:true,quantities:new Map()};
  await fixture(ctx,state);
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(local);
  await page.getByRole('link',{name:'Voir les soins',exact:true}).waitFor();
  assert.ok((await page.getByRole('link',{name:'Voir les soins',exact:true}).boundingBox()).y < 600);
  await page.screenshot({path:join(output,'cskin-after-home.png'),scale:'css'});
  await page.getByRole('button',{name:'Trouver mon soin'}).click();
  await page.getByRole('button',{name:'La souplesse et la fermeté'}).click();
  await page.getByRole('button',{name:'Elle est plutôt équilibrée'}).click();
  await page.getByRole('button',{name:'L’essentiel, en deux gestes'}).click();
  const lead=page.locator('.routine-result-item--lead');
  await lead.getByRole('button',{name:'Ajouter au panier'}).waitFor();
  assert.match(await lead.innerText(),/Sérum Age Plus[\s\S]*avant votre crème/);
  assert.equal(await page.locator('#quiz-dialog input[type=email]').count(),0);
  assert.equal(await lead.getByRole('button',{name:'Ajouter au panier',exact:true}).isEnabled(),true);
  assert.equal(await lead.locator('[data-product-retry]').isVisible(),false);
  await page.screenshot({path:join(output,'cskin-after-quiz.png'),scale:'css'});
  await lead.getByRole('link',{name:'Voir le soin'}).click();
  await page.waitForURL('**/produit/serum-age-plus-1/');
  await page.getByText('Disponible',{exact:true}).waitFor();
  assert.doesNotMatch(await page.locator('.product-source-content').first().innerText(),/botox/i);
  assert.match(await page.locator('.product-source-content').first().innerText(),/Relaxant musculaire — pour lisser/);
  const offer=JSON.parse(await page.locator('#product-schema').textContent()).offers;
  assert.equal(offer.price,'69.00');
  assert.equal(offer.availability,'https://schema.org/InStock');
  assert.ok(await page.getByRole('heading',{name:/Spectromètre/}).count());
  await page.locator('.product-order').scrollIntoViewIfNeeded();
  await page.screenshot({path:join(output,'cskin-after-product.png'),scale:'css'});
  await page.getByRole('button',{name:'Ajouter au panier',exact:true}).click();
  const cart=page.locator('#cart-dialog');
  await cart.getByText('Sous-total',{exact:true}).waitFor();
  assert.match(await cart.innerText(),/CSKIN20/);
  await cart.getByRole('button',{name:/Augmenter la quantité de/}).click();
  await cart.getByText(/138\s*€/).first().waitFor();
  await cart.getByRole('button',{name:'Retirer'}).click();
  await cart.getByText('Votre panier est encore vide.',{exact:false}).waitFor();
  await cart.getByRole('button',{name:'Fermer le panier'}).click();
  await page.getByRole('button',{name:'Ajouter au panier',exact:true}).click();
  await cart.getByRole('button',{name:'Passer commande'}).click();
  await page.waitForURL(checkoutUrl);
  assert.equal(await page.getByRole('heading',{name:'Shopify checkout fixture'}).count(),1);
  console.log('Mobile FR: questionnaire, fiche, ajout, +1, retrait, retour et navigation vers la caisse simulée.');

  for (const [prefix,language,track] of [['','fr','Suivre ma commande'],['/en','en','Track my order'],['/es','es','Seguir mi pedido']]) {
    await page.goto(local+prefix+'/soins/coffrets/');
    assert.equal(await page.locator('html').getAttribute('lang'),language);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('[aria-current=page]').getAttribute('href'),prefix+'/soins/coffrets/');
    assert.equal(await page.locator('.catalog-shop-grid .product-card').count(),4);
    const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(horizontal<=1,'overflow '+language+': '+horizontal);
    await page.goto(local+prefix+'/livraison/');
    await page.getByRole('link',{name:track,exact:true}).first().waitFor();
    assert.match(await page.locator('main').innerText(),/6[.,]99/);
    assert.doesNotMatch(await page.locator('main').innerText(),/France/);
  }
  await page.goto(local+'/products/serum-age-plus-1?lang=es&utm_source=test');
  await page.waitForURL('**/es/produit/serum-age-plus-1/?utm_source=test');
  await page.goto(local+'/#/soins/visage');
  await page.waitForURL('**/soins/visage/');
  await page.goto(local+'/en/#/marque');
  await page.waitForURL('**/en/marque/');
  assert.equal((await page.goto(local+'/products/does-not-exist')).status(),404);
  assert.match(await page.locator('main').innerText(),/introuvable/);
  console.log('FR/EN/ES, chemins réels, fragments, alias produit, paramètres et 404 vérifiés.');

  const failing=await browser.newContext(use);
  const failure={available:false,error:true,delay:900,quantities:new Map()};
  await fixture(failing,failure);
  const blocking=await failing.newPage();
  await blocking.goto(local+'/produit/serum-age-plus-1/');
  await blocking.getByText('Vérification du stock…',{exact:true}).waitFor();
  await blocking.getByText('Impossible de vérifier le stock. Réessayez.',{exact:true}).waitFor();
  assert.ok(!JSON.parse(await blocking.locator('#product-schema').textContent()).offers);
  failure.error=false;
  await blocking.getByRole('button',{name:'Réessayer',exact:true}).click();
  await blocking.getByRole('button',{name:'Rupture de stock',exact:true}).waitFor();
  assert.equal(await blocking.getByRole('button',{name:'Rupture de stock',exact:true}).isDisabled(),true);
  assert.equal(JSON.parse(await blocking.locator('#product-schema').textContent()).offers.availability,'https://schema.org/OutOfStock');
  assert.deepEqual(errors,[]);
  console.log('Chargement, erreur, nouvelle tentative et rupture distincts, données Product cohérentes.');

  for (const choice of ['reject','accept']) {
    const events=[];
    const trackCtx=await browser.newContext(use);
    await fixture(trackCtx,{available:true,quantities:new Map()});
    await trackCtx.exposeBinding('reportEvent',(_,event)=>events.push(event));
    await trackCtx.addInitScript(()=>{
      window.dataLayer=[];
      const push=window.dataLayer.push.bind(window.dataLayer);
      window.dataLayer.push=function(entry){if(entry?.[0]==='event') window.reportEvent(entry[1]);return push(entry);};
    });
    await trackCtx.route('https://www.cskinaesthetic.com/**',async route=>{
      const url=new URL(route.request().url());
      const data=await route.fetch({url:local+url.pathname+url.search});
      await route.fulfill({response:data});
    });
    await trackCtx.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:'',contentType:'text/javascript'}));
    const p=await trackCtx.newPage();
    await p.goto('https://www.cskinaesthetic.com/produit/serum-age-plus-1/');
    await p.locator('[data-analytics-choice='+choice+']').click();
    await p.getByRole('button',{name:'Ajouter au panier',exact:true}).click();
    const c=p.locator('#cart-dialog');
    await c.getByText('Sous-total',{exact:true}).waitFor();
    await c.getByRole('button',{name:'Passer commande'}).evaluate(target=>{target.click();target.click();});
    await p.waitForURL(checkoutUrl);
    const ecommerce=events.filter(name=>name==='add_to_cart'||name==='begin_checkout');
    assert.deepEqual(ecommerce,choice==='accept'?['add_to_cart','begin_checkout']:[]);
    await trackCtx.close();
  }
  console.log('GA4: 0 événement sans consentement ; un add_to_cart et un begin_checkout avec consentement malgré le double clic.');

  if (process.env.CSKIN_CAPTURE_BASELINE === '1') {
    const before=await browser.newContext(use);
    const baseline=await before.newPage();
    await baseline.goto('https://www.cskinaesthetic.com/?v=baseline-cskin-review');
    const preferences=baseline.locator('[data-analytics-choice=reject]');
    if(await preferences.isVisible()) await preferences.click();
    await baseline.locator('#campaign-title').waitFor();
    await baseline.screenshot({path:join(output,'cskin-before-home.png'),scale:'css'});
    await baseline.goto('https://www.cskinaesthetic.com/produit/serum-age-plus-1/');
    await baseline.locator('.product-order').scrollIntoViewIfNeeded();
    await baseline.screenshot({path:join(output,'cskin-before-product.png'),scale:'css'});
  }
} finally { await browser.close(); }
