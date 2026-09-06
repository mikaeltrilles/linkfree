import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, MousePointerClick, TrendingUp, FolderKanban, Mail } from "lucide-react"
import { formatNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      links: { orderBy: { clickCount: "desc" } },
      projects: { orderBy: { clickCount: "desc" } },
      leads: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })
  if (!profile) notFound()

  const since7 = new Date(Date.now() - 7 * 86400000)
  const since30 = new Date(Date.now() - 30 * 86400000)

  const [views7, views30, clicks7, clicks30, devices] = await Promise.all([
    prisma.pageView.count({ where: { profileId: profile.id, createdAt: { gte: since7 } } }),
    prisma.pageView.count({ where: { profileId: profile.id, createdAt: { gte: since30 } } }),
    prisma.linkEvent.count({ where: { profileId: profile.id, type: "CLICK", createdAt: { gte: since7 } } }),
    prisma.linkEvent.count({ where: { profileId: profile.id, type: "CLICK", createdAt: { gte: since30 } } }),
    prisma.pageView.groupBy({
      by: ["device"],
      where: { profileId: profile.id, createdAt: { gte: since30 } },
      _count: { _all: true },
    }),
  ])

  const ctr7 = views7 > 0 ? ((clicks7 / views7) * 100).toFixed(1) : "0.0"
  const ctr30 = views30 > 0 ? ((clicks30 / views30) * 100).toFixed(1) : "0.0"
  const projectClicks = profile.projects.reduce((sum, p) => sum + p.clickCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/profiles/${profile.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Statistiques</h1>
          <p className="text-xs text-muted-foreground">{profile.title || profile.slug}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vues (7j)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(views7)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(views30)} sur 30j</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clics liens (7j)</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(clicks7)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(clicks30)} sur 30j</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CTR (7j)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr7}%</div>
            <p className="text-xs text-muted-foreground">{ctr30}% sur 30j</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clics projets</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(projectClicks)}</div>
            <p className="text-xs text-muted-foreground">depuis le début</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top liens cliqués</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.links.slice(0, 10).map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{link.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(link.clickCount)}</p>
                    <p className="text-xs text-muted-foreground">clics</p>
                  </div>
                </div>
              ))}
              {profile.links.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucun lien pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top projets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.projects.slice(0, 10).map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{project.url || project.repoUrl}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(project.clickCount)}</p>
                    <p className="text-xs text-muted-foreground">clics</p>
                  </div>
                </div>
              ))}
              {profile.projects.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucun projet pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appareils (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Pas encore de visite.</p>
            ) : (
              <ul className="space-y-2">
                {devices.map((d) => {
                  const count = d._count._all
                  const pct = views30 > 0 ? Math.round((count / views30) * 100) : 0
                  return (
                    <li key={d.device ?? "inconnu"} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{d.device ?? "inconnu"}</span>
                        <span className="text-muted-foreground">{formatNumber(count)} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Derniers contacts ({profile.leads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.leads.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucun message. Ajoutez un lien avec l&apos;URL <code>#contact-form</code> pour afficher le formulaire.
              </p>
            ) : (
              <ul className="divide-y">
                {profile.leads.map((lead) => (
                  <li key={lead.id} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{lead.name || lead.email}</p>
                      <time className="shrink-0 text-xs text-muted-foreground">{lead.createdAt.toLocaleDateString("fr-FR")}</time>
                    </div>
                    <a href={`mailto:${lead.email}`} className="text-xs text-brand-600 hover:underline">{lead.email}</a>
                    {lead.message && <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{lead.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
