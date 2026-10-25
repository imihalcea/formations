#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration (branche feat/front), installe le navigateur
# de Playwright et lance l'API et le front en arrière-plan.
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
# Arrêt : make -C demos/06-mcp-interface stop SESSION=<session>
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
base="${2:-$HOME/travail}"
work="$base/tickets-api-$session"
"$ici/../01-commun/prepare.sh" "$session" "feat/front" "$ici/overlay" "$base"

# Navigateur de Playwright : un échec ne bloque pas la préparation (voir le repli du runbook).
npx --yes playwright install chromium || echo "AVERTISSEMENT : navigateur non installé, voir le repli du runbook" >&2

# API et front sur http://localhost:8000/ui/ (arrière-plan, journal et pid dans la copie de travail).
if [ -f "$work/serve.pid" ] && kill -0 "$(cat "$work/serve.pid")" 2>/dev/null; then
  echo "OK serveur déjà lancé (pid $(cat "$work/serve.pid"))"
else
  (cd "$work" && setsid nohup make run >serve.log 2>&1 & echo $! >serve.pid)
  echo "OK serveur lancé en arrière-plan, journal : $work/serve.log"
fi
