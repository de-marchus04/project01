import { Metadata } from 'next';
import { getBackCoursesPaginated } from '@/shared/api/courseApi';
import CoursesBackClient from './CoursesBackClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Здоровая спина | YOGA.LIFE',
  description: 'Курсы йоги для здоровой спины: оздоровительные практики и реабилитационные программы.',
  openGraph: {
    title: 'Здоровая спина | YOGA.LIFE',
    description: 'Курсы йоги для здоровой спины.',
    type: 'website',
  },
};

export default async function CoursesBackPage() {
  const initialData = await getBackCoursesPaginated(1, 6, '', 'default').catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  }));
  return <CoursesBackClient initialData={initialData} />;
}
