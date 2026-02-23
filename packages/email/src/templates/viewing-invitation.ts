import { sendEmail } from '../client';

interface ViewingInvitationParams {
  applicantName: string;
  listingAddress: string;
  date: string;
  time: string;
  viewingUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(params: ViewingInvitationParams): string {
  const name = escapeHtml(params.applicantName);
  const address = escapeHtml(params.listingAddress);
  const date = escapeHtml(params.date);
  const time = escapeHtml(params.time);
  const url = encodeURI(params.viewingUrl);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">Einladung zur Besichtigung</h2>
    <p style="color: #3D3832; line-height: 1.6;">Hallo ${name},</p>
    <p style="color: #3D3832; line-height: 1.6;">
      Sie wurden zu einer Besichtigung f&uuml;r
      <strong>${address}</strong> eingeladen.
    </p>
    <table style="margin: 16px 0; border-collapse: collapse;">
      <tr>
        <td style="color: #737373; padding: 4px 16px 4px 0;">Datum:</td>
        <td style="color: #1A1714; font-weight: 600;">${date}</td>
      </tr>
      <tr>
        <td style="color: #737373; padding: 4px 16px 4px 0;">Uhrzeit:</td>
        <td style="color: #1A1714; font-weight: 600;">${time}</td>
      </tr>
    </table>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      Termin best&auml;tigen
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
  return sendEmail({
    to: params.to,
    subject: `Einladung zur Besichtigung: ${params.listingAddress}`,
    html: buildHtml(params),
  });
}
