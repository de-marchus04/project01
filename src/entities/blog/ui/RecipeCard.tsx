import { Recipe } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_recipe = tData ? tData(recipe) : recipe;
  return (
    <div className="card h-100 shadow-sm border-0 hover-scale-sm transition-all">
      <img 
        src={localized_recipe.imageUrl} 
        className="card-img-top" 
        style={{ height: '200px', objectFit: 'cover' }}
        alt={tStr(localized_recipe.title)} 
      />
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title font-playfair fw-bold mb-0">{tStr(localized_recipe.title)}</h5>
          <span className="badge text-white rounded-pill" style={{ backgroundColor: 'var(--color-accent)' }}>
            <i className="bi bi-clock me-1"></i>{localized_recipe.time}
          </span>
        </div>
        <p className="card-text text-muted small">{tStr(localized_recipe.description)}</p>
        <button className="btn btn-outline-dark rounded-pill btn-sm px-4 mt-2">{tStr("Смотреть рецепт")}</button>
      </div>
    </div>
  );
};