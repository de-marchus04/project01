'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { rateLimit } from '@/shared/lib/rateLimit';
import { randomBytes } from 'crypto';
import { emailService } from '@/shared/api/emailService';

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
    const session = await auth();
    const sessionUser = session?.user;
    // Allow: own profile OR admin can fetch any profile
    if (!session?.user || (sessionUser?.username !== username && sessionUser?.role !== 'ADMIN')) {
      return null;
    }
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true, email: true, phone: true, avatar: true, role: true },
    });
    if (!user) return null;
    return { ...user, role: user.role as string };
  } catch {
    return null;
  }
}

export async function updateMyProfile(
  username: string,
  data: { name?: string; email?: string; phone?: string; avatar?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const sessionUsername = session?.user?.username;
    if (!session?.user || sessionUsername !== username) {
      return { success: false, error: 'ACCESS_DENIED' };
    }
    await prisma.user.update({
      where: { username },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('updateMyProfile error:', error);
    return { success: false, error: 'PROFILE_UPDATE_FAILED' };
  }
}

export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || 'unknown';
    const rl = await rateLimit(`changePwd:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) return { success: false, error: 'RATE_LIMIT' };

    const session = await auth();
    const sessionUsername = session?.user?.username;
    if (!session?.user || sessionUsername !== username) {
      return { success: false, error: 'ACCESS_DENIED' };
    }
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    if (!user.passwordHash) {
      return { success: false, error: 'PASSWORD_NOT_SET' };
    }

    const passwordsMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!passwordsMatch) {
      return { success: false, error: 'WRONG_PASSWORD' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedNewPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error('changePassword error:', error);
    return { success: false, error: 'PASSWORD_CHANGE_FAILED' };
  }
}

export async function resetPassword(username: string, newPassword: string) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || 'unknown';
    const rl = await rateLimit(`resetPwd:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) return { success: false, error: 'RATE_LIMIT' };

    const session = await auth();
    const sessionUser = session?.user;
    if (!session?.user || sessionUser?.role !== 'ADMIN') {
      return { success: false, error: 'ADMIN_ONLY' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'PASSWORD_TOO_SHORT' };
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedNewPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error('resetPassword error:', error);
    return { success: false, error: 'PASSWORD_RESET_FAILED' };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || 'unknown';
    const rl = await rateLimit(`passwordReset:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) return { success: true }; // Don't reveal rate limit info

    // Always return success to prevent email enumeration
    const user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email: user.email! } });
      await prisma.passwordResetToken.create({ data: { email: user.email!, token, expiresAt } });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      await emailService.sendPasswordResetEmail(user.email!, `${siteUrl}/reset-password?token=${token}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('requestPasswordReset error:', error);
    return { success: true }; // Don't leak errors
  }
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'PASSWORD_TOO_SHORT' };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken) return { success: false, error: 'INVALID_RESET_LINK' };
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return { success: false, error: 'RESET_LINK_EXPIRED' };
    }

    const user = await prisma.user.findFirst({ where: { email: resetToken.email } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword } });
    await prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

    return { success: true };
  } catch (error: any) {
    console.error('confirmPasswordReset error:', error);
    return { success: false, error: 'GENERAL_ERROR' };
  }
}
