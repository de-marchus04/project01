import { Metadata } from 'next';
import { getMentorshipConsultations } from "@/shared/api/consultationApi";
import ConsultationsMentorshipClient from "./ConsultationsMentorshipClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Йога-менторство | YOGA.LIFE',
  description: 'Консультации по йога-менторству: персональное сопровождение в практике.',
  openGraph: {
    title: 'Йога-менторство | YOGA.LIFE',
    description: 'Персональное йога-менторство.',
    type: 'website',
  },
};

export default async function ConsultationsMentorshipPage() {
  const initialData = await getMentorshipConsultations().catch(() => []);
  return <ConsultationsMentorshipClient initialData={initialData} />;
}
