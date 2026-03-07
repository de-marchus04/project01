"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getPrivateConsultations } from "@/shared/api/consultationApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";

export default function ConsultationsPrivateClient({ initialData }: { initialData: any }) {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();
  const [products, setProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getPrivateConsultations();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(t.programs.errLoad);
      } finally {
        setLoading(false);
      }
    }

    if (!initialData) { setLoading(true); loadProducts(); }
  }, []);

  const { buyProduct } = usePurchase();

  return (
    <main>
      {/* HERO SECTION */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
        <HeroSlider images={[
          "https://images.unsplash.com/photo-1515020617130-eca80c7d0753?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
        ]} />
        <div className="container position-relative z-2">
          <span className="text-uppercase ls-2 mb-3 d-block small fw-bold" style={{ color: 'var(--color-secondary)' }}>{t.programs.consultPrivate}</span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{t.programs.consultPrivateTitle}</h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light">{t.programs.consultPrivateDesc}</p>
        </div>
      </section>

      {/* AVAILABLE PROGRAMS */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.programs.consultPrivate}
            title={t.programs.availablePrograms}
            observe={observe}
          />

          <div id="products-container" className="row g-4 justify-content-center">
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t.programs.loading}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-warning text-center">{error}</div>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="text-center text-muted">{t.programs.noProducts}</p>
            )}

            {!loading && !error && products.map((product: any, idx: number) => (
              <div key={product.id} className={`col-md-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`} ref={observe as any}>
                <CourseCard course={product} onBuy={buyProduct} type="consultation" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
