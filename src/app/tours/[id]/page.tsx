import { Metadata } from 'next';
import { getTourById } from '@/shared/api/tourApi';
import TourDetailClient from './TourDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const tour = await getTourById(id);
    if (!tour) return { title: 'Тур | YOGA.LIFE' };
    return {
      title: `${tour.title} | YOGA.LIFE`,
      description: tour.description?.slice(0, 160),
      openGraph: {
        title: tour.title,
        description: tour.description?.slice(0, 160),
        images: tour.imageUrl ? [{ url: tour.imageUrl }] : [],
        url: `${BASE_URL}/tours/${id}`,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Тур | YOGA.LIFE' };
  }
}

export default function TourPage() {
  return <TourDetailClient />;
}
