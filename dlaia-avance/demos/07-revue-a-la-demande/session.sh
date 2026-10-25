#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration 1 (branche demo/revue-defauts) et y copie les
# fichiers de la revue (artefacts/), non commités.
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
exec "$ici/../01-commun/prepare.sh" "$session" "demo/revue-defauts" "$ici/artefacts" "${2:-$HOME/travail}"
