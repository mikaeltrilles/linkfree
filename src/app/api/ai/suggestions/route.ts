import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const profileId = searchParams.get("profileId")

  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 })
  }

  const links = await prisma.link.findMany({
    where: { profileId },
    orderBy: { clickCount: "asc" },
    take: 5,
  })

  const suggestions = links.map((link) => {
    const tips = []
    if (link.clickCount < 10) {
      tips.push("Ce lien a peu de clics. Essayez une miniature ou un titre plus accrocheur.")
    }
    if (link.title.length > 40) {
      tips.push("Titre un peu long. Privilégiez moins de 40 caractères sur mobile.")
    }
    if (!link.thumbnail && link.clickCount < 50) {
      tips.push("Ajoutez une miniature pour augmenter le CTR.")
    }
    if (tips.length === 0) {
      tips.push("Performance stable. Vous pouvez tester une variante A/B pour optimiser.")
    }
    return {
      linkId: link.id,
      title: link.title,
      ctrHint: link.clickCount < 10 ? "faible" : "moyen",
      tips,
    }
  })

  return NextResponse.json({ suggestions })
}
