import { prisma } from "./prisma"

/**
 * Vérifie que le profil appartient bien à l'utilisateur.
 * Toutes les server actions du dashboard passent par ici afin qu'un
 * utilisateur ne puisse pas modifier les données d'un autre compte.
 */
export async function assertProfileOwner(profileId: string, userId: string) {
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId },
    select: { id: true, slug: true },
  })
  if (!profile) throw new Error("Profil introuvable ou accès refusé")
  return profile
}

export async function assertLinkOwner(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, profile: { userId } },
    select: { id: true, profileId: true, profile: { select: { slug: true } } },
  })
  if (!link) throw new Error("Lien introuvable ou accès refusé")
  return link
}

export async function assertSectionOwner(sectionId: string, userId: string) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, profile: { userId } },
    select: { id: true, profileId: true, profile: { select: { slug: true } } },
  })
  if (!section) throw new Error("Section introuvable ou accès refusé")
  return section
}

export async function assertSocialLinkOwner(id: string, userId: string) {
  const social = await prisma.socialLink.findFirst({
    where: { id, profile: { userId } },
    select: { id: true, profileId: true, profile: { select: { slug: true } } },
  })
  if (!social) throw new Error("Réseau introuvable ou accès refusé")
  return social
}

export async function assertProjectOwner(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, profile: { userId } },
    select: { id: true, profileId: true, profile: { select: { slug: true } } },
  })
  if (!project) throw new Error("Projet introuvable ou accès refusé")
  return project
}
