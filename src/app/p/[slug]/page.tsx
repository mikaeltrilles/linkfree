import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProfileShell } from "@/components/public/ProfileShell"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
  })

  if (!profile || profile.status !== "PUBLISHED") {
    return { title: "Page introuvable — Linkfree" }
  }

  return {
    title: profile.seoTitle || profile.title || `${profile.slug} — Linkfree`,
    description: profile.seoDescription || profile.bio || "",
    openGraph: {
      images: profile.ogImage ? [profile.ogImage] : undefined,
    },
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: {
      links: {
        where: { status: "ACTIVE" },
        orderBy: [{ isPinned: "desc" }, { priority: "asc" }],
      },
      sections: {
        orderBy: { priority: "asc" },
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!profile || profile.status !== "PUBLISHED") {
    notFound()
  }

  // Log page view (fire-and-forget, ne bloque pas le rendu)
  try {
    await prisma.pageView.create({
      data: {
        profileId: profile.id,
        // En production : passer ipHash, userAgent, referrer depuis headers()
      },
    })
  } catch {
    // Silencieux
  }

  return <ProfileShell profile={profile as any} />
}
