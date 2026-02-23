import { sendEmail } from '../client';

interface MemberInvitationParams {
  inviterName: string;
  orgName: string;
  inviteUrl: string;
  role: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(params: MemberInvitationParams): string {
  const inviter = escapeHtml(params.inviterName);
  const org = escapeHtml(params.orgName);
  const role = escapeHtml(params.role);
  const url = encodeURI(params.inviteUrl);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, sans-serif; background: #FAFAF8; padding: 40px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
    <h2 style="color: #1A1714; margin: 0 0 16px;">Einladung zu ${org}</h2>
    <p style="color: #3D3832; line-height: 1.6;">Hallo,</p>
    <p style="color: #3D3832; line-height: 1.6;">
      <strong>${inviter}</strong> hat Sie eingeladen, dem Team
      <strong>${org}</strong> auf Casalino beizutreten.
    </p>
    <p style="color: #3D3832; line-height: 1.6;">
      Ihre Rolle: <strong>${role}</strong>
    </p>
    <a href="${url}"
       style="display: inline-block; background: #E8503E; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
      Einladung annehmen
    </a>
    <p style="color: #737373; font-size: 12px; margin-top: 32px;">
      Casalino &ndash; Vermietungsplattform
    </p>
  </div>
</body>
</html>`;
}

interface SendParams extends MemberInvitationParams {
  to: string;
}

export async function sendMemberInvitationEmail(params: SendParams) {
  return sendEmail({
    to: params.to,
    subject: `Einladung zu ${params.orgName} auf Casalino`,
    html: buildHtml(params),
  });
}
