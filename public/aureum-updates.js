(function () {
  "use strict";
  const panel = document.getElementById("contact-panel");
  if (!panel) return;
  // Temporary operational pause: preserve the Mia implementation for reactivation.
  // CSS also hides the launcher before deferred JavaScript runs.
  const MIA_TEMPORARILY_ENABLED = false;
  if (!MIA_TEMPORARILY_ENABLED) {
    const miaLauncher = document.getElementById("launch-assistant");
    if (miaLauncher) {
      miaLauncher.disabled = true;
      miaLauncher.hidden = true;
      miaLauncher.setAttribute("aria-hidden", "true");
    }
    const miaView = panel.querySelector('.contact-view[data-view="assistant"]');
    if (miaView) {
      miaView.hidden = true;
      miaView.inert = true;
    }
  }
  const lang = (document.documentElement.lang || "pt-BR").toLowerCase().split("-")[0];
  const copy = {
    pt: {
      title: "Fale com a Aureum", subtitle: "Escolha como prefere conversar.", miaRole: "Assistente virtual",
      directTitle: "Enviar mensagem", directText: "Fale diretamente com a equipe da Aureum pelo WhatsApp.",
      directButton: "Enviar mensagem no WhatsApp", callbackTitle: "Prefiro receber contato",
      callbackText: "Informe seu telefone com código do país para solicitar um retorno.",
      phoneLabel: "Seu telefone com código do país", phonePlaceholder: "+55 11 99999-9999",
      callbackButton: "Solicitar contato", privacyText: "Ao continuar, seu número será incluído em uma mensagem para a equipe da Aureum. A mensagem só será enviada após sua confirmação no WhatsApp.",
      privacyLink: "Política de privacidade", unconfigured: "O WhatsApp oficial da Aureum ainda não está configurado. Nenhum dado foi enviado ou armazenado.",
      invalid: "Informe um telefone válido com código do país, por exemplo +55 11 99999-9999.",
      confirm: "WhatsApp aberto. Revise e envie a mensagem para concluir.",
      directMessage: "Olá! Gostaria de conversar com a equipe da Aureum sobre uma assessoria internacional.",
      callbackMessage: "Olá! Gostaria que a equipe da Aureum entrasse em contato comigo. Meu telefone é {phone}. Autorizo o uso deste número exclusivamente para retorno sobre esta solicitação."
    },
    en: {
      title: "Contact Aureum", subtitle: "Choose how you would like to get in touch.", miaRole: "Virtual assistant",
      directTitle: "Send a message", directText: "Talk directly with the Aureum team on WhatsApp.",
      directButton: "Send a WhatsApp message", callbackTitle: "I would prefer a callback",
      callbackText: "Enter your phone number with its country code to request a return contact.",
      phoneLabel: "Phone number with country code", phonePlaceholder: "+1 202 555 0147",
      callbackButton: "Request contact", privacyText: "Your number will be included in a message to the Aureum team. The message is sent only after you confirm it in WhatsApp.",
      privacyLink: "Privacy policy", unconfigured: "Aureum's official WhatsApp number has not been configured. No information was sent or stored.",
      invalid: "Enter a valid phone number with its country code, for example +1 202 555 0147.",
      confirm: "WhatsApp opened. Review and send the message to complete your request.",
      directMessage: "Hello! I would like to speak with the Aureum team about international advisory services.",
      callbackMessage: "Hello! I would like the Aureum team to contact me. My phone number is {phone}. I authorize the use of this number solely to respond to this request."
    },
    es: {
      title: "Habla con Aureum", subtitle: "Elige cómo prefieres comunicarte.", miaRole: "Asistente virtual",
      directTitle: "Enviar un mensaje", directText: "Habla directamente con el equipo de Aureum por WhatsApp.",
      directButton: "Enviar mensaje por WhatsApp", callbackTitle: "Prefiero que me contacten",
      callbackText: "Indica tu teléfono con el código del país para solicitar una respuesta.",
      phoneLabel: "Teléfono con código del país", phonePlaceholder: "+34 600 000 000",
      callbackButton: "Solicitar contacto", privacyText: "Tu número se incluirá en un mensaje para el equipo de Aureum. El mensaje solo se enviará cuando lo confirmes en WhatsApp.",
      privacyLink: "Política de privacidad", unconfigured: "El WhatsApp oficial de Aureum aún no está configurado. No se envió ni almacenó ningún dato.",
      invalid: "Introduce un teléfono válido con el código del país, por ejemplo +34 600 000 000.",
      confirm: "WhatsApp está abierto. Revisa y envía el mensaje para completar tu solicitud.",
      directMessage: "Hola. Me gustaría hablar con el equipo de Aureum sobre asesoría internacional.",
      callbackMessage: "Hola. Me gustaría que el equipo de Aureum se pusiera en contacto conmigo. Mi teléfono es {phone}. Autorizo el uso de este número exclusivamente para responder a esta solicitud."
    },
    fr: {
      title: "Contacter Aureum", subtitle: "Choisissez votre mode de contact.", miaRole: "Assistant virtuel",
      directTitle: "Envoyer un message", directText: "Échangez directement avec l'équipe Aureum sur WhatsApp.",
      directButton: "Envoyer un message WhatsApp", callbackTitle: "Je préfère être recontacté",
      callbackText: "Indiquez votre téléphone avec l'indicatif du pays pour demander un rappel.",
      phoneLabel: "Téléphone avec indicatif du pays", phonePlaceholder: "+33 6 12 34 56 78",
      callbackButton: "Demander un rappel", privacyText: "Votre numéro sera inclus dans un message à l'équipe Aureum. L'envoi ne sera effectué qu'après votre confirmation dans WhatsApp.",
      privacyLink: "Politique de confidentialité", unconfigured: "Le numéro WhatsApp officiel d'Aureum n'est pas encore configuré. Aucune donnée n'a été envoyée ni enregistrée.",
      invalid: "Saisissez un numéro valide avec l'indicatif du pays, par exemple +33 6 12 34 56 78.",
      confirm: "WhatsApp est ouvert. Vérifiez et envoyez le message pour terminer votre demande.",
      directMessage: "Bonjour. Je souhaite échanger avec l'équipe Aureum au sujet de l'accompagnement international.",
      callbackMessage: "Bonjour. Je souhaite être contacté par l'équipe Aureum. Mon téléphone est le {phone}. J'autorise l'utilisation de ce numéro uniquement pour répondre à cette demande."
    },
    de: {
      title: "Aureum kontaktieren", subtitle: "Wählen Sie Ihren bevorzugten Kontaktweg.", miaRole: "Virtueller Assistent",
      directTitle: "Nachricht senden", directText: "Kontaktieren Sie das Aureum-Team direkt über WhatsApp.",
      directButton: "WhatsApp-Nachricht senden", callbackTitle: "Ich möchte kontaktiert werden",
      callbackText: "Geben Sie Ihre Telefonnummer mit Ländervorwahl ein, um einen Rückruf anzufordern.",
      phoneLabel: "Telefonnummer mit Ländervorwahl", phonePlaceholder: "+49 1512 3456789",
      callbackButton: "Kontakt anfordern", privacyText: "Ihre Nummer wird in eine Nachricht an das Aureum-Team eingefügt. Die Nachricht wird erst nach Ihrer Bestätigung in WhatsApp gesendet.",
      privacyLink: "Datenschutzerklärung", unconfigured: "Die offizielle WhatsApp-Nummer von Aureum ist noch nicht eingerichtet. Es wurden keine Daten gesendet oder gespeichert.",
      invalid: "Geben Sie eine gültige Telefonnummer mit Ländervorwahl ein, zum Beispiel +49 1512 3456789.",
      confirm: "WhatsApp wurde geöffnet. Prüfen und senden Sie die Nachricht, um Ihre Anfrage abzuschließen.",
      directMessage: "Hallo. Ich möchte mit dem Aureum-Team über internationale Beratung sprechen.",
      callbackMessage: "Hallo. Ich möchte vom Aureum-Team kontaktiert werden. Meine Telefonnummer ist {phone}. Ich erlaube die Verwendung dieser Nummer ausschließlich zur Beantwortung dieser Anfrage."
    }
  };
  const t = copy[lang] || copy.pt;
  const instagram = document.querySelector('footer a.f-social-link[href^="https://www.instagram.com/"]');
  const instagramLabel = {
    pt: 'Abrir Instagram', en: 'Open Instagram', es: 'Abrir Instagram',
    fr: 'Ouvrir Instagram', de: 'Instagram öffnen',
  }[lang] || 'Abrir Instagram';
  const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  const whatsappView = panel.querySelector('.contact-view[data-view="whatsapp"]');
  if (whatsappView) {
    whatsappView.innerHTML = [
      '<div class="contact-options">',
        '<section class="contact-option contact-option--primary">',
          '<div class="contact-option-copy"><h3>', escapeHtml(t.directTitle), '</h3><p>', escapeHtml(t.directText), '</p></div>',
          '<button type="button" class="contact-primary" id="aureum-send-whatsapp">', escapeHtml(t.directButton), '</button>',
          '<p class="contact-status" id="aureum-whatsapp-status" role="status" aria-live="polite"></p>',
        '</section>',
        '<section class="contact-option">',
          '<div class="contact-option-copy"><h3>', escapeHtml(t.callbackTitle), '</h3><p>', escapeHtml(t.callbackText), '</p></div>',
          '<form id="aureum-callback-form" class="aureum-callback-form">',
            '<label for="aureum-callback-phone">', escapeHtml(t.phoneLabel), '</label>',
            '<input id="aureum-callback-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="', escapeHtml(t.phonePlaceholder), '" required aria-describedby="aureum-phone-note">',
            '<button type="submit" class="contact-primary" id="aureum-callback-submit">', escapeHtml(t.callbackButton), '</button>',
          '</form>',
          '<p class="contact-note" id="aureum-phone-note">', escapeHtml(t.privacyText), ' <a href="/privacidade.html">', escapeHtml(t.privacyLink), '</a>.</p>',
          '<p class="contact-status" id="aureum-callback-status" role="status" aria-live="polite"></p>',
        '</section>',
      '</div>'
    ].join('');
  }

  const title = panel.querySelector("#contact-panel-title") || panel.querySelector(".contact-panel-title") || panel.querySelector("h2");
  const eyebrow = panel.querySelector("#contact-panel-eyebrow") || panel.querySelector(".contact-panel-eyebrow") || panel.querySelector(".contact-eyebrow");
  const getNumber = () => String((window.AUREUM_INTEGRATIONS && window.AUREUM_INTEGRATIONS.whatsappNumber) || "").replace(/\D/g, "");
  const configured = () => getNumber().length >= 10 && getNumber().length <= 15;
  const openWhatsApp = (message, status) => {
    const number = getNumber();
    if (number.length < 10 || number.length > 15) {
      if (status) status.textContent = t.unconfigured;
      return;
    }
    const url = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    if (status) status.textContent = t.confirm;
  };

  if (whatsappView) {
    const directButton = whatsappView.querySelector("#aureum-send-whatsapp");
    const directStatus = whatsappView.querySelector("#aureum-whatsapp-status");
    const form = whatsappView.querySelector("#aureum-callback-form");
    const phoneInput = whatsappView.querySelector("#aureum-callback-phone");
    const submitButton = whatsappView.querySelector("#aureum-callback-submit");
    const callbackStatus = whatsappView.querySelector("#aureum-callback-status");
    const active = configured();
    if (directButton) directButton.disabled = !active;
    if (phoneInput) phoneInput.disabled = !active;
    if (submitButton) submitButton.disabled = !active;
    if (!active) {
      if (form) form.closest('.contact-option').remove();
      const launcher = document.getElementById('launch-whatsapp');
      if (launcher) {
        launcher.classList.remove('fab-whatsapp');
        launcher.classList.add('ux-contact-launcher');
        launcher.textContent = t.title;
        launcher.title = t.title;
        launcher.setAttribute('aria-label', t.title);
      }
      if (instagram && directButton) {
        const instagramLink = document.createElement('a');
        instagramLink.className = directButton.className;
        instagramLink.href = instagram.href;
        instagramLink.rel = 'noopener noreferrer';
        instagramLink.target = '_blank';
        instagramLink.textContent = instagramLabel;
        directButton.replaceWith(instagramLink);
        const description = whatsappView.querySelector('.contact-option--primary .contact-option-copy p');
        if (description) description.textContent = instagram.getAttribute('aria-label') || instagramLabel;
      }
    }
    if (directButton) directButton.addEventListener("click", () => openWhatsApp(t.directMessage, directStatus));
    if (form) form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!configured()) {
        if (callbackStatus) callbackStatus.textContent = t.unconfigured;
        return;
      }
      const raw = String(phoneInput.value || "").trim();
      const digits = raw.replace(/\D/g, "");
      if (!raw.startsWith("+") || digits.length < 8 || digits.length > 15) {
        phoneInput.setAttribute("aria-invalid", "true");
        if (callbackStatus) callbackStatus.textContent = t.invalid;
        phoneInput.focus();
        return;
      }
      phoneInput.removeAttribute("aria-invalid");
      openWhatsApp(t.callbackMessage.replace("{phone}", "+" + digits), callbackStatus);
    });
    if (phoneInput) phoneInput.addEventListener("input", () => phoneInput.removeAttribute("aria-invalid"));
  }

  const titleEl = panel.querySelector("#contact-panel-title") || panel.querySelector(".contact-panel-title") || panel.querySelector("h2");
  const eyebrowEl = panel.querySelector("#contact-panel-eyebrow") || panel.querySelector(".contact-panel-eyebrow") || panel.querySelector(".contact-eyebrow");
  const updatePanel = () => {
    const assistant = panel.dataset.currentView === "assistant";
    if (titleEl) {
      const value = assistant ? "Mia" : t.title;
      if (titleEl.textContent !== value) titleEl.textContent = value;
    }
    if (eyebrowEl) {
      const value = assistant ? t.miaRole : t.subtitle;
      if (eyebrowEl.textContent !== value) eyebrowEl.textContent = value;
    }
    const open = !panel.hidden;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    document.body.classList.toggle("aureum-chat-open", open && assistant && mobile);
    panel.setAttribute("aria-modal", open && assistant && mobile ? "true" : "false");

    const avatar = panel.querySelector(".mia-avatar");
    if (avatar) {
      avatar.loading = "lazy";
      avatar.decoding = "async";
      avatar.alt = "Mia";
      if (avatar.getAttribute("src") && !avatar.dataset.src) {
        avatar.dataset.src = avatar.getAttribute("src");
        avatar.removeAttribute("src");
      }
      if (assistant && open && avatar.dataset.src && !avatar.getAttribute("src")) avatar.setAttribute("src", avatar.dataset.src);
    }

    const transcript = panel.querySelector("#chat-transcript");
    if (transcript && !transcript.dataset.aureumAutoScroll) {
      let nearBottom = true;
      transcript.addEventListener("scroll", () => {
        nearBottom = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 90;
      }, { passive: true });
      const observer = new MutationObserver(() => {
        if (nearBottom) requestAnimationFrame(() => { transcript.scrollTop = transcript.scrollHeight; });
      });
      observer.observe(transcript, { childList: true, subtree: true });
      transcript.dataset.aureumAutoScroll = "true";
    }
    const input = panel.querySelector("#chat-input");
    if (input && !input.dataset.aureumViewportBound) {
      input.addEventListener("focus", () => {
        window.setTimeout(() => {
          if (window.matchMedia("(max-width: 640px)").matches) input.scrollIntoView({ block: "nearest", behavior: "auto" });
        }, 180);
      });
      input.dataset.aureumViewportBound = "true";
    }
  };
  const syncViewport = () => {
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    panel.style.setProperty("--aureum-vh", Math.round(height) + "px");
  };
  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", syncViewport, { passive: true });
  const panelObserver = new MutationObserver(updatePanel);
  panelObserver.observe(panel, { attributes: true, attributeFilter: ["hidden", "data-current-view"], childList: true, subtree: true });
  updatePanel();
})();

