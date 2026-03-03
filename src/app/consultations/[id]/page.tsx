import { Metadata } from 'next';
import { getConsultationById } from '@/shared/api/consultationApi';
import ConsultationDetailClient from './ConsultationDetailClient';

const BASE_URL = 'https://yoga-platform-9j65.vercel.app';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const consultation = await getConsultationById(params.id);
    if (!consultation) return { title: 'Консультация | YOGA.LIFE' };
    return {
      title: `${consultation.title} | YOGA.LIFE`,
      description: consultation.description?.slice(0, 160),
      openGraph: {
        title: consultation.title,
        description: consultation.description?.slice(0, 160),
        images: consultation.imageUrl ? [{ url: consultation.imageUrl }] : [],
        url: `${BASE_URL}/consultations/${params.id}`,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Консультация | YOGA.LIFE' };
  }
}

export default function ConsultationPage() {
  return <ConsultationDetailClient />;
}
