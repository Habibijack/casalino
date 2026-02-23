import { sendEmail } from '../client';

interface ApplicationReceivedParams {
  managerName: string;
  applicantName: string;
  listingAddress: string;
  applicationUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(params: ApplicationReceivedParams): string {
  const manager = escapeHtml(params.managerName);
  const applicant = escapeHtml(params.applicantName);
  const address = escapeHtml(params.listingAddress);
  const url = encodeURI(params.applicationUrl);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">Neue Bewerbung eingegangen</h2>
    <p style="color: #3D3832; line-height: 1.6;">Hallo ${manager},</p>
    <p style="color: #3D3832; line-height: 1.6;">
      <strong>${applicant}</strong> hat sich f&uuml;r
      <strong>${address}</strong> beworben.
    </p>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      Bewerbung ansehen
    </a>
    <p style="color: #737373; font-size: 12px; margin-top: 32px;">
      Casalino &ndash; Vermietungsplattform
    </p>
  </div>
</body>
</html>`;
}

interface SendParams extends ApplicationReceivedParams {
  to: string;
}

export async function sendApplicationReceivedEmail(params: SendParams) {
  return sendEmail({
    to: params.to,
    subject: `Neue Bewerbung: ${params.applicantName} f\u00fcr ${params.listingAddress}`,
    html: buildHtml(params),
  });
}
