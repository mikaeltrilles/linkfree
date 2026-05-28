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

  if (variant === "pinned") {
    return (
      <Link
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="bento-pinned group flex w-full items-center gap-5"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
        }}
      >
        {link.thumbnail ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
            <Image src={link.thumbnail} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-sm">{link.title}</span>
            <Pin className="h-3 w-3 shrink-0 text-white/60" />
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/0 transition group-hover:text-white/60" />
          </div>
          {link.description && (
            <p className="truncate text-xs text-white/70">{link.description}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "bento-card group flex w-full items-center gap-5 px-6 py-5",
        "hover:bg-white hover:shadow-lg"
      )}
    >
      {link.thumbnail ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
          <Image src={link.thumbnail} alt="" fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-sm text-stone-700">{link.title}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-stone-300 transition group-hover:text-stone-500" />
        </div>
        {link.description && (
          <p className="truncate text-xs text-stone-400">{link.description}</p>
        )}
      </div>
    </Link>
  )
}
