import { sendEmail } from '../client';

type SupportedLanguage = 'de' | 'fr' | 'it';

interface RejectionParams {
  applicantName: string;
  listingAddress: string;
  language: SupportedLanguage;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface TranslatedContent {
  subject: string;
  heading: string;
  greeting: string;
  body: string;
  closing: string;
}

function getTranslations(
  params: RejectionParams,
): TranslatedContent {
  const name = escapeHtml(params.applicantName);
  const address = escapeHtml(params.listingAddress);

  const translations: Record<SupportedLanguage, TranslatedContent> = {
    de: {
      subject: `Ihre Bewerbung f\u00fcr ${params.listingAddress}`,
      heading: 'Ihre Bewerbung',
      greeting: `Hallo ${name},`,
      body: `Vielen Dank f&uuml;r Ihr Interesse an <strong>${address}</strong>. Leider m&uuml;ssen wir Ihnen mitteilen, dass wir uns f&uuml;r eine andere Bewerbung entschieden haben.`,
      closing: 'Wir w&uuml;nschen Ihnen viel Erfolg bei der weiteren Wohnungssuche.',
    },
    fr: {
      subject: `Votre candidature pour ${params.listingAddress}`,
      heading: 'Votre candidature',
      greeting: `Bonjour ${name},`,
      body: `Nous vous remercions de votre int&eacute;r&ecirc;t pour <strong>${address}</strong>. Malheureusement, nous avons d&eacute;cid&eacute; de retenir une autre candidature.`,
      closing: 'Nous vous souhaitons beaucoup de succ&egrave;s dans votre recherche de logement.',
    },
    it: {
      subject: `La sua candidatura per ${params.listingAddress}`,
      heading: 'La sua candidatura',
      greeting: `Buongiorno ${name},`,
      body: `La ringraziamo per il suo interesse per <strong>${address}</strong>. Purtroppo dobbiamo comunicarle che abbiamo scelto un&#039;altra candidatura.`,
      closing: 'Le auguriamo buona fortuna nella ricerca di un alloggio.',
    },
  };

  return translations[params.language];
}

function buildHtml(params: RejectionParams): string {
  const t = getTranslations(params);
  const lang = params.language;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">${t.heading}</h2>
    <p style="color: #3D3832; line-height: 1.6;">${t.greeting}</p>
    <p style="color: #3D3832; line-height: 1.6;">${t.body}</p>
    <p style="color: #3D3832; line-height: 1.6;">${t.closing}</p>
    <p style="color: #737373; font-size: 12px; margin-top: 32px;">
      Casalino &ndash; Vermietungsplattform
    </p>
  </div>
</body>
</html>`;
}

interface SendParams extends RejectionParams {
  to: string;
}

export async function sendRejectionEmail(params: SendParams) {
  const t = getTranslations(params);

  return sendEmail({
    to: params.to,
    subject: t.subject,
    html: buildHtml(params),
  });
}
