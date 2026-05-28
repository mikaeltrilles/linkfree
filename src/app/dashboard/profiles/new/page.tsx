import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  const userId = session.user.id

  async function createProfile(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const bio = formData.get("bio") as string

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Slug invalide")
    }

    const existing = await prisma.profile.findUnique({ where: { slug } })
    if (existing) throw new Error("Ce slug est déjà pris")

    await prisma.profile.create({
      data: {
        userId,
        slug,
        title,
        bio,
        status: "DRAFT",
      },
    })

    redirect("/dashboard")
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
          <form action={createProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug public</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="alice-design"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Lettres minuscules, chiffres et tirets uniquement.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Nom affiché</Label>
              <Input id="title" name="title" placeholder="Alice Dupont" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" placeholder="Designer UX &amp; Product..." />
            </div>

            <Button type="submit" className="w-full">Créer le profil</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
