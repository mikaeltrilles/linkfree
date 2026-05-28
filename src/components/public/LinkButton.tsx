"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ExternalLink,
  Mail,
  Calendar,
  MessageCircle,
  ShoppingBag,
  Music,
  Video,
  FileText,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Pin,
} from "lucide-react"
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
  primaryColor?: string
}

function getLinkIcon(url: string) {
  const u = url.toLowerCase()
  if (u.includes("whatsapp") || u.includes("wa.me")) return MessageCircle
  if (u.includes("calendly") || u.includes("calendar") || u.includes("rendez-vous"))
    return Calendar
  if (u.includes("mailto:")) return Mail
  if (u.includes("shop") || u.includes("buy") || u.includes("store"))
    return ShoppingBag
  if (u.includes("spotify") || u.includes("music") || u.includes("soundcloud"))
    return Music
  if (u.includes("youtube") || u.includes("vimeo") || u.includes("tiktok"))
    return Video
  if (u.includes("github")) return Github
  if (u.includes("twitter") || u.includes("x.com")) return Twitter
  if (u.includes("instagram")) return Instagram
  if (u.includes("linkedin")) return Linkedin
  if (u.includes("pdf") || u.includes("doc")) return FileText
  if (u.includes("dribbble") || u.includes("behance") || u.includes("portfolio"))
    return Globe
  return ExternalLink
}

export function LinkButton({
  link,
  variant = "default",
  profileId,
  primaryColor = "#14b8a6",
}: LinkButtonProps) {
  const Icon = getLinkIcon(link.url)

  const handleClick = async () => {
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
        "group flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-4 py-3.5 transition",
        "hover:-translate-y-0.5 active:translate-y-0",
        variant === "pinned"
          ? "border-transparent text-white shadow-lg"
          : "bg-card/80 shadow-card backdrop-blur-sm hover:shadow-card-hover",
        variant === "pinned" && "ring-1 ring-white/20"
      )}
      style={
        variant === "pinned"
          ? { backgroundColor: primaryColor }
          : undefined
      }
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
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            variant === "pinned"
              ? "bg-white/20 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-sm">{link.title}</span>
          {link.isPinned && (
            <Pin className="h-3 w-3 shrink-0 opacity-60" />
          )}
          <ExternalLink
            className={cn(
              "h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-60",
              variant === "pinned" && "text-white"
            )}
          />
        </div>
        {link.description && (
          <p
            className={cn(
              "truncate text-xs",
              variant === "pinned" ? "opacity-80" : "text-muted-foreground"
            )}
          >
            {link.description}
          </p>
        )}
      </div>
    </Link>
  )
}
