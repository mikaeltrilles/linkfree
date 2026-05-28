import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const eventSchema = z.object({
  profileId: z.string().cuid(),
  linkId: z.string().cuid(),
  type: z.enum(["CLICK", "IMPRESSION"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = eventSchema.parse(body)

    await prisma.linkEvent.create({
      data: {
        profileId: data.profileId,
        linkId: data.linkId,
        type: data.type,
      },
    })

    // Incrémenter le compteur dénormalisé pour les lectures rapides
    if (data.type === "CLICK") {
      await prisma.link.update({
        where: { id: data.linkId },
        data: { clickCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
