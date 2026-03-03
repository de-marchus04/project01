"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Course } from "@/entities/course/model/types";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getNutritionConsultations } from "@/shared/api/consultationApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function ConsultationsNutritionClient({ initialData }: { initialData: any }) {
  const { t , tStr} = useLanguage() as any;
  const [products, setProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

    
  useEffect(() => {
    
    async function loadProducts() {
      try {
        const data = await getNutritionConsultations();
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
          <HeroSlider images={["https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop","https://images.unsplash.com/photo-1515020617130-eca80c7d0753?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop"]} /> 
          <div className="container position-relative z-2">
              <span className="text-uppercase ls-2 mb-3 d-block small fw-bold" style={{ color: 'var(--color-secondary)' }}>{tStr("Здоровое Питание")}</span>
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Разбор Питания")}</h1>
              <p className="lead mb-5 col-lg-8 mx-auto fw-light">
                  {tStr("Консультация нутрициолога. Анализ рациона, составление индивидуального плана питания для достижения ваших целей.")}
              </p>
          </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-5 bg-light details-section">
          <div className="container py-5">
              <h2 className="font-playfair mb-5 text-center">{t.programs.availablePrograms}</h2>
              
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

                  {!loading && !error && products.map(product => (
                      <div key={product.id} className="col-md-6 col-lg-4">
                          <CourseCard course={product} onBuy={buyProduct} />
                      </div>
                  ))}
              </div>
          </div>
      </section>
    </main>
  );
}