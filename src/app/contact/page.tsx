"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendMessage } from "@/shared/api/supportApi";
import { modalService } from "@/shared/ui/Modal/modalService";
import { useLanguage } from "@/shared/i18n/LanguageContext";



export default function ContactPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  const PREDEFINED_QUESTIONS = [
    t.contact.q1,
    t.contact.q2,
    t.contact.q3,
    t.contact.q4,
    t.contact.q5,
    t.contact.q6,
    t.contact.qCustom
  ];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [questionType, setQuestionType] = useState(t.contact.q1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionUser?.name || sessionUser?.username) {
      setName(sessionUser.name || sessionUser.username);
    }
    if (sessionUser?.email) {
      setEmail(sessionUser.email);
    }
  }, [sessionUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      modalService.alert(t.contact.alertAttention, t.contact.alertFillFields);
      return;
    }

    const isCustom = questionType === t.contact.qCustom;
    if (isCustom && !message.trim()) {
      modalService.alert(t.contact.alertAttention, t.contact.alertFillMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMessage(
        name,
        email,
        questionType,
        isCustom ? message : questionType,
        !isCustom // Если вопрос стандартный, отвечает бот
      );

      if (isCustom) {
        await modalService.alert(
          t.contact.alertSuccessTitle, 
          t.contact.alertSuccessMsg
        );
      } else {
        await modalService.alert(
          t.contact.alertBotTitle, 
          t.contact.alertBotMsg
        );
      }

      if (isCustom) setMessage("");
      setQuestionType(t.contact.q1);
    } catch (error) {
      modalService.alert(t.contact.alertErrorTitle, t.contact.alertErrorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-vh-100 pt-5" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{t.contact.contactTitle}</h1>
          <p className="lead" style={{ color: 'var(--color-text-muted)' }}>{t.contact.contactSubtitle}</p>
        </div>

        <div className="row justify-content-center g-5">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="card-body p-5">
                <h3 className="h4 font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.contact.contactUs}</h3>
                
                <div className="d-flex align-items-center mb-4">
                  <div className="p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(193, 166, 141, 0.15)', width: '50px', height: '50px' }}>
                    <i className="bi bi-geo-alt fs-4" style={{ color: 'var(--color-primary)' }}></i>
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: 'var(--color-text)' }}>{t.contact.addressTitle}</h5>
                    <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{t.contact.addressValue}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div className="p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(193, 166, 141, 0.15)', width: '50px', height: '50px' }}>
                    <i className="bi bi-envelope fs-4" style={{ color: 'var(--color-primary)' }}></i>
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: 'var(--color-text)' }}>Email</h5>
                    <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{t.contact.emailValue}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(193, 166, 141, 0.15)', width: '50px', height: '50px' }}>
                    <i className="bi bi-telephone fs-4" style={{ color: 'var(--color-primary)' }}></i>
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: 'var(--color-text)' }}>{t.contact.phoneTitle}</h5>
                    <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{t.contact.phoneValue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="card-body p-5">
                <h3 className="h4 font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.contact.sendMessage}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>{t.contact.yourName}</label>
                      <input 
                        type="text" 
                        className="form-control rounded-pill px-4" 
                        placeholder={t.contact.namePlaceholder} 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ borderColor: 'rgba(193, 166, 141, 0.3)' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>Email</label>
                      <input 
                        type="email" 
                        className="form-control rounded-pill px-4" 
                        placeholder={t.contact.emailPlaceholder} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderColor: 'rgba(193, 166, 141, 0.3)' }}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>{t.contact.subject}</label>
                      <select 
                        className="form-select rounded-pill px-4" 
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        style={{ borderColor: 'rgba(193, 166, 141, 0.3)', cursor: 'pointer' }}
                      >
                        {PREDEFINED_QUESTIONS.map((q, i) => (
                          <option key={i} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>

                    {questionType === t.contact.qCustom && (
                      <div className="col-12">
                        <label className="form-label" style={{ color: 'var(--color-text-muted)' }}>{t.contact.messageLabel}</label>
                        <textarea 
                          className="form-control rounded-4 p-3" 
                          rows={5} 
                          placeholder={t.contact.messagePlaceholder}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          style={{ borderColor: 'rgba(193, 166, 141, 0.3)' }}
                        ></textarea>
                      </div>
                    )}

                    <div className="col-12 mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t.contact.sendingBtn : t.contact.sendBtn}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="row justify-content-center mt-5 pt-5">
          <div className="col-lg-8 text-center mb-5">
            <h2 className="h3 font-playfair fw-bold" style={{ color: 'var(--color-text)' }}>{t.contact.faqTitle}</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{t.contact.faqSubtitle}</p>
          </div>
          <div className="col-lg-8">
            <div className="accordion custom-accordion" id="faqAccordion">
              {[
                { q: t.contact.q1, a: t.contact.a1 },
                { q: t.contact.q2, a: t.contact.a2 },
                { q: t.contact.q3, a: t.contact.a3 },
                { q: t.contact.q4, a: t.contact.a4 }
              ].map((faq, i) => (
                <div className="accordion-item border-0 mb-3 shadow-sm rounded-4 overflow-hidden" key={i}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
                      {faq.q}
                    </button>
                  </h2>
                  <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


              </div>
    </main>
  );
}
