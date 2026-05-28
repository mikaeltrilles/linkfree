"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createSchema = z.object({
  profileId: z.string().cuid(),
  linkId: z.string().cuid().optional(),
  name: z.string().min(1),
})

export async function createABTest(formData: FormData) {
  const data = createSchema.parse({
    profileId: formData.get("profileId"),
    linkId: formData.get("linkId") || undefined,
    name: formData.get("name"),
  })

  await prisma.aBTest.create({
    data: {
      ...data,
      variants: {
        create: [
          { title: "Variante A", weight: 50 },
          { title: "Variante B", weight: 50 },
        ],
      },
    },
  })

  revalidatePath(`/dashboard/profiles/${data.profileId}/ab-tests`)
}

export async function updateABTestVariant(formData: FormData) {
  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const weight = Number(formData.get("weight"))

  const variant = await prisma.aBTestVariant.update({
    where: { id },
    data: { title, url, weight },
  })

  const test = await prisma.aBTest.findUnique({
    where: { id: variant.abTestId },
  })
  if (test) revalidatePath(`/dashboard/profiles/${test.profileId}/ab-tests`)
}

export async function deleteABTest(formData: FormData) {
  const id = formData.get("id") as string
  const test = await prisma.aBTest.delete({ where: { id } })
  revalidatePath(`/dashboard/profiles/${test.profileId}/ab-tests`)
}
