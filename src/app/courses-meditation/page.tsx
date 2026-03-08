import { getMeditationCoursesPaginated } from "@/shared/api/courseApi";
import CoursesMeditationClient from "./CoursesMeditationClient";

export const revalidate = 3600;

export default async function CoursesMeditationPage() {
  const initialData = await getMeditationCoursesPaginated(1, 6, '', 'default').catch(() => ({ data: [], total: 0, page: 1, limit: 6, totalPages: 0 }));
  return <CoursesMeditationClient initialData={initialData} />;
}
