import { Podcast } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface PodcastCardProps {
  podcast: Podcast;
}

export const PodcastCard = ({ podcast }: PodcastCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_podcast = tData ? tData(podcast) : podcast;
  return (
    <div className="card shadow-sm border-0 p-4 d-flex flex-md-row align-items-center gap-4">
      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary)' }}>
        <i className="bi bi-mic-fill text-white fs-1"></i>
      </div>
      <div className="flex-grow-1 text-center text-md-start">
        <h5 className="font-playfair fw-bold mb-2">{tStr(localized_podcast.title)}</h5>
        <p className="text-muted mb-0">{tStr(localized_podcast.description)}</p>
      </div>
      <div className="d-flex flex-column align-items-center align-items-md-end gap-2">
        <span className="badge bg-light text-dark border">{localized_podcast.duration}</span>
        <button className="btn rounded-pill btn-sm px-4" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>{tStr("Слушать")}</button>
      </div>
    </div>
  );
};