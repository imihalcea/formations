#!/usr/bin/env bash
# Crée un dépôt de session à partir du dépôt de référence, puis le clone dans le travail.
# La référence ne reçoit jamais d'issue ni de pull request : chaque session, chaque
# répétition, travaille sur sa copie. Idempotent : un dépôt ou un clone déjà présent
# est laissé tel quel.
#
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
# Variables : REFERENCE=imihalcea/tickets-api
set -euo pipefail

session="${1:?usage: session.sh <session> [dossier de travail]}"
work_base="${2:-$HOME/travail}"
reference="${REFERENCE:-imihalcea/tickets-api}"
owner="${reference%%/*}"
name="${reference##*/}"
target="$owner/$name-$session"
work="$work_base/$name-$session"

gh auth status >/dev/null 2>&1 || { echo "KO : gh n'est pas connecté"; exit 1; }
gh repo view "$reference" --json name >/dev/null 2>&1 || {
  echo "KO : référence $reference introuvable"; exit 1; }

reference_url="$(gh repo view "$reference" --json sshUrl -q .sshUrl)"

if gh repo view "$target" --json name >/dev/null 2>&1; then
  echo "OK dépôt $target déjà présent, contenu laissé tel quel"
else
  gh repo create "$target" --private \
    --description "Dépôt de session $session, copie de $reference" >/dev/null
  target_url="$(gh repo view "$target" --json sshUrl -q .sshUrl)"
  tmp="$(mktemp -d)"
  git clone --quiet --mirror "$reference_url" "$tmp/reference.git"
  git -C "$tmp/reference.git" push --quiet --mirror "$target_url"
  rm -rf "$tmp"
  echo "OK dépôt $target créé, toutes les branches copiées"
fi

if [ -d "$work/.git" ]; then
  echo "OK clone déjà présent dans $work"
else
  mkdir -p "$work_base"
  target_url="$(gh repo view "$target" --json sshUrl -q .sshUrl)"
  git clone --quiet "$target_url" "$work"
  echo "OK clone dans $work"
fi
