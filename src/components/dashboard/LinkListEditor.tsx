"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { LinkListItem } from "./LinkListItem"
import { reorderLinks, deleteLink } from "@/lib/actions/links"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface LinkListEditorProps {
  profileId: string
  initialLinks: Array<{
    id: string
    title: string
    url: string
    description: string | null
    thumbnail: string | null
    isPinned: boolean
    status: string
    priority: number
  }>
}

export function LinkListEditor({ profileId, initialLinks }: LinkListEditorProps) {
  const [links, setLinks] = useState(initialLinks)
  const [open, setOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        reorderLinks(
          profileId,
          newItems.map((i) => i.id)
        )
        return newItems
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Vos liens</h2>
        <Dialog open={open} onOpenChange={setOpen}>
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
                const { createLink } = await import("@/lib/actions/links")
                await createLink(formData)
                setOpen(false)
              }}
              className="space-y-4"
            >
              <input type="hidden" name="profileId" value={profileId} />
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Mon Portfolio" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input id="description" name="description" placeholder="Courte description..." />
              </div>
              <Button type="submit" className="w-full">
                Créer le lien
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {links.map((link) => (
              <LinkListItem
                key={link.id}
                link={link}
                onDelete={async () => {
                  const fd = new FormData()
                  fd.append("id", link.id)
                  await deleteLink(fd)
                  setLinks((prev) => prev.filter((l) => l.id !== link.id))
                }}
              />
            ))}
            {links.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun lien pour le moment.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
