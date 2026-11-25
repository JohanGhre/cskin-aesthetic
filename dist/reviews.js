/* Only a Judge.me Public API Token belongs in this browser integration. */
(() => {
  const settings = window.CSKIN_REVIEWS;
  const started = new WeakSet();
  const phrases = {
    fr: ['Avis clients', 'Donner mon avis', 'Aucun avis publié pour ce soin.', 'Les avis sont momentanément indisponibles.', 'sur', 'avis'],
    en: ['Customer reviews', 'Write a review', 'There are no published reviews for this product yet.', 'Reviews are temporarily unavailable.', 'out of', 'reviews'],
    es: ['Opiniones de clientes', 'Escribir una opinión', 'Aún no hay opiniones publicadas para este producto.', 'Las opiniones no están disponibles en este momento.', 'de', 'opiniones'],
  };
  const language = () => window.CSkinI18n?.language || 'fr';

  function reviewLink(productId) {
    try {
      const url = new URL(settings.formUrl);
      if (url.origin !== 'https://judge.me' || !/^\/product_reviews\/[a-f0-9-]+\/new\/?$/i.test(url.pathname)) return null;
      url.searchParams.set('id', productId);
      url.searchParams.set('source', 'shareable-link');
      url.searchParams.set('template_locale', language());
      return url;
    } catch {
      return null;
    }
  }

  function append(node, tagName, text, className) {
    const child = document.createElement(tagName);
    child.textContent = text;
    if (className) child.className = className;
    node.append(child);
    return child;
  }

  function mount(root) {
    if (!settings?.publicToken) return;
    const section = root.querySelector('[data-product-reviews]');
    if (!section || started.has(section)) return;
    const handle = section.dataset.productReviews;
    const productId = settings.productIds?.[handle];
    if (!/^\d+$/.test(productId)) return;
    const url = reviewLink(productId);
    if (!url) return;
    started.add(section);
    const [heading, write, empty, unavailable, outOf, reviewsLabel] = phrases[language()] || phrases.fr;
    section.hidden = false;
    append(section, 'h2', heading).id = 'product-reviews-title';
    const link = append(section, 'a', write, 'campaign-link');
    link.href = url.href;
    const status = append(section, 'p', '');
    status.setAttribute('role', 'status');
    loadReviews(section, status, { handle, productId, empty, unavailable, outOf, reviewsLabel });
  }

  async function loadReviews(section, status, labels) {
    try {
      const endpoint = new URL('https://cdn.judge.me/api/v1/widgets/product_review');
      endpoint.search = new URLSearchParams({
        shop_domain: settings.shopDomain, api_token: settings.publicToken, handle: labels.handle, per_page: '20',
      });
      const response = await fetch(endpoint, {
        credentials: 'omit', signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) throw new Error('Review widget unavailable');
      const { product_external_id, widget } = await response.json();
      if (String(product_external_id) !== labels.productId || typeof widget !== 'string') {
        throw new Error('Review widget does not match the product');
      }
      const template = document.createElement('template');
      template.innerHTML = widget;
      const source = template.content;
      const summary = source.querySelector('.jdgm-rev-widg');
      const count = Number(summary?.dataset.numberOfReviews);
      const average = Number(summary?.dataset.averageRating);
      const items = [...source.querySelectorAll('.jdgm-rev')];
      if (count === 0 || (!items.length && !widget.trim())) {
        status.textContent = labels.empty;
        return;
      }
      if (!items.length) throw new Error('Review widget content unavailable');
      if (count > 0 && average >= 1 && average <= 5) {
        status.textContent = new Intl.NumberFormat(language(), { maximumFractionDigits: 1 }).format(average)
          + ' ' + labels.outOf + ' 5 · ' + count + ' ' + labels.reviewsLabel;
      }
      const list = append(section, 'ul', '', 'product-reviews-list');
      for (const item of items) {
        const score = Number(item.querySelector('.jdgm-rev__rating')?.dataset.score);
        const body = item.querySelector('.jdgm-rev__body')?.textContent.trim();
        if (!Number.isInteger(score) || score < 1 || score > 5) continue;
        const row = append(list, 'li', '');
        const stars = append(row, 'span', '★'.repeat(score) + '☆'.repeat(5 - score), 'product-review-stars');
        stars.setAttribute('aria-label', score + ' ' + labels.outOf + ' 5');
        const author = item.querySelector('.jdgm-rev__author')?.textContent.trim();
        if (author) append(row, 'strong', author);
        const title = item.querySelector('.jdgm-rev__title')?.textContent.trim();
        if (title) append(row, 'h3', title);
        if (body) append(row, 'p', body);
      }
      if (!list.children.length) throw new Error('No displayable reviews');
    } catch {
      status.textContent = labels.unavailable;
    }
  }

  window.CSkinReviews = { mount };
})();
