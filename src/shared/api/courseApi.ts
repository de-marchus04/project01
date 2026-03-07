"use server";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { Course } from "@/entities/course/model/types";
import { PaginatedResponse } from "./blogApi";

// Shared helper — eliminates duplicated pagination logic across category functions
async function paginateCourses(
  baseWhere: Prisma.CourseWhereInput,
  page: number,
  limit: number,
  searchQuery: string,
  sortBy: string
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }

  const where: Prisma.CourseWhereInput = { ...baseWhere };
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.CourseOrderByWithRelationInput =
    sortBy === 'price_asc' ? { price: 'asc' } :
    sortBy === 'price_desc' ? { price: 'desc' } : {};

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({ where, orderBy, skip, take: limit }),
    prisma.course.count({ where }),
  ]);

  return JSON.parse(JSON.stringify({
    data: courses,
    total,
    page: safePage,
    limit,
    totalPages: Math.ceil(total / limit),
  }));
}

export async function getBeginnersCourses(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  return paginateCourses({ category: { startsWith: 'beginners' } }, page, limit, searchQuery, sortBy);
}

export async function getAllCourses(
  page: number = 1,
  limit: number = 9,
  searchQuery: string = '',
  sortBy: string = 'default',
  category: string = 'all'
): Promise<PaginatedResponse<Course>> {
  const baseWhere: Prisma.CourseWhereInput =
    category && category !== 'all' ? { category: { startsWith: category } } : {};
  return paginateCourses(baseWhere, page, limit, searchQuery, sortBy);
}

export async function getBackCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({ where: { category: { startsWith: 'back' } } });
  return JSON.parse(JSON.stringify(courses));
}

export async function getBackCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  return paginateCourses({ category: { startsWith: 'back' } }, page, limit, searchQuery, sortBy);
}

export async function getMeditationCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({ where: { category: { startsWith: 'meditation' } } });
  return JSON.parse(JSON.stringify(courses));
}

export async function getMeditationCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  return paginateCourses({ category: { startsWith: 'meditation' } }, page, limit, searchQuery, sortBy);
}

export async function getWomenCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({ where: { category: { startsWith: 'women' } } });
  return JSON.parse(JSON.stringify(courses));
}

export async function getWomenCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  return paginateCourses({ category: { startsWith: 'women' } }, page, limit, searchQuery, sortBy);
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  const course = await prisma.course.findUnique({ where: { id } });
  return course ? JSON.parse(JSON.stringify(course)) : undefined;
}

export async function getAllAdminCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(courses));
}

const addCourseSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  price: z.number().positive().max(999999),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
});

const addCourseCategorySchema = z.string().min(1).max(100);

const updateCourseSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  price: z.number().positive().max(999999).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
  category: z.string().min(1).max(100).optional(),
});

export async function addCourse(courseData: Omit<Course, 'id'>, category: string): Promise<Course> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsedCategory = addCourseCategorySchema.safeParse(category);
  if (!parsedCategory.success) throw new Error(parsedCategory.error.issues[0]?.message || 'Некорректная категория');
  const parsed = addCourseSchema.safeParse(courseData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const newCourse = await prisma.course.create({
    data: { ...parsed.data, category: parsedCategory.data },
  });
  return JSON.parse(JSON.stringify(newCourse));
}

export async function updateCourse(id: string, updatedData: Partial<Course>): Promise<Course | undefined> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateCourseSchema.safeParse(updatedData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const updated = await prisma.course.update({
    where: { id },
    data: parsed.data
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteCourse(id: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.course.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteCourse error:', e);
    return false;
  }
}
