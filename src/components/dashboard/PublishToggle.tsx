"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { setProfileStatus } from "@/lib/actions/profile"

export function PublishToggle({ profileId, published }: { profileId: string; published: boolean }) {
  const router = useRouter()
  const [checked, setChecked] = useState(published)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`publish-${profileId}`}
        checked={checked}
        disabled={pending}
        onCheckedChange={(next) => {
          setChecked(next)
          startTransition(async () => {
            const result = await setProfileStatus(profileId, next)
            if (!result.ok) {
              setChecked(!next)
              alert(result.error)
              return
            }
            router.refresh()
          })
        }}
      />
      <Label htmlFor={`publish-${profileId}`} className="text-sm">
        {checked ? <span className="font-medium text-emerald-600">Publié</span> : <span className="text-muted-foreground">Brouillon</span>}
      </Label>
    </div>
  )
}
