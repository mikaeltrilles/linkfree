"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner } from "@/lib/profile-access"
import { fail, str, type ActionResult } from "./types"

const createSchema = z.object({
  profileId: z.string().min(1),
  linkId: z.string().optional(),
  name: z.string().trim().min(1),
})

async function assertTestOwner(id: string, userId: string) {
  const test = await prisma.aBTest.findFirst({
    where: { id, profile: { userId } },
    select: { id: true, profileId: true },
  })
  if (!test) throw new Error("Test introuvable ou accès refusé")
  return test
}

export async function createABTest(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const data = createSchema.parse({
      profileId: str(formData, "profileId"),
      linkId: str(formData, "linkId") || undefined,
      name: str(formData, "name"),
    })
    await assertProfileOwner(data.profileId, userId)

    const test = await prisma.aBTest.create({
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
    return { ok: true, id: test.id }
  } catch (e) {
    return fail(e)
  }
}

export async function updateABTestVariant(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const variant = await prisma.aBTestVariant.findFirst({
      where: { id, abTest: { profile: { userId } } },
      select: { id: true, abTestId: true },
    })
    if (!variant) return { ok: false, error: "Variante introuvable" }

    const weight = Math.min(100, Math.max(0, Number(formData.get("weight")) || 0))
    await prisma.aBTestVariant.update({
      where: { id },
      data: { title: str(formData, "title"), url: str(formData, "url") || null, weight },
    })

    const test = await assertTestOwner(variant.abTestId, userId)
    revalidatePath(`/dashboard/profiles/${test.profileId}/ab-tests`)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteABTest(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const id = str(formData, "id")
    const test = await assertTestOwner(id, userId)
    await prisma.aBTest.delete({ where: { id } })
    revalidatePath(`/dashboard/profiles/${test.profileId}/ab-tests`)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}
