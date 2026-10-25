#!/usr/bin/env bash
# Ajoute à la copie de session un fichier avec un jeton GitHub factice (format ghp_, 36 caractères hexadécimaux
# aléatoires) que gitleaks reconnaît. Le jeton est tiré au hasard à chaque appel et n'est jamais
# versionné dans le dépôt de formation.
# Usage : ajouter-jeton.sh <copie de travail>   (annuler : supprimer le fichier, git restore --staged)
set -euo pipefail
work="${1:?usage: ajouter-jeton.sh <copie de travail>}"
jeton="ghp_$(od -An -N18 -tx1 /dev/urandom | tr -d ' \n')"
fichier="$work/src/tickets/adapters/outbound/notifications.py"
mkdir -p "$(dirname "$fichier")"
printf 'NOTIFY_TOKEN = "%s"\n' "$jeton" > "$fichier"
echo "OK $fichier écrit (jeton factice)"
