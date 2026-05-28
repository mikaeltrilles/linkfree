import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, MousePointerClick, TrendingUp } from "lucide-react"
import { formatNumber } from "@/lib/utils"

export default async function AnalyticsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      links: { orderBy: { clickCount: "desc" } },
    },
  })

  if (!profile) notFound()

  const since7 = new Date(Date.now() - 7 * 86400000)
  const since30 = new Date(Date.now() - 30 * 86400000)

  const views7 = await prisma.pageView.count({
    where: { profileId: profile.id, createdAt: { gte: since7 } },
  })
  const views30 = await prisma.pageView.count({
    where: { profileId: profile.id, createdAt: { gte: since30 } },
  })
  const clicks7 = await prisma.linkEvent.count({
    where: { profileId: profile.id, type: "CLICK", createdAt: { gte: since7 } },
  })
  const clicks30 = await prisma.linkEvent.count({
    where: { profileId: profile.id, type: "CLICK", createdAt: { gte: since30 } },
  })

  const ctr7 = views7 > 0 ? ((clicks7 / views7) * 100).toFixed(1) : "0.0"
  const ctr30 = views30 > 0 ? ((clicks30 / views30) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/profiles/${profile.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-xs text-muted-foreground">{profile.title || profile.slug}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Clics (7j)</CardTitle>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top liens cliqués</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.links.slice(0, 10).map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{link.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNumber(link.clickCount)}</p>
                  <p className="text-xs text-muted-foreground">clics</p>
                </div>
              </div>
            ))}
            {profile.links.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun lien pour le moment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
