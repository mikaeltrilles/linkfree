import { revalidatePath } from "next/cache"

/** Invalide le dashboard du profil et sa page publique. */
export function revalidateProfile(profileId: string, slug?: string | null) {
  revalidatePath(`/dashboard/profiles/${profileId}`, "layout")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profiles")
  if (slug) {
    revalidatePath(`/p/${slug}`)
    revalidatePath(`/p/${slug}/qr`)
  }
}
