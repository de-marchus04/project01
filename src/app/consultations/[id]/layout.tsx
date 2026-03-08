import { Metadata } from 'next';
import { getConsultationById } from '@/shared/api/consultationApi';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const consultation = await getConsultationById(resolvedParams.id);

    if (!consultation) {
      return {
        title: 'Консультация не найдена | YOGA.LIFE',
      };
    }

    return {
      title: `${consultation.title} | Консультации YOGA.LIFE`,
      description: consultation.description.substring(0, 160) + '...',
      openGraph: {
        title: consultation.title,
        description: consultation.description.substring(0, 160) + '...',
        images: consultation.imageUrl ? [consultation.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Консультация | YOGA.LIFE',
    };
  }
}

export default function ConsultationLayout({ children }: Props) {
  return <>{children}</>;
}
