import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const profileId = new URL(req.url).searchParams.get("profileId")
  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 })
  }

  const links = await prisma.link.findMany({
    where: { profileId, profile: { userId: session.user.id } },
    orderBy: { clickCount: "asc" },
    take: 5,
  })

  const suggestions = links.map((link) => {
    const tips: string[] = []
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
