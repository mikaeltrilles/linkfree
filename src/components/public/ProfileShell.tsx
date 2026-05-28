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
      <div className="w-full rounded-2xl border border-black/[0.08] bg-white/50 p-5 backdrop-blur-sm">
        <p className="mb-3 text-sm font-medium">{link.title}</p>
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
  const primaryColor = colors?.primary || "#000000"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center px-6 pb-16"
    >
      {/* Organic background blobs */}
      <div
        className="organic-blob"
        style={{
          width: "600px",
          height: "600px",
          background: `${primaryColor}15`,
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="organic-blob"
        style={{
          width: "400px",
          height: "400px",
          background: `${primaryColor}10`,
          bottom: "10%",
          right: "-100px",
        }}
      />

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mt-16"
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-xl ring-4 ring-white"
        >
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.title || ""}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-3xl font-bold text-stone-400"
            >
              {(profile.title || profile.slug).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 text-center"
      >
        <h1 className="editorial-title text-2xl font-semibold text-black/90">
          {profile.title || profile.slug}
        </h1>
        {profile.bio && (
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-black/50">
            {profile.bio}
          </p>
        )}
      </motion.div>

      {/* Links */}
      <div className="mt-8 w-full space-y-3">
        {/* Pinned */}
        {pinned.map((link, i) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            {renderLink(link, profile.id, "pinned", primaryColor)}
          </motion.div>
        ))}

        {/* Sections or regular */}
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => {
            const sectionLinks = regular.filter((l) => l.sectionId === section.id)
            if (sectionLinks.length === 0) return null
            return (
              <div key={section.id} className="pt-2">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-black/5" />
                  <span className="text-xs font-medium uppercase tracking-wider text-black/30">
                    {section.title}
                  </span>
                  <div className="h-px flex-1 bg-black/5" />
                </div>
                <div className="space-y-3">
                  {sectionLinks.map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                    >
                      {renderLink(link, profile.id, "default", primaryColor)}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          regular.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            >
              {renderLink(link, profile.id, "default", primaryColor)}
            </motion.div>
          ))
        )}
      </div>

      {/* Products Bento */}
      {profile.products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 w-full"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/5" />
            <span className="text-xs font-medium uppercase tracking-wider text-black/30">Boutique</span>
            <div className="h-px flex-1 bg-black/5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {profile.products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-black/[0.06] bg-white/60 backdrop-blur-sm transition-all duration-300 hover:border-black/[0.12] hover:shadow-lg"
              >
                {product.image && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-black/90">{product.title}</h3>
                  <p className="mt-0.5 text-xs text-black/40">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-black/80">
                      {Number(product.price).toFixed(0)} {product.currency}
                    </span>
                    <button
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-105"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-14 flex items-center gap-4 text-xs text-black/30">
        <Link
          href={`/p/${profile.slug}/qr`}
          className="flex items-center gap-1 transition hover:text-black/60"
        >
          <QrCode className="h-3.5 w-3.5" /> QR
        </Link>
        <span>·</span>
        <Link href="/" className="transition hover:text-black/60">Linkfree</Link>
      </div>
    </motion.div>
  )
}
