export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function POST(req: Request) {
  const { secret, username } = await req.json();

  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { username },
    data: { role: 'ADMIN' },
  });

  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
