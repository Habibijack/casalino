import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY ?? '';

export const resend = new Resend(apiKey);

const FROM_EMAIL = 'Casalino <noreply@casalino.ch>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
