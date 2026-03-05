"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { rateLimit } from "@/shared/lib/rateLimit";

export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
}

export async function getMyProfile(username: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true, email: true, phone: true, avatar: true, role: true }
    });
    if (!user) return null;
    return { ...user, role: user.role as string };
  } catch {
    return null;
  }
}

export async function updateMyProfile(
  username: string,
  data: { name?: string; email?: string; phone?: string; avatar?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const sessionUsername = (session?.user as any)?.username;
    if (!session?.user || sessionUsername !== username) {
      return { success: false, error: 'Нет доступа' };
    }
    await prisma.user.update({
      where: { username },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error('updateMyProfile error:', error);
    return { success: false, error: 'Не удалось обновить профиль' };
  }
}

export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(`changePwd:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) return { success: false, error: 'Слишком много запросов. Попробуйте позже.' };

    const session = await auth();
    const sessionUsername = (session?.user as any)?.username;
    if (!session?.user || sessionUsername !== username) {
      return { success: false, error: 'Нет доступа' };
    }
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }

    if (!user.passwordHash) {
      return { success: false, error: "Пароль не установлен" };
    }

    const passwordsMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!passwordsMatch) {
      return { success: false, error: "Текущий пароль неверен" };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedNewPassword }
    });

    return { success: true };
  } catch (error: any) {
    console.error('changePassword error:', error);
    return { success: false, error: 'Не удалось изменить пароль' };
  }
}

export async function resetPassword(username: string, newPassword: string) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(`resetPwd:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) return { success: false, error: 'Слишком много запросов. Попробуйте позже.' };

    const session = await auth();
    const sessionUser = session?.user as any;
    if (!session?.user || sessionUser?.role !== 'ADMIN') {
      return { success: false, error: 'Только администратор может сбросить пароль' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Пароль должен быть не менее 6 символов' };
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedNewPassword }
    });

    return { success: true };
  } catch (error: any) {
    console.error('resetPassword error:', error);
    return { success: false, error: 'Не удалось сбросить пароль' };
  }
}
