import { getBackCourses } from "@/shared/api/courseApi";
import CoursesBackClient from "./CoursesBackClient";

export const revalidate = 3600;

export default async function CoursesBackPage() {
  const initialData = await getBackCourses();
  return <CoursesBackClient initialData={initialData} />;
}
