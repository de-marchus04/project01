import type { NextAuthConfig } from 'next-auth';

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
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  trustHost: true,
} satisfies NextAuthConfig;
