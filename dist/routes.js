(() => {
  const languages = ['fr', 'en', 'es'];
  function split(path) {
    const match = /^\/(fr|en|es)(?=\/|$)/.exec(path);
    return { language: match?.[1], route: (match ? path.slice(match[0].length) : path).replace(/\/+$/, '') || '/' };
  }
  function href(route, language = 'fr') {
    const path = split(route).route;
    return (language === 'en' || language === 'es' ? '/' + language : '') + (path === '/' ? '/' : path + '/');
  }
  function currentLanguage() {
    const url = new URL(location.href);
    const requested = url.searchParams.get('lang');
    return (languages.includes(requested) ? requested : split(url.pathname).language) || 'fr';
  }
  function normalize() {
    const url = new URL(location.href);
    const fragment = url.hash.startsWith('#/') ? url.hash.slice(1).replace(/\/+$/, '') || '/' : null;
    const queryLanguage = url.searchParams.get('lang');
    if (!fragment && !languages.includes(queryLanguage)) return false;
    const path = fragment || split(url.pathname).route;
    if (!/^\/(?:$|(?:soins(?:\/(?:visage|corps|coffrets))?|produit\/[a-z0-9-]+|marque|contact|livraison|politiques(?:\/[a-z0-9-]+)?|guides\/[a-z0-9-]+)$)/.test(path)) return false;
    const legacyPolicy = /^\/politiques\/.+/.test(path);
    const language = currentLanguage();
    url.pathname = href(legacyPolicy ? '/politiques' : path, language);
    url.searchParams.delete('lang');
    if (fragment && !legacyPolicy) url.hash = '';
    if (url.href === location.href) return false;
    if (url.pathname === location.pathname) {
      history.replaceState(history.state, '', url);
      return false;
    }
    location.replace(url.href);
    return true;
  }
  window.CSkinRoutes = { languages, split, href, currentLanguage, normalize };
})();
