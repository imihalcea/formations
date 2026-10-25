#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration (branche fix/ticket-ferme-commentaires).
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
exec "$ici/../01-commun/prepare.sh" "$session" "fix/ticket-ferme-commentaires" "$ici/overlay" "${2:-$HOME/travail}"
