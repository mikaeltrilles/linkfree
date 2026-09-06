"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { QrCode } from "lucide-react"
import { LinkButton } from "./LinkButton"
import { ContactForm } from "./ContactForm"
import { SocialRow } from "./SocialRow"
import { ProjectCard } from "./ProjectCard"
import { PageViewTracker } from "./PageViewTracker"

type PublicLink = {
  id: string
  title: string
  url: string
  description: string | null
  thumbnail: string | null
  layout: string
  isPinned: boolean
  sectionId: string | null
}

interface ProfileShellProps {
  profile: {
    id: string
    slug: string
    title: string | null
    bio: string | null
    avatar: string | null
    coverImage: string | null
    theme: string
    appearance: Record<string, unknown> | null
    locale: string
    links: PublicLink[]
    socialLinks: Array<{ id: string; platform: string; url: string; label: string | null }>
    projects: Array<{
      id: string
      title: string
      description: string | null
      url: string | null
      repoUrl: string | null
      image: string | null
      tags: string | null
      isFeatured: boolean
    }>
    sections: Array<{ id: string; title: string; isVisible: boolean }>
    products: Array<{
      id: string
      title: string
      description: string | null
      price: number
      currency: string
      image: string | null
    }>
  }
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-black/5" />
      <span className="text-xs font-medium uppercase tracking-wider text-black/30">{title}</span>
      <div className="h-px flex-1 bg-black/5" />
    </div>
  )
}

function renderLink(link: PublicLink, profileId: string, variant: "default" | "pinned", primaryColor: string) {
  if (link.url === "#contact-form") {
    return (
      <div className="w-full rounded-2xl border border-black/[0.08] bg-white/50 p-5 backdrop-blur-sm">
        <p className="mb-3 text-sm font-medium">{link.title}</p>
        <ContactForm profileId={profileId} />
      </div>
    )
  }
  return <LinkButton link={link} variant={variant} profileId={profileId} primaryColor={primaryColor} />
}

export function ProfileShell({ profile }: ProfileShellProps) {
  const pinned = profile.links.filter((l) => l.isPinned)
  const regular = profile.links.filter((l) => !l.isPinned)
  const visibleSections = profile.sections.filter((s) => s.isVisible)
  const visibleSectionIds = new Set(visibleSections.map((s) => s.id))
  // Les liens sans section (ou dont la section est masquée) restent visibles.
  const unsectioned = regular.filter((l) => !l.sectionId || !visibleSectionIds.has(l.sectionId))

  const colors = (profile.appearance?.colors ?? {}) as { primary?: string }
  const primaryColor = colors.primary || "#111111"

  let delay = 0.35
  const nextDelay = () => (delay += 0.06)

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center px-6 pb-16"
    >
      <PageViewTracker profileId={profile.id} />

      {/* Fond organique */}
      <div
        className="organic-blob"
        style={{ width: 600, height: 600, background: `${primaryColor}15`, top: -200, left: "50%", transform: "translateX(-50%)" }}
      />
      <div
        className="organic-blob"
        style={{ width: 400, height: 400, background: `${primaryColor}10`, bottom: "10%", right: -100 }}
      />

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mt-16"
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-xl ring-4 ring-white">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt={profile.title || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-3xl font-bold text-stone-400">
              {(profile.title || profile.slug).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Titre + bio */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 text-center"
      >
        <h1 className="editorial-title text-2xl font-semibold text-black/90">{profile.title || profile.slug}</h1>
        {profile.bio && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-black/50">{profile.bio}</p>}
      </motion.div>

      {/* Réseaux sociaux */}
      <SocialRow socials={profile.socialLinks} primaryColor={primaryColor} />

      {/* Liens */}
      {profile.links.length > 0 && (
        <div className="mt-8 w-full space-y-3">
          {pinned.map((link) => (
            <motion.div key={link.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: nextDelay() }}>
              {renderLink(link, profile.id, "pinned", primaryColor)}
            </motion.div>
          ))}

          {unsectioned.map((link) => (
            <motion.div key={link.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: nextDelay() }}>
              {renderLink(link, profile.id, "default", primaryColor)}
            </motion.div>
          ))}

          {visibleSections.map((section) => {
            const sectionLinks = regular.filter((l) => l.sectionId === section.id)
            if (sectionLinks.length === 0) return null
            return (
              <div key={section.id} className="pt-2">
                <SectionDivider title={section.title} />
                <div className="space-y-3">
                  {sectionLinks.map((link) => (
                    <motion.div key={link.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: nextDelay() }}>
                      {renderLink(link, profile.id, "default", primaryColor)}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Projets */}
      {profile.projects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: nextDelay() }}
          className="mt-10 w-full"
          aria-label="Projets"
        >
          <SectionDivider title="Projets" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} profileId={profile.id} primaryColor={primaryColor} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Boutique */}
      {profile.products.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: nextDelay() }}
          className="mt-10 w-full"
          aria-label="Boutique"
        >
          <SectionDivider title="Boutique" />
          <div className="grid grid-cols-2 gap-3">
            {profile.products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-black/[0.06] bg-white/60 backdrop-blur-sm transition-all duration-300 hover:border-black/[0.12] hover:shadow-lg"
              >
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.title} loading="lazy" className="h-32 w-full object-cover transition duration-500 group-hover:scale-105" />
                )}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-black/90">{product.title}</h3>
                  {product.description && <p className="mt-0.5 text-xs text-black/40">{product.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-black/80">
                      {product.price.toFixed(0)} {product.currency}
                    </span>
                    <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                      Bientôt
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {profile.links.length === 0 && profile.projects.length === 0 && profile.socialLinks.length === 0 && (
        <p className="mt-10 text-sm text-black/40">Cette page est encore vide.</p>
      )}

      {/* Pied de page */}
      <footer className="mt-14 flex items-center gap-4 text-xs text-black/30">
        <Link href={`/p/${profile.slug}/qr`} className="flex items-center gap-1 transition hover:text-black/60">
          <QrCode className="h-3.5 w-3.5" /> QR
        </Link>
        <span>·</span>
        <Link href="/" className="transition hover:text-black/60">
          Linkfree
        </Link>
      </footer>
    </motion.main>
  )
}
