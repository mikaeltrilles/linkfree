#!/bin/bash
# deploy.sh — à lancer DEPUIS LE POSTE LOCAL.
#
# L'hébergement mutualisé (CloudLinux) refuse les processus supplémentaires
# que `next build` lance (EAGAIN) : le build est donc fait ICI avec les
# variables publiques de production, puis .next est envoyé avec les sources.
# Le serveur installe les dépendances, génère le client Prisma pour sa
# plateforme, synchronise le schéma et redémarre PM2.
#
#   ./deploy.sh                 # build local + déploiement
#   BUILD_ON_SERVER=1 ./deploy.sh   # ancien mode : build sur le serveur
set -euo pipefail
SSH_HOST="${SSH_HOST:-o2switch}"
REMOTE_DIR="${REMOTE_DIR:-linkfree.tmktools.com}"
PUBLIC_URL="${PUBLIC_URL:-https://linkfree.tmktools.com}"
cd "$(dirname "$0")"

RSYNC_EXCLUDES=(--exclude=node_modules --exclude=.git --exclude=logs --exclude=.env
  --exclude='*.log' --exclude=tmp --exclude='prisma/dev.db*' --exclude=prisma/migrations
  --exclude=tsconfig.tsbuildinfo --exclude=.next/cache)

if [ "${BUILD_ON_SERVER:-0}" = "1" ]; then
  RSYNC_EXCLUDES+=(--exclude=.next)
else
  echo "→ Build local de production (NEXT_PUBLIC_APP_URL=${PUBLIC_URL})"
  rm -rf .next
  NODE_ENV=production NEXT_PUBLIC_APP_URL="$PUBLIC_URL" NEXTAUTH_URL="$PUBLIC_URL" \
    NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-build-only-secret-not-used-at-runtime}" \
    DATABASE_URL="${DATABASE_URL:-mysql://build:build@127.0.0.1:3306/build}" \
    npx next build
fi

echo "→ Synchronisation vers ${SSH_HOST}:~/${REMOTE_DIR}/"
rsync -az --delete "${RSYNC_EXCLUDES[@]}" ./ "${SSH_HOST}:~/${REMOTE_DIR}/"

echo "→ Installation, schéma et redémarrage sur le serveur"
ssh "${SSH_HOST}" "chmod +x ~/${REMOTE_DIR}/scripts/*.sh && SKIP_BUILD=$([ "${BUILD_ON_SERVER:-0}" = "1" ] && echo 0 || echo 1) ~/${REMOTE_DIR}/scripts/server-deploy.sh"

echo "→ Vérification publique"
curl -s -o /dev/null -w "${PUBLIC_URL}/ → HTTP %{http_code}\n" "${PUBLIC_URL}/"
