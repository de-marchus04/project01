"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState, useRef } from "react";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getAllConsultations } from "@/shared/api/consultationApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";
import { Consultation } from "@/entities/consultation/model/types";

const CATEGORIES = [
  { key: 'all', label: null },
  { key: 'private', labelKey: 'consultPrivate' },
  { key: 'nutrition', labelKey: 'consultNutrition' },
  { key: 'mentorship', labelKey: 'consultMentorship' },
] as const;

type CategoryKey = 'all' | 'private' | 'nutrition' | 'mentorship';

export default function ConsultationsAllClient({ initialData }: { initialData: Consultation[] }) {
  const { t } = useLanguage() as any;
  const { observe } = useScrollReveal();
  const [products, setProducts] = useState<Consultation[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await getAllConsultations();
        setProducts(data);
      } catch (err) {
        console.error('Error loading consultations:', err);
        setError(t.programs?.errLoad || 'Не удалось загрузить список. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadProducts();
  }, []);

  const { buyProduct } = usePurchase();

  const categoryLabel = (key: CategoryKey) => {
    const map: Record<CategoryKey, string> = {
      all: t.nav?.consultAll || 'Все консультации',
      private: t.nav?.consultPrivate || 'Частная практика',
      nutrition: t.nav?.consultNutrition || 'Нутрициология',
      mentorship: t.nav?.consultMentorship || 'Менторство',
    };
    return map[key];
  };

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'all' || (p.category || '').startsWith(activeCategory);
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
        ]} />
        <div className="container position-relative z-2">
          <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>
            {t.programs?.labelConsult || 'Консультация'}
          </span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {t.programs?.consultTitleNum || 'Личные консультации'}
          </h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {t.programs?.consultDescNum || 'Получите индивидуальную поддержку от наших экспертов для достижения ваших целей.'}
          </p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section id="consultations-content" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.programs?.labelConsult || 'Консультация'}
            title={t.programs?.availablePrograms || 'Доступные программы'}
            observe={observe}
          />

          {/* Category Tabs */}
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 reveal-up" ref={observe as any}>
            {CATEGORIES.map(({ key }) => (
              <button
                key={key}
                className={`btn rounded-pill px-4 ${activeCategory === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveCategory(key)}
              >
                {categoryLabel(key)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="row mb-4 justify-content-center reveal-up" ref={observe as any}>
            <div className="col-md-6 col-lg-4">
              <input
                type="text"
                className="form-control rounded-pill px-4"
                placeholder={t.programs?.searchPlaceholder || 'Поиск...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="row g-4 justify-content-center">
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t.programs?.loading || 'Загрузка...'}</span>
                </div>
              </div>
            )}
            {error && (
              <div className="alert alert-warning text-center">{error}</div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-center text-muted">{t.programs?.noProducts || 'Нет результатов'}</p>
            )}
            {!loading && !error && filtered.map((product, idx) => (
              <div key={product.id} className={`col-md-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`} ref={observe as any}>
                <CourseCard course={product as any} onBuy={buyProduct} type="consultation" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
