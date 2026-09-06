import { prisma } from "./prisma"

/**
 * Charge un profil publié avec tout ce que la page publique affiche.
 * Utilisé directement par la page /p/[slug] (pas de self-fetch HTTP) et par
 * l'API /api/profiles/[slug].
 */
export async function getPublicProfile(slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: {
      links: {
        where: { status: "ACTIVE" },
        orderBy: [{ isPinned: "desc" }, { priority: "asc" }],
      },
      socialLinks: {
        where: { isVisible: true },
        orderBy: { priority: "asc" },
      },
      projects: {
        where: { isVisible: true },
        orderBy: [{ isFeatured: "desc" }, { priority: "asc" }],
      },
      sections: { orderBy: { priority: "asc" } },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!profile || profile.status !== "PUBLISHED") return null

  const now = new Date()
  const links = profile.links.filter((l) => {
    if (l.startsAt && l.startsAt > now) return false
    if (l.endsAt && l.endsAt < now) return false
    return true
  })

  let appearance: Record<string, unknown> | null = null
  try {
    appearance = profile.appearance ? JSON.parse(profile.appearance) : null
  } catch {
    appearance = null
  }

  return {
    ...profile,
    links,
    appearance,
    products: profile.products.map((p) => ({ ...p, price: Number(p.price) })),
  }
}

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>
