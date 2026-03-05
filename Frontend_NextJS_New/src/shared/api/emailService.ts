export const emailService = {
  // 1. Валидация формата email (Regex)
  isValidFormat: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-O_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  // 2. Симуляция проверки "глобального существования" email (MX записи)
  verifyEmailExists: async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const domain = email.split('@')[1]?.toLowerCase() ?? '';
        // Имитируем отбраковку несуществующих или тестовых доменов
        const invalidDomains = ['test.com', 'example.com', 'fake.ru', '123.com'];
        if (invalidDomains.includes(domain)) {
          resolve(false);
        } else {
          resolve(true); // Считаем остальные валидными для симуляции
        }
      }, 1500); // Имитация сетевой задержки
    });
  },

  // 3. Подписка на рассылку
  subscribe: async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!emailService.isValidFormat(email)) {
      return { success: false, message: "Неверный формат email адреса." };
    }

    const exists = await emailService.verifyEmailExists(email);
    if (!exists) {
      return { success: false, message: "Указанный домен почты не существует или не принимает письма." };
    }

    // Сохраняем в "базу" (localStorage)
    const subscribersJson = localStorage.getItem('yoga_subscribers');
    const subscribers = subscribersJson ? JSON.parse(subscribersJson) : [];
    
    if (subscribers.includes(email)) {
      return { success: false, message: "Этот email уже подписан на рассылку." };
    }

    subscribers.push(email);
    localStorage.setItem('yoga_subscribers', JSON.stringify(subscribers));

    return { success: true, message: "Вы успешно подписались на обновления!" };
  },

  // 4. Симуляция отправки письма (уведомления/напоминания)
  sendEmail: (to: string, subject: string, body: string) => {
    console.log(`[EMAIL SENT to ${to}]`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Логируем отправленные письма в localStorage для истории
    const sentEmailsJson = localStorage.getItem('yoga_sent_emails');
    const sentEmails = sentEmailsJson ? JSON.parse(sentEmailsJson) : [];
    sentEmails.push({
      to,
      subject,
      body,
      date: new Date().toISOString()
    });
    localStorage.setItem('yoga_sent_emails', JSON.stringify(sentEmails));
  }
};
