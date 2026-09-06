"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SortableList } from "./SortableList"
import { FormError } from "./FormError"
import { useEditorList } from "./useEditorList"
import {
  createProject,
  deleteProject,
  reorderProjects,
  toggleProjectVisibility,
  updateProject,
} from "@/lib/actions/projects"
import { cn } from "@/lib/utils"

export type EditableProject = {
  id: string
  title: string
  description: string | null
  url: string | null
  repoUrl: string | null
  image: string | null
  tags: string | null
  isVisible: boolean
  isFeatured: boolean
  clickCount: number
  priority: number
}

function ProjectFormFields({ idPrefix, project }: { idPrefix: string; project?: EditableProject }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Nom du projet</Label>
        <Input id={`${idPrefix}-title`} name="title" defaultValue={project?.title} placeholder="Mon application" required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea id={`${idPrefix}-description`} name="description" defaultValue={project?.description ?? ""} placeholder="En quelques phrases : le problème résolu, la stack, votre rôle…" maxLength={1000} rows={3} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-url`}>Lien du projet</Label>
          <Input id={`${idPrefix}-url`} name="url" type="url" defaultValue={project?.url ?? ""} placeholder="https://monprojet.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-repo`}>Dépôt de code (optionnel)</Label>
          <Input id={`${idPrefix}-repo`} name="repoUrl" type="url" defaultValue={project?.repoUrl ?? ""} placeholder="https://github.com/…" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-image`}>Image de couverture (URL, optionnelle)</Label>
        <Input id={`${idPrefix}-image`} name="image" type="url" defaultValue={project?.image ?? ""} placeholder="https://…/capture.png" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-tags`}>Tags (séparés par des virgules)</Label>
        <Input id={`${idPrefix}-tags`} name="tags" defaultValue={project?.tags ?? ""} placeholder="Next.js, TypeScript, Design" maxLength={200} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id={`${idPrefix}-featured`} name="isFeatured" value="true" defaultChecked={project?.isFeatured} className="h-4 w-4 rounded border-gray-300" />
        <Label htmlFor={`${idPrefix}-featured`}>Mettre en avant (carte élargie, affichée en premier)</Label>
      </div>
    </>
  )
}

export function ProjectsEditor({ profileId, initialProjects }: { profileId: string; initialProjects: EditableProject[] }) {
  const { items, setItems, error, run } = useEditorList(initialProjects)
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditableProject | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Projets</h2>
          <p className="text-xs text-muted-foreground">Vos réalisations, présentées en cartes sous vos liens.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setCreateError(null) }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un projet</DialogTitle>
            </DialogHeader>
            <form
              key={open ? "open" : "closed"}
              action={async (formData) => {
                const result = await createProject(formData)
                if (!result.ok) return setCreateError(result.error)
                await run(async () => result, () => setOpen(false))
              }}
              className="space-y-4"
            >
              <input type="hidden" name="profileId" value={profileId} />
              <ProjectFormFields idPrefix="new-project" />
              <FormError message={createError} />
              <Button type="submit" className="w-full">Ajouter le projet</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FormError message={error} />

      <SortableList
        items={items}
        emptyMessage="Aucun projet. Présentez vos réalisations, apps ou dépôts."
        onReorder={(next) => {
          setItems(next)
          run(() => reorderProjects(profileId, next.map((i) => i.id)))
        }}
        renderItem={(project) => (
          <>
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40", !project.isVisible && "opacity-40")}>
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <div className={cn("min-w-0 flex-1", !project.isVisible && "opacity-50")}>
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{project.title}</p>
                {project.isFeatured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Mis en avant" />}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {project.url || project.repoUrl}
                {project.clickCount > 0 && ` · ${project.clickCount} clic${project.clickCount > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title={project.isVisible ? "Masquer" : "Afficher"} onClick={() => run(() => toggleProjectVisibility(project.id))}>
                {project.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Éditer" onClick={() => { setEditing(project); setEditError(null) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title="Supprimer"
                onClick={() => {
                  if (!confirm(`Supprimer le projet « ${project.title} » ?`)) return
                  run(() => deleteProject(project.id), () => setItems((prev) => prev.filter((p) => p.id !== project.id)))
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Éditer le projet</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              key={editing.id}
              action={async (formData) => {
                const result = await updateProject(formData)
                if (!result.ok) return setEditError(result.error)
                await run(async () => result, () => setEditing(null))
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editing.id} />
              <ProjectFormFields idPrefix={editing.id} project={editing} />
              <FormError message={editError} />
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
