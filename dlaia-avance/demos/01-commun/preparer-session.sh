#!/usr/bin/env bash
# Prépare le dépôt de session et la copie de travail de la démonstration 1.
# Usage : preparer-session.sh [préfixe, défaut jour-mois, ex. 28-10]
# Se lance depuis n'importe quel shell (bash, fish) : bash preparer-session.sh [préfixe]
# Rejouable sans effet de bord. Affiche à la fin les commandes qui posent les variables
# de session dans le shell appelant (bash et fish).
set -euo pipefail

ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:-$(date +%d-%m)}"
export REFERENCE="${REFERENCE:-imihalcea/tickets-api}"
target="$REFERENCE-$session"
work="$HOME/travail/${REFERENCE##*/}-$session"

echo "Session $session : dépôt $target, copie de travail $work"
"$ici/../00-tickets-api/session.sh" "$session" "$HOME/travail"

cd "$work"
git checkout --quiet -- .
git clean -fdq -e .venv -e node_modules
git checkout --quiet fix/ticket-ferme-commentaires
docker compose down -v
make db-up
uv sync
make test || true

echo
echo "Variables de session :"
echo "  bash : export SESSION=$session TARGET=$target WORK=$work"
echo "  fish : set -gx SESSION $session; set -gx TARGET $target; set -gx WORK $work"
