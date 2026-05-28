import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, ArrowUpRight, Plus } from "lucide-react"
import { formatNumber } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const stats = await Promise.all(
    profiles.map(async (profile) => {
      const views = await prisma.pageView.count({
        where: { profileId: profile.id, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      })
      const clicks = await prisma.linkEvent.count({
        where: { profileId: profile.id, type: "CLICK", createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      })
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
            <p className="text-muted-foreground">Vous n'avez encore aucun profil.</p>
            <Link href="/dashboard/profiles/new" className="mt-4">
              <Button>Créer mon premier profil</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const s = stats.find((x) => x.profileId === profile.id)
              return (
                <Card key={profile.id} className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{profile.title || profile.slug}</CardTitle>
                      <Link href={`/p/${profile.slug}`} target="_blank">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">/p/{profile.slug}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-xs">Vues</span>
                        </div>
                        <p className="mt-1 text-lg font-bold">{formatNumber(s?.views || 0)}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <MousePointerClick className="h-3.5 w-3.5" />
                          <span className="text-xs">Clics</span>
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
        </>
      )}
    </div>
  )
}
