// NextAuth v5 route handler
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { handlers } from '@/auth';

export const GET = handlers.GET;
export const POST = handlers.POST;
