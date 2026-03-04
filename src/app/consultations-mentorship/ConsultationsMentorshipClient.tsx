"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Course } from "@/entities/course/model/types";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getMentorshipConsultations } from "@/shared/api/consultationApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function ConsultationsMentorshipClient({ initialData }: { initialData: any }) {
  const { t , tStr} = useLanguage() as any;
  const [products, setProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

    
  useEffect(() => {
    
    async function loadProducts() {
      try {
        const data = await getMentorshipConsultations();
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
          <HeroSlider images={["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop","https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop"]} /> 
          <div className="container position-relative z-2">
              <span className="text-uppercase ls-2 mb-3 d-block small fw-bold" style={{ color: 'var(--color-secondary)' }}>{tStr("Полное Сопровождение")}</span>
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Менторство")}</h1>
              <p className="lead mb-5 col-lg-8 mx-auto fw-light">
                  {tStr("Долгосрочная работа с наставником. Постановка целей, регулярная обратная связь и поддержка на каждом этапе.")}
              </p>
          </div>
      </section>

      {/* CONTENT SECTION */}
      {/* BENEFITS */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-3">
          <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{tStr("Преимущества")}</h2>
          <div className="row g-4">
            {([
              { icon: 'bi-compass', title: tStr("Ясность направления"), desc: tStr("Вместе определяем долгосрочные цели и намечаем чёткий путь к ним через практику и внутреннюю работу") },
              { icon: 'bi-bell', title: tStr("Постоянная поддержка"), desc: tStr("Регулярные встречи и обратная связь между сессиями — вы никогда не остаётесь с вопросами один на один") },
              { icon: 'bi-stars', title: tStr("Глубокая трансформация"), desc: tStr("Работа с ограничивающими убеждениями, углубление практики и устойчивый личностный рост") },
            ] as const).map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="text-center p-4 h-100 rounded-4" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 72, height: 72, backgroundColor: 'var(--color-primary)' }}>
                    <i className={`bi ${item.icon} text-white`} style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <h5 className="font-playfair fw-bold mb-2" style={{ color: 'var(--color-text)' }}>{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-3">
          <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{tStr("Как это работает")}</h2>
          <div className="row g-4 justify-content-center">
            {([
              { step: 1, title: tStr("Вводная встреча"), desc: tStr("Знакомство, постановка целей и разработка индивидуального плана трансформации") },
              { step: 2, title: tStr("Регулярные сессии"), desc: tStr("Еженедельные или двухнедельные встречи с разбором прогресса и адаптацией программы") },
              { step: 3, title: tStr("Рост и результаты"), desc: tStr("Отслеживание изменений, закрепление результатов и выход на следующий уровень практики") },
            ] as const).map((item) => (
              <div key={item.step} className="col-md-4">
                <div className="d-flex gap-4 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white" style={{ width: 48, height: 48, backgroundColor: 'var(--color-primary)', fontSize: '1.1rem' }}>{item.step}</div>
                  <div>
                    <h5 className="font-playfair fw-bold mb-1" style={{ color: 'var(--color-text)' }}>{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
            <i className="bi bi-info-circle me-2" style={{ color: 'var(--color-primary)' }}></i>
            <span className="text-muted">{tStr("Подходит для тех, кто чувствует, что «застрял» на одном месте, ищет глубинных изменений или хочет выстроить устойчивую духовную практику рядом с опытным наставником.")}</span>
          </div>
        </div>
      </section>

      {/* AVAILABLE PROGRAMS */}
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