/* AUREUM UI CORRECTIONS — 2026-11-10 */
(function aureumUiCorrections() {
  "use strict";

  /* Remove only an accidental literal \\N / N\\ text node if it is injected in the header. */
  var header = document.getElementById("hdr");
  if (header && window.NodeFilter) {
    var walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT);
    var strayNodes = [];
    while (walker.nextNode()) {
      var value = String(walker.currentNode.nodeValue || "").trim();
      if (value === "\\\\N" || value === "N\\\\") strayNodes.push(walker.currentNode);
    }
    strayNodes.forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  /* Reliable close fallback for Mia and WhatsApp; preserves the conversation DOM/history. */
  if (!document.documentElement.hasAttribute("data-aureum-close-guard")) {
    document.documentElement.setAttribute("data-aureum-close-guard", "true");
    document.addEventListener("click", function (event) {
      var target = event.target;
      var closeButton = target && target.closest ? target.closest("#contact-panel .contact-close") : null;
      if (!closeButton) return;
      var panel = document.getElementById("contact-panel");
      if (!panel) return;
      panel.hidden = true;
      panel.setAttribute("aria-modal", "false");
      var whatsapp = document.getElementById("launch-whatsapp");
      var assistant = document.getElementById("launch-assistant");
      if (whatsapp) whatsapp.setAttribute("aria-expanded", "false");
      if (assistant) assistant.setAttribute("aria-expanded", "false");
      document.body.classList.remove("aureum-chat-open");
    }, true);
  }
})();



