export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

let handlers: any;
let importError: Error | null = null;

try {
  handlers = require('@/auth').handlers;
} catch (e: any) {
  importError = e;
  console.error('[NextAuth route] Failed to import auth:', e);
}

export async function GET(req: Request) {
  if (importError) {
    return NextResponse.json(
      { error: 'Auth module failed to load', message: importError.message, stack: importError.stack },
      { status: 500 },
    );
  }
  return handlers.GET(req);
}

export async function POST(req: Request) {
  if (importError) {
    return NextResponse.json({ error: 'Auth module failed to load', message: importError.message }, { status: 500 });
  }
  return handlers.POST(req);
}
