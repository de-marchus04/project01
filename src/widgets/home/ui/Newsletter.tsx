"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { emailService } from "@/shared/api/emailService";
import { subscribeEmail, checkSubscription } from "@/shared/api/subscriberApi";
import { modalService } from "@/shared/ui/Modal/modalService";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

export const Newsletter = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { observe } = useScrollReveal();

  useEffect(() => {
    const userEmail = sessionUser?.email;
    if (userEmail) {
      checkSubscription(userEmail).then(setIsSubscribed);
    }
  }, [sessionUser?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      modalService.alert("Внимание", "Пожалуйста, введите email адрес.");
      return;
    }

    if (!emailService.isValidFormat(email)) {
      await modalService.alert("Внимание", "Неверный формат email адреса.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscribeEmail(email);
      await emailService.sendWelcomeGuide(email);

      if (result.alreadySubscribed) {
        await modalService.alert("Успешно!", "Гайд отправлен на вашу почту! (Вы уже являетесь нашим подписчиком).");
      } else {
        await modalService.alert("Успешно!", "Гайд отправлен на вашу почту! Вы также успешно подписаны на наши обновления и анонсы ретритов.");
        setIsSubscribed(true);
      }

      setEmail("");
    } catch (error) {
      modalService.alert("Ошибка", "Произошла ошибка при обработке запроса. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed && sessionUser?.email) {
    return null;
  }

  return (
    <section
      className="py-5"
      style={{
        background: `
          radial-gradient(ellipse at 25% 50%, rgba(196,113,74,0.22) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 20%, rgba(92,110,79,0.15) 0%, transparent 45%),
          var(--color-primary)
        `,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Плавающий лист — декоративный элемент */}
      <div
        aria-hidden="true"
        className="float-element"
        style={{
          position: 'absolute',
          right: '5%',
          top: '10%',
          opacity: 0.1,
          pointerEvents: 'none'
        }}
      >
        <svg width="120" height="180" viewBox="0 0 120 180" fill="none">
          <path
            d="M60,170 C60,170 10,120 10,70 C10,40 35,10 60,10 C85,10 110,40 110,70 C110,120 60,170 60,170 Z"
            fill="white"
          />
          <path d="M60,170 L60,10" stroke="white" strokeWidth="1.5" opacity="0.6"/>
          <path d="M60,80 Q30,65 15,50" stroke="white" strokeWidth="1" opacity="0.5"/>
          <path d="M60,100 Q90,85 105,70" stroke="white" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center reveal-up" ref={observe as any}>
            <h2 className="font-playfair display-6 fw-bold mb-4 text-white">{t.home.newsletterTitle}</h2>
            <p className="lead mb-5 font-montserrat" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t.home.newsletterDesc}
            </p>
            <form
              className="d-flex flex-column flex-sm-row gap-3 justify-content-center"
              style={{ maxWidth: '500px', margin: '0 auto' }}
              onSubmit={handleSubmit}
            >
              <input
                id="newsletter-email"
                type="email"
                className="form-control form-control-lg rounded-pill border-0 px-4"
                placeholder={t.home.newsletterPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                style={{
                  backgroundColor: 'var(--color-newsletter-input)',
                  color: '#f5f0eb',
                  caretColor: '#f5f0eb',
                  backdropFilter: 'blur(4px)'
                }}
              />
              <button
                type="submit"
                className="btn btn-accent-custom btn-lg rounded-pill px-5 fw-bold"
                disabled={isLoading}
              >
                {isLoading ? t.home.newsletterSending : t.home.newsletterBtn}
              </button>
            </form>
            <small className="d-block mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t.home.newsletterSpam}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
