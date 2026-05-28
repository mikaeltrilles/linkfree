import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Demo profile
  const profile = await prisma.profile.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      userId: "seed-user",
      slug: "demo",
      title: "Alice Dupont",
      bio: "Designer UX & Product · Créatrice de templates Figma · Disponible en freelance",
      theme: "minimal",
      status: "PUBLISHED",
      locale: "fr",
      appearance: JSON.stringify({
        colors: { primary: "#14b8a6", background: "#ffffff", text: "#111827" },
        layout: "list",
        darkMode: false,
      }),
      links: {
        create: [
          {
            title: "🎨 Portfolio Dribbble",
            url: "https://dribbble.com",
            description: "Mes derniers projets de design",
            priority: 0,
            isPinned: true,
            status: "ACTIVE",
          },
          {
            title: "📅 Prendre rendez-vous",
            url: "https://calendly.com",
            description: "30 min pour discuter de votre projet",
            priority: 1,
            status: "ACTIVE",
          },
          {
            title: "💬 Me contacter sur WhatsApp",
            url: "https://wa.me/33600000000",
            priority: 2,
            status: "ACTIVE",
          },
          {
            title: "📘 Templates Figma",
            url: "https://figma.com",
            description: "UI kits et design systems",
            priority: 3,
            status: "ACTIVE",
          },
        ],
      },
      sections: {
        create: [
          { title: "Réseaux", priority: 0, isVisible: true },
          { title: "Contact", priority: 1, isVisible: true },
          { title: "Boutique", priority: 2, isVisible: true },
        ],
      },
      products: {
        create: [
          {
            title: "UI Kit Minimal",
            description: "200+ composants Figma prêts à l'emploi",
            price: 29,
            currency: "EUR",
            isActive: true,
          },
          {
            title: "E-book Design System",
            description: "Guide complet pour construire votre design system",
            price: 15,
            currency: "EUR",
            isActive: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Created demo profile: /p/${profile.slug}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
