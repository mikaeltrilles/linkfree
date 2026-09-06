import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import { prisma } from "./prisma"
import { verifyPassword } from "./hash"
import { authConfig } from "./auth.config"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const isGoogleAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = credentialsSchema.safeParse(credentials)
      if (!parsed.success) return null

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      })
      if (!user || !user.password) return null
      if (!verifyPassword(parsed.data.password, user.password)) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      }
    },
  }),
]

if (isGoogleAuthEnabled) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }) as never
  )
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as never,
  providers,
})
