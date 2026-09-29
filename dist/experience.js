/* Small, optional enhancements. All content and native controls work without GSAP. */
'use strict';
(() => {
  if (!window.gsap) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.querySelector('.intro-screen');
  let timeline, fallback;
  const finish = () => {
    clearTimeout(fallback);
    timeline?.kill();
    intro?.remove();
    document.documentElement.classList.remove('intro-active');
    document.removeEventListener('keydown', finish);
  };
  let seen = false;
  try { seen = sessionStorage.getItem('cskin-intro') === 'seen'; } catch {}
  if (intro && !seen && !reduced.matches && document.body.classList.contains('home-page')) {
    try { sessionStorage.setItem('cskin-intro', 'seen'); } catch {}
    intro.style.display = 'grid';
    document.documentElement.classList.add('intro-active');
    document.addEventListener('keydown', finish, { once: true });
    fallback = setTimeout(finish, 3000);
    timeline = gsap.timeline({ onComplete: finish });
    timeline.to('.intro-line i', { scaleX: 1, duration: .7, ease: 'power2.inOut' })
      .to('.intro-brand', { y: -18, duration: .35, ease: 'power2.out' })
      .to(intro, { yPercent: -100, duration: .75, ease: 'power3.inOut' }, '-=.05');
  } else finish();
  reduced.addEventListener('change', event => { if (event.matches) finish(); });

  const cursor = document.querySelector('.editorial-cursor');
  const label = cursor.querySelector('span');
  const eligibility = matchMedia('(hover: hover) and (pointer: fine) and (any-pointer: fine) and (not (any-pointer: coarse))');
  let teardown = () => {};
  function configure() {
    teardown();
    if (!eligibility.matches || reduced.matches) return;
    let visible = false;
    const x = gsap.quickTo(cursor, 'x', { duration: .18, ease: 'power3.out' });
    const y = gsap.quickTo(cursor, 'y', { duration: .18, ease: 'power3.out' });
    const hide = () => {
      visible = false;
      document.documentElement.classList.remove('custom-cursor-active');
      cursor.classList.remove('visible');
    };
    const move = event => {
      if (event.pointerType !== 'mouse' || document.querySelector('dialog[open]') ||
          event.target.closest('input,textarea,select,[contenteditable="true"]')) { hide(); return; }
      if (!visible) {
        gsap.set(cursor, { x: event.clientX, y: event.clientY });
        visible = true;
        document.documentElement.classList.add('custom-cursor-active');
        cursor.classList.add('visible');
      }
      x(event.clientX); y(event.clientY);
      const target = event.target.closest('a,button,summary,[data-cursor]');
      const requested = target?.dataset.cursor;
      label.textContent = ['VIEW','DRAG','PLAY'].includes(requested) ? requested : '';
      cursor.classList.toggle('interactive', !!target);
      cursor.classList.toggle('labelled', !!label.textContent);
      cursor.classList.toggle('on-dark', !!event.target.closest('.header,.footer,.philosophy,.intro-screen'));
    };
    const keyboard = event => { if (event.key === 'Tab') hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('keydown', keyboard);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    window.addEventListener('hashchange', hide);
    document.addEventListener('click', hide);
    window.addEventListener('scroll', hide, { passive: true });
    teardown = () => {
      hide(); x.tween.kill(); y.tween.kill();
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      window.removeEventListener('hashchange', hide);
      document.removeEventListener('click', hide);
      window.removeEventListener('scroll', hide);
    };
  }
  eligibility.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  configure();
})();
