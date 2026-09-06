import {
  Globe,
  Github,
  Gitlab,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Twitch,
  MessageSquare,
  Dribbble,
  Palette,
  BookOpen,
  Music,
  MessageCircle,
  Send,
  Mail,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  website: Globe,
  github: Github,
  gitlab: Gitlab,
  linkedin: Linkedin,
  x: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  twitch: Twitch,
  discord: MessageSquare,
  dribbble: Dribbble,
  behance: Palette,
  medium: BookOpen,
  spotify: Music,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
}

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = ICONS[platform] ?? Globe
  return <Icon className={className} aria-hidden="true" />
}
