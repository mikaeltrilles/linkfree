"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, MailOpen, Trash2, Reply, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormError } from "./FormError"
import { deleteLead, markAllLeadsRead, markLeadRead } from "@/lib/actions/leads"
import { cn } from "@/lib/utils"

export type MessageItem = {
  id: string
  name: string | null
  email: string
  message: string | null
  readAt: string | null
  createdAt: string
  profile: { id: string; slug: string; title: string | null }
}

export function MessageList({ messages, profileId }: { messages: MessageItem[]; profileId?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const unread = messages.filter((m) => !m.readAt).length

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) setError(result.error ?? "Erreur")
      router.refresh()
    })
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Aucun message pour le moment. Le formulaire de contact s&apos;affiche sur votre page via un lien dont l&apos;URL est <code>#contact-form</code>.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length > 1 ? "s" : ""}
          {unread > 0 && <> · <span className="font-medium text-foreground">{unread} non lu{unread > 1 ? "s" : ""}</span></>}
        </p>
        {unread > 0 && (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => markAllLeadsRead(profileId))}>
            <CheckCheck className="mr-2 h-4 w-4" />Tout marquer comme lu
          </Button>
        )}
      </div>

      <FormError message={error} />

      <ul className="space-y-3">
        {messages.map((m) => {
          const isUnread = !m.readAt
          const date = new Date(m.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
          return (
            <li
              key={m.id}
              className={cn(
                "rounded-xl border bg-card p-4 shadow-sm transition",
                isUnread && "border-l-4 border-l-brand-500"
              )}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUnread ? <Mail className="h-4 w-4 text-brand-500" /> : <MailOpen className="h-4 w-4 text-muted-foreground" />}
                    <p className={cn("truncate text-sm", isUnread ? "font-semibold" : "font-medium")}>{m.name || m.email}</p>
                    {isUnread && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase text-brand-700">Nouveau</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="text-brand-600 hover:underline">{m.email}</a>
                    {" · "}{date}
                    {!profileId && <> · via <span className="font-medium">{m.profile.title || m.profile.slug}</span></>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: votre message sur ${m.profile.title || m.profile.slug}`)}`}>
                    <Button variant="outline" size="sm"><Reply className="mr-2 h-4 w-4" />Répondre</Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={isUnread ? "Marquer comme lu" : "Marquer comme non lu"}
                    disabled={pending}
                    onClick={() => run(() => markLeadRead(m.id, isUnread))}
                  >
                    {isUnread ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    title="Supprimer"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`Supprimer le message de ${m.name || m.email} ?`)) return
                      run(() => deleteLead(m.id))
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {m.message && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">{m.message}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
