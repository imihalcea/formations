#!/usr/bin/env bash
# Prépare la copie de travail d'une démonstration du module 1.
# Usage : prepare.sh <session> <branche> <dossier overlay> [dossier de travail, défaut ~/travail]
# 1. crée ou réutilise la copie de session (00-tickets-api/session.sh) ;
# 2. se place sur la branche de la démonstration ;
# 3. copie par-dessus les configurations de l'overlay (fichiers non commités) ;
# 4. lance la base et installe les dépendances.
set -euo pipefail

session="${1:?usage: prepare.sh <session> <branche> <overlay> [dossier]}"
branche="${2:?branche}"
overlay="${3:?overlay}"
base="${4:-$HOME/travail}"
ici="$(cd "$(dirname "$0")" && pwd)"
work="$base/tickets-api-$session"

"$ici/../00-tickets-api/session.sh" "$session" "$base"
cd "$work"
git fetch --quiet origin
git checkout --quiet "$branche"
git pull --quiet --ff-only origin "$branche" || true
if [ -d "$overlay" ]; then
  cp -a "$overlay"/. "$work"/
  echo "OK overlay $(basename "$overlay") copié dans $work"
fi
make db-up >/dev/null
uv sync --quiet
echo "OK prêt : cd $work (branche $branche)"
