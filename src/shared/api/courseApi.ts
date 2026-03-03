"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Course } from "@/entities/course/model/types";
import { PaginatedResponse } from "./blogApi";

export async function getBeginnersCourses(
  page: number = 1, 
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = {
    category: { startsWith: 'beginners' }
  };

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    whereClause.OR = [
      { title: { contains: lowerQuery, mode: 'insensitive' } },
      { description: { contains: lowerQuery, mode: 'insensitive' } }
    ];
  }

  let orderByClause: any = {};
  if (sortBy === 'price_asc') {
    orderByClause = { price: 'asc' };
  } else if (sortBy === 'price_desc') {
    orderByClause = { price: 'desc' };
  }

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
    }),
    prisma.course.count({ where: whereClause })
  ]);

  return JSON.parse(JSON.stringify({
    data: courses,
    total,
    page: safePage,
    limit,
    totalPages: Math.ceil(total / limit)
  }));
}

export async function getAllCourses(
  page: number = 1,
  limit: number = 9,
  searchQuery: string = '',
  sortBy: string = 'default',
  category: string = 'all'
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = {};

  if (category && category !== 'all') {
    whereClause.category = { startsWith: category };
  }

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    whereClause.OR = [
      { title: { contains: lowerQuery, mode: 'insensitive' } },
      { description: { contains: lowerQuery, mode: 'insensitive' } }
    ];
  }

  let orderByClause: any = {};
  if (sortBy === 'price_asc') {
    orderByClause = { price: 'asc' };
  } else if (sortBy === 'price_desc') {
    orderByClause = { price: 'desc' };
  }

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
    }),
    prisma.course.count({ where: whereClause })
  ]);

  return JSON.parse(JSON.stringify({
    data: courses,
    total,
    page: safePage,
    limit,
    totalPages: Math.ceil(total / limit)
  }));
}

export async function getBackCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { category: { startsWith: 'back' } }
  });
  return JSON.parse(JSON.stringify(courses));
}

export async function getBackCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = { category: { startsWith: 'back' } };
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    whereClause.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
  }
  let orderByClause: any = {};
  if (sortBy === 'price_asc') orderByClause = { price: 'asc' };
  else if (sortBy === 'price_desc') orderByClause = { price: 'desc' };
  const safePage = Math.max(1, page);
  const [courses, total] = await Promise.all([
    prisma.course.findMany({ where: whereClause, orderBy: orderByClause, skip: (safePage - 1) * limit, take: limit }),
    prisma.course.count({ where: whereClause })
  ]);
  return JSON.parse(JSON.stringify({ data: courses, total, page: safePage, limit, totalPages: Math.ceil(total / limit) }));
}

export async function getMeditationCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { category: { startsWith: 'meditation' } }
  });
  return JSON.parse(JSON.stringify(courses));
}

export async function getMeditationCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = { category: { startsWith: 'meditation' } };
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    whereClause.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
  }
  let orderByClause: any = {};
  if (sortBy === 'price_asc') orderByClause = { price: 'asc' };
  else if (sortBy === 'price_desc') orderByClause = { price: 'desc' };
  const safePage = Math.max(1, page);
  const [courses, total] = await Promise.all([
    prisma.course.findMany({ where: whereClause, orderBy: orderByClause, skip: (safePage - 1) * limit, take: limit }),
    prisma.course.count({ where: whereClause })
  ]);
  return JSON.parse(JSON.stringify({ data: courses, total, page: safePage, limit, totalPages: Math.ceil(total / limit) }));
}

export async function getWomenCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { category: { startsWith: 'women' } }
  });
  return JSON.parse(JSON.stringify(courses));
}

export async function getWomenCoursesPaginated(
  page: number = 1,
  limit: number = 6,
  searchQuery: string = '',
  sortBy: string = 'default'
): Promise<PaginatedResponse<Course>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = { category: { startsWith: 'women' } };
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    whereClause.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
  }
  let orderByClause: any = {};
  if (sortBy === 'price_asc') orderByClause = { price: 'asc' };
  else if (sortBy === 'price_desc') orderByClause = { price: 'desc' };
  const safePage = Math.max(1, page);
  const [courses, total] = await Promise.all([
    prisma.course.findMany({ where: whereClause, orderBy: orderByClause, skip: (safePage - 1) * limit, take: limit }),
    prisma.course.count({ where: whereClause })
  ]);
  return JSON.parse(JSON.stringify({ data: courses, total, page: safePage, limit, totalPages: Math.ceil(total / limit) }));
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  const course = await prisma.course.findUnique({
    where: { id }
  });
  return course ? JSON.parse(JSON.stringify(course)) : undefined;
}

export async function getAllAdminCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(courses));
}

export async function addCourse(courseData: Omit<Course, 'id'>, category: string): Promise<Course> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, ...validData } = courseData as any;
  const newCourse = await prisma.course.create({
    data: {
      ...validData,
      category: category,
      id: `${category}-${Date.now()}`
    } as any
  });
  return JSON.parse(JSON.stringify(newCourse));
}

export async function updateCourse(id: string, updatedData: Partial<Course>): Promise<Course | undefined> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, id: _, ...validData } = updatedData as any;
  const updated = await prisma.course.update({
    where: { id },
    data: validData
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteCourse(id: string): Promise<boolean> {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
    await prisma.course.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
