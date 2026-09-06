"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ActionResult } from "@/lib/actions/types"

/**
 * État local d'un éditeur de liste synchronisé avec les données serveur :
 * - `items` suit `initialItems` à chaque rafraîchissement (router.refresh)
 * - `run` exécute une server action, affiche l'erreur éventuelle et rafraîchit
 */
export function useEditorList<T extends { id: string }>(initialItems: T[]) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  async function run(action: () => Promise<ActionResult>, onSuccess?: () => void): Promise<boolean> {
    setError(null)
    const result = await action()
    if (!result.ok) {
      setError(result.error)
      return false
    }
    onSuccess?.()
    startTransition(() => router.refresh())
    return true
  }

  return { items, setItems, error, setError, pending, run }
}
