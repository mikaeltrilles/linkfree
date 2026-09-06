import { prisma } from "./prisma"

/** Nombre de messages non lus sur l'ensemble des profils de l'utilisateur. */
export async function countUnreadLeads(userId: string, profileId?: string): Promise<number> {
  return prisma.lead.count({
    where: { readAt: null, profile: { userId, ...(profileId ? { id: profileId } : {}) } },
  })
}
