import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      if (isAdminRoute) {
        const isLoggedIn = !!auth?.user;
        const isAdmin = (auth?.user as any)?.role === 'ADMIN';
        return isLoggedIn && isAdmin;
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
} satisfies NextAuthConfig;
