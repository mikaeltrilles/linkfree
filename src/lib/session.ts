import { auth } from "./auth"
import { redirect } from "next/navigation"

/** Retourne l'utilisateur connecté ou redirige vers la page de connexion. */
export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  return session.user
}

/** Variante pour les server actions : lève une erreur au lieu de rediriger. */
export async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Non authentifié")
  return session.user.id
}
