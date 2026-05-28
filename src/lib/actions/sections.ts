"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createSectionSchema = z.object({
  profileId: z.string().cuid(),
  title: z.string().min(1).max(120),
})

export async function createSection(formData: FormData) {
  const data = createSectionSchema.parse({
    profileId: formData.get("profileId"),
    title: formData.get("title"),
  })

  const maxPriority = await prisma.section.findFirst({
    where: { profileId: data.profileId },
    orderBy: { priority: "desc" },
  })

  await prisma.section.create({
    data: {
      ...data,
      priority: (maxPriority?.priority ?? -1) + 1,
    },
  })

  revalidatePath(`/dashboard/profiles/${data.profileId}`)
}

export async function updateSection(formData: FormData) {
  const id = formData.get("id") as string
  const isVisible = formData.get("isVisible") === "true"
  const title = formData.get("title") as string

  const section = await prisma.section.update({
    where: { id },
    data: { isVisible, title },
  })

  revalidatePath(`/dashboard/profiles/${section.profileId}`)
}

export async function deleteSection(formData: FormData) {
  const id = formData.get("id") as string
  const section = await prisma.section.delete({ where: { id } })
  revalidatePath(`/dashboard/profiles/${section.profileId}`)
}

export async function reorderSections(profileId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.section.update({
        where: { id },
        data: { priority: index },
      })
    )
  )
  revalidatePath(`/dashboard/profiles/${profileId}`)
}
