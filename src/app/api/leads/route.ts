import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { notifyNewLead } from "@/lib/notify"

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
      select: { id: true, slug: true, title: true, user: { select: { email: true } } },
    })
    if (!profile) return NextResponse.json({ ok: false }, { status: 404 })

    // Anti-abus simple : 5 messages max par email et par profil sur 10 minutes.
    const recent = await prisma.lead.count({
      where: {
        profileId: profile.id,
        email: data.email.toLowerCase(),
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    })
    if (recent >= 5) return NextResponse.json({ ok: false, error: "Trop de messages" }, { status: 429 })

    const lead = await prisma.lead.create({
      data: {
        profileId: profile.id,
        email: data.email.toLowerCase(),
        name: data.name?.trim() || null,
        message: data.message?.trim() || null,
        consent: true,
        source: "form",
      },
    })

    // La notification ne doit jamais faire échouer l'enregistrement.
    await notifyNewLead({ lead, profile, ownerEmail: profile.user.email })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[api/leads]", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
