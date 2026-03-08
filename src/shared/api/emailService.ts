import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM || 'YOGA.LIFE <noreply@yoga.life>';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export const emailService = {
  isValidFormat: (email: string): boolean => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  sendEmail: async (to: string, subject: string, body: string): Promise<void> => {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[emailService] RESEND_API_KEY не задан — письмо не отправлено.');
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform-ruby.vercel.app';
    await emailService.sendEmail(
      email,
      'Ваш бесплатный гайд по медитации от YOGA.LIFE',
      `Здравствуйте!\n\nСпасибо за подписку. Ваш бесплатный гайд по медитации:\n${siteUrl}/guide\n\nС уважением, команда YOGA.LIFE`,
    );
  },

  sendPasswordResetEmail: async (email: string, resetUrl: string): Promise<void> => {
    await emailService.sendEmail(
      email,
      'Сброс пароля — YOGA.LIFE',
      `Здравствуйте!\n\nДля сброса пароля перейдите по ссылке:\n${resetUrl}\n\nСсылка действует 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.\n\nС уважением, команда YOGA.LIFE`,
    );
  },

  sendOrderConfirmation: async (
    email: string,
    productName: string,
    price: number,
    notes: string | undefined,
    profileUrl: string,
  ): Promise<void> => {
    const notesLine = notes ? `\n\nЖелаемая дата/время: ${notes}` : '';
    await emailService.sendEmail(
      email,
      `Ваша заявка «${productName}» принята — YOGA.LIFE`,
      `Здравствуйте!\n\nСпасибо за запись!\n\nМы получили вашу заявку на «${productName}» на сумму ${price} ₴.${notesLine}\n\nМенеджер свяжется с вами в ближайшее время для подтверждения.\n\nОтследить статус заявки: ${profileUrl}\n\nС уважением, команда YOGA.LIFE`,
    );
  },

  sendOrderStatusUpdate: async (email: string, productName: string, accepted: boolean): Promise<void> => {
    const statusMessage = accepted
      ? `Ваша заявка на «${productName}» принята. Менеджер свяжется с вами в ближайшее время.`
      : `Ваша заявка на «${productName}» была отклонена. Если у вас есть вопросы, свяжитесь с нами.`;
    await emailService.sendEmail(
      email,
      `Статус вашей заявки «${productName}» — YOGA.LIFE`,
      `Здравствуйте!\n\n${statusMessage}\n\nС уважением, команда YOGA.LIFE`,
    );
  },

  sendPromoCodeEmail: async (email: string, promoCode: string, completedCount: number): Promise<void> => {
    await emailService.sendEmail(
      email,
      `Ваш подарочный промокод от YOGA.LIFE`,
      `Здравствуйте!\n\nВы оформили ${completedCount} заявки на наши услуги. В знак благодарности дарим вам промокод на скидку 10%:\n\n${promoCode}\n\nПромокод действует 90 дней.\n\nС уважением, команда YOGA.LIFE`,
    );
  },

  sendAdminOrderNotification: async (
    email: string,
    productName: string,
    buyer: string,
    price: number,
    notes: string | undefined,
    adminUrl: string,
  ): Promise<void> => {
    const notesLine = notes ? `\n\nЖелаемая дата/время: ${notes}` : '';
    await emailService.sendEmail(
      email,
      `Новая заявка: «${productName}» — YOGA.LIFE`,
      `Новая заявка на платформе!\n\nПродукт: ${productName}\nКлиент: ${buyer}\nСумма: ${price} ₴${notesLine}\n\nУправление заявками: ${adminUrl}`,
    );
  },
};
