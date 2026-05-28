# Linkfree

Votre hub intelligent et actionnable. Plateforme link-in-bio moderne pour créateurs, freelances et marques.

## Stack

- **Front** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI** : shadcn/ui + Framer Motion
- **Back** : Next.js API Routes + Prisma
- **DB** : PostgreSQL
- **Auth** : NextAuth.js (Google + Magic Link)
- **Storage** : Supabase Storage / S3-compatible
- **Paiement** : Stripe-ready

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# 3. Initialiser la base de données
npx prisma migrate dev --name init
npx prisma generate

# 4. Lancer le serveur de développement
npm run dev
```

## Self-hosting avec Docker

```bash
docker-compose up --build
```

## Structure du projet

```
project/
├── src/
│   ├── app/                 # Routes Next.js (App Router)
│   │   ├── (public)/
│   │   │   ├── page.tsx       # Landing page
│   │   │   └── p/[slug]/      # Page profil publique
│   │   ├── dashboard/         # Dashboard admin
│   │   ├── api/               # API routes
│   │   └── auth/              # Pages d'authentification
│   ├── components/
│   │   ├── public/            # Composants page profil
│   │   ├── dashboard/         # Composants dashboard
│   │   └── ui/                # Composants shadcn/ui
│   ├── lib/
│   │   ├── prisma.ts          # Singleton Prisma
│   │   ├── auth.ts            # Config NextAuth
│   │   └── utils.ts           # Helpers
│   └── types/
│       └── index.ts           # Types globaux
├── prisma/
│   └── schema.prisma          # Schème de base de données
├── docker-compose.yml
└── Dockerfile
```

## Licence

MIT — libre d'utilisation, modification et distribution.
