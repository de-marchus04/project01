import type { NextAuthConfig } from "next-auth"

// Конфигурация для Edge Runtime (интерфейс, callbacks, страницы). Никаких баз данных.
export const authConfig = {
  providers: [], // Провайдеры добавим в самом auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
} satisfies NextAuthConfig;
