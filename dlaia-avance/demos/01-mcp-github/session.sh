#!/usr/bin/env bash
# Démonstration 1 : MCP GitHub, créer des issues.
# Usage : session.sh <session> [dossier de travail]
# Pose GITHUB_TOKEN dans l'environnement de la session de démonstration avant de lancer l'agent de code.
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
"$ici/../01-commun/prepare.sh" "$session" fix/ticket-ferme-commentaires "$ici/overlay" "${2:-$HOME/travail}"
