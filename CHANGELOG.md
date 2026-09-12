# Changelog

Toutes les évolutions notables du projet sont consignées ici.

## [0.9.3] — 2026-09-13

### Corrections
- Page Messages : la suppression d'un message provoquait « Application error: a client-side exception » (`Cannot read properties of undefined (reading 'ok')`). L'action serveur était attendue à l'intérieur d'une transition React : quand la revalidation remplaçait l'arbre, sa valeur de retour était perdue. L'action est désormais attendue avant la transition de rafraîchissement, et tous les éditeurs tolèrent un retour vide.

### Interface
- Les boîtes de confirmation du navigateur (`window.confirm`, `alert`) sont remplacées par une modale intégrée (`ConfirmProvider` / `useConfirm`) : suppression de message, lien, réseau, projet, section et profil, avec titre, explication des conséquences et bouton rouge. Le bouton Publié/Brouillon affiche son erreur en ligne.

## [0.9.2] — 2026-09-12

### Performance de la page publique
- **Contenu visible dès le HTML** : framer-motion retiré de la page publique (la page entière démarrait en opacité 0 jusqu'à l'hydratation JavaScript, puis chaque carte attendait son tour d'animation, jusqu'à 1,5 s pour la dernière). Les apparitions sont désormais des animations CSS (`Reveal`), plafonnées à 450 ms, et désactivées si l'utilisateur préfère réduire les animations.
- **JavaScript** : bundle propre à `/p/[slug]` de 44 kB à 11 kB, First Load de 149 kB à 115 kB. Dépendance framer-motion supprimée.
- **Images** : avatar, images de projets et de produits passent par `next/image` avec `sharp` : redimensionnement à la taille affichée, WebP/AVIF, cache disque 7 jours. L'avatar du profil principal (PNG 1080 px, 1 Mo) est servi en ~6 ko.
- `.htaccess` : fichiers de `public/` servis directement par Apache ; icône SVG de l'application.

## [0.9.1] — 2026-09-06

### Nouveautés
- **Messages** : nouvelle page `/dashboard/messages` listant tous les messages reçus via le formulaire de contact (contenu complet, non lus en premier, filtre par profil, marquer lu/non lu, tout marquer comme lu, supprimer, bouton Répondre). Badge de non-lus dans la barre latérale, l'en-tête et la page d'édition du profil.
- **Notification** à chaque nouveau message : email au propriétaire du profil (SMTP local de l'hébergeur par défaut, `NOTIFY_EMAIL_TO`, `MAIL_FROM` et `SMTP_*` pour surcharger) et Telegram si `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` sont renseignés. L'échec d'une notification n'empêche jamais l'enregistrement du message.
- Champ `Lead.readAt` (schéma), limite de 5 messages par email et par profil sur 10 minutes.

### Technique
- `@auth/prisma-adapter` 1.6 → 2.11.2 pour s'aligner sur le `@auth/core` de next-auth, ce qui permet d'installer `nodemailer` 7.

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
- `proxy.php` : conservation de tous les `Set-Cookie` (Auth.js en émet plusieurs, seul le dernier survivait), en-têtes `X-Forwarded-*`, timeouts. Les corps `multipart/form-data` (toutes les server actions) arrivaient vides car PHP les consomme avant `php://input` : `.user.ini` désactive `enable_post_data_reading` et le proxy reconstruit le corps depuis `$_POST`/`$_FILES` en secours.
- `next.config.mjs` : `serverActions.allowedOrigins` pour le domaine public derrière le proxy.
- `.htaccess` : fichiers `/_next/static` servis directement par Apache avec cache immutable.
- Gestion du processus par PM2 (`ecosystem.config.js`) + `scripts/keepalive.sh` en cron toutes les 5 minutes.
- `deploy.sh` : build Next.js effectué en local avec les variables publiques de production (l'hébergement mutualisé refuse les processus que `next build` lance : `spawn EAGAIN`), puis rsync des sources et de `.next` → `scripts/server-deploy.sh` (npm ci, prisma generate pour la plateforme du serveur, db push, PM2).
- `server.js` : écoute sur 127.0.0.1, ignore les `ECONNRESET` du proxy.
- Docker : image sans `standalone`, MariaDB dans `docker-compose.yml` (le schéma est MySQL).

### Divers
- Seed idempotent enrichi (réseaux, projets, sections, formulaire de contact) et compte démo avec mot de passe.
- Scripts npm : `db:push`, `typecheck`, `deploy`.
