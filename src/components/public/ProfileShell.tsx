"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LinkButton } from "./LinkButton"
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

export function ProfileShell({ profile }: ProfileShellProps) {
  const pinned = profile.links.filter((l) => l.isPinned)
  const regular = profile.links.filter((l) => !l.isPinned)
  const visibleSections = profile.sections.filter((s) => s.isVisible)

  // Extract appearance colors if available
  const colors = profile.appearance?.colors
  const primaryColor = colors?.primary || "#14b8a6"

  const containerStyle: React.CSSProperties = colors
    ? {
        backgroundColor: colors.background,
        color: colors.text,
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-md pb-16"
      style={containerStyle}
    >
      {/* Cover */}
      <div className="relative h-44 w-full overflow-hidden md:h-60">
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
              background: `linear-gradient(135deg, ${primaryColor}88, ${primaryColor})`,
            }}
          />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="relative px-5">
        <div className="-mt-14">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-background shadow-xl">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.title || ""}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-muted-foreground">
                {(profile.title || profile.slug).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.title || profile.slug}
          </h1>
          {profile.bio && (
            <p className="mt-1 text-sm opacity-80">{profile.bio}</p>
          )}
        </div>

        {/* Pinned links */}
        {pinned.length > 0 && (
          <div className="mt-6 space-y-3">
            {pinned.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <LinkButton
                  link={link}
                  variant="pinned"
                  profileId={profile.id}
                  primaryColor={primaryColor}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Regular links by section */}
        <div className="mt-6 space-y-6">
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => {
              const sectionLinks = regular.filter(
                (l) => l.sectionId === section.id
              )
              if (sectionLinks.length === 0) return null
              return (
                <div key={section.id}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {sectionLinks.map((link, i) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                      >
                        <LinkButton
                          link={link}
                          variant="default"
                          profileId={profile.id}
                          primaryColor={primaryColor}
                        />
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <LinkButton
                    link={link}
                    variant="default"
                    profileId={profile.id}
                    primaryColor={primaryColor}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {profile.products.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">
              Boutique
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border bg-card/80 shadow-card backdrop-blur-sm"
                >
                  {product.image && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{product.title}</h3>
                    <p className="mt-1 text-xs opacity-70">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {Number(product.price).toFixed(2)} {product.currency}
                      </span>
                      <button
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
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

        {/* Social proof / footer */}
        <div className="mt-12 flex items-center justify-center gap-4 text-xs opacity-50">
          <Link
            href={`/p/${profile.slug}/qr`}
            className="flex items-center gap-1 hover:opacity-100"
          >
            <QrCode className="h-3.5 w-3.5" /> QR
          </Link>
          <span>·</span>
          <Link href="/" className="hover:opacity-100">
            Powered by Linkfree
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
