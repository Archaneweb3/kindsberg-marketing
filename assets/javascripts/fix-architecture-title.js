/**
 * Keep #architecture Solutions title at the large size.
 * Ever's scroll timeline removes .architecture__title--large and
 * tweens inline font-size — strip those so brand.css lock wins
 * equally on localhost and Vercel regardless of scroll progress.
 */
(function () {
  'use strict';

  function target() {
    return document.querySelector(
      '#architecture .architecture__title[data-custom-scroll-id="architecture-title"], #architecture .architecture__title--large'
    ) || document.querySelector('#architecture .architecture__title');
  }

  function lock() {
    var el = target();
    if (!el) return;
    el.classList.add('architecture__title--large');
    if (el.style.fontSize) el.style.fontSize = '';
    if (el.style.letterSpacing) el.style.letterSpacing = '';
  }

  function arm(el) {
    if (!el || el.__kbTitleLock) return;
    el.__kbTitleLock = true;
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(lock).observe(el, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }
  }

  function boot() {
    lock();
    arm(target());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);
  // Ever mounts scroll scenes after load
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
