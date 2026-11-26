import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const origin = 'https://www.cskinaesthetic.com';
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const context = { window: {} };
for (const file of ['products', 'translations', 'site-content', 'delivery']) {
  runInNewContext(readFileSync(join(dist, 'data', file + '.js'), 'utf8'), context);
}
const { CSKIN_PRODUCTS: products, CSKIN_TRANSLATIONS: dictionary, CSKIN_SITE_CONTENT: pages, CSKIN_DELIVERY: rates } = context.window;
const languages = ['fr', 'en', 'es'];
const translations = (source, lang) => dictionary[source]?.[lang] || source;
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pathIn = (path, lang) => (lang === 'fr' ? '' : '/' + lang) + path;
const productPath = id => '/produit/' + id + '/';
const imagePath = id => '/assets/editorial/marble/' + id + '.webp';
const tags = [
  ['Voir les soins', 'Explore skincare', 'Ver cuidados'],
  ['Mode d’emploi', 'How to use', 'Modo de empleo'],
  ['Suivre ma commande', 'Track my order', 'Seguir mi pedido'],
];
const write = (path, content) => {
  const file = join(dist, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};
const menu = ['/soins/', '/soins/visage/', '/soins/corps/', '/soins/coffrets/', '/marque/', '/livraison/'];
const titleFor = (route, i) => pages[route.replace(/\/$/, '')].title[i];
const links = (paths, lang, i) => '<ul>' + paths.map(path =>
  '<li><a href="' + pathIn(path, lang) + '">' + escape(titleFor(path, i)) + '</a></li>').join('') + '</ul>';

function productList(items, lang) {
  return '<ul>' + items.map(product => '<li><a href="' + pathIn(productPath(product.id), lang) + '">' +
    escape(translations(product.title, lang)) + '</a></li>').join('') + '</ul>';
}

function fallback(page, lang, i, product) {
  if (product) {
    const description = lang === 'fr' && product.id === 'serum-age-plus-1'
      ? product.sourceDescription.trim().split(/\n\s*\n/).map(line => '<p>' + escape(line.trim().replace(/\s+/g, ' ')) + '</p>').join('')
      : '<p>' + escape(translations(product.summary, lang)) + '</p>';
    return '<section class="section product-source"><h1>' + escape(translations(product.title, lang)) +
      '</h1><img width="380" height="570" src="' + imagePath(product.id) + '" alt="' + escape(translations(product.title, lang)) + '">' +
      description + '<h2>' + tags[1][i] + '</h2><p>' + escape(translations(product.usage, lang)) +
      '</p><p><a href="' + pathIn('/soins/', lang) + '">' + tags[0][i] + '</a></p></section>';
  }
  const pageData = pages[page];
  const heading = page === '/marque' ? 'Céline AB. · ' + pageData.title[i] : pageData.title[i];
  let content = '<section class="section product-source"><h1>' + escape(heading) + '</h1><p>' + escape(pageData.description[i]) + '</p>';
  if (page === 'home') content += links(menu, lang, i);
  if (page.startsWith('/soins')) {
    const category = page.split('/')[2];
    content += links(menu.slice(0, 4), lang, i) + productList(products.filter(product => !category || product.category === category), lang);
  }
  if (page === '/marque') {
    const founder = [
      'Formée en pharmacologie et physiologie en France, Céline a poursuivi son parcours auprès de professionnels du soin et s’est formée au Royaume-Uni auprès du CIBTAC.',
      'Céline studied pharmacology and physiology in France, worked with skincare professionals and trained with CIBTAC in the United Kingdom.',
      'Céline estudió farmacología y fisiología en Francia, trabajó con profesionales del cuidado de la piel y se formó con CIBTAC en el Reino Unido.',
    ];
    content += '<p>' + escape(founder[i]) + '</p><img width="380" height="380" src="/assets/editorial/celine-founder-cutout.png" alt="Céline AB.">' + links(['/soins/'], lang, i);
  }
  if (page === '/contact') content += '<a href="mailto:ab.frenchbeauty@gmail.com">ab.frenchbeauty@gmail.com</a>' + links(['/livraison/'], lang, i);
  if (page === '/livraison') {
    const rate = rates.ES;
    const amount = new Intl.NumberFormat(lang, { style: 'currency', currency: rate.currency });
    const info = [
      'Espagne · tarif standard de ' + amount.format(rate.cost) + ', offert dès ' + amount.format(rate.freeFrom) + '. Délai estimé de 3 à 5 jours ouvrés.',
      'Spain · standard delivery ' + amount.format(rate.cost) + ', free from ' + amount.format(rate.freeFrom) + '. Estimated 3 to 5 business days.',
      'España · envío estándar de ' + amount.format(rate.cost) + ', gratuito desde ' + amount.format(rate.freeFrom) + '. Plazo estimado de 3 a 5 días laborables.',
    ];
    content += '<p>' + escape(info[i]) + '</p><p><a href="https://shopify.com/101781537115/account">' + tags[2][i] + '</a></p>' + links(['/politiques/'], lang, i);
  }
  if (pageData.sections) {
    content += pageData.sections.map(({heading, body, products: ids}) =>
      '<h2>' + escape(heading[i]) + '</h2><p>' + escape(body[i]) + '</p>' +
      productList(ids.map(id => products.find(product => product.id === id)), lang)).join('');
  }
  return content + '</section>';
}

function localizeShell(html, lang) {
  return html.replace(/(<(?:a|button|label|span|p)\b[^>]*>)([^<>]+)(<\/(?:a|button|label|span|p)>)/g, (match, open, content, close) => {
    if (open.includes('data-i18n-ignore')) return match;
    const phrase = content.trim();
    const translation = dictionary[phrase]?.[lang];
    return translation ? open + content.replace(phrase, escape(translation)) + close : match;
  });
}

function renderPage(route, product, lang, i) {
  const page = route === '/' ? 'home' : route.slice(0, -1);
  const path = pathIn(route, lang);
  const url = origin + path;
  const title = product ? translations(product.title, lang) : pages[page].title[i];
  const description = product ? translations(product.summary, lang) : pages[page].description[i];
  const fullTitle = (route === '/' ? title : title + ' — Cskin Aesthetic');
  const alternates = [...languages.map(language => [language, pathIn(route, language)]), ['x-default', route]]
    .map(([language, target]) => '  <link rel="alternate" hreflang="' + language + '" href="' + origin + target + '">');
  const image = origin + (product ? imagePath(product.id) : '/assets/campaign/hero-omni-desktop.jpg');
  let schema = '';
  if (product) {
    schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: title, description,
      image: [image], url, brand: { '@type': 'Brand', name: 'Cskin Aesthetic' },
    }).replace(/</g, '\\u003c');
  }
  let html = template.replace(/<html lang="[^"]+"[^>]*>/, '<html lang="' + lang + '">')
    .replace(/^\s*<link rel="alternate" hreflang="[^"]+"[^>\n]*>\n/gm, '\n')
    .replace(/<link rel="canonical" href="[^"]+">/, '<link rel="canonical" href="' + url + '">\n' + alternates.join('\n'))
    .replace(/<title>[^<]+<\/title>/, '<title>' + escape(fullTitle) + '</title>')
    .replace(/(<meta name="description" content=")[^"]+/, '$1' + escape(description))
    .replace(/(<meta property="og:type" content=")[^"]+/, '$1' + (product ? 'product' : 'website'))
    .replace(/(<meta property="og:url" content=")[^"]+/, '$1' + url)
    .replace(/(<meta (?:property="og|name="twitter):title" content=")[^"]+/g, '$1' + escape(fullTitle))
    .replace(/(<meta (?:property="og|name="twitter):description" content=")[^"]+/g, '$1' + escape(description))
    .replace(/(<meta (?:property="og|name="twitter):image" content=")[^"]+/g, '$1' + image)
    .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/, () =>
      '<main id="main" tabindex="-1">' + fallback(page, lang, i, product) + '</main>');
  if (schema) html = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/,
    () => '<script id="product-schema" type="application/ld+json">' + schema + '</script>');
  else if (route !== '/') html = html.replace(/\s*<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/, '');
  if (path !== '/') html = html.replace(/^\s*<meta name="google-site-verification"[^>\n]*>\n/m, '\n');
  html = html.replace(/(<a class="skip-link" href=")[^"]*/, '$1' + path + '#main');
  if (lang !== 'fr') {
    html = localizeShell(html, lang);
    html = html.replace(/(<a\b[^>]*\bhref=")(\/(?:soins(?:\/[^"#]*)?|marque\/|contact\/|livraison\/|politiques\/|guides\/[^"#]+|produit\/[^"#]+)?)"/g,
      (_, start, target) => start + pathIn(target, lang) + '"');
  }
  write(path + 'index.html', html);
}

const routes = [
  { path: '/' }, ...Object.keys(pages).filter(page => page !== 'home').map(page => ({ path: page + '/' })),
  ...products.map(product => ({ path: productPath(product.id), product })),
];
for (const {path, product} of routes) {
  if (product && !/^[a-z0-9-]+$/.test(product.id)) throw new Error('Invalid product slug: ' + product.id);
  languages.forEach((lang, i) => renderPage(path, product, lang, i));
}
write('404.html', template.replace(/<meta name="robots" content="[^"]+">/, '<meta name="robots" content="noindex, follow">')
  .replace(/^\s*<link rel="(?:canonical|alternate)"[^>\n]*>\n/gm, '\n')
  .replace(/<title>[^<]+<\/title>/, '<title>Page introuvable — Cskin Aesthetic</title>')
  .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/, '<main id="main" tabindex="-1"><section class="section"><h1>Page introuvable.</h1><a href="/soins/">Voir les soins</a></section></main>'));

const oldCollections = JSON.parse(readFileSync(join(root, 'docs', 'legacy-collections.json'), 'utf8'));
const legacy = Object.fromEntries([
  ...products.map(p => ['/products/' + p.id, productPath(p.id)]),
  ...Object.entries(oldCollections).map(([id, target]) => ['/collections/' + id, target]),
  ['/products', '/soins/'], ['/collections', '/soins/'], ['/pages/la-marque', '/marque/'], ['/pages/contact', '/contact/'],
]);
const redirects = [];
for (const [from, target] of Object.entries(legacy)) {
  for (const language of ['', 'fr', 'en', 'es']) {
    const oldPath = language ? '/' + language + from : from;
    const destination = pathIn(target, language || 'fr');
    const url = origin + destination;
    const identified = JSON.stringify(destination);
    const html = '<!doctype html>\n<html lang="' + (language || 'fr') + '"><meta charset="utf-8"><meta name="robots" content="noindex, follow">' +
      '<title>Cskin Aesthetic</title><link rel="canonical" href="' + url + '"><meta http-equiv="refresh" content="0;url=' + destination + '">' +
      '<script>const u=new URL(' + identified + ',location.origin);const q=new URLSearchParams(location.search);' +
      'const language=q.get("lang");if(["fr","en","es"].includes(language)){u.pathname=u.pathname.replace(/^\\/(en|es)(?=\\/)/,"");if(language!=="fr")u.pathname="/"+language+u.pathname;q.delete("lang");}' +
      'u.search=q;location.replace(u);</script><body><p><a href="' + destination + '">Cskin Aesthetic</a></p></body></html>\n';
    write(oldPath + '/index.html', html);
    redirects.push([oldPath, url, '301']);
    redirects.push([oldPath + '/', url, '301']);
  }
}
writeFileSync(join(root, 'docs', 'legacy-redirects.csv'), 'old_path,new_url,desired_status\n' + redirects.map(row => row.join(',')).join('\n') + '\n');

const urls = routes.flatMap(({path}) => languages.map(lang => '  <url><loc>' + origin + pathIn(path, lang) + '</loc></url>'));
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n');
console.log(urls.length + ' pages indexables, ' + redirects.length / 2 + ' anciennes routes récupérées.');
