/**
 * Catalogue des réseaux sociaux proposés dans le dashboard.
 * `placeholder` sert d'aide à la saisie, `match` permet de détecter la
 * plateforme à partir d'une URL collée.
 */
export type SocialPlatform = {
  key: string
  label: string
  placeholder: string
  match: RegExp
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "website", label: "Site web", placeholder: "https://monsite.com", match: /^$/ },
  { key: "github", label: "GitHub", placeholder: "https://github.com/utilisateur", match: /github\.com/i },
  { key: "gitlab", label: "GitLab", placeholder: "https://gitlab.com/utilisateur", match: /gitlab\.com/i },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/utilisateur", match: /linkedin\.com/i },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/utilisateur", match: /(twitter\.com|x\.com)/i },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/utilisateur", match: /instagram\.com/i },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/page", match: /facebook\.com|fb\.com/i },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@chaine", match: /youtube\.com|youtu\.be/i },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@utilisateur", match: /tiktok\.com/i },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/chaine", match: /twitch\.tv/i },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/invitation", match: /discord\.(gg|com)/i },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/utilisateur", match: /dribbble\.com/i },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/utilisateur", match: /behance\.net/i },
  { key: "medium", label: "Medium", placeholder: "https://medium.com/@utilisateur", match: /medium\.com/i },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/...", match: /spotify\.com/i },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/33600000000", match: /wa\.me|whatsapp\.com/i },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/utilisateur", match: /t\.me|telegram\.(me|org)/i },
  { key: "email", label: "Email", placeholder: "mailto:vous@exemple.com", match: /^mailto:/i },
]

export const SOCIAL_PLATFORM_KEYS = SOCIAL_PLATFORMS.map((p) => p.key)

export function getPlatform(key: string): SocialPlatform {
  return SOCIAL_PLATFORMS.find((p) => p.key === key) ?? SOCIAL_PLATFORMS[0]
}

export function detectPlatform(url: string): string {
  const found = SOCIAL_PLATFORMS.find((p) => p.key !== "website" && p.match.test(url))
  return found?.key ?? "website"
}

/** Accepte http(s) et mailto: (pour le réseau "email"). */
export function isValidSocialUrl(url: string): boolean {
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url)) return true
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}
