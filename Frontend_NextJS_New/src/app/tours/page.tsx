import { getTours } from "@/shared/api/tourApi";
import ToursPageClient from "./ToursPageClient";

export const revalidate = 3600;

export default async function ToursPagePage() {
  const initialData = await getTours();
  return <ToursPageClient initialData={initialData} />;
}
