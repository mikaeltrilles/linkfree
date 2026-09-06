import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("base64")
  const hash = scryptSync(plain, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 128 * 1024 * 1024,
  }).toString("base64")
  return `${salt}:${hash}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const expected = scryptSync(plain, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 128 * 1024 * 1024,
  })
  const actual = Buffer.from(hash, "base64")
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}
