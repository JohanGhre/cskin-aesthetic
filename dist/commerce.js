/* Shopify Storefront only. Never use an Admin or private token in this browser module. */
(function (root) {
  'use strict';
  const cartFields = `id totalQuantity checkoutUrl cost { subtotalAmount { amount currencyCode } }
    lines(first:100) { pageInfo { hasNextPage } nodes { id quantity
      cost { totalAmount { amount currencyCode } amountPerQuantity { amount currencyCode } }
      merchandise { ... on ProductVariant { id title availableForSale product { handle title } } }
    } }`;
  class CommerceError extends Error {
    constructor(code) { super(code); this.name = 'CommerceError'; this.code = code; }
  }
  function create(config, options = {}) {
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(config.domain || '') ||
        !/^\d{4}-(01|04|07|10)$/.test(config.apiVersion || '') || !config.publicAccessToken) {
      throw new CommerceError('configuration');
    }
    const fetcher = options.fetch || root.fetch.bind(root);
    const storage = options.storage;
    const language = options.language || (() => 'FR');
    const key = `cskin-shopify-cart:${config.domain}`;
    const listeners = new Set();
    let state = { status: 'idle', busy: false, products: {}, cart: null, notice: '' };
    let queue = Promise.resolve();
    let savedId;
    try { savedId = storage?.getItem(key); } catch {}
    const read = () => JSON.parse(JSON.stringify(state));
    const emit = () => listeners.forEach(fn => fn(read()));
    const persist = id => {
      savedId = id || null;
      try { if (id) storage?.setItem(key, id); else storage?.removeItem(key); } catch {}
    };
    async function request(query, variables = {}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetcher(`https://${config.domain}/api/${config.apiVersion}/graphql.json`, {
          method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': config.publicAccessToken },
          body: JSON.stringify({ query, variables: { ...variables, language: ['FR','EN','ES'].includes(language()) ? language() : 'FR' } }),
        });
        if (!response.ok) throw new CommerceError('connection');
        const result = await response.json();
        if (result.errors?.length || !result.data) throw new CommerceError('connection');
        return result.data;
      } catch (error) {
        throw error instanceof CommerceError ? error : new CommerceError('connection');
      } finally { clearTimeout(timeout); }
    }
    function acceptCart(cart) {
      if (!cart) { persist(null); state.cart = null; return; }
      if (cart.lines.pageInfo.hasNextPage) throw new CommerceError('cart-too-large');
      const lines = cart.lines.nodes.map(line => {
        const variant = line.merchandise;
        if (!variant?.product || !Number.isInteger(line.quantity)) throw new CommerceError('cart-invalid');
        return { id: variant.product.handle, lineId: line.id, variantId: variant.id,
          title: variant.product.title, qty: line.quantity, available: variant.availableForSale,
          total: Number(line.cost.totalAmount.amount), unit: Number(line.cost.amountPerQuantity.amount),
          currency: line.cost.totalAmount.currencyCode };
      });
      const subtotal = Number(cart.cost.subtotalAmount.amount);
      if (!Number.isFinite(subtotal) || lines.some(l => !Number.isFinite(l.total))) throw new CommerceError('cart-invalid');
      state.cart = { id: cart.id, lines, count: cart.totalQuantity, subtotal,
        currency: cart.cost.subtotalAmount.currencyCode, checkoutUrl: cart.checkoutUrl };
      persist(cart.id);
    }
    async function getCart() {
      if (!savedId) { state.cart = null; return; }
      const data = await request(`query Cart($id:ID!,$language:LanguageCode!) @inContext(language:$language) { cart(id:$id) { ${cartFields} } }`, {id:savedId});
      acceptCart(data.cart);
    }
    async function catalog() {
      const data = await request(`query Catalog($language:LanguageCode!) @inContext(language:$language) {
        products(first:100) { pageInfo { hasNextPage } nodes { id handle availableForSale
          variants(first:2) { nodes { id availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } } }
        } }
      }`);
      if (data.products.pageInfo.hasNextPage) throw new CommerceError('catalog-too-large');
      state.products = Object.fromEntries(data.products.nodes.map(product => {
        const variant = product.variants.nodes[0];
        const supported = product.variants.nodes.length === 1 && variant;
        return [product.handle, { variantId: supported ? variant.id : null,
          available: Boolean(supported && product.availableForSale && variant.availableForSale),
          price: variant ? Number(variant.price.amount) : null,
          compare: variant?.compareAtPrice ? Number(variant.compareAtPrice.amount) : null,
          currency: variant?.price.currencyCode }];
      }));
    }
    function enqueue(operation) {
      const task = queue.then(async () => {
        state.busy = true; state.notice = ''; emit();
        try { return await operation(); }
        finally { state.busy = false; emit(); }
      });
      queue = task.catch(() => {});
      return task;
    }
    async function mutate(name, declarations, argumentsText, variables) {
      const data = await request(`mutation UpdateCart(${declarations},$language:LanguageCode!) @inContext(language:$language) {
        ${name}(${argumentsText}) { cart { ${cartFields} } userErrors { code message } warnings { code message } }
      }`, variables);
      const payload = data[name];
      if (payload.cart) acceptCart(payload.cart);
      if (payload.userErrors?.length) {
        const stale = payload.userErrors.some(e => e.code === 'CART_NOT_FOUND' || /cart.*(not found|does not exist)/i.test(e.message));
        if (stale) { acceptCart(null); throw new CommerceError('cart-expired'); }
        throw new CommerceError('quantity');
      }
      if (!payload.cart) throw new CommerceError('connection');
      if (payload.warnings?.length) state.notice = 'quantity';
    }
    function requireReady() { if (state.status !== 'ready') throw new CommerceError('connection'); }
    function validQuantity(qty, zero = false) {
      if (!Number.isInteger(qty) || qty < (zero ? 0 : 1) || qty > 20) throw new CommerceError('quantity');
    }
    const api = {
      getState: read,
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      init() {
        return enqueue(async () => {
          state.status = 'loading'; emit();
          try { await catalog(); await getCart(); state.status = 'ready'; }
          catch (error) { state.status = 'error'; throw error; }
        });
      },
      refresh() { return enqueue(async () => { requireReady(); await getCart(); }); },
      addItems(items) {
        return enqueue(async () => {
          requireReady();
          const combined = new Map();
          for (const {id, qty} of items) { validQuantity(qty); combined.set(id, (combined.get(id) || 0) + qty); }
          const lines = [...combined].map(([id, qty]) => {
            const product = state.products[id];
            if (!product?.available || !product.variantId) throw new CommerceError('unavailable');
            const existing = state.cart?.lines.find(l => l.id === id)?.qty || 0;
            validQuantity(qty + existing);
            return {merchandiseId:product.variantId, quantity:qty};
          });
          if (!lines.length) return;
          if (!state.cart) {
            await mutate('cartCreate', '$input:CartInput!', 'input:$input', {input:{lines,attributes:[{key:'storefront',value:'cskin-site-sur-mesure'}]}});
          } else {
            await mutate('cartLinesAdd', '$cartId:ID!,$lines:[CartLineInput!]!', 'cartId:$cartId,lines:$lines', {cartId:state.cart.id,lines});
          }
        });
      },
      changeQuantity(id, change) {
        return enqueue(async () => {
          requireReady();
          const line = state.cart?.lines.find(l => l.id === id);
          if (!line) throw new CommerceError('cart-expired');
          const qty = change === 'remove' ? 0 : line.qty + change;
          validQuantity(qty,true);
          if (!qty) await mutate('cartLinesRemove','$cartId:ID!,$lineIds:[ID!]!','cartId:$cartId,lineIds:$lineIds',{cartId:state.cart.id,lineIds:[line.lineId]});
          else await mutate('cartLinesUpdate','$cartId:ID!,$lines:[CartLineUpdateInput!]!','cartId:$cartId,lines:$lines',{cartId:state.cart.id,lines:[{id:line.lineId,quantity:qty}]});
        });
      },
      checkout() {
        return enqueue(async () => {
          requireReady(); await getCart();
          if (!state.cart?.lines.length) throw new CommerceError('cart-expired');
          if (state.cart.lines.some(l => !l.available)) throw new CommerceError('unavailable');
          let url;
          try { url = new URL(state.cart.checkoutUrl); } catch { throw new CommerceError('checkout'); }
          const hosts = [config.domain, 'cskinaesthetic.com', 'www.cskinaesthetic.com', 'checkout.cskinaesthetic.com', 'checkout.shopify.com'];
          if (url.protocol !== 'https:' || !hosts.includes(url.hostname)) throw new CommerceError('checkout');
          return url.href;
        });
      },
    };
    return api;
  }
  root.CSkinCommerce = {create, CommerceError};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CSkinCommerce;
})(typeof window !== 'undefined' ? window : globalThis);
