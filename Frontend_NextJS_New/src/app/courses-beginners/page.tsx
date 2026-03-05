import { getBeginnersCourses } from "@/shared/api/courseApi";
import CoursesBeginnersClient from "./CoursesBeginnersClient";

// Incremental Static Regeneration (ISR): кэшируем страницу на 1 час
export const revalidate = 3600;

export default async function CoursesBeginnersPage() {
  // Выполняем 1 запрос к БД для сборки статической страницы на сервере
  const initialData = await getBeginnersCourses(1, 6, '', 'default');

  return <CoursesBeginnersClient initialData={initialData} />;
}
