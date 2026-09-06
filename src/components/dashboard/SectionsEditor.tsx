"use client"

import { useState } from "react"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SortableList } from "./SortableList"
import { FormError } from "./FormError"
import { useEditorList } from "./useEditorList"
import { createSection, deleteSection, reorderSections, toggleSectionVisibility } from "@/lib/actions/sections"
import { cn } from "@/lib/utils"

export type EditableSection = { id: string; title: string; isVisible: boolean; priority: number }

export function SectionsEditor({ profileId, initialSections }: { profileId: string; initialSections: EditableSection[] }) {
  const { items, setItems, error, run } = useEditorList(initialSections)
  const [title, setTitle] = useState("")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Sections</h2>
        <p className="text-xs text-muted-foreground">Regroupez vos liens par thème (Réseaux, Contact, Boutique…). Les liens sans section s&apos;affichent en premier.</p>
      </div>

      <form
        className="flex gap-2"
        action={async (formData) => {
          await run(() => createSection(formData), () => setTitle(""))
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nouvelle section…" required maxLength={120} />
        <Button type="submit" size="sm" variant="outline" className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />Créer
        </Button>
      </form>

      <FormError message={error} />

      <SortableList
        items={items}
        emptyMessage="Aucune section."
        onReorder={(next) => {
          setItems(next)
          run(() => reorderSections(profileId, next.map((i) => i.id)))
        }}
        renderItem={(section) => (
          <>
            <p className={cn("min-w-0 flex-1 truncate text-sm font-medium", !section.isVisible && "opacity-50")}>{section.title}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title={section.isVisible ? "Masquer" : "Afficher"} onClick={() => run(() => toggleSectionVisibility(section.id))}>
                {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title="Supprimer"
                onClick={() => {
                  if (!confirm(`Supprimer la section « ${section.title} » ? Les liens seront conservés.`)) return
                  run(() => deleteSection(section.id), () => setItems((prev) => prev.filter((s) => s.id !== section.id)))
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      />
    </div>
  )
}
