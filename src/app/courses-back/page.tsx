import { getBackCoursesPaginated } from "@/shared/api/courseApi";
import CoursesBackClient from "./CoursesBackClient";

export const revalidate = 3600;

export default async function CoursesBackPage() {
  const initialData = await getBackCoursesPaginated(1, 6, '', 'default');
  return <CoursesBackClient initialData={initialData} />;
}
