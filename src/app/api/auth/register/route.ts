export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/shared/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/shared/lib/rateLimit';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Логин должен содержать минимум 3 символа")
    .max(32, "Логин не должен превышать 32 символа")
    .regex(/^[a-zA-Z0-9_]+$/, "Логин может содержать только буквы, цифры и _"),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(72, "Пароль не должен превышать 72 символа"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await rateLimit(`register:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много попыток регистрации. Попробуйте позже.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Неверные данные';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { username: un, password: pw } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { username: un } });
    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(pw, 10);
    const user = await prisma.user.create({
      data: { username: un, passwordHash, role: 'USER' }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { username: user.username, role: user.role }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
