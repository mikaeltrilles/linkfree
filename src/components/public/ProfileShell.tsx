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
      <div className="bento-card col-span-full p-6">
        <p className="mb-4 text-sm font-semibold">{link.title}</p>
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
      className="relative mx-auto min-h-screen max-w-lg overflow-hidden pb-20"
    >
      {/* Organic gradient background */}
      <div className="fixed inset-0 -z-10 organic-gradient" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#faf8f5_0%,#f5f2ed_100%)]" />

      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden md:h-72">
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
              background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}50)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#faf8f5]" />
      </div>

      <div className="relative px-6">
        {/* Avatar + Title */}
        <div className="-mt-16 flex flex-col items-center">
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] border-[3px] border-white shadow-2xl"
              style={{
                boxShadow: `0 12px 40px ${primaryColor}25, 0 0 0 4px rgba(255,255,255,0.8)`,
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
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50 text-5xl font-serif text-stone-400"
                >
                  {(profile.title || profile.slug).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 text-center">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-800">
              {profile.title || profile.slug}
            </h1>
            {profile.bio && (
              <p className="mt-2 text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Pinned Links */}
        {pinned.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3">
            {pinned.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
              >
                {renderLink(link, profile.id, "pinned", primaryColor)}
              </motion.div>
            ))}
          </div>
        )}

        {/* Sections / Bento Grid */}
        <div className="mt-8 space-y-10">
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => {
              const sectionLinks = regular.filter(
                (l) => l.sectionId === section.id
              )
              if (sectionLinks.length === 0) return null
              return (
                <div key={section.id}>
                  <div className="flex items-center justify-center mb-5">
                    <span className="pill-badge text-stone-500">
                      {section.title}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {sectionLinks.map((link, i) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 80 }}
                      >
                        {renderLink(link, profile.id, "default", primaryColor)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {regular.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 80 }}
                >
                  {renderLink(link, profile.id, "default", primaryColor)}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Products Bento Grid */}
        {profile.products.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-center mb-5">
              <span className="pill-badge text-stone-500">Boutique</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profile.products.map((product) => (
                <div
                  key={product.id}
                  className="bento-card overflow-hidden group"
                >
                  {product.image && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-serif text-base font-medium text-stone-800">{product.title}</h3>
                    <p className="mt-1 text-xs text-stone-400 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-serif text-lg font-medium text-stone-700">
                        {Number(product.price).toFixed(0)} {product.currency}
                      </span>
                      <button
                        className="rounded-full px-4 py-2 text-xs font-medium text-white transition hover:scale-105"
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

        {/* Footer */}
        <div className="mt-16 flex items-center justify-center gap-5 text-xs text-stone-400">
          <Link
            href={`/p/${profile.slug}/qr`}
            className="flex items-center gap-1.5 transition hover:text-stone-600"
          >
            <QrCode className="h-3.5 w-3.5" /> QR
          </Link>
          <span className="text-stone-300">·</span>
          <Link href="/" className="transition hover:text-stone-600">Powered by Linkfree</Link>
        </div>
      </div>
    </motion.div>
  )
}
