"use client";

import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Recipe } from "@/entities/blog/model/types";
import { RecipeCard } from "@/entities/blog/ui/RecipeCard";
import { getRecipes } from "@/shared/api/blogApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function BlogRecipes() {
  const { t , tStr} = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (err) {
        console.error('Error loading recipes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const tags = Array.from(new Set(recipes.map(r => r.tag).filter(Boolean))) as string[];
  const filteredRecipes = selectedTag ? recipes.filter(r => r.tag === selectedTag) : recipes;

  return (
    <main>
      <section 
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{
            height: '50vh',
            minHeight: '400px',
            background: "linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.7)), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop') center/cover"
        }}
      >
          <HeroSlider images={["https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop","https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop"]} />
          <div className="container position-relative z-2">
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Рецепты")}</h1>
              <p className="lead text-white-50">
                  {tStr("Вкусная и полезная еда для вашего тела")}
              </p>
          </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-5">
              {tags.length > 0 && (
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
                  <button
                    className="btn rounded-pill px-4"
                    style={!selectedTag
                      ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: '1px solid var(--color-text)' }
                      : { backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    onClick={() => setSelectedTag(null)}
                  >{tStr("Все")}</button>
                  {tags.map(tag => (
                    <button
                      key={tag}
                      className="btn rounded-pill px-4"
                      style={selectedTag === tag
                        ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: '1px solid var(--color-text)' }
                        : { backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tStr(tag)}
                    </button>
                  ))}
                </div>
              )}

              <div className="row g-4">
                  {loading && (
                      <div className="col-12 text-center">
                          <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">{t.programs.loading}</span>
                          </div>
                      </div>
                  )}

                  {!loading && filteredRecipes.length === 0 && (
                      <div className="col-12 text-center text-muted">{tStr("Рецептов пока нет.")}</div>
                  )}

                  {!loading && filteredRecipes.map(recipe => (
                      <div key={recipe.id} className="col-md-6 col-lg-4" onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
                          <RecipeCard recipe={recipe} />
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Modal for Recipe Details */}
      {selectedRecipe && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedRecipe(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 position-absolute top-0 end-0 z-3">
                <button type="button" className="btn-close bg-white rounded-circle p-2 m-3 shadow-sm" onClick={() => setSelectedRecipe(null)}></button>
              </div>
              <div className="row g-0">
                <div className="col-md-5">
                  <div style={{ position: 'relative', height: '300px', minHeight: '300px' }}>
                    <Image src={selectedRecipe.imageUrl} fill sizes="(max-width: 768px) 100vw, 600px" style={{ objectFit: 'cover' }} alt={tStr(selectedRecipe.title)} />
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="modal-body p-4 p-md-5">
                    <div className="mb-3">
                      <span className="badge bg-light text-dark border mb-2">{selectedRecipe.tag || tStr("Рецепт")}</span>
                      <span className="badge text-white rounded-pill ms-2 mb-2" style={{ backgroundColor: 'var(--color-accent)' }}>
                        <i className="bi bi-clock me-1"></i>{selectedRecipe.time}
                      </span>
                    </div>
                    <h3 className="font-playfair fw-bold mb-3">{tStr(selectedRecipe.title)}</h3>
                    <p className="text-muted fw-medium mb-4">{tStr(selectedRecipe.description)}</p>
                    
                    <div className="bg-light rounded-4 p-4">
                      <h5 className="font-playfair fw-bold mb-3">{tStr("Способ приготовления")}</h5>
                      <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                        {selectedRecipe.fullDescription || tStr("Подробный рецепт скоро появится...")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}