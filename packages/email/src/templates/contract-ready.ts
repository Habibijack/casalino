import { sendEmail } from '../client';

interface ContractReadyParams {
  tenantName: string;
  listingAddress: string;
  contractUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(params: ContractReadyParams): string {
  const name = escapeHtml(params.tenantName);
  const address = escapeHtml(params.listingAddress);
  const url = encodeURI(params.contractUrl);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">Ihr Mietvertrag ist bereit</h2>
    <p style="color: #3D3832; line-height: 1.6;">Hallo ${name},</p>
    <p style="color: #3D3832; line-height: 1.6;">
      Ihr Mietvertrag f&uuml;r <strong>${address}</strong> ist bereit
      und wartet auf Ihre Unterschrift.
    </p>
    <p style="color: #3D3832; line-height: 1.6;">
      Bitte pr&uuml;fen Sie den Vertrag und unterschreiben Sie ihn digital
      &uuml;ber den folgenden Link:
    </p>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      Mietvertrag ansehen
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
  return sendEmail({
    to: params.to,
    subject: `Ihr Mietvertrag ist bereit: ${params.listingAddress}`,
    html: buildHtml(params),
  });
}
