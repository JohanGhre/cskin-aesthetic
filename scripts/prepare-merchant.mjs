import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const origin = 'https://www.cskinaesthetic.com';
const sandbox = { window: {} };
for (const file of ['shopify-config.js', 'data/products.js', 'data/translations.js']) {
  runInNewContext(readFileSync(join(dist, file), 'utf8'), sandbox);
}
const { CSKIN_SHOPIFY: shop, CSKIN_PRODUCTS: products, CSKIN_TRANSLATIONS: translations } = sandbox.window;

const query = 'query($language:LanguageCode!,$country:CountryCode!) @inContext(language:$language,country:$country) {' +
  ' localization { country { isoCode } language { isoCode } availableCountries { isoCode } }' +
  ' products(first:100) { pageInfo { hasNextPage } nodes { id handle title vendor descriptionHtml availableForSale' +
  ' images(first:11) { nodes { url width height } } variants(first:2) { nodes { id sku barcode availableForSale price { amount currencyCode } } } } } }';
async function catalog(country, language) {
  const url = 'https://' + shop.domain + '/api/' + shop.apiVersion + '/graphql.json';
  const response = await fetch(url, {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': shop.publicAccessToken },
    body: JSON.stringify({ query, variables: { country, language } }),
  });
  if (!response.ok) throw new Error('Unable to read Shopify: HTTP ' + response.status);
  const result = await response.json();
  if (result.errors?.length || result.data?.products.pageInfo.hasNextPage) throw new Error('Incomplete Shopify catalog');
  return result.data;
}

function textFor(product, field, language) {
  const value = product[field];
  return translations[value]?.[language] || value;
}

function fitImages(p) {
  const unique = new Map();
  for (const {url, width, height} of p.images.nodes) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !width || !height) continue;
    if (!unique.has(parsed.pathname)) unique.set(parsed.pathname, { url, width, height });
  }
  return [...unique.values()];
}

const csv = row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(',');
const suppliedPhotos = { 'duo-pack-anti-aging-day-night': [origin + '/assets/campaign/day-night-hands.jpg'] };
const header = ['country', 'language', 'shopify_product_id', 'shopify_variant_id', 'link', 'title', 'description', 'price',
  'availability', 'brand', 'condition', 'image_link', 'additional_image_link', 'gtin_candidate', 'mpn_candidate', 'source_state'];
const results = await Promise.all([catalog('ES', 'ES'), catalog('FR', 'FR')]);
const date = new Date().toISOString();
const output = new URL('../docs/merchant/', import.meta.url);
mkdirSync(output, { recursive: true });
for (const [index, [country, lang]] of [['ES', 'es'], ['FR', 'fr']].entries()) {
  const result = results[index];
  const validMarket = result.localization.availableCountries.some(value => value.isoCode === country)
    && result.localization.country.isoCode === country;
  const rows = [];
  for (const p of products) {
    const match = result.products.nodes.find(item => item.handle === p.id);
    const variant = match?.variants.nodes.length === 1 ? match.variants.nodes[0] : null;
    const { amount, currencyCode } = variant?.price || {};
    const eligible = validMarket && variant && amount && currencyCode === 'EUR';
    const images = match ? fitImages(match) : [];
    const primary = images[0];
    const secondary = [...new Set([...images.slice(1).map(image => image.url), ...(suppliedPhotos[p.id] || [])])];
    const status = !validMarket ? 'market_unconfirmed' : !eligible ? 'needs_product_check' : 'verify_in_existing_merchant_source';
    rows.push([country, lang, match?.id.split('/').at(-1), variant?.id.split('/').at(-1),
      origin + (lang === 'fr' ? '' : '/' + lang) + '/produit/' + p.id + '/',
      textFor(p, 'title', lang), textFor(p, 'summary', lang),
      eligible ? Number(amount).toFixed(2) + ' ' + currencyCode : '',
      eligible ? (match.availableForSale && variant.availableForSale ? 'in_stock' : 'out_of_stock') : '',
      match?.vendor, 'new', primary?.url, secondary.join(','), variant?.barcode, variant?.sku, status]);
  }
  const report = [header, ...rows].map(csv).join('\n') + '\n';
  writeFileSync(new URL(country.toLowerCase() + '-controle.csv', output), report);
  console.log(JSON.stringify({
    country, requestedLanguage: lang, responseLanguage: result.localization.language.isoCode,
    validMarket, snapshotAt: date, products: rows.length,
    images: ['serum-age-plus-1', 'mousse-nettoyante-a-lacide-glycolique', 'duo-pack-anti-aging-day-night'].map(handle => {
      const match = result.products.nodes.find(item => item.handle === handle);
      return { handle, photos: match ? fitImages(match).map(({width, height}) => [width, height]) : [],
        serumPhrasePresent: handle === 'serum-age-plus-1' ? /botox|bótox/i.test(match?.descriptionHtml || '') : undefined };
    }),
  }));
}
