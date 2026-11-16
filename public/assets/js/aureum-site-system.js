/* Shared motion lifecycle and accessible mobile navigation. No hidden content. */
(function () {
  'use strict';
  var html = document.documentElement;
  var drawer = document.getElementById('mmenu');
  var panel = document.getElementById('contact-panel');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isolated = new Map();
  var drawerOpen = false;

  function focusable() {
    return Array.from(drawer.querySelectorAll('a[href],button:not(:disabled),summary,input:not(:disabled),[tabindex="0"]'))
      .filter(function (element) { return !element.closest('[inert]') && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden'; });
  }

  function sync() {
    var open = !!drawer && !drawer.hidden;
    if (open !== drawerOpen) {
      drawerOpen = open;
      if (open) {
        document.querySelectorAll('main,footer.foot,#hdr,#aureum-contact-hub').forEach(function (element) {
          if (element.contains(drawer)) return;
          isolated.set(element, element.inert);
          element.inert = true;
        });
      } else {
        isolated.forEach(function (previous, element) { element.inert = previous; });
        isolated.clear();
        var opener = document.getElementById('mm-open');
        if (opener && (document.activeElement === document.body || drawer.contains(document.activeElement))) opener.focus({preventScroll:true});
      }
    }
    var dialog = document.getElementById('aureum-lead-dialog');
    var paused = document.hidden || reduced.matches || open || (panel && !panel.hidden) || (dialog && dialog.open);
    html.setAttribute('data-aureum-motion', paused ? 'paused' : 'active');
  }

  if (drawer) {
    new MutationObserver(sync).observe(drawer, {attributes:true, attributeFilter:['hidden']});
    document.addEventListener('keydown', function (event) {
      if (drawer.hidden || event.key !== 'Tab') return;
      var items = focusable();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1], current = document.activeElement;
      if (event.shiftKey && (current === first || !drawer.contains(current))) {
        event.preventDefault();last.focus();
      } else if (!event.shiftKey && (current === last || !drawer.contains(current))) {
        event.preventDefault();first.focus();
      }
    });
    // Closing via the existing controller restores focus after inert is removed.
    drawer.addEventListener('click', function (event) {
      if (!event.target.closest('#mm-close')) return;
      queueMicrotask(function () {
        sync();
        var opener = document.getElementById('mm-open');
        if (opener) opener.focus({preventScroll:true});
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.hidden) {
        var wasOpen = drawerOpen;
        sync();
        if (wasOpen) document.getElementById('mm-open')?.focus({preventScroll:true});
      }
    });
  }
  if (panel) new MutationObserver(sync).observe(panel, {attributes:true, attributeFilter:['hidden','data-current-view']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('aureum:lead-dialog', sync);
  // The existing dialog is created after deferred scripts initialize.
  var bodyObserver = new MutationObserver(function () {
    var dialog = document.getElementById('aureum-lead-dialog');
    if (!dialog) return;
    new MutationObserver(sync).observe(dialog, {attributes:true, attributeFilter:['open']});
    bodyObserver.disconnect();sync();
  });
  bodyObserver.observe(document.body, {childList:true});
  sync();
})();
