"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { redirect } from "next/navigation"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner } from "@/lib/profile-access"
import { isValidSlug, normalizeSlug } from "@/lib/slug"
import { isValidUrl } from "@/lib/utils"
import { revalidateProfile } from "./revalidate"
import { fail, firstZodMessage, optional, str, type ActionResult } from "./types"

const HEX_COLOR = /^#[0-9a-f]{6}$/i

const optionalUrl = z
  .string()
  .trim()
  .nullable()
  .refine((u) => u === null || isValidUrl(u), "URL invalide (https://…)")

async function slugAvailable(slug: string, exceptProfileId?: string) {
  const existing = await prisma.profile.findUnique({ where: { slug }, select: { id: true } })
  return !existing || existing.id === exceptProfileId
}

export async function createProfile(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const slug = normalizeSlug(str(formData, "slug"))
    const title = optional(formData, "title")
    const bio = optional(formData, "bio")

    if (!isValidSlug(slug)) {
      return { ok: false, error: "Slug invalide : 3 à 40 caractères, lettres minuscules, chiffres et tirets." }
    }
    if (!(await slugAvailable(slug))) return { ok: false, error: "Ce slug est déjà pris." }

    const profile = await prisma.profile.create({
      data: {
        userId,
        slug,
        title,
        bio,
        status: "DRAFT",
        appearance: JSON.stringify({ colors: { primary: "#111111" } }),
      },
    })

    revalidateProfile(profile.id, profile.slug)
    return { ok: true, id: profile.id }
  } catch (e) {
    return fail(e)
  }
}

const settingsSchema = z.object({
  title: z.string().trim().max(80, "Nom trop long").nullable(),
  bio: z.string().trim().max(300, "Bio trop longue (300 caractères max)").nullable(),
  avatar: optionalUrl,
  seoTitle: z.string().trim().max(70, "Titre SEO trop long").nullable(),
  seoDescription: z.string().trim().max(160, "Description SEO trop longue").nullable(),
  emergencyUrl: optionalUrl,
  primaryColor: z.string().trim().regex(HEX_COLOR, "Couleur invalide (format #rrggbb)"),
})

export async function updateProfileSettings(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profileId = str(formData, "profileId")
    const current = await assertProfileOwner(profileId, userId)

    const slug = normalizeSlug(str(formData, "slug"))
    if (!isValidSlug(slug)) {
      return { ok: false, error: "Slug invalide : 3 à 40 caractères, lettres minuscules, chiffres et tirets." }
    }
    if (!(await slugAvailable(slug, profileId))) return { ok: false, error: "Ce slug est déjà pris." }

    const parsed = settingsSchema.safeParse({
      title: optional(formData, "title"),
      bio: optional(formData, "bio"),
      avatar: optional(formData, "avatar"),
      seoTitle: optional(formData, "seoTitle"),
      seoDescription: optional(formData, "seoDescription"),
      emergencyUrl: optional(formData, "emergencyUrl"),
      primaryColor: str(formData, "primaryColor") || "#111111",
    })
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    const isEmergency = formData.get("isEmergency") === "on"
    if (isEmergency && !parsed.data.emergencyUrl) {
      return { ok: false, error: "Indiquez l'URL de redirection pour activer le mode urgence." }
    }

    const status = formData.get("isPublished") === "on" ? "PUBLISHED" : "DRAFT"
    const { primaryColor, emergencyUrl, ...rest } = parsed.data

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        ...rest,
        slug,
        status,
        isEmergency,
        emergencyUrl: isEmergency ? emergencyUrl : null,
        appearance: JSON.stringify({ colors: { primary: primaryColor.toLowerCase() } }),
      },
    })

    revalidateProfile(profileId, current.slug)
    if (slug !== current.slug) revalidateProfile(profileId, slug)
    return { ok: true, id: profileId }
  } catch (e) {
    return fail(e)
  }
}

export async function setProfileStatus(profileId: string, published: boolean): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profile = await assertProfileOwner(profileId, userId)
    await prisma.profile.update({
      where: { id: profileId },
      data: { status: published ? "PUBLISHED" : "DRAFT" },
    })
    revalidateProfile(profileId, profile.slug)
    return { ok: true, id: profileId }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteProfile(formData: FormData): Promise<void> {
  const userId = await requireUserId()
  const profileId = str(formData, "profileId")
  const profile = await assertProfileOwner(profileId, userId)
  await prisma.profile.delete({ where: { id: profileId } })
  revalidateProfile(profileId, profile.slug)
  redirect("/dashboard")
}
