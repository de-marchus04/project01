import { Video } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_video = tData ? tData(video) : video;
  return (
    <div className="card h-100 shadow-sm border-0 hover-scale-sm transition-all">
      <div className="position-relative">
        <img 
          src={localized_video.thumbnailUrl} 
          className="card-img-top" 
          style={{ height: '200px', objectFit: 'cover' }}
          alt={tStr(localized_video.title)} 
        />
        <div className="position-absolute top-50 start-50 translate-middle">
          <i className="bi bi-play-circle-fill text-white" style={{ fontSize: '4rem', opacity: 0.8 }}></i>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title font-playfair fw-bold">{tStr(localized_video.title)}</h5>
        <p className="card-text text-muted">{tStr(localized_video.description)}</p>
      </div>
    </div>
  );
};