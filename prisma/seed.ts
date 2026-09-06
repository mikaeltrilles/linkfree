import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/hash"

const prisma = new PrismaClient()

/**
 * Seed idempotent : crée (ou met à jour) l'utilisateur démo et le profil
 * public /p/demo avec liens, réseaux sociaux, projets et sections.
 */
async function main() {
  console.log("Seeding…")

  const demoPassword = process.env.DEMO_PASSWORD || "DemoLinkfree2026!"
  const user = await prisma.user.upsert({
    where: { email: "demo@linkfree.tmktools.com" },
    update: { password: hashPassword(demoPassword) },
    create: {
      id: "seed-user",
      email: "demo@linkfree.tmktools.com",
      name: "Demo User",
      password: hashPassword(demoPassword),
      role: "OWNER",
    },
  })

  const profile = await prisma.profile.upsert({
    where: { slug: "demo" },
    update: { status: "PUBLISHED" },
    create: {
      userId: user.id,
      slug: "demo",
      title: "Alice Dupont",
      bio: "Designer UX & Product · Créatrice de templates Figma · Disponible en freelance",
      theme: "minimal",
      status: "PUBLISHED",
      locale: "fr",
      seoTitle: "Alice Dupont — Designer UX & Product",
      seoDescription: "Portfolio, projets et réseaux d'Alice Dupont, designer produit freelance.",
      appearance: JSON.stringify({ colors: { primary: "#14b8a6" } }),
    },
  })

  // Sections
  const [reseaux, contact] = await Promise.all(
    [
      { title: "Ressources", priority: 0 },
      { title: "Contact", priority: 1 },
    ].map(async (s) => {
      const existing = await prisma.section.findFirst({ where: { profileId: profile.id, title: s.title } })
      return existing ?? prisma.section.create({ data: { profileId: profile.id, ...s } })
    })
  )

  // Liens (boutons)
  const links = [
    { title: "Portfolio Dribbble", url: "https://dribbble.com", description: "Mes derniers projets de design", priority: 0, isPinned: true },
    { title: "Prendre rendez-vous", url: "https://calendly.com", description: "30 min pour discuter de votre projet", priority: 1, sectionId: contact.id },
    { title: "Me contacter sur WhatsApp", url: "https://wa.me/33600000000", priority: 2, sectionId: contact.id },
    { title: "M'écrire", url: "#contact-form", priority: 3, sectionId: contact.id },
    { title: "Templates Figma", url: "https://figma.com", description: "UI kits et design systems", priority: 4, sectionId: reseaux.id },
  ]
  for (const l of links) {
    const existing = await prisma.link.findFirst({ where: { profileId: profile.id, url: l.url } })
    if (existing) {
      await prisma.link.update({ where: { id: existing.id }, data: l })
    } else {
      await prisma.link.create({ data: { profileId: profile.id, status: "ACTIVE", ...l } })
    }
  }

  // Réseaux sociaux
  const socials = [
    { platform: "website", url: "https://linkfree.tmktools.com", label: "Site web", priority: 0 },
    { platform: "github", url: "https://github.com/mikaeltrilles", priority: 1 },
    { platform: "linkedin", url: "https://www.linkedin.com/", priority: 2 },
    { platform: "x", url: "https://x.com/", priority: 3 },
    { platform: "instagram", url: "https://www.instagram.com/", priority: 4 },
    { platform: "youtube", url: "https://www.youtube.com/", priority: 5 },
  ]
  for (const s of socials) {
    const existing = await prisma.socialLink.findFirst({ where: { profileId: profile.id, platform: s.platform } })
    if (existing) {
      await prisma.socialLink.update({ where: { id: existing.id }, data: s })
    } else {
      await prisma.socialLink.create({ data: { profileId: profile.id, ...s } })
    }
  }

  // Projets
  const projects = [
    {
      title: "Linkfree",
      description: "Plateforme link-in-bio open source : liens, réseaux, projets, analytics et formulaire de contact natif.",
      url: "https://linkfree.tmktools.com",
      repoUrl: "https://github.com/mikaeltrilles/linkfree",
      tags: "Next.js,Prisma,MySQL,Tailwind",
      isFeatured: true,
      priority: 0,
    },
    {
      title: "UI Kit Minimal",
      description: "200+ composants Figma prêts à l'emploi, tokens de design et mode sombre.",
      url: "https://figma.com",
      tags: "Figma,Design system",
      priority: 1,
    },
    {
      title: "Design System Handbook",
      description: "Guide complet pour construire et faire vivre un design system en équipe.",
      url: "https://example.com/handbook",
      tags: "E-book,Documentation",
      priority: 2,
    },
  ]
  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { profileId: profile.id, title: p.title } })
    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data: p })
    } else {
      await prisma.project.create({ data: { profileId: profile.id, ...p } })
    }
  }

  // Produits (affichage seul)
  const products = [
    { title: "UI Kit Minimal", description: "200+ composants Figma prêts à l'emploi", price: 29, currency: "EUR" },
    { title: "E-book Design System", description: "Guide complet pour construire votre design system", price: 15, currency: "EUR" },
  ]
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { profileId: profile.id, title: p.title } })
    if (!existing) await prisma.product.create({ data: { profileId: profile.id, isActive: true, ...p } })
  }

  console.log(`Profil démo prêt : /p/${profile.slug} (compte ${user.email})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
