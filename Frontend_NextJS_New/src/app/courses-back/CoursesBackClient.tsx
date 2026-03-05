"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Course } from "@/entities/course/model/types";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getBeginnersCourses, getBackCourses, getMeditationCourses, getWomenCourses, getCourseById, getAllAdminCourses, addCourse, updateCourse, deleteCourse } from "@/shared/api/courseApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function CoursesBackClient({ initialData }: { initialData: any }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) { setIsInitialLoad(false); return; }

    async function loadProducts() {
      try {
        const data = await getBackCourses();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(t.programs.errLoad);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const { buyProduct } = usePurchase();

  return (
    <main>
      {/* HERO SECTION */}
      <section 
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
          <HeroSlider images={["https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop","https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2000&auto=format&fit=crop"]} /> 
          <div className="container position-relative z-2">
              <span className="text-uppercase ls-2 mb-3 d-block small fw-bold" style={{ color: 'var(--color-secondary)' }}>{t.programs.labelCourse}</span>
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{t.programs.heroBackTitle}</h1>
              <p className="lead mb-5 col-lg-8 mx-auto fw-light">
                  {t.programs.heroBackDesc}
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

                  {!loading && !error && products.map((product: Course) => (
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