/* Kindsberg brand layer -- in-page menu navigation for about.html.
 *
 * Why this file exists at all:
 *
 * about.html and index.html use two different scroll engines. index.html runs the
 * "scrollController" system, and landing.js wires its menu links to it (js-menu-link +
 * handleHashLinkClick). about.html runs Locomotive smooth-scroll (the .js-smooth-scroll-
 * wrapper / data-scroll-section markup), and about.js ships NONE of that wiring -- it has
 * no hash-link handler at all. So a plain <a href="#section"> in the menu does nothing:
 * the section ids resolve, but nothing listens for the click, and Locomotive scrolls by
 * transforming sections rather than moving the document, so the native anchor jump has no
 * visual effect either.
 *
 * The one quirk that cost real time to find: Locomotive's programmatic scrollToElement
 * lands SHORT on its first call after any layout settle -- it stops ~400px in regardless
 * of the target, because its cached section offsets aren't in sync yet, and they only get
 * corrected once the page has actually started moving. A correction call fired too early
 * (before that first move) re-reads the same stale offset and also lands short; on the
 * short mobile layout the offsets settle within ~60ms, but the taller desktop layout needs
 * longer. So jumpTo fires a small burst of correction calls over ~1s. Each re-aims at the
 * live section position; once the offsets are correct the target stops moving and the
 * repeats are no-ops. Verified by screenshot on desktop and mobile across every section.
 *
 * Scope is deliberately narrow: only clicks inside .menu__footer__links, only href="#..."
 * that resolves to a real element, and #callback is left alone so the CTA still opens the
 * form modal. Everything is feature-detected; if jQuery or the scroller plugin isn't
 * present the handler bails and the link behaves as a normal (inert) anchor.
 */
(function () {
  'use strict';

  function scroller() {
    var jq = window.jQuery;
    if (!jq || !jq.fn || !jq.fn.scroller) return null;
    try {
      var inst = jq('body').scroller('instance');
      return inst && inst.scrollToElement ? { jq: jq, inst: inst } : null;
    } catch (e) {
      return null;
    }
  }

  // Correction calls at increasing delays. The desktop layout only recomputes its
  // section offsets after the previous scrollToElement's ~1s ease has fully settled, so
  // a correction has to land AFTER that, not during it -- hence the ~1s spacing out to
  // ~3s. Mobile is accurate from the first call and the rest are no-ops. Worst case is a
  // two-step glide on desktop; it always ends on the right section, which is the point.
  var RETRIES = [0, 1000, 2100, 3200];

  function jumpTo(sel) {
    var s = scroller();
    if (!s) return false;
    var $t = s.jq(sel);
    if (!$t.length) return false;
    RETRIES.forEach(function (ms) {
      window.setTimeout(function () { s.inst.scrollToElement($t, 0); }, ms);
    });
    return true;
  }

  function closeMenu() {
    var closer = document.querySelector('#menu .js-modal-close');
    if (closer) closer.click();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.menu__footer__links a[href^="#"]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href === '#callback') return; // CTA / no-op keep default
    if (!document.querySelector(href)) return;                 // unknown id -> leave alone

    e.preventDefault();
    closeMenu();
    // let the fullscreen menu finish closing AND its scroll-restore settle before the
    // scroll starts, or the jump competes with the restore and lands nowhere
    window.setTimeout(function () { jumpTo(href); }, 700);
  }, true);
})();
