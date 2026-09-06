import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { auth, signIn, isGoogleAuthEnabled } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2 } from "lucide-react"

export const dynamic = "force-dynamic"

const ERRORS: Record<string, string> = {
  CredentialsSignin: "Email ou mot de passe incorrect.",
  credentials: "Email ou mot de passe incorrect.",
  OAuthAccountNotLinked: "Cet email est déjà associé à un autre mode de connexion.",
  registered: "",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string; registered?: string }
}) {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  const allowRegistration = process.env.ALLOW_REGISTRATION !== "false"
  const callbackUrl = searchParams.callbackUrl?.startsWith("/") ? searchParams.callbackUrl : "/dashboard"
  const errorMessage = searchParams.error ? ERRORS[searchParams.error] ?? "Connexion impossible. Réessayez." : null

  async function signInWithCredentials(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? "").toLowerCase(),
        password: String(formData.get("password") ?? ""),
        redirectTo: callbackUrl,
      })
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/auth/signin?error=${encodeURIComponent(error.type)}`)
      }
      // NEXT_REDIRECT : la connexion a réussi, on laisse Next rediriger.
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Link2 className="h-6 w-6" />
          </Link>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre dashboard Linkfree</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.registered && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Compte créé. Vous pouvez vous connecter.
            </p>
          )}
          {errorMessage && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <form action={signInWithCredentials} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Se connecter</Button>
          </form>

          {isGoogleAuthEnabled && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signIn("google", { redirectTo: callbackUrl })
                }}
              >
                <Button type="submit" variant="outline" className="w-full gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </Button>
              </form>
            </>
          )}

          {allowRegistration && (
            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="font-medium text-brand-600 hover:underline">
                S&apos;inscrire
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
