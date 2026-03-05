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
        setEmail("");
      } else {
        await modalService.alert("Внимание", result.message);
      }
    } catch (error) {
      modalService.alert("Внимание", "Произошла ошибка при подписке. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinkColor = 'rgba(255, 255, 255, 0.65)';
  const footerMutedColor = 'rgba(255, 255, 255, 0.45)';

  return (
    <footer role="contentinfo" style={{ backgroundColor: 'var(--color-text)', padding: '3rem 0 2rem' }}>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <h3 className="font-playfair mb-3 text-white" style={{ fontSize: '1.5rem' }}>YOGA.LIFE</h3>
            <p style={{ color: footerLinkColor, lineHeight: '1.75' }}>{t.footer.description}</p>
          </div>
          <div className="col-lg-2 col-6">
            <h5 className="mb-3 text-white" style={{ fontSize: '1rem' }}>{t.footer.quickLinks}</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/courses-beginners" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.courses}</Link></li>
              <li><Link href="/tours" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.tours}</Link></li>
              <li><Link href="/consultations-private" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.consultations}</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-6">
            <h5 className="mb-3 text-white" style={{ fontSize: '1rem' }}>{t.footer.contacts}</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/about" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.about}</Link></li>
              <li><Link href="/contact" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.contact}</Link></li>
              <li><Link href="/blog-articles" className="text-decoration-none" style={{ color: footerLinkColor, transition: 'color 150ms' }}>{t.nav.blog}</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h5 className="mb-3 text-white" style={{ fontSize: '1rem' }}>{t.footer.subscribe}</h5>
            <form className="d-flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="form-control me-2"
                style={{ borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                placeholder={t.footer.yourEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                aria-label={t.footer.yourEmail}
              />
              <button
                type="submit"
                className="btn btn-accent-custom px-4"
                style={{ borderRadius: '9999px' }}
                disabled={isLoading}
              >
                {isLoading ? "..." : "OK"}
              </button>
            </form>
          </div>
        </div>
        <div style={{ margin: '2rem 0 1.25rem', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}></div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ color: footerMutedColor }}>
          <small className="mb-2 mb-md-0">© 2026 YOGA.LIFE. {t.footer.rights}</small>
          <div className="d-flex gap-3">
            <Link href="/privacy" className="text-decoration-none" style={{ color: footerMutedColor, fontSize: '0.875rem' }}>{t.footer.privacyPolicy}</Link>
            <Link href="/terms" className="text-decoration-none" style={{ color: footerMutedColor, fontSize: '0.875rem' }}>{t.footer.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
