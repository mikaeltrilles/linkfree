#!/usr/bin/env bash
# Sauvegarde quotidienne de LinkFree (cron serveur à 2 h 10, supervisé par Cronify : « LinkFree » / « Sauvegarde »).
# Dump MySQL cohérent (--single-transaction) + .env, dans ~/linkfree-backups/AAAA-MM-JJ.tar.gz (hors du dossier
# synchronisé par deploy.sh, dont rsync --delete effacerait les archives). Rotation locale : RETENTION_JOURS (14).
# Puis copie chiffrée sur pcloud-chiffre:Sauvegardes/linkfree.tmktools.com (60 jours). Aucun fichier déposé :
# les images des projets sont des URL externes, public/ ne contient que les icônes du build.
set -euo pipefail
RETENTION_JOURS="${1:-14}"
APP="$HOME/linkfree.tmktools.com"
DEST="$HOME/linkfree-backups"
REMOTE="pcloud-chiffre:Sauvegardes/linkfree.tmktools.com"
umask 077
mkdir -p "$DEST"; chmod 700 "$DEST"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT

# Identifiants lus dans DATABASE_URL (mysql://user:pass@host:port/base), passés par fichier pour rester hors de ps.
URL="$(grep -m1 '^DATABASE_URL=' "$APP/.env" | cut -d= -f2- | tr -d '"'"'")"
/opt/alt/alt-nodejs22/root/usr/bin/node -e '
const u = new URL(process.argv[1]), d = decodeURIComponent;
console.log(`[client]\nuser=${d(u.username)}\npassword="${d(u.password)}"\nhost=${u.hostname}\nport=${u.port || 3306}`);
console.log(`#db=${u.pathname.slice(1)}`);' "$URL" > "$T/my.cnf"
DB="$(sed -n 's/^#db=//p' "$T/my.cnf")"

mkdir "$T/a"
mysqldump --defaults-file="$T/my.cnf" --no-tablespaces --single-transaction --routines "$DB" > "$T/a/$DB.sql"
grep -q 'CREATE TABLE `User`' "$T/a/$DB.sql" || { echo "❌ dump incomplet (table User absente)"; exit 1; }
cp -a "$APP/.env" "$T/a/"
ARCHIVE="$DEST/$(date +%F).tar.gz"
tar -czf "$ARCHIVE.tmp" -C "$T/a" . && mv "$ARCHIVE.tmp" "$ARCHIVE"

find "$DEST" -maxdepth 1 -name '*.tar.gz' -mtime +"$RETENTION_JOURS" -delete
echo "[$(date '+%F %T')] ✅ $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

# « copy » et non « sync » : une archive effacée ici (serveur vidé, compromis) ne l'est jamais sur pCloud.
"$HOME/bin/rclone" copy "$DEST" "$REMOTE" --include '*.tar.gz'
"$HOME/bin/rclone" delete "$REMOTE" --min-age "${RETENTION_PCLOUD_JOURS:-60}d"
echo "[$(date '+%F %T')] ☁️  copié sur $REMOTE (60 jours conservés)"
