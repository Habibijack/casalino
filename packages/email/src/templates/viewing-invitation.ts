import { sendEmail } from '../client';

type SupportedLanguage = 'de' | 'fr' | 'it';

interface ViewingInvitationParams {
  applicantName: string;
  listingAddress: string;
  date: string;
  time: string;
  viewingUrl: string;
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
  dateLabel: string;
  timeLabel: string;
  button: string;
}

function getTranslations(
  params: ViewingInvitationParams,
): TranslatedContent {
  const name = escapeHtml(params.applicantName);
  const address = escapeHtml(params.listingAddress);
  const lang = params.language ?? 'de';

  const translations: Record<SupportedLanguage, TranslatedContent> = {
    de: {
      subject: `Einladung zur Besichtigung: ${params.listingAddress}`,
      heading: 'Einladung zur Besichtigung',
      greeting: `Hallo ${name},`,
      body: `Sie wurden zu einer Besichtigung f&uuml;r <strong>${address}</strong> eingeladen.`,
      dateLabel: 'Datum:',
      timeLabel: 'Uhrzeit:',
      button: 'Termin best&auml;tigen',
    },
    fr: {
      subject: `Invitation \u00e0 la visite: ${params.listingAddress}`,
      heading: 'Invitation &agrave; la visite',
      greeting: `Bonjour ${name},`,
      body: `Vous avez &eacute;t&eacute; invit&eacute;(e) &agrave; visiter <strong>${address}</strong>.`,
      dateLabel: 'Date:',
      timeLabel: 'Heure:',
      button: 'Confirmer le rendez-vous',
    },
    it: {
      subject: `Invito alla visita: ${params.listingAddress}`,
      heading: 'Invito alla visita',
      greeting: `Buongiorno ${name},`,
      body: `&Egrave; stato/a invitato/a a visitare <strong>${address}</strong>.`,
      dateLabel: 'Data:',
      timeLabel: 'Ora:',
      button: `Confermare l&#039;appuntamento`,
    },
  };

  return translations[lang];
}

function buildHtml(params: ViewingInvitationParams): string {
  const t = getTranslations(params);
  const lang = params.language ?? 'de';
  const date = escapeHtml(params.date);
  const time = escapeHtml(params.time);
  const url = encodeURI(params.viewingUrl);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">${t.heading}</h2>
    <p style="color: #3D3832; line-height: 1.6;">${t.greeting}</p>
    <p style="color: #3D3832; line-height: 1.6;">${t.body}</p>
    <table style="margin: 16px 0; border-collapse: collapse;">
      <tr>
        <td style="color: #737373; padding: 4px 16px 4px 0;">${t.dateLabel}</td>
        <td style="color: #1A1714; font-weight: 600;">${date}</td>
      </tr>
      <tr>
        <td style="color: #737373; padding: 4px 16px 4px 0;">${t.timeLabel}</td>
        <td style="color: #1A1714; font-weight: 600;">${time}</td>
      </tr>
    </table>
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

interface SendParams extends ViewingInvitationParams {
  to: string;
}

export async function sendViewingInvitationEmail(params: SendParams) {
  const t = getTranslations(params);

  return sendEmail({
    to: params.to,
    subject: t.subject,
    html: buildHtml(params),
  });
}
