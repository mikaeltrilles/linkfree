import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { deleteProfile, updateProfileSettings } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FormError } from "@/components/dashboard/FormError"
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfileSettingsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { error?: string; saved?: string }
}) {
  const user = await requireUser()

  const profile = await prisma.profile.findFirst({
    where: { id: params.id, userId: user.id },
    include: { _count: { select: { leads: true } } },
  })
  if (!profile) notFound()

  let primaryColor = "#111111"
  try {
    primaryColor = JSON.parse(profile.appearance ?? "{}")?.colors?.primary ?? primaryColor
  } catch {
    // apparence invalide : couleur par défaut
  }

  async function save(formData: FormData) {
    "use server"
    const result = await updateProfileSettings(formData)
    const base = `/dashboard/profiles/${params.id}/settings`
    if (!result.ok) redirect(`${base}?error=${encodeURIComponent(result.error)}`)
    redirect(`${base}?saved=1`)
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

      {searchParams.saved && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Modifications enregistrées.
        </p>
      )}
      <FormError message={searchParams.error ?? null} />

      <form action={save} className="space-y-6">
        <input type="hidden" name="profileId" value={profile.id} />

        <Card>
          <CardHeader>
            <CardTitle>Publication</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublished">Page publique visible</Label>
              <p className="text-xs text-muted-foreground">Désactivé, la page /p/{profile.slug} renvoie une erreur 404.</p>
            </div>
            <Switch id="isPublished" name="isPublished" defaultChecked={profile.status === "PUBLISHED"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Adresse de la page</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input id="slug" name="slug" defaultValue={profile.slug} required minLength={3} maxLength={40} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Nom affiché</Label>
              <Input id="title" name="title" defaultValue={profile.title || ""} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={profile.bio || ""} maxLength={300} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar (URL d&apos;image)</Label>
              <Input id="avatar" name="avatar" type="url" defaultValue={profile.avatar || ""} placeholder="https://…/photo.jpg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex items-center gap-3">
                <input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue={primaryColor}
                  className="h-10 w-14 cursor-pointer rounded-lg border bg-background p-1"
                />
                <p className="text-xs text-muted-foreground">Utilisée pour les liens épinglés, les icônes et les accents.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO &amp; partage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Titre SEO</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={profile.seoTitle || ""} placeholder="Titre affiché sur Google et les réseaux" maxLength={70} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Description SEO</Label>
              <Input id="seoDescription" name="seoDescription" defaultValue={profile.seoDescription || ""} placeholder="Description affichée sur Google" maxLength={160} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Mode urgence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isEmergency">Activer la redirection d&apos;urgence</Label>
                <p className="text-xs text-muted-foreground">Remplace instantanément la page par une redirection vers un lien unique.</p>
              </div>
              <Switch id="isEmergency" name="isEmergency" defaultChecked={profile.isEmergency} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyUrl">URL d&apos;urgence</Label>
              <Input id="emergencyUrl" name="emergencyUrl" defaultValue={profile.emergencyUrl || ""} type="url" placeholder="https://…" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">Enregistrer les modifications</Button>
      </form>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Supprime définitivement le profil, ses liens, projets, statistiques et {profile._count.leads} contact(s).
          </p>
          <form action={deleteProfile}>
            <input type="hidden" name="profileId" value={profile.id} />
            <Button type="submit" variant="destructive" size="sm">Supprimer le profil</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
