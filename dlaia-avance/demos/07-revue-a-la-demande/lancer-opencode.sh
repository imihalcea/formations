#!/usr/bin/env bash
# Rejeu non interactif sous Open Code v2.0.32 : `opencode run` ne développe ni /revue ni !`cmd`.
# Ce script lit le fichier de la commande, retire le frontmatter, remplace $ARGUMENTS, exécute les
# blocs !`cmd` dans la copie de travail, puis lance opencode run avec le prompt assemblé.
# Usage : lancer-opencode.sh <copie de travail> <revue|revue-adverse> <spécification> [agent]
#   agent : défaut reviewer pour revue, agent par défaut (build) pour revue-adverse
# Variable : MODEL (défaut amazon-bedrock/eu.anthropic.claude-sonnet-5-5)
set -euo pipefail
work="${1:?usage: lancer-opencode.sh <copie> <revue|revue-adverse> <spec> [agent]}"
cmd="${2:?commande}"
spec="${3:?spécification}"
default_agent=""; [ "$cmd" = "revue" ] && default_agent="reviewer"
agent="${4:-$default_agent}"
model="${MODEL:-amazon-bedrock/eu.anthropic.claude-sonnet-5-5}"
file="$work/.opencode/commands/$cmd.md"
[ -f "$file" ] || { echo "KO : $file absent"; exit 1; }

prompt=""
in_front=0; seen_front=0
while IFS= read -r line; do
  if [ "$line" = "---" ] && [ "$seen_front" -eq 0 ]; then
    if [ "$in_front" -eq 0 ]; then in_front=1; continue; else in_front=0; seen_front=1; continue; fi
  fi
  [ "$in_front" -eq 1 ] && continue
  line="${line//\$ARGUMENTS/$spec}"
  if [[ "$line" =~ ^\!\`(.*)\`$ ]]; then
    out="$(cd "$work" && bash -c "${BASH_REMATCH[1]}")"
    prompt+="$out"$'\n'
  else
    prompt+="$line"$'\n'
  fi
done < "$file"

cd "$work"
args=(run --model "$model")
[ -n "$agent" ] && args+=(--agent "$agent")
opencode "${args[@]}" "$prompt"
