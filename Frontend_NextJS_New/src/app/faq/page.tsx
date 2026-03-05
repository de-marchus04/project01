"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFAQs, FAQ } from "@/shared/api/faqApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export default function FAQPage() {
  const { t, tStr } = useLanguage() as any;
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getFAQs().then(setFaqs);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '96px' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
            {t.faq.title}
          </h1>
          <p className="lead" style={{ color: 'var(--color-text-muted)' }}>
            {t.faq.subtitle}
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq) => (
                <div className="accordion-item border-0 mb-3" key={faq.id} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h2 className="accordion-header">
                    <button 
                      className={`accordion-button ${openId === faq.id ? '' : 'collapsed'} fw-bold`} 
                      type="button" 
                      onClick={() => toggleAccordion(faq.id)}
                      style={{ backgroundColor: openId === faq.id ? 'var(--color-primary)' : '#fff', color: openId === faq.id ? '#fff' : 'var(--color-text)', padding: '20px 25px' }}
                    >
                      {tStr(faq.question)}
                    </button>
                  </h2>
                  <div className={`accordion-collapse collapse ${openId === faq.id ? 'show' : ''}`}>
                    <div className="accordion-body" style={{ padding: '25px', backgroundColor: '#fff', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
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

            <div className="text-center mt-5">
              <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.faq.notFound}</p>
              <Link href="/support" className="btn btn-dark rounded-pill px-4 py-2">
                {t.faq.writeSupport}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
