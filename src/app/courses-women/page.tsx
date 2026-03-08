import { getWomenCoursesPaginated } from "@/shared/api/courseApi";
import CoursesWomenClient from "./CoursesWomenClient";

export const revalidate = 3600;

export default async function CoursesWomenPage() {
  const initialData = await getWomenCoursesPaginated(1, 6, '', 'default').catch(() => ({ data: [], total: 0, page: 1, limit: 6, totalPages: 0 }));
  return <CoursesWomenClient initialData={initialData} />;
}
