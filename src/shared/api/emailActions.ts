'use server';

import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM || 'YOGA.LIFE <noreply@yoga.life>';

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[emailActions] RESEND_API_KEY не задан — письмо не отправлено.');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({ from: FROM, to, subject, text: body });
}

export async function sendWelcomeGuide(email: string): Promise<void> {
  await sendEmail(
    email,
    'Ваш бесплатный гайд по медитации от YOGA.LIFE',
    'Здравствуйте!\n\nСпасибо за подписку. Ваш бесплатный гайд по медитации:\nhttps://yoga.life/guide\n\nС уважением, команда YOGA.LIFE',
  );
}
