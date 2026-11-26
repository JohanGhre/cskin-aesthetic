import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const origin = 'https://www.cskinaesthetic.com';
const dist = join(import.meta.dirname, '../dist');
const source = path => readFileSync(join(dist, path), 'utf8');
const routeHTML = url => source(new URL(url).pathname + 'index.html');

test('all sitemap URLs have initial content and reciprocal localized canonicals', () => {
  const sitemap = source('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  const published = new Set(urls);
  assert.equal(urls.length, published.size);
  assert.ok(urls.includes(origin + '/es/produit/serum-age-plus-1/'));
  assert.ok(urls.includes(origin + '/en/soins/coffrets/'));
  assert.ok(urls.includes(origin + '/guides/textures/'));
  for (const url of urls) {
    const html = routeHTML(url);
    const lang = /^\/(en|es)(?:\/|$)/.exec(new URL(url).pathname)?.[1] || 'fr';
    assert.match(html, /<base href="\/">/, url);
    assert.ok(html.includes('<html lang="' + lang + '">'), url);
    assert.ok(html.includes('<link rel="canonical" href="' + url + '">'), url);
    assert.match(html, /<meta name="description" content="[^"]+">/, url);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, url);
    const alternates = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.deepEqual(alternates.map(match=>match[1]), ['fr','en','es','x-default'], url);
    for (const [,language,target] of alternates) {
      assert.ok(published.has(target), target);
      if (language === lang) assert.equal(target, url);
      assert.ok(routeHTML(target).includes('hreflang="' + lang + '" href="' + url + '"'), target);
    }
  }
});

test('legacy routes recover the correct destination and remain out of the sitemap', () => {
  const sitemap = source('sitemap.xml');
  const rows = readFileSync(join(import.meta.dirname, '../docs/legacy-redirects.csv'),'utf8').trim().split('\n').slice(1);
  assert.equal(rows.length, new Set(rows).size);
  for (const line of rows) {
    const [old, destination, desiredStatus] = line.split(',');
    assert.equal(desiredStatus, '301');
    if (!old.endsWith('/')) continue;
    assert.ok(!sitemap.includes('<loc>' + origin + old + '</loc>'));
    assert.ok(sitemap.includes('<loc>' + destination + '</loc>'));
    const html = source(old + 'index.html');
    assert.match(html,/content="noindex, follow"/);
    assert.ok(html.includes('href="' + destination + '"'));
  }
  assert.match(source('404.html'),/Page introuvable/);
  assert.match(source('404.html'),/content="noindex, follow"/);
  assert.doesNotMatch(source('404.html'),/rel="canonical"/);
});

test('no product schema invents offers or reviews in the static HTML, and the serum clause is clean', () => {
  const context={window:{}};
  runInNewContext(source('data/products.js'),context);
  const serum=context.window.CSKIN_PRODUCTS.find(p=>p.id==='serum-age-plus-1');
  assert.doesNotMatch(serum.sourceDescription,/botox|bótox/i);
  assert.match(serum.sourceDescription,/pour lisser les rides d'expression/);
  for (const product of context.window.CSKIN_PRODUCTS) {
    const html = source('/produit/' + product.id + '/index.html');
    const raw = /<script id="product-schema" type="application\/ld\+json">([^<]+)<\/script>/.exec(html)?.[1];
    assert.ok(raw, product.id);
    const data = JSON.parse(raw);
    assert.equal(data['@type'], 'Product');
    assert.equal(data.url, origin + '/produit/' + product.id + '/');
    assert.ok(!data.offers && !data.aggregateRating);
  }
});
