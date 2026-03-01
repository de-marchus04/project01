export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing logic fields' }, { status: 400 });
    }

    const un = username.trim();
    const pw = password.trim();

    // Check existing
    const existingUser = await prisma.user.findUnique({
      where: { username: un }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(pw, 10);
    const role = un.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        username: un,
        passwordHash,
        role
      }
    });

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: { username: user.username, role: user.role } 
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
