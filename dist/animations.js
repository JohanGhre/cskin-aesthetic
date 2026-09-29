/* Calm editorial motion. Native video playback; GSAP + ScrollTrigger only. */
'use strict';
window.CSkinMotion = (() => {
  let media, imageReveal, filmCleanup, filmToggle;
  let filmUserPaused = false;

  function destroy() {
    filmCleanup?.();
    imageReveal?.revert();
    media?.revert();
    filmCleanup = filmToggle = imageReveal = media = undefined;
  }

  function setupFilm(root, paused) {
    const video = root.querySelector('#serum-film');
    const button = root.querySelector('[data-action="film"]');
    if (!video || !button) return;
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionPreference.matches;
    const saveData = navigator.connection?.saveData === true;
    const label = button.querySelector('.film-control-label');
    const icon = button.querySelector('.film-control-icon');
    let visible = false, disposed = false, manualPlay = false;
    const sync = () => {
      const playing = !video.paused;
      button.disabled = paused || reduced;
      button.setAttribute('aria-pressed', String(playing));
      label.textContent = reduced ? 'Image fixe · mouvement réduit' : paused
        ? 'Film en pause' : playing ? 'Mettre le film en pause' : 'Lire le film';
      icon.textContent = playing ? 'Ⅱ' : '▷';
    };
    const screenPreference = matchMedia('(max-width: 782px)');
    const load = () => {
      const mobile = screenPreference.matches;
      const source = mobile ? video.dataset.mobileSrc : video.dataset.desktopSrc;
      // Upgrade when a narrow preview becomes desktop; never downgrade an already loaded desktop film.
      if (video.hasAttribute('src') && (mobile || video.src.endsWith(source))) return;
      video.src = source;
      video.load();
    };
    const update = () => {
      if (disposed) return;
      const allowed = !reduced && !paused && !filmUserPaused && (!saveData || manualPlay);
      if (allowed && visible && !document.hidden) {
        load();
        video.play().catch(() => { if (!disposed) sync(); });
      } else video.pause();
      sync();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
      update();
    }, { threshold: 0.15 });
    video.muted = true;
    // The landing background is critical media; load it immediately unless motion/data preferences prevent it.
    if (video.dataset.priority === 'hero' && !reduced && !paused && !filmUserPaused && !saveData && !document.hidden) load();
    observer.observe(video);
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    document.addEventListener('visibilitychange', update);
    screenPreference.addEventListener?.('change', update);
    const onMotionChange = event => { reduced = event.matches; update(); };
    motionPreference.addEventListener?.('change', onMotionChange);
    filmToggle = () => {
      if (reduced || paused) return;
      filmUserPaused = !video.paused;
      manualPlay = true;
      update();
    };
    sync();
    filmCleanup = () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      screenPreference.removeEventListener?.('change', update);
      motionPreference.removeEventListener?.('change', onMotionChange);
      video.removeEventListener('play', sync);
      video.removeEventListener('pause', sync);
      video.pause();
    };
  }

  function setupHeroFilm(root, desktop) {
    const video = root.querySelector('.hero-film video');
    if (!video || !desktop) return;
    // Subtle depth between the film and the copy, using composited properties only.
    gsap.to(video, {
      y: -24, scale: 1.02, ease: 'none',
      scrollTrigger: { id: 'cskin-film', trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
    gsap.to(root.querySelector('.hero-copy'), {
      y: -9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  }

  function setupSectionReveals(root) {
    ['.selection-heading', '.philosophy-top', '.founder-quote'].forEach(selector => {
      const target = root.querySelector(selector);
      if (!target) return;
      gsap.fromTo(target, { y: 22, opacity: 0.72 }, {
        y: 0, opacity: 1, duration: 0.75, ease: 'power2.out',
        scrollTrigger: { trigger: target, start: 'top 88%', once: true },
      });
    });
  }

  function setupCatalogReveals(root, desktop) {
    ['.catalog-introduction'].forEach(selector => {
      const target = root.querySelector(selector);
      if (!target) return;
      gsap.fromTo(target, { y: desktop ? 20 : 9, opacity: 0.78 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: target, start: 'top 89%', once: true },
      });
    });
  }

  function setupRitual(root, desktop) {
    const section = root.querySelector('.ritual');
    if (!section) return () => {};
    const photo = section.querySelector('.ritual-image');
    const copy = section.querySelector('.ritual-copy');
    if (!desktop) {
      // Mobile: 8px lift only, no lateral travel, pinning or hidden text.
      gsap.fromTo(photo, { y: 8 }, {
        y: 0, ease: 'none',
        scrollTrigger: { id: 'cskin-ritual', trigger: section, start: 'top 85%', end: 'top 35%', scrub: 0.5 },
      });
      return () => {};
    }
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'cskin-ritual', trigger: section, start: 'top 80%', end: 'top 8%',
        scrub: 0.8, invalidateOnRefresh: true,
      },
    });
    timeline.fromTo(photo, {
      x: 24, y: 0, scale: 0.995,
    }, { x: 0, y: -12, scale: 1.01, duration: 0.65 }, 0.18);
    timeline.fromTo(copy, { x: 12, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.55 }, 0.35);
    // Keyboard interaction reveals the final composition immediately.
    const onFocus = () => { timeline.scrollTrigger?.kill(); timeline.progress(1); };
    section.addEventListener('focusin', onFocus, { once: true });
    return () => section.removeEventListener('focusin', onFocus);
  }

  function init(root, { paused = false } = {}) {
    destroy();
    setupFilm(root, paused);
    if (!window.gsap || !window.ScrollTrigger || paused) return { revert: destroy };
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add({
      desktop: '(min-width: 783px)', mobile: '(max-width: 782px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, context => {
      if (context.conditions.reduced) return;
      const desktop = context.conditions.desktop;
      if (root.querySelector('.catalog-showroom')) {
        setupCatalogReveals(root, desktop);
        return;
      }
      if (!root.querySelector('.hero')) return;
      // Existing title entrance retained. No new global animation system.
      gsap.from('.hero-copy .line', { y: desktop ? 16 : 8, duration: 0.9, stagger: 0.08, ease: 'power2.out' });
      setupHeroFilm(root, desktop);
      setupSectionReveals(root);
      const ritualCleanup = setupRitual(root, desktop);
      return ritualCleanup;
    }, root);
    return { revert: destroy };
  }

  function revealImage(image, { paused = false } = {}) {
    imageReveal?.revert();
    if (!window.gsap || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    imageReveal = gsap.fromTo(image, { opacity: 0.6 }, {
      opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity',
    });
  }
  return { init, revealImage, destroy, toggleFilm: () => filmToggle?.() };
})();
