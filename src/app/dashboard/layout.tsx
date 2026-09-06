import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/dashboard/SignOutButton"
import { LayoutDashboard, Link2, Plus, Mail } from "lucide-react"
import { countUnreadLeads } from "@/lib/leads"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const unread = await countUnreadLeads(session.user.id)

  const nav = [
    { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, badge: 0 },
    { href: "/dashboard/profiles", label: "Mes profils", icon: Link2, badge: 0 },
    { href: "/dashboard/messages", label: "Messages", icon: Mail, badge: unread },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-muted/30 lg:block">
        <Link href="/" className="flex h-16 items-center gap-2 px-6 text-lg font-bold">
          <Link2 className="h-5 w-5 text-brand-500" />
          Linkfree
        </Link>
        <nav className="px-4 py-4">
          <div className="mb-4">
            <Link href="/dashboard/profiles/new">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Nouveau profil
              </Button>
            </Link>
          </div>
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <Link2 className="h-5 w-5 text-brand-500" />
              Linkfree
            </Link>
            <Link href="/dashboard/profiles" className="text-sm text-muted-foreground hover:text-foreground">
              Profils
            </Link>
            <Link href="/dashboard/messages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Messages
              {unread > 0 && <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard/messages" className="relative hidden lg:block" title="Messages">
              <Mail className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              {unread > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
