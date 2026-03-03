import { getMeditationCoursesPaginated } from "@/shared/api/courseApi";
import CoursesMeditationClient from "./CoursesMeditationClient";

export const revalidate = 3600;

export default async function CoursesMeditationPage() {
  const initialData = await getMeditationCoursesPaginated(1, 6, '', 'default');
  return <CoursesMeditationClient initialData={initialData} />;
}
