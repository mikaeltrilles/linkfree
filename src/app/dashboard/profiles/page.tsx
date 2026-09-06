import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowUpRight, Settings, BarChart3, Pencil } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilesPage() {
  const user = await requireUser()
  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { links: true, projects: true, socialLinks: true, leads: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes profils</h1>
        <Link href="/dashboard/profiles/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau profil
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Aucun profil pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => {
            const published = p.status === "PUBLISHED"
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{p.title || p.slug}</p>
                      <span className={published ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700" : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground"}>
                        {published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /p/{p.slug} · {p._count.links} liens · {p._count.socialLinks} réseaux · {p._count.projects} projets · {p._count.leads} contacts
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Link href={`/dashboard/profiles/${p.id}`}>
                      <Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" />Éditer</Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${p.id}/analytics`}>
                      <Button variant="ghost" size="sm"><BarChart3 className="mr-2 h-4 w-4" />Stats</Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${p.id}/settings`}>
                      <Button variant="ghost" size="sm"><Settings className="mr-2 h-4 w-4" />Paramètres</Button>
                    </Link>
                    {published && (
                      <Link href={`/p/${p.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Voir la page"><ArrowUpRight className="h-4 w-4" /></Button>
                      </Link>
                    )}
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
