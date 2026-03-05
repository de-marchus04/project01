"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { emailService } from "@/shared/api/emailService";
import { modalService } from "@/shared/ui/Modal/modalService";

export const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = () => {
      const userJson = localStorage.getItem('yoga_user');
      let userEmail = '';
      if (userJson) {
        const userData = JSON.parse(userJson);
        const profileJson = localStorage.getItem(`profile_${userData.username}`);
        userEmail = profileJson ? JSON.parse(profileJson).email : `${userData.username}@example.com`;
      }

      const subscribersJson = localStorage.getItem('yoga_subscribers');
      const subscribers = subscribersJson ? JSON.parse(subscribersJson) : [];
      
      if (userEmail && subscribers.includes(userEmail)) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
    window.addEventListener('yoga_subscription_updated', checkSubscription);
    return () => window.removeEventListener('yoga_subscription_updated', checkSubscription);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      modalService.alert("Внимание", "Пожалуйста, введите email адрес.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Валидация формата
      if (!emailService.isValidFormat(email)) {
        await modalService.alert("Внимание", "Неверный формат email адреса.");
        setIsLoading(false);
        return;
      }

      // 2. Проверка существования домена
      const exists = await emailService.verifyEmailExists(email);
      if (!exists) {
        await modalService.alert("Внимание", "Указанный домен почты не существует или не принимает письма.");
        setIsLoading(false);
        return;
      }

      // 3. Проверка на дублирование в базе подписчиков (как в футере)
      const subscribersJson = localStorage.getItem('yoga_subscribers');
      const subscribers = subscribersJson ? JSON.parse(subscribersJson) : [];
      
      let isNewSubscriber = false;
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('yoga_subscribers', JSON.stringify(subscribers));
        isNewSubscriber = true;
        window.dispatchEvent(new Event('yoga_subscription_updated'));
      }

      // 4. Отправка обещанного гайда
      emailService.sendEmail(
        email,
        "Ваш бесплатный гайд по медитации от YOGA.LIFE",
        "Здравствуйте!\n\nСпасибо за интерес к нашей платформе. Вот ваш бесплатный гайд по медитации для начинающих: [Ссылка на скачивание PDF]\n\n{t.home.newsletterTitle} уже сегодня!"
      );
      
      // 5. Уведомление пользователя
      if (isNewSubscriber) {
        await modalService.alert("Успешно!", "Гайд отправлен на вашу почту! Вы также успешно подписаны на наши обновления и анонсы ретритов.");
      } else {
        await modalService.alert("Успешно!", "Гайд отправлен на вашу почту! (Вы уже являетесь нашим подписчиком, дублирования рассылки не будет).");
      }
      
      setEmail("");
    } catch (error) {
      modalService.alert("Ошибка", "Произошла ошибка при обработке запроса. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return null;
  }

  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2 className="font-playfair fw-bold mb-4 text-white" style={{ fontSize: 'var(--text-4xl)' }}>{t.home.newsletterTitle}</h2>
            <p className="lead mb-5" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 'var(--leading-relaxed)' }}>
              {t.home.newsletterDesc}
            </p>
            <form className="d-flex flex-column flex-sm-row gap-3 justify-content-center mx-auto" style={{ maxWidth: '500px' }} onSubmit={handleSubmit}>
              <input
                type="email"
                className="form-control form-control-lg border-0 px-4"
                style={{ borderRadius: 'var(--radius-full)' }}
                placeholder={t.home.newsletterPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                aria-label={t.home.newsletterPlaceholder}
              />
              <button
                type="submit"
                className="btn btn-accent-custom btn-lg px-5 fw-bold"
                style={{ borderRadius: 'var(--radius-full)' }}
                disabled={isLoading}
              >
                {isLoading ? t.home.newsletterSending : t.home.newsletterBtn}
              </button>
            </form>
            <small className="d-block mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {t.home.newsletterSpam}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
