/* Optional storefront measurement. Shopify remains the source for confirmed orders. */
(() => {
  const id = document.querySelector('meta[name="cskin-ga4"]')?.content;
  if (!/^G-[A-Z0-9]+$/.test(id || '') || location.hostname !== 'www.cskinaesthetic.com') return;

  const preferenceKey = 'cskin-analytics-consent';
  const panel = document.querySelector('#analytics-preferences');
  const settings = document.querySelector('#analytics-settings');
  let preference;
  try { preference = localStorage.getItem(preferenceKey); } catch {}
  let initialized = false;

  function initialize() {
    window['ga-disable-' + id] = false;
    if (initialized) return;
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
  }

  function choose(value) {
    preference = value;
    try { localStorage.setItem(preferenceKey, value); } catch {}
    if (value === 'accept') initialize();
    else window['ga-disable-' + id] = true;
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
