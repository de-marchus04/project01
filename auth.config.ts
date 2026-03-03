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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.avatar = (user as any).avatar
        token.username = (user as any).username
        // name and email are standard JWT fields already set by NextAuth
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).avatar = token.avatar;
        (session.user as any).username = token.username;
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
} satisfies NextAuthConfig;
