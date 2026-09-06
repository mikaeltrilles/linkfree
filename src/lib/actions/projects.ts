"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner, assertProjectOwner } from "@/lib/profile-access"
import { isValidUrl } from "@/lib/utils"
import { revalidateProfile } from "./revalidate"
import { fail, firstZodMessage, optional, str, type ActionResult } from "./types"

const optionalUrl = z
  .string()
  .trim()
  .nullable()
  .refine((u) => u === null || isValidUrl(u), "URL invalide (https://…)")

const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est requis").max(120, "Titre trop long"),
    description: z.string().trim().max(1000, "Description trop longue").nullable(),
    url: optionalUrl,
    repoUrl: optionalUrl,
    image: optionalUrl,
    tags: z.string().trim().max(200, "Trop de tags").nullable(),
  })
  .refine((p) => p.url || p.repoUrl, {
    message: "Indiquez au moins un lien (site du projet ou dépôt)",
    path: ["url"],
  })

function normalizeTags(tags: string | null): string | null {
  if (!tags) return null
  const list = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8)
  return list.length ? list.join(",") : null
}

function parseProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    title: str(formData, "title"),
    description: optional(formData, "description"),
    url: optional(formData, "url"),
    repoUrl: optional(formData, "repoUrl"),
    image: optional(formData, "image"),
    tags: optional(formData, "tags"),
  })
  if (!parsed.success) return parsed
  return { success: true as const, data: { ...parsed.data, tags: normalizeTags(parsed.data.tags) } }
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profileId = str(formData, "profileId")
    const profile = await assertProfileOwner(profileId, userId)

    const parsed = parseProject(formData)
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    const last = await prisma.project.findFirst({
      where: { profileId },
      orderBy: { priority: "desc" },
      select: { priority: true },
    })

    const project = await prisma.project.create({
      data: {
        profileId,
        ...parsed.data,
        isFeatured: formData.get("isFeatured") === "true",
        priority: (last?.priority ?? -1) + 1,
      },
    })

    revalidateProfile(profileId, profile.slug)
    return { ok: true, id: project.id }
  } catch (e) {
    return fail(e)
  }
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const project = await assertProjectOwner(id, userId)

    const parsed = parseProject(formData)
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error.issues) }

    await prisma.project.update({
      where: { id },
      data: { ...parsed.data, isFeatured: formData.get("isFeatured") === "true" },
    })

    revalidateProfile(project.profileId, project.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function toggleProjectVisibility(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const project = await assertProjectOwner(id, userId)
    const current = await prisma.project.findUniqueOrThrow({ where: { id }, select: { isVisible: true } })
    await prisma.project.update({ where: { id }, data: { isVisible: !current.isVisible } })
    revalidateProfile(project.profileId, project.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const project = await assertProjectOwner(id, userId)
    await prisma.project.delete({ where: { id } })
    revalidateProfile(project.profileId, project.profile.slug)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function reorderProjects(profileId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const profile = await assertProfileOwner(profileId, userId)
    const owned = await prisma.project.findMany({
      where: { profileId, id: { in: orderedIds } },
      select: { id: true },
    })
    const ownedIds = new Set(owned.map((p) => p.id))
    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) => prisma.project.update({ where: { id }, data: { priority: index } }))
    )
    revalidateProfile(profileId, profile.slug)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
