import { Metadata } from 'next';
import { getCourseById } from '@/shared/api/courseApi';
import CourseDetailClient from './CourseDetailClient';

const BASE_URL = 'https://yoga-platform-9j65.vercel.app';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const course = await getCourseById(params.id);
    if (!course) return { title: 'Курс | YOGA.LIFE' };
    return {
      title: `${course.title} | YOGA.LIFE`,
      description: course.description?.slice(0, 160),
      openGraph: {
        title: course.title,
        description: course.description?.slice(0, 160),
        images: course.imageUrl ? [{ url: course.imageUrl }] : [],
        url: `${BASE_URL}/courses/${params.id}`,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Курс | YOGA.LIFE' };
  }
}

export default function CoursePage() {
  return <CourseDetailClient />;
}
