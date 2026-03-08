export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/shared/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/shared/lib/rateLimit';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "USERNAME_TOO_SHORT")
    .max(32, "USERNAME_TOO_LONG")
    .regex(/^[a-zA-Z0-9_]+$/, "USERNAME_INVALID_CHARS"),
  password: z
    .string()
    .min(6, "PASSWORD_TOO_SHORT")
    .max(72, "PASSWORD_TOO_LONG"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await rateLimit(`register:${ip}`, { windowMs: 600_000, max: 5 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'INVALID_DATA';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { username: un, password: pw } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { username: un } });
    if (existingUser) {
      return NextResponse.json({ error: 'USER_EXISTS' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(pw, 10);

    // Hardcoded admin promotion: if username matches ADMIN_USERNAME env var, give ADMIN role
    const adminUsername = process.env.ADMIN_USERNAME;
    const role = (adminUsername && un === adminUsername) ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: { username: un, passwordHash, role }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { username: user.username, role: user.role }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
