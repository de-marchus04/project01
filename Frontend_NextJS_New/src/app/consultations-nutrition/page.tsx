import { getNutritionConsultations } from "@/shared/api/consultationApi";
import ConsultationsNutritionClient from "./ConsultationsNutritionClient";

export const revalidate = 3600;

export default async function ConsultationsNutritionPage() {
  const initialData = await getNutritionConsultations();
  return <ConsultationsNutritionClient initialData={initialData} />;
}
