import { Course } from "../model/types";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

interface CourseCardProps {
  course: Course;
  onBuy: (title: string, price: number) => void;
}

export const CourseCard = ({ course, onBuy }: CourseCardProps) => {
  const { lang, tData , tStr} = useLanguage() as any;

  const localized_course = tData ? tData(course) : course;
  return (
    <article className="card h-100 border-0 hover-scale-sm">
      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
        <Image
          src={localized_course.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'}
          alt={localized_course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="card-img-top object-fit-cover"
        />
      </div>
      <div className="card-body d-flex flex-column">
        <Link href={localized_course.id.match(/^(private|nutrition|mentorship)/) ? `/consultations/${localized_course.id}` : `/courses/${localized_course.id}`} className="text-decoration-none">
          <h5 className="card-title font-playfair fw-bold mb-3">{localized_course.title}</h5>
        </Link>
        <p className="card-text flex-grow-1" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{localized_course.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <span className="fw-bold" style={{ fontSize: 'var(--text-2xl)' }}>{formatPrice(localized_course.price, lang)}</span>
          <button
            className="btn btn-primary-custom fw-bold px-4"
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => onBuy(localized_course.title, localized_course.price)}
          >{tStr("Записаться")}</button>
        </div>
      </div>
    </article>
  );
};
