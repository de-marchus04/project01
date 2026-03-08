import { getBeginnersCourses } from "@/shared/api/courseApi";
import CoursesBeginnersClient from "./CoursesBeginnersClient";

// Incremental Static Regeneration (ISR): кэшируем страницу на 1 час
export const revalidate = 3600;

export default async function CoursesBeginnersPage() {
  const initialData = await getBeginnersCourses(1, 6, '', 'default').catch(() => ({ data: [], total: 0, page: 1, limit: 6, totalPages: 0 }));
  return <CoursesBeginnersClient initialData={initialData} />;
}
