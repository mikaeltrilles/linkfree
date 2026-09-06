export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

export function fail(error: unknown): ActionResult {
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Une erreur est survenue." }
}

export function firstZodMessage(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Données invalides"
}

export function str(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

export function optional(formData: FormData, key: string): string | null {
  const v = str(formData, key)
  return v === "" ? null : v
}
