import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Link2, BarChart3, Settings, Plus } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/profiles", label: "Profils", icon: Link2 },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-muted/30 lg:block">
        <div className="flex h-16 items-center gap-2 px-6 font-bold text-lg">
          <Link2 className="h-5 w-5 text-brand-500" />
          Linkfree
        </div>
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
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
          <span className="text-sm font-medium text-muted-foreground lg:hidden">
            Linkfree
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="sm">Déconnexion</Button>
            </Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
