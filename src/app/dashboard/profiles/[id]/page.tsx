import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LinkListEditor } from "@/components/dashboard/LinkListEditor"
import { SocialLinksEditor } from "@/components/dashboard/SocialLinksEditor"
import { ProjectsEditor } from "@/components/dashboard/ProjectsEditor"
import { SectionsEditor } from "@/components/dashboard/SectionsEditor"
import { PublishToggle } from "@/components/dashboard/PublishToggle"
import { ArrowLeft, Settings, BarChart3, Eye, QrCode } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfileEditPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      links: { orderBy: [{ isPinned: "desc" }, { priority: "asc" }] },
      socialLinks: { orderBy: { priority: "asc" } },
      projects: { orderBy: [{ isFeatured: "desc" }, { priority: "asc" }] },
      sections: { orderBy: { priority: "asc" } },
    },
  })

  if (!profile) notFound()
  const published = profile.status === "PUBLISHED"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{profile.title || profile.slug}</h1>
            <p className="text-xs text-muted-foreground">/p/{profile.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PublishToggle profileId={profile.id} published={published} />
          <Link href={`/p/${profile.slug}`} target="_blank" aria-disabled={!published}>
            <Button variant="outline" size="sm" disabled={!published} title={published ? "Voir la page publique" : "Publiez le profil pour voir la page"}>
              <Eye className="mr-2 h-4 w-4" />Aperçu
            </Button>
          </Link>
          <Link href={`/p/${profile.slug}/qr`} target="_blank">
            <Button variant="ghost" size="sm" disabled={!published}>
              <QrCode className="mr-2 h-4 w-4" />QR
            </Button>
          </Link>
          <Link href={`/dashboard/profiles/${profile.id}/analytics`}>
            <Button variant="ghost" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />Stats
            </Button>
          </Link>
          <Link href={`/dashboard/profiles/${profile.id}/settings`}>
            <Button variant="ghost" size="sm">
              <Settings className="mr-2 h-4 w-4" />Paramètres
            </Button>
          </Link>
        </div>
      </div>

      {!published && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ce profil est en brouillon : la page /p/{profile.slug} n&apos;est pas visible. Activez « Publié » quand vous êtes prêt.
        </p>
      )}

      <Card>
        <CardContent className="pt-6">
          <SocialLinksEditor profileId={profile.id} initialSocials={profile.socialLinks} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <LinkListEditor
            profileId={profile.id}
            initialLinks={profile.links}
            sections={profile.sections.map((s) => ({ id: s.id, title: s.title }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProjectsEditor profileId={profile.id} initialProjects={profile.projects} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionsEditor profileId={profile.id} initialSections={profile.sections} />
        </CardContent>
      </Card>
    </div>
  )
}
