"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/session"
import { assertProfileOwner } from "@/lib/profile-access"
import { fail, type ActionResult } from "./types"

async function assertLeadOwner(id: string, userId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id, profile: { userId } },
    select: { id: true, profileId: true },
  })
  if (!lead) throw new Error("Message introuvable ou accès refusé")
  return lead
}

function revalidateMessages(profileId: string) {
  revalidatePath("/dashboard/messages")
  revalidatePath("/dashboard", "layout")
  revalidatePath(`/dashboard/profiles/${profileId}`)
}

export async function markLeadRead(id: string, read = true): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const lead = await assertLeadOwner(id, userId)
    await prisma.lead.update({ where: { id }, data: { readAt: read ? new Date() : null } })
    revalidateMessages(lead.profileId)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}

export async function markAllLeadsRead(profileId?: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    if (profileId) await assertProfileOwner(profileId, userId)
    await prisma.lead.updateMany({
      where: { readAt: null, profile: { userId, ...(profileId ? { id: profileId } : {}) } },
      data: { readAt: new Date() },
    })
    revalidateMessages(profileId ?? "")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const lead = await assertLeadOwner(id, userId)
    await prisma.lead.delete({ where: { id } })
    revalidateMessages(lead.profileId)
    return { ok: true, id }
  } catch (e) {
    return fail(e)
  }
}
