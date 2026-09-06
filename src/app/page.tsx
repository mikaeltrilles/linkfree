import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Link2,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Smartphone,
  Layers,
  Clock,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Link2 className="h-6 w-6 text-brand-500" />
            Linkfree
          </div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Fonctionnalités</Link>
            <Link href="#how" className="text-muted-foreground hover:text-foreground">Comment ça marche</Link>
            <Link href="/p/demo" className="text-muted-foreground hover:text-foreground">Démo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="sm">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Votre audience mérite{" "}
            <span className="text-brand-500">mieux qu&apos;une liste de liens</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Linkfree centralise vos liens, convertit vos visiteurs et optimise votre
            présence en ligne grâce à des outils intelligents pensés pour les
            créateurs, freelances et marques ambitieuses.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signin">
              <Button size="lg" className="gap-2">
                Créer ma page gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/p/demo">
              <Button size="lg" variant="outline">Voir un exemple</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Tout ce dont vous avez besoin</h2>
          <p className="mt-4 text-muted-foreground">
            Des fonctionnalités pensées pour convertir, pas juste afficher.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "Réseaux & projets",
              desc: "Vos icônes de réseaux sociaux sous la bio, vos projets en cartes avec image, tags et lien vers le code.",
            },
            {
              icon: Zap,
              title: "Smart Sections",
              desc: "Affichez des blocs conditionnels selon l'heure, le pays ou le device de vos visiteurs.",
            },
            {
              icon: BarChart3,
              title: "Analytics actionnables",
              desc: "Vues, clics, CTR, répartition device — et des suggestions IA pour optimiser.",
            },
            {
              icon: Globe,
              title: "SEO performant",
              desc: "Pages statiques générées par Next.js, méta-données riches, indexation optimale.",
            },
            {
              icon: Shield,
              title: "Conversion native",
              desc: "RDV, formulaires, WhatsApp, tips et mini-commerce intégrés — sans lien externe.",
            },
            {
              icon: Smartphone,
              title: "Mobile-first",
              desc: "Design pensé pour le mobile. Vos visiteurs viennent majoritairement de leur téléphone.",
            },
            {
              icon: Layers,
              title: "A/B Testing",
              desc: "Testez deux variantes de bouton et gardez le gagnant automatiquement.",
            },
            {
              icon: Clock,
              title: "Programmation",
              desc: "Planifiez la publication et l'expiration de vos liens à l'avance.",
            },
            {
              icon: Link2,
              title: "Multi-profil",
              desc: "Gérez plusieurs pages publiques depuis un seul compte — idéal pour les agences.",
            },
            {
              icon: ArrowRight,
              title: "Domaine perso",
              desc: "Connectez votre propre nom de domaine pour une expérience de marque complète.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-6 shadow-card transition hover:shadow-card-hover"
            >
              <f.icon className="h-8 w-8 text-brand-500" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Comment ça marche</h2>
          <p className="mt-4 text-muted-foreground">De l'idée à la page publique en 3 minutes.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Créez votre profil",
              desc: "Choisissez un slug, ajoutez votre photo, votre bio et votre couverture.",
            },
            {
              step: "02",
              title: "Ajoutez vos liens",
              desc: "Liens sociaux, portfolio, prise de RDV, produits — tout est centralisé.",
            },
            {
              step: "03",
              title: "Publiez et convertissez",
              desc: "Partagez votre lien unique. Analysez et optimisez avec les outils intégrés.",
            },
          ].map((s) => (
            <div key={s.step} className="relative rounded-2xl border bg-muted/30 p-8">
              <span className="text-4xl font-bold text-brand-200">{s.step}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl bg-brand-600 px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Prêt à transformer votre link-in-bio ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Rejoignez les créateurs et freelances qui utilisent Linkfree pour centraliser,
            convertir et analyser leur audience.
          </p>
          <div className="mt-8">
            <Link href="/auth/signin">
              <Button size="lg" variant="secondary" className="gap-2">
                Créer ma page gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-semibold">
              <Link2 className="h-5 w-5 text-brand-500" />
              Linkfree
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Linkfree. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
