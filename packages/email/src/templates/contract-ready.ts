import { sendEmail } from '../client';

type SupportedLanguage = 'de' | 'fr' | 'it';

interface ContractReadyParams {
  tenantName: string;
  listingAddress: string;
  contractUrl: string;
  language?: SupportedLanguage;
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
  reviewText: string;
  button: string;
}

function getTranslations(
  params: ContractReadyParams,
): TranslatedContent {
  const name = escapeHtml(params.tenantName);
  const address = escapeHtml(params.listingAddress);
  const lang = params.language ?? 'de';

  const translations: Record<SupportedLanguage, TranslatedContent> = {
    de: {
      subject: `Ihr Mietvertrag ist bereit: ${params.listingAddress}`,
      heading: 'Ihr Mietvertrag ist bereit',
      greeting: `Hallo ${name},`,
      body: `Ihr Mietvertrag f&uuml;r <strong>${address}</strong> ist bereit und wartet auf Ihre Unterschrift.`,
      reviewText: 'Bitte pr&uuml;fen Sie den Vertrag und unterschreiben Sie ihn digital &uuml;ber den folgenden Link:',
      button: 'Mietvertrag ansehen',
    },
    fr: {
      subject: `Votre contrat de bail est pr\u00eat: ${params.listingAddress}`,
      heading: 'Votre contrat de bail est pr&ecirc;t',
      greeting: `Bonjour ${name},`,
      body: `Votre contrat de bail pour <strong>${address}</strong> est pr&ecirc;t et attend votre signature.`,
      reviewText: 'Veuillez v&eacute;rifier le contrat et le signer num&eacute;riquement via le lien suivant:',
      button: 'Voir le contrat',
    },
    it: {
      subject: `Il suo contratto di locazione \u00e8 pronto: ${params.listingAddress}`,
      heading: 'Il suo contratto di locazione &egrave; pronto',
      greeting: `Buongiorno ${name},`,
      body: `Il suo contratto di locazione per <strong>${address}</strong> &egrave; pronto e attende la sua firma.`,
      reviewText: 'La preghiamo di verificare il contratto e di firmarlo digitalmente tramite il seguente link:',
      button: 'Visualizza il contratto',
    },
  };

  return translations[lang];
}

function buildHtml(params: ContractReadyParams): string {
  const t = getTranslations(params);
  const lang = params.language ?? 'de';
  const url = encodeURI(params.contractUrl);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">${t.heading}</h2>
    <p style="color: #3D3832; line-height: 1.6;">${t.greeting}</p>
    <p style="color: #3D3832; line-height: 1.6;">${t.body}</p>
    <p style="color: #3D3832; line-height: 1.6;">${t.reviewText}</p>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      ${t.button}
    </a>
    <p style="color: #737373; font-size: 12px; margin-top: 32px;">
      Casalino &ndash; Vermietungsplattform
    </p>
  </div>
</body>
</html>`;
}

interface SendParams extends ContractReadyParams {
  to: string;
}

export async function sendContractReadyEmail(params: SendParams) {
  const t = getTranslations(params);

  return sendEmail({
    to: params.to,
    subject: t.subject,
    html: buildHtml(params),
  });
}
