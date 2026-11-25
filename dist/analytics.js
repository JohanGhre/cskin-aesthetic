/* Optional storefront measurement. Shopify remains the source for confirmed orders. */
(() => {
  const id = document.querySelector('meta[name="cskin-ga4"]')?.content;
  if (!/^G-[A-Z0-9]+$/.test(id || '') || location.hostname !== 'www.cskinaesthetic.com') return;

  const preferenceKey = 'cskin-analytics-consent';
  const panel = document.querySelector('#analytics-preferences');
  const settings = document.querySelector('#analytics-settings');
  let preference;
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) || 'null');
    if (saved && Date.now() - saved.time < 180 * 86400000) preference = saved.value;
  } catch {}
  let initialized = false;

  function initialize() {
    window['ga-disable-' + id] = false;
    if (initialized) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    initialized = true;
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    window.dataLayer ||= [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: '',
    });
    document.head.append(tag);
    pageView();
  }

  function choose(value) {
    preference = value;
    try { localStorage.setItem(preferenceKey, JSON.stringify({ value, time: Date.now() })); } catch {}
    if (value === 'accept') initialize();
    else {
      window['ga-disable-' + id] = true;
      if (initialized) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', '; Domain=www.cskinaesthetic.com', '; Domain=.cskinaesthetic.com']) {
          document.cookie = name + '=; Max-Age=0; Path=/' + domain + '; SameSite=Lax; Secure';
        }
      }
    }
    panel.hidden = true;
    settings.focus();
  }

  settings.hidden = false;
  settings.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector('button').focus();
  });
  panel.querySelector('[data-analytics-choice="reject"]').addEventListener('click', () => choose('reject'));
  panel.querySelector('[data-analytics-choice="accept"]').addEventListener('click', () => choose('accept'));
  if (preference === 'accept') initialize();
  else if (preference !== 'reject') panel.hidden = false;

  function pageView() {
    if (preference !== 'accept' || !initialized) return;
    const route = location.hash.startsWith('#/') ? location.hash.slice(1) : location.pathname;
    window.gtag('event', 'page_view', {
      send_to: id, page_location: location.origin + route, page_title: document.title,
    });
  }
  window.addEventListener('hashchange', pageView);

  function record(event, lines) {
    if (preference !== 'accept' || !lines.length) return;
    const items = lines.map(line => ({
      item_id: line.id, item_name: line.title, price: line.unit, quantity: line.qty,
    }));
    window.gtag('event', event, {
      send_to: id,
      currency: lines[0].currency,
      value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items,
    });
  }

  window.CSkinAnalytics = {
    added: lines => record('add_to_cart', lines),
    checkout: lines => record('begin_checkout', lines),
  };
})();
