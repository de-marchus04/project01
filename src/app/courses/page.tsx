import { Metadata } from 'next';
import { getAllCourses } from "@/shared/api/courseApi";
import CoursesAllClient from "./CoursesAllClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Все курсы | YOGA.LIFE',
  description: 'Полный каталог курсов по йоге: для начинающих, для женщин, медитация, здоровая спина',
};

export default async function CoursesPage() {
  const initialData = await getAllCourses(1, 9, '', 'default', 'all');
  return <CoursesAllClient initialData={initialData} />;
}
