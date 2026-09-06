#!/bin/bash
# keepalive.sh — à installer en cron SUR LE SERVEUR (toutes les 5 minutes) :
#   */5 * * * * /home/vote1550/linkfree.tmktools.com/scripts/keepalive.sh >> /home/vote1550/linkfree.tmktools.com/logs/keepalive.log 2>&1
#
# Sur l'hébergement mutualisé, le démon PM2 peut être tué. Ce script vérifie
# que l'application répond sur son port et la relance sinon.
APP_DIR="${APP_DIR:-$HOME/linkfree.tmktools.com}"
PORT="${PORT:-3000}"
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

cd "$APP_DIR" || exit 1
mkdir -p logs

if curl -s -m 10 -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/api/health" | grep -q '^200$'; then
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Port ${PORT} muet — relance de linkfree via PM2"
if npx pm2 startOrRestart ecosystem.config.js --update-env >/dev/null 2>&1; then
  npx pm2 save >/dev/null 2>&1
  sleep 8
  CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/api/health")
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Relance effectuée — HTTP ${CODE}"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Échec de la relance PM2"
  exit 1
fi
