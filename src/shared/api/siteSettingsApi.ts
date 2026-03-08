'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';

export interface SiteSettingsData {
  addressLine: string;
  email: string;
  phone: string;
  instagram: string;
  telegram: string;
  youtube: string;
  yearsExp: string;
  studentsCount: string;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });
  return {
    addressLine: settings.addressLine,
    email: settings.email,
    phone: settings.phone,
    instagram: settings.instagram,
    telegram: settings.telegram,
    youtube: settings.youtube,
    yearsExp: settings.yearsExp,
    studentsCount: settings.studentsCount,
  };
}

export async function updateSiteSettings(
  data: Partial<SiteSettingsData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Нет доступа' };
    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    });
    return { success: true };
  } catch (e) {
    console.error('updateSiteSettings error:', e);
    return { success: false, error: 'Не удалось обновить настройки' };
  }
}
