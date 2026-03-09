'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';

export async function getHomeContent(): Promise<Record<string, string>> {
  const rows = await prisma.homeContent.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function updateHomeContent(data: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Нет доступа' };

    const ops = Object.entries(data).map(([key, value]) =>
      prisma.homeContent.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    );
    await prisma.$transaction(ops);
    return { success: true };
  } catch (e) {
    console.error('updateHomeContent error:', e);
    return { success: false, error: 'Не удалось обновить контент' };
  }
}
