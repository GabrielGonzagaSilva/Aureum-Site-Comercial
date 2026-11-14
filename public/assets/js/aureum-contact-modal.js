/* Aureum — contact sheet: move the existing lead-main card; never clone it. */
(function () {
  'use strict';

  var COPY = {
    pt: {
      eyebrow: 'PRIMEIRO CONTATO',
      title: 'Conte sobre o seu projeto',
      detail: 'Preencha os dados para preparar sua mensagem à Aureum.',
      close: 'Fechar formulário de contato'
    },
    en: {
      eyebrow: 'FIRST CONTACT',
      title: 'Tell us about your plans',
      detail: 'Fill in the details to prepare your message to Aureum.',
      close: 'Close contact form'
    },
    es: {
      eyebrow: 'PRIMER CONTACTO',
      title: 'Cuéntanos sobre tu proyecto',
      detail: 'Completa los datos para preparar tu mensaje a Aureum.',
      close: 'Cerrar formulario de contacto'
    },
    fr: {
      eyebrow: 'PREMIER CONTACT',
      title: 'Parlez-nous de votre projet',
      detail: 'Renseignez les informations pour préparer votre message à Aureum.',
      close: 'Fermer le formulaire de contact'
    },
    de: {
      eyebrow: 'ERSTE KONTAKTAUFNAHME',
      title: 'Erzählen Sie uns von Ihrem Vorhaben',
      detail: 'Füllen Sie die Angaben aus, um Ihre Nachricht an Aureum vorzubereiten.',
      close: 'Kontaktformular schließen'
    }
  };

  function initialize() {
    var form = document.getElementById('lead-main');
    if (document.getElementById('aureum-lead-dialog')) return;
    if (!form || form.tagName !== 'FORM' || !form.matches('[data-aureum-lead-form="v1"]')) return;
    var card = form.closest('.fcard');
    if (!card || !card.parentNode) return;

    var lang = (document.documentElement.lang || 'pt').toLowerCase().split('-')[0];
    var copy = COPY[lang] || COPY.pt;
    var modal = document.createElement('dialog');
    modal.className = 'aureum-lead-dialog';
    modal.id = 'aureum-lead-dialog';
    modal.setAttribute('aria-labelledby', 'aureum-lead-dialog-title');
    modal.setAttribute('aria-describedby', 'aureum-lead-dialog-detail');

    var heading = document.createElement('div');
    heading.className = 'aureum-lead-dialog__heading';
    var headCopy = document.createElement('div');
    headCopy.className = 'aureum-lead-dialog__heading-copy';
    var eyebrow = document.createElement('p');
    eyebrow.className = 'aureum-lead-dialog__eyebrow';
    eyebrow.textContent = copy.eyebrow;
    var title = document.createElement('h2');
    title.id = 'aureum-lead-dialog-title';
    title.textContent = copy.title;
    var detail = document.createElement('p');
    detail.id = 'aureum-lead-dialog-detail';
    detail.textContent = copy.detail;
    headCopy.appendChild(eyebrow);
    headCopy.appendChild(title);
    headCopy.appendChild(detail);
    var close = document.createElement('button');
    close.type = 'button';
    close.autofocus = true;
    close.className = 'aureum-lead-dialog__close';
    close.setAttribute('aria-label', copy.close);
    close.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    heading.appendChild(headCopy);
    heading.appendChild(close);

    var container = document.createElement('div');
    container.className = 'aureum-lead-dialog__content';
    modal.appendChild(heading);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Associate the existing inline validation with its controls in the dialog.
    ['nome', 'email'].forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      var error = field && field.closest('.f').querySelector('.err');
      if (!error) return;
      error.id = field.id + '-error';
      error.setAttribute('role', 'alert');
      field.setAttribute('aria-describedby', error.id);
    });

    var originalCardMinHeight = captureStyles(card, ['min-height']);
    var marker = null;
    var previousPageStyles = null;
    var lockedScroll = null;
    var selectedTrigger = null;

    function lockPageScroll() {
      var root = document.documentElement;
      lockedScroll = { x: window.scrollX, y: window.scrollY };
      previousPageStyles = {
        body: captureStyles(document.body, ['position', 'top', 'left', 'width', 'box-sizing', 'padding-right', 'overflow']),
        root: captureStyles(root, ['min-height', 'scroll-behavior', 'overflow-anchor', 'overflow', 'overscroll-behavior', 'scrollbar-gutter'])
      };
      var scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);
      var currentPadding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;

      // Keep the document's scroll range while the body is fixed. Otherwise scrollY
      // becomes zero and the site's scroll-driven header changes behind the dialog.
      root.style.minHeight = root.scrollHeight + 'px';
      root.style.scrollBehavior = 'auto';
      root.style.overflowAnchor = 'none';
      root.style.scrollbarGutter = 'stable';
      root.style.overflow = 'hidden';
      root.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = (-lockedScroll.y) + 'px';
      document.body.style.left = (-lockedScroll.x) + 'px';
      document.body.style.width = '100%';
      document.body.style.boxSizing = 'border-box';
      // Modern browsers retain the gutter, so compensate only a lost scrollbar.
      var lostGap = Math.max(0, scrollbarGap - (window.innerWidth - root.clientWidth));
      document.body.style.paddingRight = (currentPadding + lostGap) + 'px';
      document.body.style.overflow = 'hidden';
    }

    function captureStyles(element, properties) {
      return {
        hadAttribute: element.hasAttribute('style'),
        values: properties.map(function (name) {
          return [name, element.style.getPropertyValue(name), element.style.getPropertyPriority(name)];
        })
      };
    }
    function restoreStyle(element, snapshot) {
      snapshot.values.forEach(function (entry) {
        element.style.removeProperty(entry[0]);
        if (entry[1]) element.style.setProperty(entry[0], entry[1], entry[2]);
      });
      if (!snapshot.hadAttribute && !element.style.cssText) element.removeAttribute('style');
    }

    function restorePageScroll() {
      if (!previousPageStyles || !lockedScroll) return;
      var root = document.documentElement;
      var position = lockedScroll;
      restoreStyle(document.body, previousPageStyles.body);
      restoreStyle(root, previousPageStyles.root);
      // The global smooth-scroll rule must never animate a scroll-lock restoration.
      root.style.setProperty('scroll-behavior', 'auto', 'important');
      window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
      restoreStyle(root, previousPageStyles.root);
      previousPageStyles = null;
      lockedScroll = null;
    }

    function selectContext(trigger) {
      var select = form.querySelector('[name="destino"]');
      var intent = form.querySelector('[name="objetivo"]');
      if (trigger.dataset.intent && intent) intent.value = trigger.dataset.intent;

      var destination = trigger.dataset.subject || '';
      if (!destination) {
        var match = location.pathname.match(/\/destinos\/([a-z0-9-]+)\/?/i);
        if (match) {
          var matchingForm = document.getElementById('lead-' + match[1]);
          var hiddenDestination = matchingForm && matchingForm.querySelector('input[name="destino"]');
          if (hiddenDestination) destination = hiddenDestination.value;
        }
      }
      if (select && destination) {
        var option = Array.prototype.find.call(select.options, function (item) {
          return item.value === destination || item.textContent.trim() === destination;
        });
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    window.addEventListener('resize', function () {
      if (!modal.open) restoreStyle(card, originalCardMinHeight);
    });

    // Safari's virtual keyboard shrinks the visual viewport, not always 100dvh.
    function updateViewport() {
      if (!window.visualViewport || !modal.open) return;
      var viewport = window.visualViewport;
      modal.style.setProperty('--lead-viewport-height', viewport.height + 'px');
      modal.style.setProperty('--lead-viewport-top', viewport.offsetTop + 'px');
      modal.style.setProperty('--lead-viewport-bottom', Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) + 'px');
    }
    window.addEventListener('resize', updateViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    function openFrom(trigger) {
      if (typeof modal.showModal !== 'function') return false;
      if (modal.open) return true;
      selectedTrigger = trigger;
      // Let the existing drawer controller release its own lock before ours starts.
      var drawer = trigger.closest('#mmenu');
      if (drawer && !drawer.hidden) {
        document.getElementById('mm-close').click();
        selectedTrigger = document.getElementById('mm-open');
      }
      selectContext(trigger);
      var box = card.getBoundingClientRect();
      lockPageScroll();
      // A same-size placeholder prevents section collapse and scroll anchoring when
      // moving the one existing form (including its listeners, errors and values).
      marker = document.createElement('div');
      marker.setAttribute('aria-hidden', 'true');
      marker.style.height = box.height + 'px';
      marker.style.minWidth = '0';
      card.parentNode.insertBefore(marker, card);
      container.appendChild(card);
      document.body.classList.add('aureum-lead-dialog-open');
      modal.showModal();
      updateViewport();
      modal.scrollTop = 0;
      close.focus({ preventScroll: true });
      return true;
    }

    // Keep the native dialog open during its short exit; cancellation never submits
    // or clears the form. Reduced-motion users close synchronously.
    var closing = false;
    var closeTimer = null;
    function finishClose() {
      clearTimeout(closeTimer);
      modal.close();
    }
    function dismiss() {
      if (closing || !modal.open) return;
      closing = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishClose();
      } else {
        modal.classList.add('is-closing');
        closeTimer = setTimeout(finishClose, 160);
      }
    }
    close.addEventListener('click', dismiss);
    modal.addEventListener('cancel', function (event) {
      event.preventDefault();
      dismiss();
    });

    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var controls = Array.prototype.filter.call(modal.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]'
      ), function (element) {
        return !element.disabled && element.tabIndex >= 0 && element.getClientRects().length;
      });
      var first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    });

    // Both press and release must be outside, so selecting/dragging text cannot
    // accidentally dismiss the form on pointer release over the backdrop.
    function outside(event) {
      var box = modal.getBoundingClientRect();
      return event.target === modal && (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom);
    }
    var backdropPress = false;
    modal.addEventListener('pointerdown', function (event) { backdropPress = outside(event); });
    modal.addEventListener('pointercancel', function () { backdropPress = false; });
    modal.addEventListener('click', function (event) {
      if (backdropPress && outside(event)) dismiss();
      backdropPress = false;
    });

    modal.addEventListener('close', function () {
      clearTimeout(closeTimer);
      modal.classList.remove('is-closing');
      closing = false;
      if (marker && marker.parentNode) {
        // A shorter review/result must not shrink the page and clamp scrollY at
        // the footer. Keep the original inline footprint until a viewport resize.
        card.style.minHeight = marker.style.height;
        marker.parentNode.replaceChild(card, marker);
      }
      marker = null;
      document.body.classList.remove('aureum-lead-dialog-open');
      restorePageScroll();
      if (selectedTrigger && selectedTrigger.isConnected && selectedTrigger.getClientRects().length) {
        selectedTrigger.focus({ preventScroll: true });
      }
      selectedTrigger = null;
    });

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey) return;
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      var url;
      try { url = new URL(link.href, location.href); } catch (error) { return; }
      if (url.origin !== location.origin || url.hash !== '#contato') return;

      var isCTA = link.matches('.btn, .more, .tlink, .primary-button, [data-subject], [data-intent], #contact-full-link');
      if (!isCTA) return;

      /* Capture the CTA before any legacy hash-navigation handler can run. */
      if (openFrom(link)) {
        event.preventDefault();
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
