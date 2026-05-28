import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkListEditor } from "@/components/dashboard/LinkListEditor"
import { ArrowLeft, Settings, BarChart3, Eye } from "lucide-react"

export default async function ProfileEditPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      links: { orderBy: [{ isPinned: "desc" }, { priority: "asc" }] },
      sections: { orderBy: { priority: "asc" } },
    },
  })

  if (!profile) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <Link href={`/p/${profile.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />Aperçu
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

      <Card>
        <CardContent className="pt-6">
          <LinkListEditor profileId={profile.id} initialLinks={profile.links} />
        </CardContent>
      </Card>
    </div>
  )
}
