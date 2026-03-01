import { getWomenCourses } from "@/shared/api/courseApi";
import CoursesWomenClient from "./CoursesWomenClient";

export const revalidate = 3600;

export default async function CoursesWomenPage() {
  const initialData = await getWomenCourses();
  return <CoursesWomenClient initialData={initialData} />;
}
