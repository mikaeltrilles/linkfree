"use client"

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
  ChevronRight,
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
  primaryColor = "#000000",
}: LinkButtonProps) {
  const Icon = getLinkIcon(link.url)

  const handleClick = () => {
    // sendBeacon survit à la navigation vers le lien externe.
    try {
      const payload = JSON.stringify({ profileId, linkId: link.id, type: "CLICK" })
      if (!navigator.sendBeacon?.("/api/events", new Blob([payload], { type: "application/json" }))) {
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // Silencieux
    }
  }

  if (variant === "pinned") {
    return (
      <a
        href={link.url}
        target={link.url.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="linktree-btn-solid group"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="absolute left-4 flex items-center">
          {link.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumbnail} alt="" className="h-6 w-6 rounded-md object-cover" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="truncate">{link.title}</span>
          <Pin className="h-3 w-3 text-white/60" />
        </div>

        <div className="absolute right-4 flex items-center">
          <ChevronRight className="h-4 w-4 text-white/60 transition group-hover:translate-x-0.5" />
        </div>
      </a>
    )
  }

  return (
    <a
      href={link.url}
      target={link.url.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="linktree-btn group"
    >
      <div className="absolute left-4 flex items-center">
        {link.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.thumbnail} alt="" className="h-6 w-6 rounded-md object-cover" />
        ) : (
          <Icon className="h-5 w-5 text-black/40 transition group-hover:text-black/60" />
        )}
      </div>

      <span className="truncate text-black/80 transition group-hover:text-black">
        {link.title}
      </span>

      <div className="absolute right-4 flex items-center">
        <ChevronRight className="h-4 w-4 text-black/20 transition group-hover:translate-x-0.5 group-hover:text-black/40" />
      </div>
    </a>
  )
}
