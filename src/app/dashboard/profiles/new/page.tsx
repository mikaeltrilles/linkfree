import Link from "next/link"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/session"
import { createProfile } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormError } from "@/components/dashboard/FormError"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewProfilePage({ searchParams }: { searchParams: { error?: string } }) {
  await requireUser()

  async function create(formData: FormData) {
    "use server"
    const result = await createProfile(formData)
    if (!result.ok) {
      redirect(`/dashboard/profiles/new?error=${encodeURIComponent(result.error)}`)
    }
    redirect(`/dashboard/profiles/${result.id}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Nouveau profil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={create} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Adresse de la page</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input id="slug" name="slug" placeholder="mon-nom" required minLength={3} maxLength={40} pattern="[a-zA-Z0-9-]+" />
              </div>
              <p className="text-xs text-muted-foreground">Lettres, chiffres et tirets. Modifiable plus tard.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Nom affiché</Label>
              <Input id="title" name="title" placeholder="Alice Dupont" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Designer produit · Freelance" maxLength={300} rows={3} />
            </div>
            <FormError message={searchParams.error ?? null} />
            <Button type="submit" className="w-full">Créer le profil</Button>
            <p className="text-center text-xs text-muted-foreground">
              Le profil est créé en brouillon : publiez-le quand il est prêt.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
