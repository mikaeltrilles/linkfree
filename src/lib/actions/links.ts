"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireUserId } from "@/lib/session"
import { assertLinkOwner, assertProfileOwner } from "@/lib/profile-access"
import { revalidateProfile } from "./revalidate"
import { fail, firstZodMessage, optional, str, type ActionResult } from "./types"

const urlSchema = z
  .string()
  .trim()
  .refine(
    (u) => u === "#contact-form" || /^https?:\/\/\S+$/i.test(u) || /^mailto:\S+@\S+$/i.test(u),
    "URL invalide (http(s)://… ou mailto:…)"
  )

const linkSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(120, "Titre trop long"),
  url: urlSchema,
  description: z.string().trim().max(500, "Description trop longue").nullable(),
  sectionId: z.string().nullable(),
})

export async function createLink(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profileId = str(formData, "profileId")
    const profile = await assertProfileOwner(profileId, userId)

    const parsed = linkSchema.safeParse({
      title: str(formData, "title"),
      url: str(formData, "url"),
      description: optional(formData, "description"),
      sectionId: optional(formData, "sectionId"),
    })
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    if (parsed.data.sectionId) {
      const section = await prisma.section.findFirst({
        where: { id: parsed.data.sectionId, profileId },
      })
      if (!section) return { ok: false, error: "Section invalide" }
    }

    const last = await prisma.link.findFirst({
      where: { profileId },
      orderBy: { priority: "desc" },
      select: { priority: true },
    })

    const link = await prisma.link.create({
      data: {
        profileId,
        ...parsed.data,
        priority: (last?.priority ?? -1) + 1,
        status: "ACTIVE",
      },
    })

    revalidateProfile(profileId, profile.slug)
    return { ok: true, id: link.id }
  } catch (e) {
    return fail(e)
  }
}

export async function updateLink(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const link = await assertLinkOwner(id, userId)

    const parsed = linkSchema.safeParse({
      title: str(formData, "title"),
      url: str(formData, "url"),
      description: optional(formData, "description"),
      sectionId: optional(formData, "sectionId"),
    })
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    if (parsed.data.sectionId) {
      const section = await prisma.section.findFirst({
        where: { id: parsed.data.sectionId, profileId: link.profileId },
      })
      if (!section) return { ok: false, error: "Section invalide" }
    }

    const status = str(formData, "status")

    await prisma.link.update({
      where: { id },
      data: {
        ...parsed.data,
        // La case à cocher n'est envoyée que si elle est cochée : absente = false.
        isPinned: formData.get("isPinned") === "true",
        ...(["ACTIVE", "DISABLED", "ARCHIVED"].includes(status) ? { status } : {}),
      },
    })

    revalidateProfile(link.profileId, link.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function toggleLinkStatus(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const link = await assertLinkOwner(id, userId)
    const current = await prisma.link.findUniqueOrThrow({ where: { id }, select: { status: true } })
    await prisma.link.update({
      where: { id },
      data: { status: current.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
    })
    revalidateProfile(link.profileId, link.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteLink(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const link = await assertLinkOwner(id, userId)
    await prisma.link.delete({ where: { id } })
    revalidateProfile(link.profileId, link.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function reorderLinks(profileId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profile = await assertProfileOwner(profileId, userId)

    // Ne réordonne que les liens appartenant réellement à ce profil.
    const owned = await prisma.link.findMany({
      where: { profileId, id: { in: orderedIds } },
      select: { id: true },
    })
    const ownedIds = new Set(owned.map((l) => l.id))

    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) => prisma.link.update({ where: { id }, data: { priority: index } }))
    )

    revalidateProfile(profileId, profile.slug)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