/* AUREUM FINAL UI PATCH — 2026-11-11 */
(function aureumFinalUiPatch(){
  "use strict";
  var html=document.documentElement;
  var panel=document.getElementById("contact-panel");
  var assistantView=panel&&panel.querySelector('.contact-view[data-view="assistant"]');
  var currentLanguage=(document.documentElement.lang||"pt").slice(0,2).toLowerCase();
  var assistantLabels={
    pt:{you:"Você",role:"Assistente virtual",note:"Não envie números de documentos ou dados sensíveis.",country:"Reino Unido"},
    en:{you:"You",role:"Virtual assistant",note:"Do not send document numbers or sensitive information.",country:"United Kingdom"},
    es:{you:"Tú",role:"Asistente virtual",note:"No envíes números de documentos ni datos sensibles.",country:"Reino Unido"},
    fr:{you:"Vous",role:"Assistant virtuel",note:"N'envoyez pas de numéros de documents ni de données sensibles.",country:"Royaume-Uni"},
    de:{you:"Sie",role:"Virtueller Assistent",note:"Senden Sie keine Dokumentennummern oder sensiblen Daten.",country:"Vereinigtes Königreich"}
  };
  var activeLabels=assistantLabels[currentLanguage]||assistantLabels.pt;
  ["mia-ui-premium","mia-avatar-centered-20261103","mia-original-svg-clean","aureum-mia-premium-v3"].forEach(function(id){var old=document.getElementById(id);if(old)old.remove();});

  if(!document.getElementById("aureum-final-ui-patch-style")){
    var style=document.createElement("style");
    style.id="aureum-final-ui-patch-style";
    style.textContent=[
      "#aureum-contact-hub #contact-panel[hidden],#aureum-contact-hub #contact-panel[hidden][data-current-view='assistant']{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}",
      "#aureum-contact-hub #contact-panel .contact-view[hidden]{display:none!important;visibility:hidden!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant']{display:flex!important;flex-direction:column!important;width:min(420px,calc(100vw - 32px))!important;height:min(640px,calc(100dvh - 112px))!important;max-height:calc(100dvh - 112px)!important;min-height:0!important;overflow:hidden!important;border-radius:22px!important;background:#FCFBF8!important;color:#0A211B!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-head{position:relative!important;z-index:40!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:11px!important;min-height:64px!important;padding:10px 56px 10px 16px!important;background:#F7F5EF!important;color:#0A211B!important;border:0!important;border-bottom:1px solid rgba(10,33,27,.10)!important;box-shadow:none!important;backdrop-filter:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-head::after{pointer-events:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .mia-avatar{display:block!important;width:42px!important;height:42px!important;min-width:42px!important;max-width:42px!important;flex:0 0 42px!important;margin:0!important;border:1px solid rgba(10,33,27,.16)!important;border-radius:50%!important;object-fit:cover!important;object-position:center!important;background:#E9DDCD!important;box-shadow:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .mia-avatar[hidden]{display:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-head>div{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:3px!important;width:auto!important;min-width:0!important;text-align:left!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-head h2,#aureum-contact-hub #contact-panel[data-current-view='assistant'] #contact-panel-title{margin:0!important;color:#0A211B!important;text-align:left!important;font:600 15px/1.2 Inter,system-ui,sans-serif!important;letter-spacing:-.02em!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-eyebrow{display:block!important;margin:0!important;color:#768774!important;text-align:left!important;font:500 10px/1.3 Inter,system-ui,sans-serif!important;letter-spacing:.015em!important;text-transform:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-close{position:absolute!important;top:50%!important;right:13px!important;z-index:100!important;display:grid!important;place-items:center!important;width:36px!important;height:36px!important;min-width:36px!important;margin:0!important;padding:0!important;transform:translateY(-50%)!important;border:1px solid rgba(10,33,27,.15)!important;border-radius:9999px!important;background:rgba(255,255,255,.82)!important;color:#0A211B!important;box-shadow:none!important;pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-close:hover{transform:translateY(-50%) rotate(90deg)!important;background:#E9DDCD!important;border-color:#A37A42!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-close svg{width:16px!important;height:16px!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .assistant-state{display:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-view[data-view='assistant']{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important;padding:0!important;background:#FCFBF8!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-transcript{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;min-height:0!important;max-height:none!important;height:auto!important;gap:12px!important;padding:14px 16px!important;margin:0!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;background:#FCFBF8!important;scroll-behavior:smooth!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-message{max-width:89%!important;padding:12px 14px!important;border:1px solid rgba(10,33,27,.10)!important;border-radius:16px 16px 16px 5px!important;background:#fff!important;color:#24332C!important;box-shadow:0 3px 12px rgba(10,33,27,.035)!important;font:400 13px/1.58 Inter,system-ui,sans-serif!important;overflow-wrap:anywhere!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-message.chat-user{align-self:flex-end!important;border-color:#1C4C3C!important;border-radius:16px 16px 5px 16px!important;background:#1C4C3C!important;color:#fff!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-author{display:block!important;margin:0 0 5px!important;color:#768774!important;font:600 10px/1.3 Inter,system-ui,sans-serif!important;letter-spacing:.01em!important;text-transform:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-user .chat-author{color:#E9DDCD!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] #chat-suggestions{display:flex!important;flex:0 0 auto!important;flex-wrap:nowrap!important;gap:6px!important;max-height:54px!important;margin:0!important;padding:8px 12px!important;overflow-x:auto!important;overflow-y:hidden!important;border-top:1px solid rgba(10,33,27,.08)!important;background:#F7F5EF!important;scrollbar-width:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] #chat-suggestions[hidden]{display:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] #chat-suggestions button{flex:0 0 auto!important;min-height:30px!important;padding:6px 11px!important;border:1px solid rgba(10,33,27,.15)!important;border-radius:9999px!important;background:#fff!important;color:#0A211B!important;font:500 10px/1.25 Inter,system-ui,sans-serif!important;white-space:nowrap!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-entry{display:flex!important;flex:0 0 auto!important;align-items:center!important;gap:7px!important;min-height:54px!important;margin:0 12px 9px!important;padding:4px 5px 4px 13px!important;border:1px solid rgba(10,33,27,.16)!important;border-radius:9999px!important;background:#fff!important;box-shadow:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-entry input{flex:1 1 auto!important;min-width:0!important;min-height:42px!important;padding:0 4px!important;border:0!important;border-radius:9999px!important;background:transparent!important;color:#0A211B!important;font:400 16px/1.4 Inter,system-ui,sans-serif!important;box-shadow:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-entry button{display:grid!important;flex:0 0 42px!important;place-items:center!important;width:42px!important;height:42px!important;min-width:42px!important;padding:0!important;border:0!important;border-radius:9999px!important;background:#1C4C3C!important;color:#fff!important;box-shadow:none!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-note{flex:0 0 auto!important;margin:0!important;padding:0 14px 5px!important;background:#FCFBF8!important;color:#6A7169!important;font:400 9px/1.4 Inter,system-ui,sans-serif!important}",
      "#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-foot{display:none!important}",
      "button,.btn,.btn-primary,.btn-line,.btn-light,.btn-ghost-light,.btn-hdr,.menu-btn,.contact-launcher,.contact-primary,.dc__cta,.chat-entry button,.chat-suggestions button{border-radius:9999px!important}",
      "@media(max-width:640px){#aureum-contact-hub #contact-panel[data-current-view='assistant']{position:fixed!important;inset:0!important;width:100vw!important;max-width:none!important;height:var(--aureum-vh,100dvh)!important;max-height:none!important;min-height:0!important;margin:0!important;border-radius:0!important;padding-top:env(safe-area-inset-top)!important;padding-bottom:env(safe-area-inset-bottom)!important}#aureum-contact-hub #contact-panel[data-current-view='assistant'] .contact-panel-head{min-height:62px!important;padding:calc(9px + env(safe-area-inset-top)) 56px 9px 14px!important}#aureum-contact-hub #contact-panel[data-current-view='assistant'] .mia-avatar{width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;flex-basis:40px!important}#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-transcript{padding:12px 14px!important}#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-entry{margin:0 12px calc(8px + env(safe-area-inset-bottom))!important}}",
      "@media(prefers-reduced-motion:reduce){#aureum-contact-hub #contact-panel[data-current-view='assistant'],#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-message{animation:none!important;transition:none!important}#aureum-contact-hub #contact-panel[data-current-view='assistant'] .chat-transcript{scroll-behavior:auto!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  if(panel&&!html.hasAttribute("data-aureum-final-close")){
    html.setAttribute("data-aureum-final-close","true");
    document.addEventListener("click",function(event){
      var target=event.target;
      var close=target&&target.closest?target.closest("#contact-panel .contact-close"):null;
      if(!close)return;
      event.preventDefault();event.stopPropagation();
      var isAssistant=panel.dataset.currentView==="assistant";
      panel.hidden=true;panel.setAttribute("aria-modal","false");
      document.body.classList.remove("aureum-chat-open");
      var wa=document.getElementById("launch-whatsapp");
      var mia=document.getElementById("launch-assistant");
      if(wa)wa.setAttribute("aria-expanded","false");
      if(mia)mia.setAttribute("aria-expanded","false");
      var launcher=isAssistant?mia:wa;
      if(launcher)requestAnimationFrame(function(){launcher.focus({preventScroll:true});});
    },true);
  }

  /* Shared reveal controller for every viewport; logo variants live in CSS. */
  (function repairHeader(){
    var header=document.getElementById("hdr");
    var hero=document.querySelector("#home .ux-hero, #home .hero-logo-centered-test");
    var logo=header&&header.querySelector(".navbar .logo");
    var cta=header&&header.querySelector(".navbar .hdr-cta > .btn-hdr");
    if(!header||!hero||!logo||!cta)return;
    var raf=0;
    function update(){
      raf=0;
      html.classList.add("aureum-nav-managed");
      var home=document.getElementById("home");
      var visible=!!home&&home.getClientRects().length>0&&getComputedStyle(home).display!=="none";
      var passed=!visible||hero.getBoundingClientRect().bottom<=(header.getBoundingClientRect().height||78)+4;
      html.classList.toggle("aureum-nav-revealed",passed);
      logo.inert=!passed;cta.inert=!passed;
      logo.setAttribute("aria-hidden",passed?"false":"true");cta.setAttribute("aria-hidden",passed?"false":"true");
    }
    function schedule(){if(!raf)raf=requestAnimationFrame(update);}
    update();
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});
    window.addEventListener("hashchange",schedule);window.addEventListener("pageshow",schedule);document.addEventListener("visibilitychange",schedule);
    if("ResizeObserver"in window){var observer=new ResizeObserver(schedule);observer.observe(hero);observer.observe(header);}
  })();

  (function renameUnitedKingdom(){
    var page=document.getElementById("destino-londres");if(!page)return;
    function replaceText(node){
      if(node.nodeType===3){if(node.nodeValue&&node.nodeValue.indexOf("Londres")!==-1)node.nodeValue=node.nodeValue.replace(/Londres/g,activeLabels.country);return;}
      if(node.nodeType!==1||/^(SCRIPT|STYLE|SVG)$/.test(node.tagName))return;
      Array.prototype.slice.call(node.childNodes).forEach(replaceText);
    }
    replaceText(page);page.setAttribute("data-title",activeLabels.country);
    page.querySelectorAll("*").forEach(function(el){
      ["data-title","data-subject","data-intent","value","title"].forEach(function(attr){
        if(el.hasAttribute(attr)){var value=el.getAttribute(attr);if(value&&value.indexOf("Londres")!==-1)el.setAttribute(attr,value.replace(/Londres/g,activeLabels.country));}
      });
    });
    if(/^\/destinos\/londres\/?$/.test(window.location.pathname)){
      document.title="Reino Unido | Aureum — Assessoria internacional";
      var og=document.querySelector('meta[property="og:title"]');if(og)og.setAttribute("content","Reino Unido | Aureum");
    }
  })();

  if(assistantView){
    var transcript=assistantView.querySelector("#chat-transcript");
    var suggestions=assistantView.querySelector("#chat-suggestions");
    var note=assistantView.querySelector(".contact-note:not(#aureum-chat-recording-notice)");
    if(note)note.textContent=activeLabels.note;
    if(transcript&&suggestions){function syncSuggestions(){suggestions.hidden=!!transcript.querySelector(".chat-user");transcript.querySelectorAll(".chat-user .chat-author").forEach(function(author){if(author.textContent!==activeLabels.you)author.textContent=activeLabels.you;});}syncSuggestions();new MutationObserver(syncSuggestions).observe(transcript,{childList:true,subtree:true});}
    var title=panel.querySelector("#contact-panel-title"),eyebrow=panel.querySelector(".contact-eyebrow");
    function syncIdentity(){if(!panel||panel.dataset.currentView!=="assistant")return;if(title&&title.textContent!=="Mia")title.textContent="Mia";if(eyebrow&&eyebrow.textContent!==activeLabels.role)eyebrow.textContent=activeLabels.role;}
    syncIdentity();new MutationObserver(function(){requestAnimationFrame(syncIdentity);}).observe(panel,{attributes:true,attributeFilter:["data-current-view"],childList:true,subtree:true});
  }
})();
