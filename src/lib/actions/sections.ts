"use server"

import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner, assertSectionOwner } from "@/lib/profile-access"
import { revalidateProfile } from "./revalidate"
import { fail, str, type ActionResult } from "./types"

export async function createSection(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profileId = str(formData, "profileId")
    const title = str(formData, "title")
    if (!title || title.length > 120) return { ok: false, error: "Titre invalide" }
    const profile = await assertProfileOwner(profileId, userId)

    const last = await prisma.section.findFirst({
      where: { profileId },
      orderBy: { priority: "desc" },
      select: { priority: true },
    })

    const section = await prisma.section.create({
      data: { profileId, title, priority: (last?.priority ?? -1) + 1 },
    })

    revalidateProfile(profileId, profile.slug)
    return { ok: true, id: section.id }
  } catch (e) {
    return fail(e)
  }
}

export async function updateSection(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const section = await assertSectionOwner(id, userId)
    const title = str(formData, "title")
    if (!title || title.length > 120) return { ok: false, error: "Titre invalide" }

    await prisma.section.update({
      where: { id },
      data: { title, isVisible: formData.get("isVisible") === "true" },
    })

    revalidateProfile(section.profileId, section.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function toggleSectionVisibility(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const section = await assertSectionOwner(id, userId)
    const current = await prisma.section.findUniqueOrThrow({ where: { id }, select: { isVisible: true } })
    await prisma.section.update({ where: { id }, data: { isVisible: !current.isVisible } })
    revalidateProfile(section.profileId, section.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteSection(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const section = await assertSectionOwner(id, userId)
    // Les liens rattachés sont conservés (sectionId remis à null par la FK).
    await prisma.section.delete({ where: { id } })
    revalidateProfile(section.profileId, section.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function reorderSections(profileId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profile = await assertProfileOwner(profileId, userId)
    const owned = await prisma.section.findMany({
      where: { profileId, id: { in: orderedIds } },
      select: { id: true },
    })
    const ownedIds = new Set(owned.map((s) => s.id))
    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) => prisma.section.update({ where: { id }, data: { priority: index } }))
    )
    revalidateProfile(profileId, profile.slug)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
