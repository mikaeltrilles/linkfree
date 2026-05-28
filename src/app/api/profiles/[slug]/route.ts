import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: {
      links: {
        where: { status: "ACTIVE" },
        orderBy: [{ isPinned: "desc" }, { priority: "asc" }],
      },
      sections: {
        orderBy: { priority: "asc" },
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!profile || profile.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
