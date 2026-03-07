import { Recipe } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_recipe = tData ? tData(recipe) : recipe;
  return (
    <div className="card h-100 shadow-sm border-0 hover-scale-sm transition-all">
      <div className="overflow-hidden rounded-top" style={{ position: 'relative', height: '200px' }}>
        <Image
          src={localized_recipe.imageUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
          alt={tStr(localized_recipe.title)}
        />
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title font-playfair fw-bold mb-0">{tStr(localized_recipe.title)}</h5>
          <span className="badge text-white rounded-pill" style={{ backgroundColor: 'var(--color-accent)' }}>
            <i className="bi bi-clock me-1"></i>{localized_recipe.time}
          </span>
        </div>
        <p className="card-text text-muted small">{tStr(localized_recipe.description)}</p>
        <button className="btn rounded-pill btn-sm px-4 mt-2" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>{tStr("Смотреть рецепт")}</button>
      </div>
    </div>
  );
};