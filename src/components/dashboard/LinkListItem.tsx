"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { updateLink } from "@/lib/actions/links"

interface LinkListItemProps {
  link: {
    id: string
    title: string
    url: string
    description: string | null
    thumbnail: string | null
    isPinned: boolean
    status: string
    priority: number
  }
  onDelete: () => void
}

export function LinkListItem({ link, onDelete }: LinkListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition",
          isDragging && "opacity-80 shadow-lg ring-2 ring-brand-300"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{link.title}</span>
            {link.isPinned && (
              <Pin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{link.url}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le lien</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              await updateLink(formData)
              setOpen(false)
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={link.id} />
            <div className="space-y-2">
              <Label htmlFor={`title-${link.id}`}>Titre</Label>
              <Input
                id={`title-${link.id}`}
                name="title"
                defaultValue={link.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`url-${link.id}`}>URL</Label>
              <Input
                id={`url-${link.id}`}
                name="url"
                type="url"
                defaultValue={link.url}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`desc-${link.id}`}>Description</Label>
              <Input
                id={`desc-${link.id}`}
                name="description"
                defaultValue={link.description || ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`pinned-${link.id}`}
                name="isPinned"
                value="true"
                defaultChecked={link.isPinned}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor={`pinned-${link.id}`}>Épingler ce lien</Label>
            </div>
            <Button type="submit" className="w-full">
              Enregistrer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
