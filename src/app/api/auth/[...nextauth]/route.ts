import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let handlers: any;
let initError: string | null = null;

try {
  handlers = require('../../../../../auth').handlers;
} catch (e: any) {
  initError = e?.message || String(e);
  console.error('[NextAuth route] Failed to import auth:', e);
}

export async function GET(req: NextRequest) {
  if (!handlers?.GET) {
    return NextResponse.json({ error: 'Auth init failed', detail: initError }, { status: 500 });
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  if (!handlers?.POST) {
    return NextResponse.json({ error: 'Auth init failed', detail: initError }, { status: 500 });
  }
  return handlers.POST(req);
}
