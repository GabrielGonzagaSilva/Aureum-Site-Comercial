import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { escapeHtml, experienceCopy, privacyPath } from './experience.mjs';
import { siteOrigin } from './search-metadata.mjs';

const copy = {
  en: {
    title: 'Privacy on the Aureum website', back: 'Return to the website',
    sections: [
      ['Browsing and hosting', 'Vercel hosts the website and receives the technical information needed to deliver pages, such as your IP address and the page you visit. The site uses HTTPS.'],
      ['First contact', 'The form prepares a message in your browser. If you copy it, the text goes to your device’s clipboard. If you then send it through an external channel such as Instagram, that service receives the information you choose to send. Keep personal documents and sensitive details out of your first message.'],
      ['Past conversations with Mia', 'The assistant is paused. While it was active, conversation content went to Google Gemini to generate responses. Aureum recorded the last message, the response, the time, a session identifier and the technical status in private Vercel Blob storage in the United States, with a backup copy.'],
      ['Requests about your data', 'To ask about your data, request a correction or request deletion where applicable, use the contact options on the website.'],
    ],
  },
  es: {
    title: 'Privacidad en el sitio de Aureum', back: 'Volver al sitio',
    sections: [
      ['Navegación y alojamiento', 'Vercel aloja el sitio y recibe los datos técnicos necesarios para mostrar las páginas, como la dirección IP y la página visitada. La conexión usa HTTPS.'],
      ['Primer contacto', 'El formulario prepara un mensaje en tu navegador. Si lo copias, el texto va al portapapeles de tu dispositivo. Si después lo envías por un canal externo como Instagram, ese servicio recibe la información que decidas enviar. Evita incluir documentos personales o datos sensibles en el primer mensaje.'],
      ['Conversaciones anteriores con Mia', 'El asistente está en pausa. Cuando estaba activo, el contenido de la conversación se enviaba a Google Gemini para generar la respuesta. Aureum guardaba el último mensaje, la respuesta, la hora, un identificador de sesión y el estado técnico en un espacio privado de Vercel Blob en Estados Unidos, con una copia de seguridad.'],
      ['Solicitudes sobre tus datos', 'Para solicitar información, una corrección o la eliminación de tus datos cuando corresponda, usa los canales de contacto del sitio.'],
    ],
  },
  fr: {
    title: 'Confidentialité sur le site Aureum', back: 'Retour au site',
    sections: [
      ['Navigation et hébergement', 'Vercel héberge le site et reçoit les informations techniques nécessaires à l’affichage des pages, comme l’adresse IP et la page consultée. La connexion utilise HTTPS.'],
      ['Premier contact', 'Le formulaire prépare le message dans votre navigateur. Si vous le copiez, le texte passe dans le presse-papiers de votre appareil. Si vous l’envoyez ensuite par un canal externe comme Instagram, ce service reçoit les informations que vous décidez de transmettre. Évitez les documents personnels et les données sensibles lors du premier contact.'],
      ['Anciennes conversations avec Mia', 'L’assistant est en pause. Lorsqu’il était actif, le contenu était transmis à Google Gemini pour produire la réponse. Aureum conservait le dernier message, la réponse, l’heure, un identifiant de session et le statut technique dans un espace Vercel Blob privé aux États-Unis, avec une copie de sauvegarde.'],
      ['Demandes concernant vos données', 'Pour demander des informations, une rectification ou une suppression de vos données lorsque cela s’applique, utilisez les moyens de contact indiqués sur le site.'],
    ],
  },
  de: {
    title: 'Datenschutz auf der Aureum-Website', back: 'Zurück zur Website',
    sections: [
      ['Website und Hosting', 'Vercel hostet die Website und erhält technische Angaben, die zur Bereitstellung der Seiten erforderlich sind, etwa die IP-Adresse und die aufgerufene Seite. Die Verbindung nutzt HTTPS.'],
      ['Erster Kontakt', 'Das Formular bereitet die Nachricht in Ihrem Browser vor. Beim Kopieren gelangt der Text in die Zwischenablage Ihres Geräts. Wenn Sie die Nachricht über einen externen Kanal wie Instagram senden, erhält dieser Dienst die Informationen, die Sie übermitteln. Vermeiden Sie beim ersten Kontakt persönliche Unterlagen und sensible Angaben.'],
      ['Frühere Gespräche mit Mia', 'Der Assistent ist pausiert. Während des Betriebs wurden Gesprächsinhalte zur Antwortgenerierung an Google Gemini übermittelt. Aureum speicherte die letzte Nachricht, die Antwort, die Uhrzeit, eine Sitzungskennung und den technischen Status in einem privaten Vercel-Blob-Speicher in den USA mit einer Sicherungskopie.'],
      ['Anfragen zu Ihren Daten', 'Für Auskünfte, Berichtigungen oder gegebenenfalls die Löschung Ihrer Daten nutzen Sie die Kontaktmöglichkeiten auf der Website.'],
    ],
  },
};

export async function applyPrivacyPages(root = 'dist') {
  const portuguese = await readFile(join(root, 'privacidade.html'), 'utf8');
  const [head] = portuguese.split('</head>');
  const languages = Object.keys(experienceCopy);
  const alternates = languages.map(locale => `<link rel="alternate" hreflang="${locale === 'pt' ? 'pt-BR' : locale}" href="${siteOrigin}${privacyPath(locale)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${siteOrigin}/privacidade.html">\n`;
  await writeFile(join(root, 'privacidade.html'), portuguese.replace('</head>', alternates + '</head>'));

  for (const [locale, page] of Object.entries(copy)) {
    const home = '/' + locale + '/';
    const localizedHead = head.replace('lang="pt-BR"', 'lang="' + locale + '"')
      .replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(page.title) + '</title>');
    const content = page.sections.map(([title, paragraph]) => `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(paragraph)}</p>`).join('\n');
    const output = `${localizedHead}${alternates}</head>
<body class="aureum-document">
<main>
  <a class="brand" href="${home}"><img src="/assets/brand/logo-reduzida-preto.svg" alt="Aureum" width="764" height="186"></a>
  <h1>${escapeHtml(page.title)}</h1>
  ${content}
  <footer><a href="${home}#contato">${escapeHtml(experienceCopy[locale].contact)}</a> · <a href="${home}">${escapeHtml(page.back)}</a></footer>
</main>
</body>
</html>\n`;
    await mkdir(join(root, locale), { recursive: true });
    await writeFile(join(root, privacyPath(locale).slice(1)), output);
  }
}
