"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/hash"
import { z } from "zod"
import type { ActionResult } from "@/lib/actions/types"

const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom est trop court").max(80, "Le nom est trop long"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(200),
})

export async function registerUser(formData: FormData): Promise<ActionResult> {
  if (process.env.ALLOW_REGISTRATION === "false") {
    return { ok: false, error: "L'inscription est désactivée." }
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { ok: false, error: "Un compte existe déjà avec cet email." }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashPassword(parsed.data.password),
      role: "OWNER",
    },
  })

  return { ok: true, id: user.id }
}
