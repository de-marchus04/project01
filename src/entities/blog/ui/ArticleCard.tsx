import Image from "next/image";
import { Article } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { tData, tStr, lang } = useLanguage();

  const localized_article = tData ? tData(article) : article;
  const dateLocale = lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'ru-RU';
  return (
    <div className="card h-100 shadow-sm border-0 hover-scale-sm transition-all">
      <div className="position-relative w-100" style={{ height: '200px' }}>
        <Image
          src={localized_article.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'}
          alt={tStr(localized_article.title)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="card-img-top object-fit-cover"
        />
        {localized_article.tag && (
          <div className="position-absolute top-0 start-0 m-3">
            <span className="badge bg-primary shadow-sm">{tStr(localized_article.tag)}</span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
          {tStr(localized_article.title)}
        </h5>
        <p className="card-text text-muted small flex-grow-1">{tStr(localized_article.subtitle)}</p>
        <button className="btn btn-link text-decoration-none p-0 fw-bold text-start mt-3" style={{ color: 'var(--color-primary)' }}>{tStr("Читать далее →")}</button>
      </div>
      <div className="card-footer border-0 text-muted small" style={{ backgroundColor: 'var(--color-card-bg)' }}>
        {new Date(localized_article.createdAt).toLocaleDateString(dateLocale)}
      </div>
    </div>
  );
};