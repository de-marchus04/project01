import { Course } from '../model/types';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { formatPrice } from '@/shared/lib/formatPrice';
import { WishlistButton } from '@/shared/ui/WishlistButton/WishlistButton';

interface CourseCardProps {
  course: Course & { category?: string };
  onBuy: (title: string, price: number) => void;
  type?: 'course' | 'consultation';
}

export const CourseCard = ({ course, onBuy, type }: CourseCardProps) => {
  const { lang, tData, tStr } = useLanguage();

  const localized_course = tData ? tData(course) : course;
  const isConsultation =
    type === 'consultation' || /^(private|nutrition|mentorship)/.test(localized_course.category || localized_course.id);
  const itemType = isConsultation ? 'CONSULTATION' : 'COURSE';
  const detailUrl = isConsultation ? `/consultations/${localized_course.id}` : `/courses/${localized_course.id}`;

  return (
    <div className="card h-100 shadow border-0 hover-scale-sm transition-all">
      <div
        className="position-relative overflow-hidden"
        style={{ height: '200px', backgroundColor: 'var(--color-secondary)' }}
      >
        <Image
          src={
            localized_course.imageUrl ||
            'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'
          }
          alt={localized_course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="card-img-top object-fit-cover"
          style={{ opacity: 0, transition: 'opacity 0.5s ease' }}
          onLoad={(e) => {
            (e.target as HTMLImageElement).style.opacity = '1';
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop';
            img.style.opacity = '1';
          }}
        />
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }}>
          <WishlistButton itemId={localized_course.id} itemType={itemType} size="sm" />
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <Link href={detailUrl} className="text-decoration-none">
          <h5 className="card-title font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
            {localized_course.title}
          </h5>
        </Link>
        <p className="card-text text-muted small flex-grow-1">{localized_course.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <span className="fs-4 fw-bold" style={{ color: 'var(--color-text)' }}>
            {formatPrice(localized_course.price, lang)}
          </span>
          <button
            className="btn btn-primary-custom rounded-pill text-white fw-bold px-4 shadow-sm"
            onClick={() => onBuy(localized_course.title, localized_course.price)}
          >
            {tStr('Записаться')}
          </button>
        </div>
      </div>
    </div>
  );
};
