"use client"

import { ArrowUpRight, Github, Star } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string | null
    url: string | null
    repoUrl: string | null
    image: string | null
    tags: string | null
    isFeatured: boolean
  }
  profileId: string
  primaryColor: string
}

export function ProjectCard({ project, profileId, primaryColor }: ProjectCardProps) {
  const href = project.url || project.repoUrl || "#"
  const tags = project.tags ? project.tags.split(",").filter(Boolean) : []

  const track = () => {
    try {
      navigator.sendBeacon?.(
        "/api/events",
        new Blob([JSON.stringify({ profileId, projectId: project.id, type: "PROJECT_CLICK" })], {
          type: "application/json",
        })
      )
    } catch {
      // silencieux
    }
  }

  return (
    <article
      className={
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg " +
        (project.isFeatured ? "border-black/[0.12] sm:col-span-2" : "border-black/[0.06] hover:border-black/[0.12]")
      }
    >
      {project.image && (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={track} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className={
              "w-full object-cover transition duration-500 group-hover:scale-[1.03] " +
              (project.isFeatured ? "h-44" : "h-32")
            }
          />
        </a>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-black/90">
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={track} className="after:absolute after:inset-0">
              {project.title}
            </a>
          </h3>
          {project.isFeatured && (
            <Star className="h-4 w-4 shrink-0" style={{ color: primaryColor }} fill={primaryColor} aria-label="Projet mis en avant" />
          )}
        </div>

        {project.description && (
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-black/50">{project.description}</p>
        )}

        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black/50">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-3 pt-3 text-xs font-medium">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={track}
              className="relative z-10 inline-flex items-center gap-1 transition hover:underline"
              style={{ color: primaryColor }}
            >
              Voir le projet <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={track}
              className="relative z-10 inline-flex items-center gap-1 text-black/50 transition hover:text-black"
            >
              <Github className="h-3.5 w-3.5" /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
