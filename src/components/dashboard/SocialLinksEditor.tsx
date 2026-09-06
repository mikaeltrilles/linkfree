"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SocialIcon } from "@/components/public/SocialIcon"
import { SortableList } from "./SortableList"
import { FormError } from "./FormError"
import { useEditorList } from "./useEditorList"
import { SOCIAL_PLATFORMS, detectPlatform, getPlatform } from "@/lib/social-platforms"
import {
  createSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
  toggleSocialLinkVisibility,
  updateSocialLink,
} from "@/lib/actions/social-links"
import { cn } from "@/lib/utils"

export type EditableSocial = {
  id: string
  platform: string
  url: string
  label: string | null
  isVisible: boolean
  priority: number
}

function SocialFormFields({ idPrefix, social }: { idPrefix: string; social?: EditableSocial }) {
  const [platform, setPlatform] = useState(social?.platform ?? "website")
  const [url, setUrl] = useState(social?.url ?? "")
  const current = getPlatform(platform)

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-url`}>URL du profil</Label>
        <Input
          id={`${idPrefix}-url`}
          name="url"
          value={url}
          placeholder={current.placeholder}
          required
          onChange={(e) => {
            const value = e.target.value
            setUrl(value)
            // Détection automatique de la plateforme quand on colle un lien.
            if (!social) setPlatform(detectPlatform(value))
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-platform`}>Plateforme</Label>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <SocialIcon platform={platform} className="h-5 w-5" />
          </span>
          <SelectNative id={`${idPrefix}-platform`} name="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </SelectNative>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-label`}>Libellé (optionnel)</Label>
        <Input id={`${idPrefix}-label`} name="label" defaultValue={social?.label ?? ""} placeholder={current.label} maxLength={60} />
      </div>
    </>
  )
}

export function SocialLinksEditor({ profileId, initialSocials }: { profileId: string; initialSocials: EditableSocial[] }) {
  const { items, setItems, error, run } = useEditorList(initialSocials)
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditableSocial | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Réseaux sociaux</h2>
          <p className="text-xs text-muted-foreground">Icônes affichées sous votre bio.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setCreateError(null) }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un réseau</DialogTitle>
            </DialogHeader>
            <form
              key={open ? "open" : "closed"}
              action={async (formData) => {
                const result = await createSocialLink(formData)
                if (!result.ok) return setCreateError(result.error)
                await run(async () => result, () => setOpen(false))
              }}
              className="space-y-4"
            >
              <input type="hidden" name="profileId" value={profileId} />
              <SocialFormFields idPrefix="new-social" />
              <FormError message={createError} />
              <Button type="submit" className="w-full">Ajouter</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FormError message={error} />

      <SortableList
        items={items}
        emptyMessage="Aucun réseau social. Ajoutez GitHub, LinkedIn, Instagram…"
        onReorder={(next) => {
          setItems(next)
          run(() => reorderSocialLinks(profileId, next.map((i) => i.id)))
        }}
        renderItem={(social) => (
          <>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted/40", !social.isVisible && "opacity-40")}>
              <SocialIcon platform={social.platform} className="h-4 w-4" />
            </span>
            <div className={cn("min-w-0 flex-1", !social.isVisible && "opacity-50")}>
              <p className="truncate text-sm font-medium">{social.label || getPlatform(social.platform).label}</p>
              <p className="truncate text-xs text-muted-foreground">{social.url}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title={social.isVisible ? "Masquer" : "Afficher"} onClick={() => run(() => toggleSocialLinkVisibility(social.id))}>
                {social.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Éditer" onClick={() => { setEditing(social); setEditError(null) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title="Supprimer"
                onClick={() => {
                  if (!confirm("Supprimer ce réseau ?")) return
                  run(() => deleteSocialLink(social.id), () => setItems((prev) => prev.filter((s) => s.id !== social.id)))
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le réseau</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              key={editing.id}
              action={async (formData) => {
                const result = await updateSocialLink(formData)
                if (!result.ok) return setEditError(result.error)
                await run(async () => result, () => setEditing(null))
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editing.id} />
              <input type="hidden" name="isVisible" value={editing.isVisible ? "true" : "false"} />
              <SocialFormFields idPrefix={editing.id} social={editing} />
              <FormError message={editError} />
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
