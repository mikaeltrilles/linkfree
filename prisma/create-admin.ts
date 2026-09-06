import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/hash"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@linkfree.com"
  const plainPassword = process.env.ADMIN_PASSWORD || "AdminLinkfree2024!"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`L'utilisateur ${email} existe déjà. Mise à jour du mot de passe et du rôle...`)
    const hashed = hashPassword(plainPassword)
    await prisma.user.update({
      where: { email },
      data: { password: hashed, role: "ADMIN" },
    })
    console.log("Compte admin mis à jour.")
  } else {
    const hashed = hashPassword(plainPassword)
    await prisma.user.create({
      data: {
        email,
        name: "Admin",
        password: hashed,
        role: "ADMIN",
      },
    })
    console.log(`Compte admin créé : ${email}`)
  }

  console.log(`Mot de passe : ${plainPassword}`)
  console.log("\n⚠️  Changez ce mot de passe après la première connexion.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
