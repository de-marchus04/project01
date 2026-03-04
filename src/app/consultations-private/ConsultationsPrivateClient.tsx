"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Course } from "@/entities/course/model/types";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getPrivateConsultations } from "@/shared/api/consultationApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function ConsultationsPrivateClient({ initialData }: { initialData: any }) {
  const { t , tStr} = useLanguage() as any;
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
          <HeroSlider images={["https://images.unsplash.com/photo-1515020617130-eca80c7d0753?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop"]} /> 
          <div className="container position-relative z-2">
              <span className="text-uppercase ls-2 mb-3 d-block small fw-bold" style={{ color: 'var(--color-secondary)' }}>{tStr("Персональный Подход")}</span>
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Индивидуальная Тренировка")}</h1>
              <p className="lead mb-5 col-lg-8 mx-auto fw-light">
                  {tStr("Занятие один на один с преподавателем. Корректировка техники, разбор сложных асан и личные рекомендации.")}
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
              { icon: 'bi-person-check', title: tStr("Персональная программа"), desc: tStr("Занятие строится под ваши цели, уровень подготовки и особенности тела — никакого усреднённого подхода") },
              { icon: 'bi-lightning-charge', title: tStr("Ускоренный прогресс"), desc: tStr("Индивидуальная работа позволяет быстрее освоить технику и исправить ошибки, которые без наставника сложно заметить") },
              { icon: 'bi-shield-check', title: tStr("Безопасность движения"), desc: tStr("Корректировка техники и работа с биомеханикой помогают избежать травм и развить правильные паттерны движения") },
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
              { step: 1, title: tStr("Выберите формат"), desc: tStr("Разовое занятие или курс из нескольких сессий с отслеживанием прогресса — по вашему запросу") },
              { step: 2, title: tStr("Проведите занятие"), desc: tStr("60 минут работы с преподавателем: разбор техники, постановка асан, ответы на вопросы") },
              { step: 3, title: tStr("Получите рекомендации"), desc: tStr("Домашние задания и индивидуальный план для самостоятельной практики между встречами") },
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
            <span className="text-muted">{tStr("Подходит как для начинающих (поставить фундамент), так и для опытных практиков (углубить практику или решить конкретную задачу). Рекомендуется при восстановлении после травм.")}</span>
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