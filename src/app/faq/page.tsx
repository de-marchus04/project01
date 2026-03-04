"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFAQs, FAQ } from "@/shared/api/faqApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";

export default function FAQPage() {
  const { t, tStr } = useLanguage() as any;
  const { observe } = useScrollReveal();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getFAQs().then(setFaqs);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
        <HeroSlider images={[
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop",
        ]} />
        <div className="container position-relative z-2">
          <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{t.faq.title}</span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{t.faq.title}</h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{t.faq.subtitle}</p>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <div className="container py-5">
        <SectionHeader
          badge={t.faq.title}
          title={t.faq.subtitle}
          observe={observe}
        />

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, idx) => (
                <div
                  className="accordion-item border-0 mb-3 reveal-up"
                  key={faq.id}
                  ref={observe as any}
                  style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                >
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${openId === faq.id ? '' : 'collapsed'} fw-bold`}
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      style={{
                        backgroundColor: openId === faq.id ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: openId === faq.id ? '#fff' : 'var(--color-text)',
                        padding: '20px 25px',
                      }}
                    >
                      {tStr(faq.question)}
                    </button>
                  </h2>
                  <div className={`accordion-collapse collapse ${openId === faq.id ? 'show' : ''}`}>
                    <div className="accordion-body" style={{ padding: '25px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                      {tStr(faq.answer)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {faqs.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">{t.faq.noQuestions}</p>
              </div>
            )}

            <div className="text-center mt-5 reveal-up" ref={observe as any}>
              <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.faq.notFound}</p>
              <Link href="/support" className="btn btn-primary-custom rounded-pill px-4 py-2">
                {t.faq.writeSupport}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
