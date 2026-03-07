import { Video } from "../model/types";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import Image from "next/image";

interface VideoCardProps {
  video: Video;
}

const getYoutubeThumbnail = (url: string): string | null => {
  const match = url?.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

export const VideoCard = ({ video }: VideoCardProps) => {
  const { tData, tStr } = useLanguage();

  const localized_video = tData ? tData(video) : video;
  const thumbnail =
    getYoutubeThumbnail(localized_video.videoUrl) ||
    localized_video.thumbnailUrl ||
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="card h-100 shadow-sm border-0 hover-scale-sm transition-all">
      <div className="position-relative overflow-hidden rounded-top" style={{ height: '200px' }}>
        <Image
          src={thumbnail}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
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