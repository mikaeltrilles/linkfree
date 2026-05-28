"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LinkButton } from "./LinkButton"
import { Globe, MapPin, Calendar, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileShellProps {
  profile: {
    id: string
    slug: string
    title: string | null
    bio: string | null
    avatar: string | null
    coverImage: string | null
    theme: string
    appearance: Record<string, any> | null
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
      conditions: Record<string, any> | null
    }>
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

export function ProfileShell({ profile }: ProfileShellProps) {
  const pinned = profile.links.filter((l) => l.isPinned)
  const regular = profile.links.filter((l) => !l.isPinned)

  // En production : filtrer les sections selon conditions (heure, device, pays)
  const visibleSections = profile.sections.filter((s) => s.isVisible)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-md bg-background pb-16"
    >
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden md:h-56">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="relative px-6">
        <div className="-mt-12">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-lg">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.title || ""}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground">
                {(profile.title || profile.slug).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold">{profile.title || profile.slug}</h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
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
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {profile.products.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Boutique
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border bg-card shadow-card"
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {product.price.toFixed(2)} {product.currency}
                      </span>
                      <Button size="sm" variant="outline">Acheter</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link href={`/p/${profile.slug}/qr`} className="flex items-center gap-1 hover:text-foreground">
            <QrCode className="h-3 w-3" /> QR
          </Link>
          <span>·</span>
          <Link href="/" className="hover:text-foreground">Powered by Linkfree</Link>
        </div>
      </div>
    </motion.div>
  )
}
