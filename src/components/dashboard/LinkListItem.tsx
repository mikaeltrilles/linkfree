"use client"

import { useState } from "react"
import { Pencil, Trash2, Pin, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormError } from "./FormError"
import { updateLink } from "@/lib/actions/links"
import { cn } from "@/lib/utils"

export type EditableLink = {
  id: string
  title: string
  url: string
  description: string | null
  thumbnail: string | null
  isPinned: boolean
  status: string
  priority: number
  sectionId: string | null
}

export type SectionOption = { id: string; title: string }

export function LinkFormFields({
  idPrefix,
  sections,
  link,
}: {
  idPrefix: string
  sections: SectionOption[]
  link?: EditableLink
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Titre</Label>
        <Input id={`${idPrefix}-title`} name="title" defaultValue={link?.title} placeholder="Mon Portfolio" required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-url`}>URL</Label>
        <Input id={`${idPrefix}-url`} name="url" defaultValue={link?.url} placeholder="https://…" required />
        <p className="text-xs text-muted-foreground">
          Astuce : <code>#contact-form</code> affiche un formulaire de contact à la place du bouton.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description (optionnelle)</Label>
        <Input id={`${idPrefix}-description`} name="description" defaultValue={link?.description ?? ""} placeholder="Courte description…" maxLength={500} />
      </div>
      {sections.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-section`}>Section</Label>
          <SelectNative id={`${idPrefix}-section`} name="sectionId" defaultValue={link?.sectionId ?? ""}>
            <option value="">Sans section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </SelectNative>
        </div>
      )}
    </>
  )
}

interface LinkListItemProps {
  link: EditableLink
  sections: SectionOption[]
  onSaved: () => void
  onToggle: () => void
  onDelete: () => void
}

export function LinkListItem({ link, sections, onSaved, onToggle, onDelete }: LinkListItemProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const disabled = link.status !== "ACTIVE"

  return (
    <>
      <div className={cn("min-w-0 flex-1", disabled && "opacity-50")}>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{link.title}</span>
          {link.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-label="Épinglé" />}
          {disabled && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">Masqué</span>}
        </div>
        <p className="truncate text-xs text-muted-foreground">{link.url}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle} title={disabled ? "Afficher" : "Masquer"}>
          {disabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)} title="Éditer">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="Supprimer">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le lien</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              const result = await updateLink(formData)
              if (!result.ok) return setError(result.error)
              setOpen(false)
              onSaved()
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={link.id} />
            <LinkFormFields idPrefix={link.id} sections={sections} link={link} />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`pinned-${link.id}`}
                name="isPinned"
                value="true"
                defaultChecked={link.isPinned}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor={`pinned-${link.id}`}>Épingler ce lien (mis en avant en haut de page)</Label>
            </div>
            <FormError message={error} />
            <Button type="submit" className="w-full">Enregistrer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
