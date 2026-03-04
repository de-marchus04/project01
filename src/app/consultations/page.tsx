import { Metadata } from 'next';
import { getAllConsultations } from "@/shared/api/consultationApi";
import ConsultationsAllClient from "./ConsultationsAllClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Все консультации | YOGA.LIFE',
  description: 'Индивидуальные консультации: частная практика, нутрициология, менторство',
};

export default async function ConsultationsPage() {
  const initialData = await getAllConsultations();
  return <ConsultationsAllClient initialData={initialData} />;
}
