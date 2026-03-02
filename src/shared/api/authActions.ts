"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    return { success: false, error: error.message };
  }
}

export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return { success: false, error: "Пользователь не найден" };
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
    return { success: false, error: error.message };
  }
}

export async function resetPassword(username: string, newPassword: string) {
  try {
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
    return { success: false, error: error.message };
  }
}
