"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner, assertSocialLinkOwner } from "@/lib/profile-access"
import { SOCIAL_PLATFORM_KEYS, detectPlatform, isValidSocialUrl } from "@/lib/social-platforms"
import { revalidateProfile } from "./revalidate"
import { fail, firstZodMessage, optional, str, type ActionResult } from "./types"

const socialSchema = z.object({
  platform: z.string().refine((p) => SOCIAL_PLATFORM_KEYS.includes(p), "Plateforme inconnue"),
  url: z.string().trim().refine(isValidSocialUrl, "URL invalide (https://… ou mailto:…)"),
  label: z.string().trim().max(60, "Libellé trop long").nullable(),
})

function parseSocial(formData: FormData) {
  const url = str(formData, "url")
  const platform = str(formData, "platform") || detectPlatform(url)
  return socialSchema.safeParse({ platform, url, label: optional(formData, "label") })
}

export async function createSocialLink(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profileId = str(formData, "profileId")
    const profile = await assertProfileOwner(profileId, userId)

    const parsed = parseSocial(formData)
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    const last = await prisma.socialLink.findFirst({
      where: { profileId },
      orderBy: { priority: "desc" },
      select: { priority: true },
    })

    const social = await prisma.socialLink.create({
      data: { profileId, ...parsed.data, priority: (last?.priority ?? -1) + 1 },
    })

    revalidateProfile(profileId, profile.slug)
    return { ok: true, id: social.id }
  } catch (e) {
    return fail(e)
  }
}

export async function updateSocialLink(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const social = await assertSocialLinkOwner(id, userId)

    const parsed = parseSocial(formData)
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    await prisma.socialLink.update({
      where: { id },
      data: { ...parsed.data, isVisible: formData.get("isVisible") !== "false" },
    })

    revalidateProfile(social.profileId, social.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function toggleSocialLinkVisibility(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const social = await assertSocialLinkOwner(id, userId)
    const current = await prisma.socialLink.findUniqueOrThrow({ where: { id }, select: { isVisible: true } })
    await prisma.socialLink.update({ where: { id }, data: { isVisible: !current.isVisible } })
    revalidateProfile(social.profileId, social.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteSocialLink(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const social = await assertSocialLinkOwner(id, userId)
    await prisma.socialLink.delete({ where: { id } })
    revalidateProfile(social.profileId, social.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function reorderSocialLinks(profileId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profile = await assertProfileOwner(profileId, userId)
    const owned = await prisma.socialLink.findMany({
      where: { profileId, id: { in: orderedIds } },
      select: { id: true },
    })
    const ownedIds = new Set(owned.map((s) => s.id))
    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) => prisma.socialLink.update({ where: { id }, data: { priority: index } }))
    )
    revalidateProfile(profileId, profile.slug)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
