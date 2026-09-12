# 9. Journal de travail

## 2026-09-06 — Reprise, correction, réseaux sociaux + projets, mise en production

### Constat initial
- Dépôt git dans `project/` sur la branche `dev`, avec des modifications non commitées (auth par mot de passe, inscription, compte admin) et de nombreux fichiers en CRLF.
- Production `https://linkfree.tmktools.com` en **502** : aucun processus Node en vie, et le client Prisma généré (`debian-openssl-1.1.x`) incompatible avec le serveur cPanel (`debian-openssl-1.0.x`).
- Fonctionnellement : impossible de publier un profil, liens hors section invisibles, épinglage non désactivable, liens de navigation cassés, vues de page jamais comptées.
- Sécurité : Next.js 14.1.0 vulnérable, server actions sans contrôle de propriété, cookies d'authentification écrasés par `proxy.php`.

### Travail réalisé
1. **Base** : normalisation LF, `.gitattributes`, réinstallation des dépendances, Next 14.2.35, PM2 en devDependency.
2. **Schéma** : modèles `SocialLink` et `Project`, `binaryTargets` pour cPanel. Synchronisation par `prisma db push` (la migration SQLite historique n'est plus utilisée).
3. **Auth** : découpage `auth.config.ts` (Edge) / `auth.ts` (Node + Prisma), bouton Google conditionnel, messages d'erreur, déconnexion par action serveur, inscription qui renvoie des erreurs lisibles.
4. **Server actions** : réécriture complète avec `requireUserId()` + `assert*Owner()` ; retour `{ ok, error }` affiché dans les formulaires ; réordonnancement limité aux éléments du profil.
5. **Dashboard** : page d'édition en quatre blocs (Réseaux sociaux, Liens, Projets, Sections) avec un composant `SortableList` partagé ; bascule Publié/Brouillon ; page « Mes profils » ; paramètres enrichis ; statistiques (vues, clics liens/projets, appareils, contacts).
6. **Page publique** : lecture directe en base, redirection du mode urgence, rangée d'icônes sociales, grille de projets, tracker de vues, boutons en `<a>` natif avec `sendBeacon`.
7. **Hébergement** : `proxy.php` corrigé, `.htaccess` (statique + protection des sources), `server.js`, `ecosystem.config.js`, `scripts/keepalive.sh`, `scripts/server-deploy.sh`, `deploy.sh`, `/api/health`.
8. **Tests locaux** : MySQL 8 éphémère, `prisma db push`, seed, `next build`, serveur en mode production ; vérifié : pages publiques (200/404), QR, API profil, connexion (bon et mauvais mot de passe), dashboard, événements (vue, clic lien, clic projet), lead + honeypot.

### Mise en production (2026-09-06)
- Premier essai de build sur le serveur : `spawn EAGAIN` pendant « Collecting page data » (limite de processus CloudLinux). Le build est désormais fait en local par `deploy.sh` et `.next` est synchronisé.
- `prisma db push` a créé `SocialLink`, `Project` et `User.password` sur MySQL sans perte de données ; seed exécuté (profil `/p/demo` enrichi).
- PM2 : application `linkfree` (port 3000) sauvegardée ; cron keepalive installé (`*/5 * * * *`).
- Server actions en 500 « Failed to parse body as FormData » derrière le proxy : PHP consommait le corps multipart. Corrigé par `.user.ini` (`enable_post_data_reading = Off`) et un secours dans `proxy.php`. Validé par une soumission du formulaire de connexion (server action) : mauvais mot de passe → redirection d'erreur, bon mot de passe → session et dashboard.
- Vérifié en HTTPS : accueil, `/p/demo`, `/api/health`, `/api/profiles/demo`, connexion, redirection du dashboard, fichiers `/_next/static` servis par Apache avec cache immutable, sources et `.env` inaccessibles.

### Procédure de déploiement
```bash
cd project
./deploy.sh          # build local, rsync vers o2switch, scripts/server-deploy.sh
```
Sur le serveur : `npx pm2 ls`, logs dans `~/linkfree.tmktools.com/logs/`, cron keepalive toutes les 5 min.

### Suite du 2026-09-06 — profil personnel, messages et notifications
- Profil `/p/mikaeltrilles` créé et peuplé depuis le portfolio tmktools.com et les README des projets (9 réseaux, 3 liens, 12 projets). Script de peuplement non commité (données personnelles).
- Mot de passe du compte personnel défini en base (hash scrypt de l'application).
- Page Messages du dashboard + notification email (SMTP local 127.0.0.1:25, comme les autres applications du serveur) et Telegram optionnel.

### 2026-09-12 — temps de chargement et projets
- Mesures : TTFB Node 50 ms, via proxy PHP ~250 ms, donc le ressenti venait du client : page invisible jusqu'à l'hydratation (framer-motion), animations en cascade, avatar PNG de 1 Mo affiché en 96 px.
- Correctifs : animations CSS sans JS, framer-motion retiré, images via next/image + sharp (glibc 2.28 sur le serveur, compatible), icône SVG.
- Profil : ajout de HNR (mis en avant), OTI et rss.tmktools.com ; Cronify écarté (pas en ligne, fork sans commit).

### 2026-09-13 — transfert des messages vers Gmail
- Les notifications partaient de `noreply@linkfree.tmktools.com` sans boîte réelle ni authentification : risque de rejet ou de spam chez Gmail.
- Boîte `noreply@linkfree.tmktools.com` créée dans cPanel (uapi `Email add_pop`, quota 100 Mo) ; DKIM et SPF du sous-domaine valides.
- `.env` du serveur : `NOTIFY_EMAIL_TO=mikaeltrilles@gmail.com`, `MAIL_FROM`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASSWORD` (mot de passe généré sur le serveur, jamais affiché). Sauvegarde `.env.bak-*` conservée.
- Vérifié : envoi authentifié accepté (`250 OK`), message reçu dans `tmk@tmktools.com` avec l'expéditeur attendu, aucun retour d'erreur dans la boîte `noreply`. L'API cPanel EmailTrack n'est pas disponible sur cet hébergement : la remise finale chez Gmail se constate dans la boîte.

### 2026-09-13 — mot de passe et profil (hors dépôt)
- Mot de passe du compte mikaeltrilles@gmail.com défini en base (hash scrypt), vérifié par une connexion réelle.
- Profil `/p/mikaeltrilles` porté à 18 projets (HNR et TMK CRM mis en avant).

### 2026-09-13 — crash à la suppression d'un message, modale de confirmation
- Cause : `await action()` dans `startTransition` ; la revalidation remplaçait l'arbre et la promesse se résolvait sans valeur. Corrigé dans MessageList (action attendue hors transition) et durci dans `useEditorList`.
- `window.confirm` / `alert` retirés du dashboard au profit d'une modale Radix partagée.

### 2026-09-13 — consignation
- Guide d'exploitation `docs/10-exploitation.md` : emplacements, comptes, déploiement, redémarrage, chaîne HTTP, variables du `.env`, messages, dépannage, historique des versions.

### Reste à faire (pistes)
- Upload d'images (avatar, projets) plutôt que des URL.
- Thèmes et mode sombre de la page publique.
- Export CSV des messages, courbes de trafic, tests A/B côté interface.
- Rate limiting sur `/api/events` et `/api/leads`.
