"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { useConfirm } from "./ConfirmDialog"

export function DeleteProfileButton({
  profileId,
  slug,
  action,
}: {
  profileId: string
  slug: string
  action: (formData: FormData) => Promise<void>
}) {
  const confirm = useConfirm()
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="profileId" value={profileId} />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={async () => {
          const ok = await confirm({
            title: "Supprimer définitivement ce profil ?",
            description: `La page /p/${slug}, ses liens, réseaux, projets, messages et statistiques seront effacés. Cette action est irréversible.`,
            confirmLabel: "Supprimer le profil",
            destructive: true,
          })
          if (ok) formRef.current?.requestSubmit()
        }}
      >
        Supprimer le profil
      </Button>
    </form>
  )
}
