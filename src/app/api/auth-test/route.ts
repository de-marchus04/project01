export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { handlers } from '@/auth';

export async function GET(req: Request) {
  try {
    const resp = await handlers.GET(req);
    return resp;
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
