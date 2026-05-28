"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LinkButton } from "./LinkButton"
import { ContactForm } from "./ContactForm"
import { QrCode } from "lucide-react"

interface ProfileShellProps {
  profile: {
    id: string
    slug: string
    title: string | null
    bio: string | null
    avatar: string | null
    coverImage: string | null
    theme: string
    appearance: any
    locale: string
    links: Array<{
      id: string
      title: string
      url: string
      description: string | null
      thumbnail: string | null
      layout: string
      isPinned: boolean
      sectionId: string | null
    }>
    sections: Array<{
      id: string
      title: string
      isVisible: boolean
      conditions: any
    }>
    products: Array<{
      id: string
      title: string
      description: string | null
      price: any
      currency: string
      image: string | null
    }>
  }
}

function renderLink(
  link: ProfileShellProps["profile"]["links"][number],
  profileId: string,
  variant: "default" | "pinned",
  primaryColor: string
) {
  if (link.url === "#contact-form") {
    return (
      <div className="glass-strong rounded-2xl p-5">
        <p className="mb-3 text-sm font-semibold">{link.title}</p>
        <ContactForm profileId={profileId} />
      </div>
    )
  }

  return (
    <LinkButton
      link={link}
      variant={variant}
      profileId={profileId}
      primaryColor={primaryColor}
    />
  )
}

export function ProfileShell({ profile }: ProfileShellProps) {
  const pinned = profile.links.filter((l) => l.isPinned)
  const regular = profile.links.filter((l) => !l.isPinned)
  const visibleSections = profile.sections.filter((s) => s.isVisible)

  const colors = profile.appearance?.colors
  const primaryColor = colors?.primary || "#14b8a6"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto min-h-screen max-w-md overflow-hidden pb-16"
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 gradient-mesh opacity-60" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background" />

      {/* Cover */}
      <div className="relative h-52 w-full overflow-hidden md:h-64">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}60, ${primaryColor})`,
            }}
          />
        )}
        {/* Glass overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative px-5">
        {/* Avatar */}
        <div className="-mt-16 flex justify-center">
          <div className="relative">
            <div
              className="relative h-32 w-32 overflow-hidden rounded-full border-[3px] shadow-2xl"
              style={{
                borderColor: `${primaryColor}40`,
                boxShadow: `0 0 40px ${primaryColor}30, 0 8px 32px rgba(0,0,0,0.3)`,
              }}
            >
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.title || ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5 text-4xl font-bold text-white/90">
                  {(profile.title || profile.slug).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Glow ring */}
            <div
              className="absolute -inset-1 rounded-full blur-md -z-10"
              style={{ background: `${primaryColor}20` }}
            />
          </div>
        </div>

        {/* Title & Bio */}
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight glow-text">
            {profile.title || profile.slug}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Pinned Links */}
        {pinned.length > 0 && (
          <div className="mt-8 space-y-3">
            {pinned.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              >
                {renderLink(link, profile.id, "pinned", primaryColor)}
              </motion.div>
            ))}
          </div>
        )}

        {/* Sections / Regular Links */}
        <div className="mt-8 space-y-8">
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => {
              const sectionLinks = regular.filter(
                (l) => l.sectionId === section.id
              )
              if (sectionLinks.length === 0) return null
              return (
                <div key={section.id}>
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40 text-center">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {sectionLinks.map((link, i) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 100 }}
                      >
                        {renderLink(link, profile.id, "default", primaryColor)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="space-y-3">
              {regular.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 100 }}
                >
                  {renderLink(link, profile.id, "default", primaryColor)}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {profile.products.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40 text-center">
              Boutique
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.products.map((product) => (
                <div
                  key={product.id}
                  className="glass-product overflow-hidden rounded-2xl transition hover:border-white/[0.12] hover:bg-white/[0.06]"
                >
                  {product.image && (
                    <div className="relative h-36 w-full overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white/90">{product.title}</h3>
                    <p className="mt-1 text-xs text-white/50 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-white/90">
                        {Number(product.price).toFixed(2)} {product.currency}
                      </span>
                      <button
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor})`,
                          boxShadow: `0 4px 16px ${primaryColor}40`,
                        }}
                      >
                        Acheter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-14 flex items-center justify-center gap-4 text-xs text-white/30">
          <Link
            href={`/p/${profile.slug}/qr`}
            className="flex items-center gap-1.5 transition hover:text-white/70"
          >
            <QrCode className="h-3.5 w-3.5" /> QR
          </Link>
          <span className="text-white/10">·</span>
          <Link href="/" className="transition hover:text-white/70">Powered by Linkfree</Link>
        </div>
      </div>
    </motion.div>
  )
}
