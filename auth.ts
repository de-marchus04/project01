import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string }
          })

          if (!user || !user.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!passwordsMatch) return null

          return {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            username: user.username,
          } as any
        } catch (e) {
          console.error('Auth error:', e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile, trigger }) {
      // OAuth login (Google / GitHub)
      if (account && account.provider !== 'credentials' && profile) {
        const email = (profile as any).email as string | undefined;
        if (email) {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
            let username = base;
            let i = 0;
            while (await prisma.user.findFirst({ where: { username } })) {
              username = `${base}${++i}`;
            }
            const avatarUrl =
              (profile as any).picture ||
              (profile as any).avatar_url ||
              null;
            dbUser = await prisma.user.create({
              data: {
                email,
                username,
                name: (profile as any).name || username,
                avatar: avatarUrl,
              }
            });
          }
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.avatar = dbUser.avatar || (profile as any).picture || (profile as any).avatar_url || null;
        }
      } else if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.avatar = (user as any).avatar;
        token.username = (user as any).username;
        token.name = (user as any).name || (user as any).username;
      }
      // Re-fetch fresh profile data from DB when session.update() is called
      if (trigger === 'update' && token.username) {
        const dbUser = await prisma.user.findUnique({
          where: { username: token.username as string },
          select: { name: true, avatar: true }
        });
        if (dbUser) {
          token.name = (dbUser.name || token.username) as string;
          // Only store HTTP avatars in JWT cookie — base64 images overflow the 4KB cookie limit
          if (!dbUser.avatar || dbUser.avatar.startsWith('http')) {
            token.avatar = dbUser.avatar;
          }
        }
      }
      // Hydrate old/incomplete tokens: if username is missing, fetch from DB by sub (user id)
      if (!token.username && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { username: true, name: true, avatar: true, role: true }
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.name = (dbUser.name || dbUser.username) as string;
          if (!dbUser.avatar || dbUser.avatar.startsWith('http')) {
            token.avatar = dbUser.avatar;
          }
          token.role = dbUser.role;
        }
      }
      // Always ensure name is at least the username
      if (!token.name && token.username) {
        token.name = token.username as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).avatar = token.avatar;
        (session.user as any).username = token.username;
        session.user.name = token.name as string;
      }
      return session;
    }
  }
})
