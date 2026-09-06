"use client"

import { motion } from "framer-motion"
import { SocialIcon } from "./SocialIcon"
import { getPlatform } from "@/lib/social-platforms"

interface SocialRowProps {
  socials: Array<{ id: string; platform: string; url: string; label: string | null }>
  primaryColor: string
}

export function SocialRow({ socials, primaryColor }: SocialRowProps) {
  if (socials.length === 0) return null

  return (
    <motion.ul
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mt-5 flex flex-wrap items-center justify-center gap-2"
      aria-label="Réseaux sociaux"
    >
      {socials.map((s) => {
        const label = s.label || getPlatform(s.platform).label
        return (
          <li key={s.id}>
            <a
              href={s.url}
              target={s.platform === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              title={label}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white/60 text-black/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:text-white"
              style={{ ["--hover-bg" as string]: primaryColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            >
              <SocialIcon platform={s.platform} className="h-5 w-5" />
            </a>
          </li>
        )
      })}
    </motion.ul>
  )
}
