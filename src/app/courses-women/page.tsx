import { getWomenCoursesPaginated } from "@/shared/api/courseApi";
import CoursesWomenClient from "./CoursesWomenClient";

export const revalidate = 3600;

export default async function CoursesWomenPage() {
  const initialData = await getWomenCoursesPaginated(1, 6, '', 'default');
  return <CoursesWomenClient initialData={initialData} />;
}
