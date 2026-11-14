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

    var marker = null;
    var previousOverflow = '';
    var selectedTrigger = null;

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

    function openFrom(trigger) {
      if (typeof modal.showModal !== 'function') return false;
      selectedTrigger = trigger;
      selectContext(trigger);
      if (!modal.open) {
        marker = document.createComment('Aureum: original lead form position');
        card.parentNode.insertBefore(marker, card);
        container.appendChild(card);
        previousOverflow = document.body.style.overflow;
        modal.showModal();
        document.body.classList.add('aureum-lead-dialog-open');
        document.body.style.overflow = 'hidden';
      }
      close.focus({ preventScroll: true });
      return true;
    }

    close.addEventListener('click', function () {
      modal.close();
    });

    modal.addEventListener('click', function (event) {
      if (event.target !== modal) return;
      var box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) {
        modal.close();
      }
    });

    modal.addEventListener('close', function () {
      if (marker && marker.parentNode) {
        marker.parentNode.replaceChild(card, marker);
      }
      marker = null;
      document.body.classList.remove('aureum-lead-dialog-open');
      document.body.style.overflow = previousOverflow;
      if (selectedTrigger && selectedTrigger.isConnected && document.activeElement === document.body) {
        selectedTrigger.focus({ preventScroll: true });
      }
      selectedTrigger = null;
    });

    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      var url;
      try { url = new URL(link.href, location.href); } catch (error) { return; }
      if (url.origin !== location.origin || url.hash !== '#contato') return;

      var isCTA = link.matches('.btn, .more, .tlink, .primary-button, [data-subject], [data-intent], #contact-full-link');
      if (!isCTA) return;
      if (openFrom(link)) event.preventDefault();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
