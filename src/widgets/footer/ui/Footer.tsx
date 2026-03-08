"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { subscribeEmail } from "@/shared/api/subscriberApi";
import { emailService } from "@/shared/api/emailService";
import { sendWelcomeGuide } from "@/shared/api/emailActions";
import { modalService } from "@/shared/ui/Modal/modalService";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { getSiteSettings } from "@/shared/api/siteSettingsApi";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const [instagram, setInstagram] = useState("https://instagram.com");
  const [telegram, setTelegram] = useState("https://t.me");
  const [youtube, setYoutube] = useState("https://youtube.com");

  useEffect(() => {
    getSiteSettings().then(s => {
      if (s.instagram) setInstagram(s.instagram);
      if (s.telegram) setTelegram(s.telegram);
      if (s.youtube) setYoutube(s.youtube);
    }).catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      modalService.alert(t.footer.warningTitle, t.footer.subscribeEmpty);
      return;
    }

    if (!emailService.isValidFormat(email)) {
      await modalService.alert(t.footer.warningTitle, t.footer.subscribeInvalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscribeEmail(email);

      if (result.alreadySubscribed) {
        await modalService.alert(t.footer.warningTitle, t.footer.subscribeAlreadySubscribed);
      } else if (result.success) {
        await sendWelcomeGuide(email);
        await modalService.alert(t.footer.successTitle, t.footer.subscribeSuccess);
        setEmail("");
      } else {
        await modalService.alert(t.footer.errorTitle, t.footer.subscribeError);
      }
    } catch (error) {
      modalService.alert(t.footer.warningTitle, t.footer.subscribeGenericError);
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
            <div className="d-flex gap-3 mt-3">
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: 'rgba(244,241,234,0.7)', fontSize: '1.4rem', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(244,241,234,0.7)')}
              ><i className="bi bi-instagram"></i></a>
              <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"
                style={{ color: 'rgba(244,241,234,0.7)', fontSize: '1.4rem', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(244,241,234,0.7)')}
              ><i className="bi bi-telegram"></i></a>
              <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                style={{ color: 'rgba(244,241,234,0.7)', fontSize: '1.4rem', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(244,241,234,0.7)')}
              ><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-6">
            <h5 className="mb-3 text-white">{t.footer.quickLinks}</h5>
            <ul className="list-unstyled">
              <li><Link href="/courses" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.courses}</Link></li>
              <li><Link href="/tours" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.tours}</Link></li>
              <li><Link href="/consultations" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>{t.nav.consultations}</Link></li>
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
            <form className="d-flex flex-column flex-sm-row gap-2" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                className="form-control rounded-pill flex-grow-1" 
                placeholder={t.footer.yourEmail} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#f5f0eb', borderColor: 'rgba(255,255,255,0.25)', minWidth: 0 }}
              />
              <button 
                type="submit" 
                className="btn btn-primary-custom rounded-pill text-white px-4 flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? "..." : "OK"}
              </button>
            </form>
          </div>
        </div>
        <div className="border-top mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderColor: 'rgba(244, 241, 234, 0.2) !important', color: 'rgba(244, 241, 234, 0.5)' }}>
          <small className="mb-2 mb-md-0">© {new Date().getFullYear()} YOGA.LIFE. {t.footer.rights}</small>
          <div className="d-flex gap-3">
            <Link href="/privacy" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.5)', fontSize: '0.875em' }}>{t.footer.privacyPolicy}</Link>
            <Link href="/terms" className="text-decoration-none" style={{ color: 'rgba(244, 241, 234, 0.5)', fontSize: '0.875em' }}>{t.footer.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
