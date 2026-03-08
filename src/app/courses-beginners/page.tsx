import { Metadata } from 'next';
import { getBeginnersCourses } from '@/shared/api/courseApi';
import CoursesBeginnersClient from './CoursesBeginnersClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Йога для начинающих | YOGA.LIFE',
  description: 'Курсы йоги для начинающих: мягкие практики, основы медитации и первые шаги в йоге.',
  openGraph: {
    title: 'Йога для начинающих | YOGA.LIFE',
    description: 'Курсы йоги для начинающих.',
    type: 'website',
  },
};

export default async function CoursesBeginnersPage() {
  const initialData = await getBeginnersCourses(1, 6, '', 'default').catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  }));
  return <CoursesBeginnersClient initialData={initialData} />;
}
