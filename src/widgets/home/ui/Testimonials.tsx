"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { Testimonial } from "@/shared/api/testimonialApi";

interface TestimonialsProps {
  initialTestimonials: Testimonial[];
}

export const Testimonials = ({ initialTestimonials }: TestimonialsProps) => {
  const { t, tData } = useLanguage();
  const { observe } = useScrollReveal();

  const testimonials = initialTestimonials.length > 0
    ? initialTestimonials.map(item => tData ? tData(item) : item)
    : [
        { id: '1', name: t.home.review1Name, course: t.home.review1Course, text: t.home.review1Text, createdAt: '' },
        { id: '2', name: t.home.review2Name, course: t.home.review2Course, text: t.home.review2Text, createdAt: '' },
        { id: '3', name: t.home.review3Name, course: t.home.review3Course, text: t.home.review3Text, createdAt: '' }
      ];

  return (
    <section className="testimonials-section py-5">
      <div className="container py-5">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          <span className="section-badge">{t.home.testimonialsBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{t.home.testimonialsTitle}</h2>
        </div>
        <div className="row g-4 justify-content-center">
          {testimonials.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              className={`col-md-4 reveal-up${index > 0 ? ` reveal-delay-${index}` : ''}`}
              ref={observe as any}
            >
              <div
                className="card border-0 h-100 p-4 position-relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)', borderRadius: '20px' }}
              >
                {/* Декоративная кавычка */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                    fontSize: '6rem',
                    lineHeight: 1,
                    fontFamily: 'Georgia, serif',
                    color: 'var(--color-primary)',
                    opacity: 0.06,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 0
                  }}
                >
                  &ldquo;
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="d-flex mb-3" style={{ color: 'var(--color-accent)' }}>
                    {[...Array(5)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
                  </div>
                  <p className="font-montserrat fst-italic mb-4 flex-grow-1">{item.text}</p>
                  <div className="d-flex align-items-center mt-auto">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '52px',
                        height: '52px',
                        backgroundColor: 'var(--color-secondary)',
                        border: '2px solid var(--color-accent-subtle)',
                        color: 'var(--color-primary)',
                        fontSize: '1.1rem',
                        flexShrink: 0
                      }}
                    >
                      <span className="fw-bold font-playfair">{item.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{item.name}</h6>
                      <small className="text-muted">{item.course}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Волновой разделитель → Newsletter (primary green) */}
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '100px', marginBottom: '-2px' }}
        aria-hidden="true"
      >
        <path
          d="M0,50 C180,100 360,0 540,50 C720,100 900,20 1080,50 C1260,80 1380,30 1440,50 L1440,100 L0,100 Z"
          fill="var(--color-primary)"
        />
      </svg>
    </section>
  );
}
