#!/bin/bash
# server-deploy.sh — exécuté SUR LE SERVEUR après synchronisation des sources.
# Installe les dépendances, synchronise le schéma MySQL, build et (re)démarre PM2.
set -euo pipefail
APP_DIR="${APP_DIR:-$HOME/linkfree.tmktools.com}"
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
export NODE_ENV=production

cd "$APP_DIR"
mkdir -p logs

echo "[1/5] Dépendances (npm ci)…"
npm ci --no-audit --no-fund --include=dev

echo "[2/5] Client Prisma…"
npx prisma generate

echo "[3/5] Schéma base de données (prisma db push)…"
npx prisma db push --skip-generate

if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "[4/5] Build fourni par le poste local (.next synchronisé), étape ignorée."
else
  echo "[4/5] Build Next.js…"
  rm -rf .next
  npm run build
fi

echo "[5/5] Redémarrage PM2…"
npx pm2 startOrRestart ecosystem.config.js --update-env
npx pm2 save >/dev/null 2>&1 || true

sleep 6
CODE=$(curl -s -m 15 -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT:-3000}/api/health" || true)
echo "Santé locale : HTTP ${CODE}"
