#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration 3 : branche demo/revue-defauts, fichiers de la
# revue (démonstration 1) et règle R3 corrigée (démonstration 2), non commités.
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
base="${2:-$HOME/travail}"
"$ici/../07-revue-a-la-demande/session.sh" "$session" "$base"
cp "$ici/../08-faux-positif/reference/regles-r3-corrigee.md" "$base/tickets-api-$session/revue/regles.md"
echo "OK règle R3 corrigée copiée dans revue/regles.md"
