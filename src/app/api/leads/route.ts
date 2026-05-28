import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const leadSchema = z.object({
  profileId: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = leadSchema.parse(body)

    if (!data.consent) {
      return NextResponse.json(
        { ok: false, error: "Consentement requis" },
        { status: 400 }
      )
    }

    await prisma.lead.create({
      data: {
        profileId: data.profileId,
        email: data.email,
        name: data.name || null,
        message: data.message || null,
        consent: true,
        source: "form",
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
