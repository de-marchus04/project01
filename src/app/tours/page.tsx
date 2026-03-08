import { Metadata } from 'next';
import { getTours } from "@/shared/api/tourApi";
import ToursPageClient from "./ToursPageClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Йога-туры | YOGA.LIFE',
  description: 'Йога-туры и ретриты по всему миру: уединённые практики, медитации на природе и оздоровительные программы для тела и разума.',
};

export default async function ToursPagePage() {
  const initialData = await getTours().catch(() => []);
  return <ToursPageClient initialData={initialData} />;
}
