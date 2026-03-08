import { Metadata } from 'next';
import { getNutritionConsultations } from "@/shared/api/consultationApi";
import ConsultationsNutritionClient from "./ConsultationsNutritionClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Нутрициология | YOGA.LIFE',
  description: 'Консультации по нутрициологии и правильному питанию.',
  openGraph: {
    title: 'Нутрициология | YOGA.LIFE',
    description: 'Консультации по нутрициологии.',
    type: 'website',
  },
};

export default async function ConsultationsNutritionPage() {
  const initialData = await getNutritionConsultations().catch(() => []);
  return <ConsultationsNutritionClient initialData={initialData} />;
}
