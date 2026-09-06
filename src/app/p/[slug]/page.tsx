import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { ProfileShell } from "@/components/public/ProfileShell"
import { getPublicProfile } from "@/lib/public-profile"

export const dynamic = "force-dynamic"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://linkfree.tmktools.com"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await getPublicProfile(params.slug)
  if (!profile) return { title: "Page introuvable — Linkfree" }

  const title = profile.seoTitle || profile.title || `${profile.slug} — Linkfree`
  const description = profile.seoDescription || profile.bio || ""
  const image = profile.ogImage || profile.avatar || undefined

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/p/${profile.slug}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/p/${profile.slug}`,
      type: "profile",
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
    icons: profile.favicon ? { icon: profile.favicon } : undefined,
  }
}

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getPublicProfile(params.slug)
  if (!profile) notFound()

  // Mode urgence : la page est remplacée par une redirection immédiate.
  if (profile.isEmergency && profile.emergencyUrl) {
    redirect(profile.emergencyUrl)
  }

  return <ProfileShell profile={profile} />
}
