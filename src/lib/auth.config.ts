import type { NextAuthConfig } from "next-auth"

/**
 * Configuration Auth.js partagée entre le middleware (Edge runtime) et le
 * serveur Node. Elle ne doit importer ni Prisma ni aucun module Node-only :
 * le middleware ne fait que lire/valider le JWT de session.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "OWNER"
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? "OWNER"
      }
      return session
    },
  },
} satisfies NextAuthConfig
