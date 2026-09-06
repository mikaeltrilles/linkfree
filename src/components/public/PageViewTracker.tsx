"use client"

import { useEffect } from "react"

/** Enregistre une vue de page (dédupliquée côté serveur par visiteur). */
export function PageViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, type: "IMPRESSION" }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {})
    return () => controller.abort()
  }, [profileId])

  return null
}
