"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { getTestimonials, Testimonial } from "@/shared/api/testimonialApi";

export const Testimonials = () => {
  const { t, lang, tData } = useLanguage() as any;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    getTestimonials().then(data => {
      if (data && data.length > 0) {
        setTestimonials(data.map((item: any) => tData ? tData(item) : item));
      } else {
        // Fallback for visual structure if storage is somehow empty and api failed to set default
        setTestimonials([
          { id: '1', name: t.home.review1Name, course: t.home.review1Course, text: t.home.review1Text, createdAt: '' },
          { id: '2', name: t.home.review2Name, course: t.home.review2Course, text: t.home.review2Text, createdAt: '' },
          { id: '3', name: t.home.review3Name, course: t.home.review3Course, text: t.home.review3Text, createdAt: '' }
        ]);
      }
    });
  }, [lang]); // Re-run if language changes to possibly get new default translated text if fallback is used

  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold" style={{ color: 'var(--color-accent)', letterSpacing: '2px', fontSize: '0.85rem' }}>{t.home.testimonialsBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-2 mb-3">{t.home.testimonialsTitle}</h2>
        </div>
        <div className="row g-4 justify-content-center">
          {testimonials.slice(0, 3).map((item) => (
            <div key={item.id} className="col-md-4">
              <div className="card border-0 h-100 p-4" style={{ backgroundColor: 'var(--color-surface)', borderRadius: '20px' }}>
                <div className="d-flex mb-3" style={{ color: 'var(--color-accent)' }}>
                  {[...Array(5)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
                </div>
                <p className="font-montserrat fst-italic mb-4 flex-grow-1">{item.text}</p>
                <div className="d-flex align-items-center mt-auto">
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', color: 'var(--color-primary)' }}>
                    <span className="fw-bold font-playfair">{item.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{item.name}</h6>
                    <small className="text-muted">{item.course}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
