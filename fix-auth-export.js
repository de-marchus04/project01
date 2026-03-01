const fs = require('fs');

const authPath = 'src/app/api/auth/[...nextauth]/route.ts';

// Для Next.js App Router (NextAuth v5 beta) важно правильно экспортировать методы
let content = `export const dynamic = "force-dynamic";
import { handlers } from "@/auth";

export const GET = handlers.GET;
export const POST = handlers.POST;
`;

fs.writeFileSync(authPath, content, 'utf8');

// Так же проверим .env переменные. Vercel иногда падает, если NEXTAUTH_URL не задан во время билда, 
// хоть он и должен игнорировать это.
