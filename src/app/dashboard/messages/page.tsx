import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { MessageList, type MessageItem } from "@/components/dashboard/MessageList"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function MessagesPage({ searchParams }: { searchParams: { profile?: string } }) {
  const user = await requireUser()

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true, _count: { select: { leads: { where: { readAt: null } } } } },
  })

  const selected = profiles.find((p) => p.id === searchParams.profile)

  const leads = await prisma.lead.findMany({
    where: { profile: { userId: user.id, ...(selected ? { id: selected.id } : {}) } },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { profile: { select: { id: true, slug: true, title: true } } },
  })

  const messages: MessageItem[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    message: l.message,
    readAt: l.readAt?.toISOString() ?? null,
    createdAt: l.createdAt.toISOString(),
    profile: l.profile,
  }))

  const totalUnread = profiles.reduce((sum, p) => sum + p._count.leads, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Messages reçus via le formulaire de contact de vos pages.</p>
      </div>

      {profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/messages"
            className={cn("rounded-full border px-3 py-1 text-sm", !selected ? "bg-foreground text-background" : "hover:bg-muted")}
          >
            Tous{totalUnread > 0 && ` (${totalUnread})`}
          </Link>
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/messages?profile=${p.id}`}
              className={cn("rounded-full border px-3 py-1 text-sm", selected?.id === p.id ? "bg-foreground text-background" : "hover:bg-muted")}
            >
              {p.title || p.slug}{p._count.leads > 0 && ` (${p._count.leads})`}
            </Link>
          ))}
        </div>
      )}

      <MessageList messages={messages} profileId={selected?.id} />
    </div>
  )
}
