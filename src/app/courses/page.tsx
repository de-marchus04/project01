import { Metadata } from 'next';
import { getAllCourses } from '@/shared/api/courseApi';
import CoursesAllClient from './CoursesAllClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Курсы йоги | YOGA.LIFE',
  description:
    'Онлайн-курсы йоги для любого уровня подготовки: йога для начинающих, йога для женщин, медитация и оздоровительные практики для здоровой спины.',
  openGraph: {
    title: 'Курсы йоги | YOGA.LIFE',
    description: 'Онлайн-курсы йоги для любого уровня подготовки.',
    type: 'website',
  },
};

export default async function CoursesPage() {
  const initialData = await getAllCourses(1, 9, '', 'default', 'all').catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  }));
  return <CoursesAllClient initialData={initialData} />;
}
