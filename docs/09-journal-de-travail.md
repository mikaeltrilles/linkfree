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

### Procédure de déploiement
```bash
cd project
./deploy.sh          # rsync vers o2switch puis scripts/server-deploy.sh
```
Sur le serveur : `npx pm2 ls`, logs dans `~/linkfree.tmktools.com/logs/`, cron keepalive toutes les 5 min.

### Reste à faire (pistes)
- Upload d'images (avatar, projets) plutôt que des URL.
- Thèmes et mode sombre de la page publique.
- Export CSV des leads, courbes de trafic, tests A/B côté interface.
- Rate limiting sur `/api/events` et `/api/leads`.
