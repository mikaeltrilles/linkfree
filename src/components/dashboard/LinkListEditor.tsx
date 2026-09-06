"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SortableList } from "./SortableList"
import { LinkListItem, LinkFormFields, type EditableLink, type SectionOption } from "./LinkListItem"
import { FormError } from "./FormError"
import { useEditorList } from "./useEditorList"
import { createLink, deleteLink, reorderLinks, toggleLinkStatus } from "@/lib/actions/links"

interface LinkListEditorProps {
  profileId: string
  initialLinks: EditableLink[]
  sections: SectionOption[]
}

export function LinkListEditor({ profileId, initialLinks, sections }: LinkListEditorProps) {
  const { items, setItems, error, run } = useEditorList(initialLinks)
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Liens</h2>
          <p className="text-xs text-muted-foreground">Boutons affichés sur votre page, dans l&apos;ordre ci-dessous.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setCreateError(null) }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un lien</DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                const result = await createLink(formData)
                if (!result.ok) return setCreateError(result.error)
                setCreateError(null)
                await run(async () => result, () => setOpen(false))
              }}
              className="space-y-4"
            >
              <input type="hidden" name="profileId" value={profileId} />
              <LinkFormFields idPrefix="new" sections={sections} />
              <FormError message={createError} />
              <Button type="submit" className="w-full">Créer le lien</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FormError message={error} />

      <SortableList
        items={items}
        emptyMessage="Aucun lien pour le moment. Ajoutez votre premier lien."
        onReorder={(next) => {
          setItems(next)
          run(() => reorderLinks(profileId, next.map((i) => i.id)))
        }}
        renderItem={(link) => (
          <LinkListItem
            link={link}
            sections={sections}
            onSaved={() => run(async () => ({ ok: true }))}
            onToggle={() => run(() => toggleLinkStatus(link.id))}
            onDelete={() => {
              if (!confirm(`Supprimer le lien « ${link.title} » ?`)) return
              run(() => deleteLink(link.id), () => setItems((prev) => prev.filter((l) => l.id !== link.id)))
            }}
          />
        )}
      />
    </div>
  )
}
