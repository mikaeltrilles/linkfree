import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

// Instance Edge-safe : pas d'adapter Prisma, uniquement la lecture du JWT.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isDashboard = nextUrl.pathname.startsWith("/dashboard")
  const isAuthPage = nextUrl.pathname.startsWith("/auth")

  if (isDashboard && !isLoggedIn) {
    const url = new URL("/auth/signin", nextUrl)
    url.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
