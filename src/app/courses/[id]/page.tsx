import { Metadata } from 'next';
import { getCourseById } from '@/shared/api/courseApi';
import CourseDetailClient from './CourseDetailClient';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseById(params.id);
  if (!course) {
    return { title: 'Курс не найден | YOGA.LIFE' };
  }
  return {
    title: `${course.title} | YOGA.LIFE`,
    description: course.description
      ? course.description.slice(0, 155)
      : 'Подробнее о курсе йоги на платформе YOGA.LIFE: программа, преподаватели, цены и запись на обучение.',
  };
}

export default function CoursePage() {
  return <CourseDetailClient />;
}
