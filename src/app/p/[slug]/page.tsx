import { notFound } from "next/navigation"
import { ProfileShell } from "@/components/public/ProfileShell"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linkfree.tmktools.com"
  const res = await fetch(`${baseUrl}/api/profiles/${params.slug}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    return { title: "Page introuvable — Linkfree" }
  }
  const profile = await res.json()

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linkfree.tmktools.com"
  const res = await fetch(`${baseUrl}/api/profiles/${params.slug}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    notFound()
  }

  const profile = await res.json()

  return <ProfileShell profile={profile} />
}
