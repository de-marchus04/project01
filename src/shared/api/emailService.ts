import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "YOGA.LIFE <noreply@yoga.life>";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export const emailService = {
  isValidFormat: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  sendEmail: async (to: string, subject: string, body: string): Promise<void> => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[emailService] RESEND_API_KEY не задан — письмо не отправлено.");
      return;
    }
    await getResend().emails.send({
      from: FROM,
      to,
      subject,
      text: body,
    });
  },

  sendWelcomeGuide: async (email: string): Promise<void> => {
    await emailService.sendEmail(
      email,
      "Ваш бесплатный гайд по медитации от YOGA.LIFE",
      `Здравствуйте!\n\nСпасибо за подписку. Ваш бесплатный гайд по медитации:\n${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga.life'}/guide\n\nС уважением, команда YOGA.LIFE`
    );
  },
};
