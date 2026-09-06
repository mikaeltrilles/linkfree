import { NextResponse } from "next/server"
import { getPublicProfile } from "@/lib/public-profile"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const profile = await getPublicProfile(params.slug)
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // On n'expose que les champs publics (pas de webhook, pixels, userId…).
  const { userId, webhookUrl, pixelConfig, customDomain, ...publicFields } = profile
  return NextResponse.json(publicFields, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  })
}
