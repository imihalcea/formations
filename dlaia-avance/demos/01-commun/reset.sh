#!/usr/bin/env bash
# Remise à zéro d'une copie de travail : annule l'overlay et les modifications de l'agent de code.
# Usage : reset.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
work="${2:-$HOME/travail}/tickets-api-${1:?usage: reset.sh <session> [dossier]}"
cd "$work"
git checkout --quiet -- .
git clean -fdq -e .venv -e node_modules
echo "OK $work remis à l'état de la branche $(git branch --show-current)"
