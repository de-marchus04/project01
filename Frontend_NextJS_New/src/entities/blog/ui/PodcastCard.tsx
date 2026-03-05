import { Podcast } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface PodcastCardProps {
  podcast: Podcast;
}

export const PodcastCard = ({ podcast }: PodcastCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_podcast = tData ? tData(podcast) : podcast;
  return (
    <article className="card border-0 d-flex flex-md-row align-items-center gap-4" style={{ padding: '1.25rem' }}>
      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        <i className="bi bi-mic-fill text-white fs-1" aria-hidden="true"></i>
      </div>
      <div className="flex-grow-1 text-center text-md-start">
        <h5 className="font-playfair fw-bold mb-2">{tStr(localized_podcast.title)}</h5>
        <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{tStr(localized_podcast.description)}</p>
      </div>
      <div className="d-flex flex-column align-items-center align-items-md-end gap-2">
        <span className="badge" style={{ backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>{localized_podcast.duration}</span>
        <button className="btn btn-outline-primary-custom btn-sm px-4" style={{ borderRadius: '9999px' }}>{tStr("Слушать")}</button>
      </div>
    </article>
  );
};
