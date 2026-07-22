/* Mac trackpad unlock for index.html scrollController.
 *
 * Ever's wheel plugin used to clear wheelIgnore on a 120ms "wheel stop" debounce.
 * Trackpad inertia kept unlocking mid-gesture → section skip / back-and-forth.
 * landing.js now keeps ignore until a timed cooldown (~900ms) after next/prev.
 *
 * This file is a safety net only: if ignore is still stuck well past that
 * cooldown (>1200ms), force-clear on the next wheel/pointer move.
 */
(function () {
  'use strict';

  function getController() {
    var $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.scrollController) return null;
    try {
      return $('.js-page-content').scrollController('instance') || null;
    } catch (e) {
      return null;
    }
  }

  function getWheelPlugin(controller) {
    var plugins = controller && controller.plugins;
    if (!plugins || !plugins.length) return null;
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i] && 'wheelIgnore' in plugins[i]) return plugins[i];
    }
    return null;
  }

  function unlock(controller, wheel) {
    if (!controller || !wheel) return;
    wheel.wheelIgnore = false;
    wheel.wheelDeltaSum = 0;
    if (wheel._kbWheelUnlock) {
      clearTimeout(wheel._kbWheelUnlock);
      wheel._kbWheelUnlock = null;
    }
    if (controller.scrollMode === 1 || controller.scrollMode === 2) {
      controller.scrollMode = 0;
    }
  }

  var stuckSince = 0;

  function onActivity() {
    var controller = getController();
    var wheel = getWheelPlugin(controller);
    if (!wheel) return;

    if (wheel.wheelIgnore) {
      if (!stuckSince) stuckSince = Date.now();
      // Must be longer than landing.js section-change cooldown (900ms)
      if (Date.now() - stuckSince > 1200) unlock(controller, wheel);
    } else {
      stuckSince = 0;
    }
  }

  function boot() {
    if (!getWheelPlugin(getController())) return false;
    window.addEventListener('wheel', onActivity, { passive: true, capture: true });
    window.addEventListener('pointermove', onActivity, { passive: true });
    return true;
  }

  function start() {
    if (boot()) return;
    var n = 0;
    var id = setInterval(function () {
      n += 1;
      if (boot() || n > 50) clearInterval(id);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
