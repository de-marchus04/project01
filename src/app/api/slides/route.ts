import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get('page');
  if (!pageKey) return NextResponse.json([]);

  try {
    const slides = await prisma.pageSlide.findMany({
      where: { pageKey, active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, mediaType: true, title: true, sortOrder: true },
    });
    return NextResponse.json(slides);
  } catch {
    return NextResponse.json([]);
  }
}
