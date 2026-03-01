"use client";

import Link from "next/link";
import { useState } from "react";
import { emailService } from "@/shared/api/emailService";
import { modalService } from "@/shared/ui/Modal/modalService";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      modalService.alert("Внимание", "Пожалуйста, введите email адрес.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await emailService.subscribe(email);
      
      if (result.success) {
        await modalService.alert("Внимание", result.message);
        setEmail(""); // Очищаем форму после успешной подписки
      } else {
        await modalService.alert("Внимание", result.message);
      }
    } catch (error) {
      modalService.alert("Внимание", "Произошла ошибка при подписке. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="py-5" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-secondary)' }}>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <h3 className="font-playfair mb-3 text-white">YOGA.LIFE</h3>
            <p style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.footer.description}</p>
          </div>
          <div className="col-lg-2 col-6">
            <h5 className="mb-3 text-white">{t.footer.quickLinks}</h5>
            <ul className="list-unstyled">
              <li><Link href="/courses-beginners" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.courses}</Link></li>
              <li><Link href="/tours" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.tours}</Link></li>
              <li><Link href="/consultations-private" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.consultations}</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-6">
            <h5 className="mb-3 text-white">{t.footer.contacts}</h5>
            <ul className="list-unstyled">
              <li><Link href="/about" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.about}</Link></li>
              <li><Link href="/contact" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.contact}</Link></li>
              <li><Link href="/blog-articles" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.blog}</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h5 className="mb-3 text-white">{t.footer.subscribe}</h5>
            <form className="d-flex" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                className="form-control rounded-pill me-2" 
                placeholder={t.footer.yourEmail} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="btn btn-primary-custom rounded-pill text-white px-4"
                disabled={isLoading}
              >
                {isLoading ? "..." : "OK"}
              </button>
            </form>
          </div>
        </div>
        <div className="border-top mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderColor: 'rgba(244, 241, 234, 0.2) !important', color: 'rgba(244, 241, 234, 0.5)' }}>
          <small className="mb-2 mb-md-0">© 2026 YOGA.LIFE. {t.footer.rights}</small>
          <div className="d-flex gap-3">
            <Link href="/privacy" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.5)', fontSize: '0.875em' }}>{t.footer.privacyPolicy}</Link>
            <Link href="/terms" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.5)', fontSize: '0.875em' }}>{t.footer.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
