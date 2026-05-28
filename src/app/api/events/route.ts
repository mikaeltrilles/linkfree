import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { headers } from "next/headers"
import { hashIp } from "@/lib/utils"

const eventSchema = z.object({
  profileId: z.string().cuid(),
  linkId: z.string().cuid().optional(),
  type: z.enum(["CLICK", "IMPRESSION"]),
})

function getDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile"
  if (/tablet/i.test(userAgent)) return "tablet"
  return "desktop"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = eventSchema.parse(body)

    const h = headers()
    const forwardedFor = h.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"
    const userAgent = h.get("user-agent") || ""
    const referrer = h.get("referer") || ""
    const ipHash = hashIp(ip, new Date().toISOString().slice(0, 10))

    if (data.type === "CLICK" && data.linkId) {
      await prisma.linkEvent.create({
        data: {
          profileId: data.profileId,
          linkId: data.linkId,
          type: "CLICK",
          ipHash,
          device: getDevice(userAgent),
        },
      })
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
