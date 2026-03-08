import { Metadata } from 'next';
import { getPrivateConsultations } from '@/shared/api/consultationApi';
import ConsultationsPrivateClient from './ConsultationsPrivateClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Частные консультации | YOGA.LIFE',
  description: 'Индивидуальные янога-консультации с опытными преподавателями.',
  openGraph: {
    title: 'Частные консультации | YOGA.LIFE',
    description: 'Индивидуальные йога-консультации.',
    type: 'website',
  },
};

export default async function ConsultationsPrivatePage() {
  const initialData = await getPrivateConsultations().catch(() => []);
  return <ConsultationsPrivateClient initialData={initialData} />;
}
