import { Metadata } from "next";
import { getBeginnersCourses, getBackCourses, getMeditationCourses, getWomenCourses, getCourseById, getAllAdminCourses, addCourse, updateCourse, deleteCourse } from "@/shared/api/courseApi";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // В реальном приложении здесь будет запрос к БД/API
    // Для демо используем наш мок-API (он синхронный, но мы оборачиваем в Promise для совместимости)
    const resolvedParams = await params;
    const course = await getCourseById(resolvedParams.id);
    
    if (!course) {
      return {
        title: "Курс не найден | YOGA.LIFE",
      };
    }

    return {
      title: `${course.title} | Курсы YOGA.LIFE`,
      description: course.description.substring(0, 160) + "...",
      openGraph: {
        title: course.title,
        description: course.description.substring(0, 160) + "...",
        images: [course.imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Курс | YOGA.LIFE",
    };
  }
}

export default function CourseLayout({ children }: Props) {
  return <>{children}</>;
}