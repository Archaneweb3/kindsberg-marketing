/* MacBook / trackpad safety net for Ever scrollController.
 *
 * Problems this prevents:
 * 1) Section skip / back-and-forth from trackpad inertia
 * 2) wheelIgnore stuck forever (scroll feels frozen)
 *
 * landing.js owns the primary cooldown. This file adds a gesture lock:
 * only one next/prev per finger gesture, and force-unlock if ignore
 * stays true past the cooldown window.
 */
(function () {
  'use strict';

  var GESTURE_QUIET_MS = 180;
  var STUCK_UNLOCK_MS = 1400;
  var lastWheelAt = 0;
  var gestureLocked = false;
  var stuckSince = 0;
  var quietTimer = null;

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

  function onWheel() {
    var now = Date.now();
    lastWheelAt = now;

    var controller = getController();
    var wheel = getWheelPlugin(controller);
    if (!wheel) return;

    // Track stuck ignore
    if (wheel.wheelIgnore) {
      if (!stuckSince) stuckSince = now;
      if (now - stuckSince > STUCK_UNLOCK_MS) {
        unlock(controller, wheel);
        stuckSince = 0;
        gestureLocked = false;
      }
    } else {
      stuckSince = 0;
    }

    // After a section change, keep ignore true until gesture goes quiet
    if (gestureLocked && wheel.wheelIgnore) {
      // hold ignore while inertia continues
      wheel.wheelIgnore = true;
    }

    clearTimeout(quietTimer);
    quietTimer = setTimeout(function () {
      gestureLocked = false;
      var c = getController();
      var w = getWheelPlugin(c);
      // If landing.js cooldown already cleared, stay clear.
      // If still ignored with no recent unlock timer, clear.
      if (w && w.wheelIgnore && !w._kbWheelUnlock) {
        unlock(c, w);
      }
    }, GESTURE_QUIET_MS);
  }

  // When Ever fires next/prev it sets wheelIgnore — mark gesture locked
  function watchIgnore() {
    var controller = getController();
    var wheel = getWheelPlugin(controller);
    if (!wheel) return;
    if (wheel.wheelIgnore) gestureLocked = true;
  }

  function boot() {
    if (!getWheelPlugin(getController())) return false;
    window.addEventListener('wheel', onWheel, { passive: true, capture: true });
    window.addEventListener('wheel', watchIgnore, { passive: true, capture: true });
    window.addEventListener('pointermove', watchIgnore, { passive: true });
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
