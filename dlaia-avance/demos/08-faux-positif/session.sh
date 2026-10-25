#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration 2 : même état que la démonstration 1
# (branche demo/revue-defauts, règle R3 en première version), avec revue/ commité localement
# dans la copie pour que `git diff HEAD~1 -- revue/regles.md` montre la seule différence de R3.
# Les autres fichiers de la revue (.claude/, .opencode/) restent non commités.
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
base="${2:-$HOME/travail}"
"$ici/../07-revue-a-la-demande/session.sh" "$session" "$base"
cd "$base/tickets-api-$session"
git add revue/regles.md revue/finding.schema.json
git diff --cached --quiet || git commit -q -m "Revue : règles de revue, R3 en première version" -- revue/regles.md revue/finding.schema.json
echo "OK revue/ commité dans la copie (état de départ de la démonstration 2)"
