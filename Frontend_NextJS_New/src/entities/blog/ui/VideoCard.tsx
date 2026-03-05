import { Video } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_video = tData ? tData(video) : video;
  return (
    <article className="card h-100 border-0 hover-scale-sm">
      <div className="position-relative overflow-hidden">
        <img
          src={localized_video.thumbnailUrl}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          alt={tStr(localized_video.title)}
        />
        <div className="position-absolute top-50 start-50 translate-middle" aria-hidden="true">
          <i className="bi bi-play-circle-fill text-white" style={{ fontSize: 'var(--text-6xl)', opacity: 0.85, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}></i>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title font-playfair fw-bold">{tStr(localized_video.title)}</h5>
        <p className="card-text" style={{ color: 'var(--color-text-muted)' }}>{tStr(localized_video.description)}</p>
      </div>
    </article>
  );
};
