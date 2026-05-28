import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default async function ProfileSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: session.user.id },
  })

  if (!profile) notFound()

  async function updateSettings(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const bio = formData.get("bio") as string
    const seoTitle = formData.get("seoTitle") as string
    const seoDescription = formData.get("seoDescription") as string
    const isEmergency = formData.get("isEmergency") === "on"
    const emergencyUrl = formData.get("emergencyUrl") as string

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        bio,
        seoTitle,
        seoDescription,
        isEmergency,
        emergencyUrl: isEmergency ? emergencyUrl : null,
      },
    })

    redirect(`/dashboard/profiles/${params.id}/settings`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/profiles/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Paramètres du profil</h1>
      </div>

      <form action={updateSettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug public</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input id="slug" name="slug" defaultValue={profile.slug} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Nom affiché</Label>
              <Input id="title" name="title" defaultValue={profile.title || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" defaultValue={profile.bio || ""} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Réseaux sociaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Titre SEO</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={profile.seoTitle || ""} placeholder="Titre affiché sur Google" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Description SEO</Label>
              <Input id="seoDescription" name="seoDescription" defaultValue={profile.seoDescription || ""} placeholder="Description affichée sur Google" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Emergency Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isEmergency">Activer la redirection d'urgence</Label>
                <p className="text-xs text-muted-foreground">Remplace instantanément la page par un lien unique.</p>
              </div>
              <Switch id="isEmergency" name="isEmergency" defaultChecked={profile.isEmergency} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyUrl">URL d'urgence</Label>
              <Input id="emergencyUrl" name="emergencyUrl" defaultValue={profile.emergencyUrl || ""} type="url" placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">Enregistrer les modifications</Button>
      </form>
    </div>
  )
}
