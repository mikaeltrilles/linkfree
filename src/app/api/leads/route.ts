import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const leadSchema = z.object({
  profileId: z.string().min(1),
  email: z.string().email().max(200),
  name: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  consent: z.boolean(),
  // Champ honeypot : rempli uniquement par les robots.
  website: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const data = leadSchema.parse(await req.json())

    if (data.website) return NextResponse.json({ ok: true })
    if (!data.consent) {
      return NextResponse.json({ ok: false, error: "Consentement requis" }, { status: 400 })
    }

    const profile = await prisma.profile.findFirst({
      where: { id: data.profileId, status: "PUBLISHED" },
      select: { id: true },
    })
    if (!profile) return NextResponse.json({ ok: false }, { status: 404 })

    await prisma.lead.create({
      data: {
        profileId: profile.id,
        email: data.email.toLowerCase(),
        name: data.name || null,
        message: data.message || null,
        consent: true,
        source: "form",
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[api/leads]", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
