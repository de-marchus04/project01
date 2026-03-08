import { Metadata } from 'next';
import { getAllConsultations } from "@/shared/api/consultationApi";
import ConsultationsAllClient from "./ConsultationsAllClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Консультации по йоге | YOGA.LIFE',
  description: 'Индивидуальные консультации по йоге и оздоровлению: частная практика, нутрициология, йога-менторство и персональная поддержка на пути к здоровью.',
};

export default async function ConsultationsPage() {
  const initialData = await getAllConsultations().catch(() => []);
  return <ConsultationsAllClient initialData={initialData} />;
}
