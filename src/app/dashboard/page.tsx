import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, ArrowUpRight, Plus } from "lucide-react"
import { formatNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireUser()
  const since7 = new Date(Date.now() - 7 * 86400000)

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { links: true, projects: true, socialLinks: true } },
    },
  })

  const stats = await Promise.all(
    profiles.map(async (profile) => {
      const [views, clicks] = await Promise.all([
        prisma.pageView.count({ where: { profileId: profile.id, createdAt: { gte: since7 } } }),
        prisma.linkEvent.count({ where: { profileId: profile.id, type: "CLICK", createdAt: { gte: since7 } } }),
      ])
      return { profileId: profile.id, views, clicks, ctr: views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0" }
    })
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/dashboard/profiles/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau profil
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">Vous n&apos;avez encore aucun profil.</p>
            <Link href="/dashboard/profiles/new" className="mt-4">
              <Button>Créer mon premier profil</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const s = stats.find((x) => x.profileId === profile.id)
            const published = profile.status === "PUBLISHED"
            return (
              <Card key={profile.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate text-base">{profile.title || profile.slug}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={published ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700" : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground"}>
                        {published ? "Publié" : "Brouillon"}
                      </span>
                      {published && (
                        <Link href={`/p/${profile.slug}`} target="_blank" title="Voir la page">
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    /p/{profile.slug} · {profile._count.links} liens · {profile._count.socialLinks} réseaux · {profile._count.projects} projets
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-xs">Vues 7j</span>
                      </div>
                      <p className="mt-1 text-lg font-bold">{formatNumber(s?.views || 0)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        <span className="text-xs">Clics 7j</span>
                      </div>
                      <p className="mt-1 text-lg font-bold">{formatNumber(s?.clicks || 0)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <span className="text-xs">CTR</span>
                      </div>
                      <p className="mt-1 text-lg font-bold">{s?.ctr}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/profiles/${profile.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">Éditer</Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${profile.id}/analytics`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">Stats</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
