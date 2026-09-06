# Linkfree

Votre hub intelligent et actionnable. Plateforme link-in-bio moderne pour créateurs, freelances et marques : liens, réseaux sociaux, projets, formulaire de contact et statistiques sur une seule page.

Production : https://linkfree.tmktools.com — démo : https://linkfree.tmktools.com/p/demo

## Fonctionnalités

- **Profils** multiples par compte, slug personnalisé, publication brouillon/publié, mode urgence (redirection).
- **Liens** : boutons ordonnables par glisser-déposer, épinglage, sections, masquage, formulaire de contact natif (`#contact-form`).
- **Réseaux sociaux** : icônes sous la bio (GitHub, LinkedIn, X, Instagram, YouTube, TikTok, Discord, WhatsApp, email…), détection automatique de la plateforme.
- **Projets** : cartes avec description, lien, dépôt de code, image, tags, mise en avant et compteur de clics.
- **Statistiques** : vues (dédupliquées), clics par lien et par projet, CTR, appareils, contacts reçus.
- **Auth** : email + mot de passe (scrypt), Google OAuth optionnel, inscription désactivable.
- **QR code** et métadonnées Open Graph par profil.

## Stack

- Next.js 14 (App Router, server actions) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- Prisma 5 + MySQL / MariaDB
- Auth.js v5 (JWT)
- PM2 derrière un proxy PHP sur hébergement cPanel (ou Docker)

## Démarrage local

```bash
npm install
cp .env.example .env        # DATABASE_URL, NEXTAUTH_SECRET…
npx prisma generate
npm run db:push             # crée / synchronise les tables
npm run db:seed             # profil démo /p/demo (compte demo@linkfree.tmktools.com)
npm run db:admin            # compte admin depuis ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

Scripts utiles : `npm run typecheck`, `npm run build`, `npm run db:studio`.

## Déploiement (cPanel / o2switch)

```bash
./deploy.sh
```

Le script synchronise les sources par rsync (hors `node_modules`, `.next`, `.env`) puis exécute `scripts/server-deploy.sh` sur le serveur : `npm ci`, `prisma generate`, `prisma db push`, `next build`, redémarrage PM2 (`ecosystem.config.js`). Le fichier `.env` du serveur n'est jamais écrasé.

Apache transmet toutes les requêtes à `proxy.php`, qui relaie vers Node sur `127.0.0.1:3000` ; les fichiers `/_next/static` sont servis directement. `scripts/keepalive.sh` (cron toutes les 5 minutes) relance l'application si `/api/health` ne répond plus.

## Docker

```bash
docker compose up --build
```

## Structure

```
project/
├── src/
│   ├── app/                    # Routes (App Router)
│   │   ├── page.tsx            # Landing
│   │   ├── p/[slug]/           # Page publique (+ /qr)
│   │   ├── auth/               # Connexion, inscription
│   │   ├── dashboard/          # Dashboard, profils, paramètres, statistiques
│   │   └── api/                # health, events, leads, profiles, auth
│   ├── components/
│   │   ├── public/             # ProfileShell, LinkButton, SocialRow, ProjectCard…
│   │   ├── dashboard/          # Éditeurs (liens, réseaux, projets, sections)
│   │   └── ui/                 # shadcn/ui
│   └── lib/
│       ├── actions/            # Server actions (vérification de propriété)
│       ├── auth.ts / auth.config.ts
│       ├── public-profile.ts   # Chargement d'un profil publié
│       └── social-platforms.ts # Catalogue des réseaux
├── prisma/schema.prisma
├── scripts/                    # keepalive.sh, server-deploy.sh
├── proxy.php, .htaccess, server.js, ecosystem.config.js
└── deploy.sh
```

## Documentation

- `CHANGELOG.md` — évolutions par version
- `docs/09-journal-de-travail.md` — journal des interventions

## Licence

MIT — libre d'utilisation, modification et distribution.
