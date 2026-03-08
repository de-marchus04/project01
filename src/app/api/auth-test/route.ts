export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const authModule = await import('@/auth');
    return NextResponse.json({
      ok: true,
      hasHandlers: !!authModule.handlers,
      hasAuth: !!authModule.auth,
      exports: Object.keys(authModule),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e.message,
        stack: e.stack?.split('\n').slice(0, 10),
      },
      { status: 500 },
    );
  }
}
