import { Recipe } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_recipe = tData ? tData(recipe) : recipe;
  return (
    <article className="card h-100 border-0 hover-scale-sm">
      <div className="overflow-hidden">
        <img
          src={localized_recipe.imageUrl}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          alt={tStr(localized_recipe.title)}
        />
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title font-playfair fw-bold mb-0">{tStr(localized_recipe.title)}</h5>
          <span className="badge" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-on-accent)', borderRadius: 'var(--radius-full)' }}>
            <i className="bi bi-clock me-1" aria-hidden="true"></i>{localized_recipe.time}
          </span>
        </div>
        <p className="card-text" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{tStr(localized_recipe.description)}</p>
        <button className="btn btn-outline-primary-custom btn-sm px-4 mt-2" style={{ borderRadius: 'var(--radius-full)' }}>{tStr("Смотреть рецепт")}</button>
      </div>
    </article>
  );
};
