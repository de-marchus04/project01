import { getMeditationCourses } from "@/shared/api/courseApi";
import CoursesMeditationClient from "./CoursesMeditationClient";

export const revalidate = 3600;

export default async function CoursesMeditationPage() {
  const initialData = await getMeditationCourses();
  return <CoursesMeditationClient initialData={initialData} />;
}
