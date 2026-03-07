"use client";

import { useEffect, useState } from "react";
import { getFAQs, type FAQ } from "@/shared/api/faqApi";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const { observe } = useScrollReveal();
  const { tStr } = useLanguage();

  useEffect(() => {
    getFAQs()
      .then(data => setFaqs(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-5" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="container py-4">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          <span className="section-badge">{tStr("Вопросы и ответы")}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">
            {tStr("Часто задаваемые вопросы")}
          </h2>
          <p
            className="text-muted font-montserrat mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {tStr("Мы собрали ответы на самые популярные вопросы о наших практиках и программах")}
          </p>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faq-accordion">
              {faqs.map((faq, idx) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`reveal-up${idx > 0 ? ` reveal-delay-${Math.min(idx, 3)}` : ""}`}
                    ref={observe as any}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      marginBottom: "10px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                    }}
                  >
                    <button
                      className="w-100 text-start d-flex align-items-center justify-content-between border-0 px-4 py-3"
                      style={{
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        color: "var(--color-text)",
                        fontWeight: 600,
                        fontSize: "1rem",
                        lineHeight: 1.4,
                      }}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span>{tStr(faq.question)}</span>
                      <i
                        className={`bi ${isOpen ? "bi-dash" : "bi-plus"} flex-shrink-0 ms-3`}
                        style={{
                          color: "var(--color-accent)",
                          fontSize: "1.25rem",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div
                        className="px-4 pb-4"
                        style={{
                          color: "var(--color-text-muted)",
                          lineHeight: 1.7,
                          fontSize: "0.97rem",
                        }}
                      >
                        {tStr(faq.answer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
