import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkListItem } from "@/components/dashboard/LinkListItem"
import { ArrowLeft, Plus, Settings, BarChart3, Eye } from "lucide-react"

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
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {["Apparence", "Liens", "Sections", "CTA"].map((tab) => (
          <Button
            key={tab}
            variant={tab === "Liens" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vos liens</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profile.links.map((link) => (
              <LinkListItem key={link.id} link={link} />
            ))}
            {profile.links.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun lien pour le moment.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
