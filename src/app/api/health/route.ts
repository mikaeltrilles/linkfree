import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** Sonde utilisée par le keepalive PM2 : vérifie aussi l'accès à la base. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: "up" })
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 })
  }
}
