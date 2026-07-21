/**
 * About header theme sync.
 *
 * The built-in `themed` plugin keys off window.scrollTop + section offsets.
 * About uses Locomotive (transform scroll), and we also hide whole sections
 * (#process / #standard) that still used to sit in the theme map with 0 height
 * and collapse neighbouring ranges — so the header could stay on a warm/blue
 * theme until Work with us finally forced ui-cold-3 (white).
 *
 * This keeps the header class in sync with whichever [data-static-theme]
 * section sits under the header measure line, using getBoundingClientRect
 * (works with Locomotive transforms).
 */
(function () {
  "use strict";

  var header = document.querySelector(".js-header");
  if (!header) return;

  var measure =
    header.querySelector(".js-themed-measure") || header;
  var last = "";

  function visibleThemeSections() {
    return Array.prototype.filter.call(
      document.querySelectorAll("[data-static-theme]"),
      function (el) {
        var r = el.getBoundingClientRect();
        return r.height > 1 && r.width > 1;
      }
    );
  }

  function themeAtHeader() {
    var box = measure.getBoundingClientRect();
    var y = box.top + box.height / 2;
    var sections = visibleThemeSections();
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        return sections[i].getAttribute("data-static-theme");
      }
    }
    // Past the last section (footer): keep last cold theme if any
    if (sections.length) {
      var lastSec = sections[sections.length - 1];
      if (lastSec.getBoundingClientRect().bottom <= y) {
        return lastSec.getAttribute("data-static-theme");
      }
    }
    return null;
  }

  function apply(theme) {
    if (!theme || theme === last) return;
    last = theme;
    header.className = header.className
      .replace(/(^|\s)ui-[a-z0-9-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    header.classList.add(theme);
  }

  function tick() {
    apply(themeAtHeader());
  }

  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  document.addEventListener("appear", tick);

  // Locomotive / body scroller if present
  try {
    if (window.jQuery && jQuery.fn.scroller) {
      var inst = jQuery("body").scroller("instance");
      if (inst && inst.on) inst.on("scroll", tick);
    }
  } catch (e) {}

  // Initial + settle after layout
  tick();
  window.setTimeout(tick, 100);
  window.setTimeout(tick, 600);
  window.setTimeout(tick, 1200);
})();
