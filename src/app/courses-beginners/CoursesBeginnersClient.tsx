"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Course } from "@/entities/course/model/types";
import { CourseCard } from "@/entities/course/ui/CourseCard";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { getBeginnersCourses } from "@/shared/api/courseApi";
import { Pagination } from "@/shared/ui/Pagination";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { PaginatedResponse } from "@/shared/api/blogApi";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";

export default function CoursesBeginnersClient({ initialData }: { initialData: PaginatedResponse<Course> }) {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();
  const [products, setProducts] = useState<Course[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const isFirstRender = useRef(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await getBeginnersCourses(currentPage, 6, searchQuery, sortBy);
        setProducts(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(t.programs.errLoad + ' : ' + (err as any).message);
      } finally {
        setLoading(false);
      }
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchQuery, sortBy]);

  const { buyProduct } = usePurchase();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('courses-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
        <HeroSlider pageKey="courses-beginners" images={[
          "https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
        ]} />
        <div className="container position-relative z-2">
          <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{t.programs.labelCourse}</span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{t.programs.heroBeginnersTitle}</h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{t.programs.heroBeginnersDesc}</p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section id="courses-content" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.programs.labelCourse}
            title={t.programs.availablePrograms}
            observe={observe}
          />

          {/* Search and Filter */}
          <div className="row mb-4 justify-content-center reveal-up" ref={observe as any}>
            <div className="col-md-6 col-lg-4 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control rounded-pill px-4"
                placeholder={t.programs.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select rounded-pill px-4"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">{t.programs.sortDefault}</option>
                <option value="price_asc">{t.programs.sortPriceAsc}</option>
                <option value="price_desc">{t.programs.sortPriceDesc}</option>
              </select>
            </div>
          </div>

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

            {!loading && !error && products.map((product, idx) => (
              <div key={product.id} className={`col-md-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`} ref={observe as any}>
                <CourseCard course={product} onBuy={buyProduct} />
              </div>
            ))}
          </div>

          {!loading && !error && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
    </main>
  );
}
