"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Mail, Calendar, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkButtonProps {
  link: {
    id: string
    title: string
    url: string
    description: string | null
    thumbnail: string | null
    layout: string
    isPinned: boolean
  }
  variant?: "default" | "pinned"
  profileId: string
}

function getLinkIcon(url: string) {
  const u = url.toLowerCase()
  if (u.includes("whatsapp")) return MessageCircle
  if (u.includes("calendly") || u.includes("calendar")) return Calendar
  if (u.includes("mailto:")) return Mail
  return ExternalLink
}

export function LinkButton({
  link,
  variant = "default",
  profileId,
}: LinkButtonProps) {
  const Icon = getLinkIcon(link.url)
  const isCta =
    link.url.startsWith("mailto:") ||
    link.url.includes("wa.me") ||
    link.url.includes("calendly")

  const handleClick = async () => {
    // Log click event
    try {
      await fetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          linkId: link.id,
          type: "CLICK",
        }),
      })
    } catch {
      // Silencieux
    }
  }

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-card px-4 py-3.5 shadow-card transition",
        "hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0",
        variant === "pinned" &&
          "border-brand-300 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20"
      )}
    >
      {link.thumbnail && (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={link.thumbnail}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      {!link.thumbnail && (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
            variant === "pinned" && "bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-100"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-sm">{link.title}</span>
          {!isCta && (
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          )}
        </div>
        {link.description && (
          <p className="truncate text-xs text-muted-foreground">{link.description}</p>
        )}
      </div>
    </Link>
  )
}
