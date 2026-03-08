import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check AUTH_SECRET
  checks.authSecret = process.env.AUTH_SECRET ? 'set' : 'MISSING';
  checks.authUrl = process.env.AUTH_URL || 'NOT SET';
  checks.nextauthUrl = process.env.NEXTAUTH_URL || 'NOT SET';
  checks.authTrustHost = process.env.AUTH_TRUST_HOST || 'NOT SET';
  checks.vercelUrl = process.env.VERCEL_URL || 'NOT SET';

  // Check DATABASE_URL
  checks.databaseUrl = process.env.DATABASE_URL ? 'set' : 'MISSING';

  // Check Prisma connection
  try {
    const { prisma } = await import('@/shared/lib/prisma');
    const count = await prisma.user.count();
    checks.database = `ok (${count} users)`;
  } catch (e: any) {
    checks.database = `error: ${e.message}`;
  }

  // Check bcryptjs
  try {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('test', 10);
    checks.bcrypt = hash ? 'ok' : 'error';
  } catch (e: any) {
    checks.bcrypt = `error: ${e.message}`;
  }

  const allOk = !Object.values(checks).some((v) => v.includes('MISSING') || v.includes('error'));

  return NextResponse.json({ status: allOk ? 'healthy' : 'unhealthy', checks }, { status: allOk ? 200 : 500 });
}
