#!/usr/bin/env bash
# Crée dans la copie de session l'issue de la démonstration, avec deux commentaires.
# Usage : creer-issue.sh <session> [dossier de travail, défaut ~/travail]
# Idempotent : si une issue ouverte porte déjà le titre, rien n'est créé.
set -euo pipefail
session="${1:?usage: creer-issue.sh <session> [dossier]}"
work="${2:-$HOME/travail}/tickets-api-$session"
ici="$(cd "$(dirname "$0")" && pwd)"
cd "$work"
repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
case "$repo" in */tickets-api-*) ;; *) echo "KO : $repo n'est pas une copie de session"; exit 1;; esac
titre="Un ticket fermé accepte encore des commentaires"
if [ -n "$(gh issue list --repo "$repo" --state open --search "$titre in:title" --json number -q '.[].number')" ]; then
  echo "OK issue déjà présente dans $repo"; exit 0
fi
url="$(gh issue create --repo "$repo" --title "$titre" --body-file "$ici/issue.md")"
gh issue comment "$url" --body-file "$ici/commentaire-1.md" >/dev/null
gh issue comment "$url" --body-file "$ici/commentaire-2.md" >/dev/null
echo "OK issue créée : $url"
