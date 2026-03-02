"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { emailService } from "@/shared/api/emailService";
import { subscribeEmail, checkSubscription } from "@/shared/api/subscriberApi";
import { modalService } from "@/shared/ui/Modal/modalService";

export const Newsletter = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    <section className="py-5" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2 className="font-playfair display-6 fw-bold mb-4 text-white">{t.home.newsletterTitle}</h2>
            <p className="lead mb-5 font-montserrat" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t.home.newsletterDesc}
            </p>
            <form className="d-flex flex-column flex-sm-row gap-3 justify-content-center max-w-md mx-auto" style={{ maxWidth: '500px' }} onSubmit={handleSubmit}>
              <input 
                id="newsletter-email"
                type="email" 
                className="form-control form-control-lg rounded-pill border-0 px-4" 
                placeholder={t.home.newsletterPlaceholder} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required 
                style={{ backgroundColor: '#7a6a5e', color: '#f5f0eb', caretColor: '#f5f0eb' }}
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
