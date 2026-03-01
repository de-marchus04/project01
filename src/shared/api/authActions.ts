"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
