/* Load optional motion only after the first page render. */
'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData === true;
  let loading;
  let lenis;

  function script(src) {
    return new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = src;
      element.async = true;
      element.onload = resolve;
      element.onerror = reject;
      document.head.append(element);
    });
  }

  async function activate() {
    if (reduced.matches || saveData) return;
    if (!loading) loading = (async () => {
      await script('assets/vendor/gsap.min.js');
      await script('assets/vendor/ScrollTrigger.min.js');
      await script('assets/vendor/lenis.min.js');
      await script('experience.js');
    })();
    try { await loading; } catch { return; }
    if (reduced.matches || saveData) return;
    window.refreshCSkinMotion?.();
    if (!lenis && window.Lenis) {
      lenis = new Lenis({
        autoRaf: true,
        autoToggle: true,
        stopInertiaOnNavigate: true,
        prevent: node => Boolean(node.closest('dialog[open]')),
      });
      lenis.on('scroll', () => window.ScrollTrigger?.update());
    }
  }

  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) requestIdleCallback(activate, { timeout: 1600 });
    else setTimeout(activate, 250);
  }, { once: true });
  reduced.addEventListener('change', event => {
    if (event.matches) {
      lenis?.destroy();
      lenis = undefined;
      window.refreshCSkinMotion?.();
    } else activate();
  });
})();
