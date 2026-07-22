/* Mac trackpad unlock for index.html scrollController.
 *
 * Ever's wheel plugin locks after a section change (wheelIgnore) and only unlocks on a
 * 120ms debounced "wheel stop". Trackpad inertia keeps resetting that debounce, so scroll
 * feels frozen until the gesture fully dies — often when the user moves the mouse.
 *
 * landing.js already has the main fix (boundary scrollMode + timed unlock). This file is a
 * safety net: if ignore is still stuck >700ms, force-clear on the next wheel/pointer move.
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
      if (Date.now() - stuckSince > 700) unlock(controller, wheel);
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
