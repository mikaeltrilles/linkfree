#!/bin/bash
# deploy.sh — à lancer DEPUIS LE POSTE LOCAL : synchronise les sources vers
# o2switch puis exécute scripts/server-deploy.sh sur le serveur.
#
#   ./deploy.sh            # déploiement complet
#   SSH_HOST=o2switch ./deploy.sh
set -euo pipefail
SSH_HOST="${SSH_HOST:-o2switch}"
REMOTE_DIR="${REMOTE_DIR:-linkfree.tmktools.com}"
cd "$(dirname "$0")"

echo "→ Synchronisation des sources vers ${SSH_HOST}:~/${REMOTE_DIR}/"
rsync -az --delete \
  --exclude=node_modules --exclude=.next --exclude=.git --exclude=logs \
  --exclude=.env --exclude='*.log' --exclude=tmp --exclude=prisma/dev.db* \
  --exclude=prisma/migrations --exclude=tsconfig.tsbuildinfo \
  ./ "${SSH_HOST}:~/${REMOTE_DIR}/"

echo "→ Build et redémarrage sur le serveur"
ssh "${SSH_HOST}" "chmod +x ~/${REMOTE_DIR}/scripts/*.sh && ~/${REMOTE_DIR}/scripts/server-deploy.sh"

echo "→ Vérification publique"
curl -s -o /dev/null -w "https://linkfree.tmktools.com/ → HTTP %{http_code}\n" https://linkfree.tmktools.com/
