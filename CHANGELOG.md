# Changelog

Toutes les évolutions notables du projet sont consignées ici.

## [0.9.0] — 2026-09-06

### Nouveautés
- **Réseaux sociaux** : nouveau modèle `SocialLink` (18 plateformes : GitHub, GitLab, LinkedIn, X, Instagram, Facebook, YouTube, TikTok, Twitch, Discord, Dribbble, Behance, Medium, Spotify, WhatsApp, Telegram, email, site web). Détection automatique de la plateforme à la saisie de l'URL, réordonnancement par glisser-déposer, masquage individuel. Affichés en rangée d'icônes sous la bio de la page publique.
- **Projets** : nouveau modèle `Project` (titre, description, lien, dépôt de code, image de couverture, tags, mise en avant, compteur de clics). Éditeur dédié dans le dashboard, cartes sur la page publique (carte élargie pour les projets mis en avant), suivi des clics.
- **Publication** : interrupteur « Publié / Brouillon » sur la page d'édition et dans les paramètres. Jusqu'ici aucun profil ne pouvait être publié depuis l'interface.
- **Sections** : éditeur (création, ordre, visibilité, suppression) et sélection de la section dans le formulaire de lien.
- **Paramètres du profil** : avatar (URL), couleur principale, bio multiligne, validation du slug (format, unicité, mots réservés), suppression du profil.
- **Statistiques** : enregistrement réel des vues de page (dédupliquées par visiteur sur 30 min), clics projets, répartition par appareil, derniers messages du formulaire de contact.
- **Dashboard** : page « Mes profils », compteurs liens/réseaux/projets, déconnexion par action serveur.
- **API** : `GET /api/health` (sonde PM2 + base de données), événement `PROJECT_CLICK`, honeypot anti-spam sur `/api/leads`.

### Corrections
- Page publique : les liens sans section disparaissaient dès qu'une section existait.
- Page publique : suppression du self-fetch HTTP vers sa propre API (source de 502 derrière le proxy), lecture directe en base ; mode urgence enfin appliqué (redirection).
- Édition d'un lien : impossible de retirer l'épinglage (case décochée ignorée).
- Éditeur de liens : la liste ne se rafraîchissait pas après création/suppression.
- Navigation dashboard : entrées « Profils », « Analytics », « Paramètres » menaient à des pages inexistantes (404).
- Formulaire de création de profil et d'inscription : les erreurs provoquaient une page d'erreur générique au lieu d'un message.
- Connexion : bouton Google affiché même sans identifiants OAuth configurés ; messages d'erreur explicites.
- Middleware : Prisma était importé dans le runtime Edge (instance Auth.js séparée, sans adapter).
- Fins de ligne CRLF normalisées en LF (`.gitattributes`), `tsconfig.tsbuildinfo` retiré du suivi git.

### Sécurité
- Next.js 14.1.0 → 14.2.35 (correctifs de sécurité, dont le contournement du middleware).
- Toutes les server actions vérifient désormais que la ressource appartient à l'utilisateur connecté (liens, sections, réseaux, projets, profils, tests A/B). Auparavant n'importe quel identifiant pouvait être modifié ou supprimé.
- `/api/ai/suggestions` exige une session et ne renvoie que les liens de l'utilisateur.
- `/api/profiles/[slug]` n'expose plus `userId`, `webhookUrl`, `pixelConfig`.
- Hash d'IP par SHA-256 salé (au lieu d'un base64 réversible).
- En-têtes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` ; `.htaccess` bloque l'accès direct aux sources, à `.env` et aux logs.

### Déploiement (cPanel o2switch)
- `prisma/schema.prisma` : `binaryTargets = ["native", "debian-openssl-1.0.x"]` — le client généré ne correspondait pas au serveur, l'application ne démarrait plus.
- `proxy.php` : conservation de tous les `Set-Cookie` (Auth.js en émet plusieurs, seul le dernier survivait), en-têtes `X-Forwarded-*`, timeouts.
- `next.config.mjs` : `serverActions.allowedOrigins` pour le domaine public derrière le proxy.
- `.htaccess` : fichiers `/_next/static` servis directement par Apache avec cache immutable.
- Gestion du processus par PM2 (`ecosystem.config.js`) + `scripts/keepalive.sh` en cron toutes les 5 minutes.
- `deploy.sh` : build Next.js effectué en local avec les variables publiques de production (l'hébergement mutualisé refuse les processus que `next build` lance : `spawn EAGAIN`), puis rsync des sources et de `.next` → `scripts/server-deploy.sh` (npm ci, prisma generate pour la plateforme du serveur, db push, PM2).
- `server.js` : écoute sur 127.0.0.1, ignore les `ECONNRESET` du proxy.
- Docker : image sans `standalone`, MariaDB dans `docker-compose.yml` (le schéma est MySQL).

### Divers
- Seed idempotent enrichi (réseaux, projets, sections, formulaire de contact) et compte démo avec mot de passe.
- Scripts npm : `db:push`, `typecheck`, `deploy`.
