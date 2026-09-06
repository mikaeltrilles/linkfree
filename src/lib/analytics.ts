import "server-only"
import { createHash } from "crypto"

/** Hash d'IP anonymisé (sel journalier) : impossible de retrouver l'IP. */
export function hashIp(ip: string, salt: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "linkfree"
  return createHash("sha256").update(`${ip}|${salt}|${secret}`).digest("hex").slice(0, 32)
}

export function getDevice(userAgent: string): string {
  if (/ipad|tablet/i.test(userAgent)) return "tablet"
  if (/mobile|android|iphone/i.test(userAgent)) return "mobile"
  return "desktop"
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") ?? "unknown"
}
