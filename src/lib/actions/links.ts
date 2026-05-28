"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createLinkSchema = z.object({
  profileId: z.string().cuid(),
  title: z.string().min(1).max(120),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  sectionId: z.string().cuid().optional(),
})

export async function createLink(formData: FormData) {
  const data = createLinkSchema.parse({
    profileId: formData.get("profileId"),
    title: formData.get("title"),
    url: formData.get("url"),
    description: formData.get("description"),
    sectionId: formData.get("sectionId") || undefined,
  })

  const maxPriority = await prisma.link.findFirst({
    where: { profileId: data.profileId },
    orderBy: { priority: "desc" },
  })

  await prisma.link.create({
    data: {
      ...data,
      priority: (maxPriority?.priority ?? -1) + 1,
      status: "ACTIVE",
    },
  })

  revalidatePath(`/dashboard/profiles/${data.profileId}`)
  revalidatePath(`/p/[slug]`)
}

const updateLinkSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(120).optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional().nullable(),
  isPinned: z.boolean().optional(),
  status: z.enum(["ACTIVE", "SCHEDULED", "ARCHIVED", "DISABLED"]).optional(),
})

export async function updateLink(formData: FormData) {
  const id = formData.get("id") as string
  const data: any = {}

  const title = formData.get("title")
  if (title) data.title = title as string

  const url = formData.get("url")
  if (url) data.url = url as string

  const description = formData.get("description")
  data.description = description === "" ? null : (description as string)

  const isPinned = formData.get("isPinned")
  if (isPinned !== null) data.isPinned = isPinned === "true"

  const status = formData.get("status")
  if (status) data.status = status as string

  const updated = await prisma.link.update({
    where: { id },
    data,
  })

  revalidatePath(`/dashboard/profiles/${updated.profileId}`)
  revalidatePath(`/p/[slug]`)
}

export async function deleteLink(formData: FormData) {
  const id = formData.get("id") as string
  const link = await prisma.link.delete({ where: { id } })
  revalidatePath(`/dashboard/profiles/${link.profileId}`)
  revalidatePath(`/p/[slug]`)
}

export async function reorderLinks(profileId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.link.update({
        where: { id },
        data: { priority: index },
      })
    )
  )

  revalidatePath(`/dashboard/profiles/${profileId}`)
  revalidatePath(`/p/[slug]`)
}
