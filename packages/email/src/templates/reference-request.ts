import { sendEmail } from '../client';

interface ReferenceRequestParams {
  landlordName: string;
  applicantName: string;
  referenceUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildSubject(applicantName: string): string {
  return `Referenzanfrage fuer ${applicantName}`;
}

function buildHtml(params: ReferenceRequestParams): string {
  const landlord = escapeHtml(params.landlordName);
  const applicant = escapeHtml(params.applicantName);
  const url = encodeURI(params.referenceUrl);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">Referenzanfrage</h2>
    <p style="color: #3D3832; line-height: 1.6;">Sehr geehrte/r ${landlord},</p>
    <p style="color: #3D3832; line-height: 1.6;">
      <strong>${applicant}</strong> hat sich f&uuml;r eine Wohnung beworben und Sie als aktuelle/n Vermieter/in angegeben.
      Bitte geben Sie eine kurze Referenz ab (ca. 2 Minuten).
    </p>
    <p style="color: #3D3832; line-height: 1.6;">
      Ihre Einsch&auml;tzung hilft uns, den Bewerbungsprozess fair und transparent zu gestalten.
    </p>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      Referenz abgeben
    </a>
    <p style="color: #737373; font-size: 12px; margin-top: 32px;">
      Dieser Link ist 7 Tage g&uuml;ltig. Falls Sie Fragen haben, kontaktieren Sie uns bitte.
    </p>
    <p style="color: #737373; font-size: 12px; margin-top: 8px;">
      Casalino &ndash; Vermietungsplattform
    </p>
  </div>
</body>
</html>`;
}

interface SendParams extends ReferenceRequestParams {
  to: string;
}

export async function sendReferenceRequestEmail(params: SendParams) {
  return sendEmail({
    to: params.to,
    subject: buildSubject(params.applicantName),
    html: buildHtml(params),
  });
}
