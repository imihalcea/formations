#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration (branche fix/ticket-ferme-commentaires-sdk).
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
base="${2:-$HOME/travail}"
"$ici/../01-commun/prepare.sh" "$session" "fix/ticket-ferme-commentaires-sdk" "$ici/overlay" "$base"

# Dépendances des scripts : un échec réseau ne bloque pas la préparation (voir le repli du runbook).
(cd "$base/tickets-api-$session/scripts" && npm install) || echo "AVERTISSEMENT : npm install a échoué, voir le repli du runbook" >&2
