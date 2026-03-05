import Image from "next/image";
import { Article } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_article = tData ? tData(article) : article;
  return (
    <article className="card h-100 border-0 hover-scale-sm">
      <div className="position-relative w-100 overflow-hidden" style={{ height: '200px' }}>
        <Image
          src={localized_article.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'}
          alt={tStr(localized_article.title)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="card-img-top object-fit-cover"
        />
        {localized_article.tag && (
          <div className="position-absolute top-0 start-0 m-3">
            <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)', boxShadow: 'var(--shadow-sm)' }}>{tStr(localized_article.tag)}</span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title font-playfair fw-bold mb-3">
          {tStr(localized_article.title)}
        </h5>
        <p className="card-text flex-grow-1" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{tStr(localized_article.subtitle)}</p>
        <button className="btn btn-link text-decoration-none p-0 fw-bold text-start mt-3" style={{ color: 'var(--color-primary)' }}>{tStr("Читать далее &rarr;")}</button>
      </div>
      <div className="card-footer border-0" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        {new Date(localized_article.createdAt).toLocaleDateString('ru-RU')}
      </div>
    </article>
  );
};
