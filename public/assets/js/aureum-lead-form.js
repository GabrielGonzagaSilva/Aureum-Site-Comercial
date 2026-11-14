(function () {
  'use strict';

  var forms = Array.prototype.slice.call(document.querySelectorAll('form[data-aureum-lead-form="v1"]'));
  if (!forms.length) return;

  var locale = (document.documentElement.lang || 'pt').toLowerCase().split('-')[0];
  var COPY = {
    pt: {
      name: 'Nome', email: 'E-mail', phone: 'Telefone / WhatsApp', destination: 'Destino',
      objective: 'Objetivo', message: 'Mensagem', intro: 'Olá, equipe Aureum. Gostaria de solicitar uma orientação inicial.',
      reviewTitle: 'Sua mensagem está pronta para revisão',
      reviewText: 'O recebimento online ainda não está habilitado. Nenhum dado foi enviado ou armazenado. Copie a mensagem e encaminhe pelos canais oficiais da Aureum.',
      copy: 'Copiar mensagem', edit: 'Editar dados', copied: 'Mensagem copiada. Encaminhe-a pelo canal oficial da Aureum.',
      copyFailed: 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.',
      successTitle: 'Solicitação registrada', successText: 'Sua solicitação foi registrada com segurança. A equipe da Aureum poderá consultar os dados informados para dar continuidade ao atendimento.',
      newRequest: 'Enviar outra solicitação', error: 'Não foi possível registrar agora. Tente novamente ou utilize um canal oficial de contato.',
      contactError: 'Informe pelo menos um meio de contato: e-mail ou telefone/WhatsApp.',
      emailError: 'Confira o e-mail informado.', phoneError: 'Confira o código do país, o DDD/código de área e o número.',
      nameError: 'Informe seu nome.', consentError: 'Confirme a autorização para continuar.',
      sending: 'Enviando solicitação…', retry: 'Tentar novamente',
    },
    en: {
      name: 'Name', email: 'Email', phone: 'Phone / WhatsApp', destination: 'Destination',
      objective: 'Purpose', message: 'Message', intro: 'Hello, Aureum team. I would like to request initial guidance.',
      reviewTitle: 'Your message is ready for review',
      reviewText: 'Online submission is not enabled yet. No information was sent or stored. Copy the message and forward it through Aureum’s official contact channels.',
      copy: 'Copy message', edit: 'Edit details', copied: 'Message copied. Forward it through an official Aureum contact channel.',
      copyFailed: 'Automatic copying failed. Select the text and copy it manually.',
      successTitle: 'Enquiry received', successText: 'Your enquiry has been securely recorded. The Aureum team can access the details provided to continue the conversation.',
      newRequest: 'Send another enquiry', error: 'We could not record your enquiry. Please try again or use an official contact channel.',
      contactError: 'Provide at least one way to reach you: email or phone/WhatsApp.',
      emailError: 'Check the email address.', phoneError: 'Check the country code, area code and phone number.',
      nameError: 'Enter your name.', consentError: 'Please confirm your consent to continue.',
      sending: 'Submitting your enquiry…', retry: 'Try again',
    },
    es: {
      name: 'Nombre', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp', destination: 'Destino',
      objective: 'Objetivo', message: 'Mensaje', intro: 'Hola, equipo de Aureum. Me gustaría solicitar una orientación inicial.',
      reviewTitle: 'Tu mensaje está listo para revisar',
      reviewText: 'El envío en línea aún no está habilitado. No se ha enviado ni almacenado ningún dato. Copia el mensaje y envíalo por los canales oficiales de Aureum.',
      copy: 'Copiar mensaje', edit: 'Editar datos', copied: 'Mensaje copiado. Envíalo por un canal oficial de Aureum.',
      copyFailed: 'No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.',
      successTitle: 'Solicitud recibida', successText: 'Tu solicitud se ha registrado de forma segura. El equipo de Aureum podrá consultar los datos para continuar la atención.',
      newRequest: 'Enviar otra solicitud', error: 'No se pudo registrar la solicitud. Inténtalo de nuevo o utiliza un canal oficial.',
      contactError: 'Indica al menos un medio de contacto: correo electrónico o teléfono/WhatsApp.',
      emailError: 'Comprueba el correo electrónico.', phoneError: 'Comprueba el código del país, el prefijo de área y el número.',
      nameError: 'Indica tu nombre.', consentError: 'Confirma la autorización para continuar.',
      sending: 'Enviando solicitud…', retry: 'Intentar de nuevo',
    },
    fr: {
      name: 'Nom', email: 'E-mail', phone: 'Téléphone / WhatsApp', destination: 'Destination',
      objective: 'Objectif', message: 'Message', intro: 'Bonjour, équipe Aureum. Je souhaite demander un premier accompagnement.',
      reviewTitle: 'Votre message est prêt à être vérifié',
      reviewText: 'L’envoi en ligne n’est pas encore activé. Aucune donnée n’a été envoyée ni enregistrée. Copiez le message et transmettez-le par les canaux officiels d’Aureum.',
      copy: 'Copier le message', edit: 'Modifier les informations', copied: 'Message copié. Transmettez-le par un canal officiel d’Aureum.',
      copyFailed: 'La copie automatique a échoué. Sélectionnez le texte et copiez-le manuellement.',
      successTitle: 'Demande enregistrée', successText: 'Votre demande a été enregistrée de manière sécurisée. L’équipe Aureum pourra consulter les informations fournies pour poursuivre les échanges.',
      newRequest: 'Envoyer une autre demande', error: 'Impossible d’enregistrer la demande. Réessayez ou utilisez un canal officiel.',
      contactError: 'Indiquez au moins un moyen de contact : e-mail ou téléphone/WhatsApp.',
      emailError: 'Vérifiez l’adresse e-mail.', phoneError: 'Vérifiez l’indicatif du pays, l’indicatif régional et le numéro.',
      nameError: 'Indiquez votre nom.', consentError: 'Confirmez votre autorisation pour continuer.',
      sending: 'Envoi de la demande…', retry: 'Réessayer',
    },
    de: {
      name: 'Name', email: 'E-Mail', phone: 'Telefon / WhatsApp', destination: 'Zielland',
      objective: 'Anliegen', message: 'Nachricht', intro: 'Hallo, Aureum-Team. Ich möchte eine erste Orientierung anfragen.',
      reviewTitle: 'Ihre Nachricht kann überprüft werden',
      reviewText: 'Die Online-Übermittlung ist noch nicht aktiviert. Es wurden keine Daten gesendet oder gespeichert. Kopieren Sie die Nachricht und senden Sie sie über einen offiziellen Aureum-Kontaktkanal.',
      copy: 'Nachricht kopieren', edit: 'Angaben bearbeiten', copied: 'Nachricht kopiert. Senden Sie sie über einen offiziellen Aureum-Kontaktkanal.',
      copyFailed: 'Automatisches Kopieren nicht möglich. Markieren und kopieren Sie den Text bitte manuell.',
      successTitle: 'Anfrage registriert', successText: 'Ihre Anfrage wurde sicher gespeichert. Das Aureum-Team kann die angegebenen Daten einsehen, um den Kontakt fortzusetzen.',
      newRequest: 'Weitere Anfrage senden', error: 'Die Anfrage konnte nicht gespeichert werden. Versuchen Sie es erneut oder nutzen Sie einen offiziellen Kontaktkanal.',
      contactError: 'Geben Sie mindestens eine Kontaktmöglichkeit an: E-Mail oder Telefon/WhatsApp.',
      emailError: 'Bitte prüfen Sie die E-Mail-Adresse.', phoneError: 'Bitte prüfen Sie Ländervorwahl, Ortsvorwahl und Rufnummer.',
      nameError: 'Bitte geben Sie Ihren Namen ein.', consentError: 'Bestätigen Sie die Zustimmung, um fortzufahren.',
      sending: 'Anfrage wird gesendet…', retry: 'Erneut versuchen',
    },
  };
  var text = COPY[locale] || COPY.pt;

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
      var random = Math.random() * 16 | 0;
      return (char === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function getIntakeConfig() {
    return fetch('/api/leads', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'same-origin',
    }).then(function (response) {
      if (!response.ok) return { enabled: false };
      return response.json();
    }).then(function (result) {
      return result && result.enabled === true && result.privacyNoticeVersion
        ? result
        : { enabled: false };
    }).catch(function () {
      return { enabled: false };
    });
  }

  var configPromise = getIntakeConfig();
  var trunkZeroCodes = new Set([
    '+20', '+27', '+30', '+31', '+32', '+33', '+41', '+43', '+44', '+46',
    '+49', '+54', '+56', '+57', '+60', '+61', '+62', '+63', '+64', '+66',
    '+81', '+82', '+86', '+90', '+212', '+234', '+254', '+593', '+598',
    '+971', '+972',
  ]);

  function normalizePhone(form) {
    var field = form.querySelector('[name="whatsapp"]');
    var select = form.querySelector('[name="codigo_pais"]');
    var other = form.querySelector('[name="codigo_pais_outro"]');
    var raw = field ? field.value.trim() : '';
    if (!raw) return { value: '', valid: true };

    var digits;
    if (raw.charAt(0) === '+') {
      digits = raw.replace(/\D/g, '');
    } else {
      var callingCode = select && select.value === 'other'
        ? (other ? other.value.trim() : '')
        : (select ? select.value : '');
      if (!/^\+[1-9]\d{0,2}$/.test(callingCode)) return { value: '', valid: false };
      var localDigits = raw.replace(/\D/g, '');
      if (trunkZeroCodes.has(callingCode) && localDigits.charAt(0) === '0') localDigits = localDigits.slice(1);
      if (callingCode === '+7' && localDigits.charAt(0) === '8') localDigits = localDigits.slice(1);
      digits = callingCode.replace(/\D/g, '') + localDigits;
    }
    if (digits.length < 7 || digits.length > 15 || digits.charAt(0) === '0') return { value: '', valid: false };
    return { value: '+' + digits, valid: true };
  }

  function setError(field, message) {
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    var wrapper = field.closest('.f, .consent');
    if (wrapper) wrapper.classList.add('bad');
    if (wrapper) {
      var error = wrapper.querySelector('.err');
      if (!error && wrapper.classList.contains('consent') && wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains('consent-error')) error = wrapper.nextElementSibling;
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
    }
  }

  function clearError(field) {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    var wrapper = field.closest('.f, .consent');
    if (wrapper) wrapper.classList.remove('bad');
    if (wrapper) {
      var error = wrapper.querySelector('.err');
      if (!error && wrapper.classList.contains('consent') && wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains('consent-error')) error = wrapper.nextElementSibling;
      if (error) error.hidden = true;
    }
  }

  function buildMessage(form, phone) {
    var name = (form.querySelector('[name="nome"]') || {}).value || '';
    var email = (form.querySelector('[name="email"]') || {}).value || '';
    var destination = (form.querySelector('[name="destino"]') || {}).value || '';
    var objective = (form.querySelector('[name="objetivo"]') || {}).value || '';
    var message = (form.querySelector('[name="mensagem"]') || {}).value || '';
    var lines = [text.intro, '', text.name + ': ' + name.trim()];
    if (email.trim()) lines.push(text.email + ': ' + email.trim());
    if (phone) lines.push(text.phone + ': ' + phone);
    if (destination.trim()) lines.push(text.destination + ': ' + destination.trim());
    if (objective.trim()) lines.push(text.objective + ': ' + objective.trim());
    if (message.trim()) lines.push(text.message + ': ' + message.trim());
    return lines.join('\n');
  }

  function makeButton(label, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'btn btn-primary';
    button.textContent = label;
    return button;
  }

  function showResult(form, title, description, message, success) {
    var result = document.createElement('section');
    result.className = 'aureum-lead-result';
    result.tabIndex = -1;
    result.setAttribute('aria-live', 'polite');

    var heading = document.createElement('h3');
    heading.textContent = title;
    var paragraph = document.createElement('p');
    paragraph.textContent = description;
    result.append(heading, paragraph);

    if (message) {
      var label = document.createElement('label');
      label.textContent = text.message;
      var preview = document.createElement('textarea');
      preview.id = 'aureum-lead-preview-' + (form.id || uuid());
      label.htmlFor = preview.id;
      preview.readOnly = true;
      preview.value = message;
      preview.setAttribute('aria-label', text.reviewTitle);
      var status = document.createElement('p');
      status.className = 'aureum-lead-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      var actions = document.createElement('div');
      actions.className = 'aureum-lead-result-actions';
      var copyButton = makeButton(text.copy, 'btn btn-primary');
      var editButton = makeButton(text.edit, 'btn btn-line');
      copyButton.addEventListener('click', function () {
        function fallback() {
          preview.focus();
          preview.select();
          var copied = false;
          try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
          status.textContent = copied ? text.copied : text.copyFailed;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(message).then(function () {
            status.textContent = text.copied;
          }).catch(fallback);
        } else fallback();
      });
      editButton.addEventListener('click', function () {
        result.remove();
        form.hidden = false;
        var nameField = form.querySelector('[name="nome"]');
        if (nameField) nameField.focus();
      });
      actions.append(copyButton, editButton);
      result.append(label, preview, actions, status);
    } else if (success) {
      var newButton = makeButton(text.newRequest, 'btn btn-line');
      newButton.addEventListener('click', function () {
        result.remove();
        form.reset();
        if (otherCode) { otherCode.hidden = true; otherCode.value = ''; }
        var group = form.querySelector('.phone-input-group');
        if (group) group.classList.remove('has-other-code');
        form.dataset.submissionId = uuid();
        form.hidden = false;
        var nameField = form.querySelector('[name="nome"]');
        if (nameField) nameField.focus();
      });
      result.append(newButton);
    }
    form.hidden = true;
    form.insertAdjacentElement('afterend', result);
    result.focus({ preventScroll: true });
  }

  forms.forEach(function (form) {
    var startedAt = performance.now();
    form.dataset.submissionId = uuid();
    var phoneField = form.querySelector('[name="whatsapp"]');
    var codeSelect = form.querySelector('[name="codigo_pais"]');
    var otherCode = form.querySelector('[name="codigo_pais_outro"]');
    var emailField = form.querySelector('[name="email"]');
    var nameField = form.querySelector('[name="nome"]');
    var consent = form.querySelector('[name="consentimento"]') || form.querySelector('[data-rule="consent"]');
    var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    var status = document.createElement('p');
    status.className = 'aureum-lead-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);

    if (codeSelect && otherCode) {
      codeSelect.addEventListener('change', function () {
        otherCode.hidden = codeSelect.value !== 'other';
        if (otherCode.hidden) otherCode.value = '';
        var group = form.querySelector('.phone-input-group');
        if (group) group.classList.toggle('has-other-code', !otherCode.hidden);
        clearError(phoneField);
        clearError(codeSelect);
        clearError(otherCode);
      });
    }
    [phoneField, emailField, nameField, consent, otherCode, codeSelect].forEach(function (field) {
      if (!field) return;
      field.addEventListener('input', function () { clearError(field); status.textContent = ''; });
      field.addEventListener('change', function () { clearError(field); status.textContent = ''; });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      var firstInvalid = null;
      var name = nameField ? nameField.value.trim() : '';
      var email = emailField ? emailField.value.trim() : '';
      var phone = normalizePhone(form);
      var hasContact = Boolean(email || phone.value);

      if (name.length < 2) {
        setError(nameField, text.nameError);
        firstInvalid = firstInvalid || nameField;
      }
      if (!hasContact) {
        setError(emailField, text.contactError);
        firstInvalid = firstInvalid || emailField;
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setError(emailField, text.emailError);
        firstInvalid = firstInvalid || emailField;
      }
      if (phoneField && phoneField.value.trim() && !phone.valid) {
        var codeField = codeSelect && codeSelect.value === 'other' ? otherCode : (codeSelect && !codeSelect.value ? codeSelect : phoneField);
        setError(codeField || phoneField, text.phoneError);
        firstInvalid = firstInvalid || codeField || phoneField;
      }
      if (consent && !consent.checked) {
        setError(consent, text.consentError);
        firstInvalid = firstInvalid || consent;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var payloadMessage = buildMessage(form, phone.value);
      configPromise.then(function (config) {
        if (!config.enabled) {
          showResult(form, text.reviewTitle, text.reviewText, payloadMessage, false);
          return;
        }

        var destination = form.querySelector('[name="destino"]');
        var objective = form.querySelector('[name="objetivo"]');
        var message = form.querySelector('[name="mensagem"]');
        var honeypot = form.querySelector('[name="website"]');
        var payload = {
          submissionId: form.dataset.submissionId,
          name: name,
          email: email,
          phone: phone.value,
          destination: destination ? destination.value : '',
          objective: objective ? objective.value : '',
          message: message ? message.value : '',
          consent: true,
          privacyNoticeVersion: config.privacyNoticeVersion,
          locale: locale,
          sourcePath: window.location.pathname,
          website: honeypot ? honeypot.value : '',
          elapsedMs: Math.round(performance.now() - startedAt),
        };

        if (submitButton) submitButton.disabled = true;
        form.setAttribute('aria-busy', 'true');
        status.textContent = text.sending;

        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify(payload),
        }).then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (body) {
            if (!response.ok || body.ok !== true) {
              var error = new Error(body.error || text.error);
              error.status = response.status;
              throw error;
            }
            return body;
          });
        }).then(function () {
          showResult(form, text.successTitle, text.successText, '', true);
        }).catch(function (error) {
          status.textContent = error && error.message ? error.message : text.error;
        }).finally(function () {
          if (submitButton) submitButton.disabled = false;
          form.removeAttribute('aria-busy');
        });
      });
    }, true);
  });
})();
