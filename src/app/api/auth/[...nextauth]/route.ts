import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getHandlers() {
  try {
    const mod = await import('../../../../../auth');
    return { handlers: mod.handlers, error: null };
  } catch (e: any) {
    console.error('[NextAuth route] Failed to import auth:', e);
    return { handlers: null, error: e?.message || String(e) };
  }
}

export async function GET(req: NextRequest) {
  const { handlers, error } = await getHandlers();
  if (!handlers?.GET) {
    return NextResponse.json({ error: 'Auth init failed', detail: error }, { status: 500 });
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const { handlers, error } = await getHandlers();
  if (!handlers?.POST) {
    return NextResponse.json({ error: 'Auth init failed', detail: error }, { status: 500 });
  }
  return handlers.POST(req);
}
