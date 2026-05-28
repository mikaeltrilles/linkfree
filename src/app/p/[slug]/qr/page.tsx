import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

export default async function QRPage({ params }: { params: { slug: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
  })

  if (!profile || profile.status !== "PUBLISHED") notFound()

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://linkfree.app"}/p/${profile.slug}`

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold">{profile.title || profile.slug}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Scannez ce QR code pour visiter la page</p>
        <div className="mt-6 inline-block rounded-2xl bg-white p-4 shadow-lg">
          <QRCodeSVG value={url} size={240} level="M" includeMargin />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{url}</p>
      </div>
    </div>
  )
}
