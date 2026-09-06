import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getClientIp, getDevice, hashIp } from "@/lib/analytics"

export const dynamic = "force-dynamic"

const eventSchema = z.object({
  profileId: z.string().min(1),
  linkId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  type: z.enum(["CLICK", "IMPRESSION", "PROJECT_CLICK"]),
})

export async function POST(req: NextRequest) {
  try {
    const data = eventSchema.parse(await req.json())

    const h = headers()
    const userAgent = h.get("user-agent") || ""
    const referrer = h.get("referer") || null
    const ipHash = hashIp(getClientIp(h), new Date().toISOString().slice(0, 10))
    const device = getDevice(userAgent)

    const profile = await prisma.profile.findFirst({
      where: { id: data.profileId, status: "PUBLISHED" },
      select: { id: true },
    })
    if (!profile) return NextResponse.json({ ok: false }, { status: 404 })

    if (data.type === "IMPRESSION") {
      // Une vue par visiteur (ipHash journalier) et par profil, toutes les 30 min.
      const recent = await prisma.pageView.findFirst({
        where: {
          profileId: profile.id,
          ipHash,
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
        select: { id: true },
      })
      if (!recent) {
        await prisma.pageView.create({
          data: {
            profileId: profile.id,
            ipHash,
            userAgent: userAgent.slice(0, 255),
            referrer: referrer?.slice(0, 255) ?? null,
            device,
          },
        })
      }
      return NextResponse.json({ ok: true })
    }

    if (data.type === "CLICK" && data.linkId) {
      const link = await prisma.link.findFirst({
        where: { id: data.linkId, profileId: profile.id },
        select: { id: true },
      })
      if (!link) return NextResponse.json({ ok: false }, { status: 404 })

      await prisma.$transaction([
        prisma.linkEvent.create({
          data: { profileId: profile.id, linkId: link.id, type: "CLICK", ipHash, device },
        }),
        prisma.link.update({ where: { id: link.id }, data: { clickCount: { increment: 1 } } }),
      ])
      return NextResponse.json({ ok: true })
    }

    if (data.type === "PROJECT_CLICK" && data.projectId) {
      await prisma.project.updateMany({
        where: { id: data.projectId, profileId: profile.id },
        data: { clickCount: { increment: 1 } },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false }, { status: 400 })
  } catch (error) {
    console.error("[api/events]", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
