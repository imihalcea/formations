#!/usr/bin/env bash
# Étapes du job « analyse-echec ». Seule source de ces étapes : le workflow analyse-echec.yml l'appelle,
# et le formateur le lance à la main sur son poste.
#
# Usage : ci/analyser-echec.sh <claude|opencode> [identifiant de l'exécution de ci] [numéro de pull request]
# Sans argument : dernière exécution du workflow ci sur la branche courante et sa pull request.
# Variables : RUN, PR (comme les arguments), MAX_LIGNES (journal passé à l'agent, défaut 3000),
#   MAX_TURNS (Claude Code, défaut 6), DELAI (secondes, défaut 540), SORTIE (défaut analyse-sortie),
#   DRY_RUN=1 (affiche le commentaire au lieu de le poster).
set -euo pipefail
outil="${1:?usage: analyser-echec.sh <claude|opencode> [exécution] [pull request]}"
run="${2:-${RUN:-}}"
pr="${3:-${PR:-}}"
sortie="${SORTIE:-analyse-sortie}"
mkdir -p "$sortie"
debut=$SECONDS

# 0. Exécution à analyser : la dernière du workflow ci sur la branche courante, si rien n'est donné.
if [ -z "$run" ]; then
  branche="$(git branch --show-current)"
  info="$(gh run list --workflow ci --branch "$branche" --limit 1 --json databaseId,conclusion)"
  run="$(jq -r '.[0].databaseId // empty' <<<"$info")"
  conclusion="$(jq -r '.[0].conclusion // empty' <<<"$info")"
else
  conclusion="$(gh run view "$run" --json conclusion -q .conclusion)"
fi
[ -n "$run" ] || { echo "Aucune exécution de ci trouvée."; exit 0; }
if [ "$conclusion" != "failure" ]; then
  echo "Exécution $run : conclusion « $conclusion », rien à analyser."
  exit 0
fi
[ -n "$pr" ] || pr="$(gh pr view --json number -q .number)"

# 1. Journal des étapes en échec (jeton en lecture), tronqué aux dernières lignes.
gh run view "$run" --log-failed > "$sortie/journal-complet.txt"
lignes="$(wc -l < "$sortie/journal-complet.txt")"
tail -n "${MAX_LIGNES:-3000}" "$sortie/journal-complet.txt" > "$sortie/journal.txt"
echo "Journal : $lignes lignes, $(wc -c < "$sortie/journal.txt") octets passés à l'agent."

# 2. Agent de code en lecture seule, sans le jeton qui écrit sur GitHub.
prompt_cc="Lance le sous-agent diagnostiqueur sur ce journal de CI. Rends la cause avec la ligne du journal citée telle quelle, puis une nouvelle migration 0002 en diff, sans modifier la 0001."
prompt_oc="Rends la cause de cet échec de CI avec la ligne du journal citée telle quelle, puis une nouvelle migration 0002 en diff, sans modifier la 0001. Commence directement par la cause, sans phrase d'introduction."
case "$outil" in
  claude)
    timeout "${DELAI:-540}" env -u GH_TOKEN -u GITHUB_TOKEN claude -p "$prompt_cc" \
      --model claude-sonnet-5-5 --max-turns "${MAX_TURNS:-6}" --output-format json \
      --allowedTools Read Grep Glob < "$sortie/journal.txt" > "$sortie/sortie.json"
    jq -r '.result' "$sortie/sortie.json" > "$sortie/analyse.md"
    jq -c '{total_cost_usd, num_turns, is_error, subtype}' "$sortie/sortie.json" > "$sortie/metriques.json"
    ;;
  opencode)
    timeout "${DELAI:-540}" env -u GH_TOKEN -u GITHUB_TOKEN opencode run \
      --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5 --agent diagnostiqueur "$prompt_oc" \
      < "$sortie/journal.txt" > "$sortie/analyse.md"
    ;;
  *) echo "Outil inconnu : $outil (claude ou opencode)"; exit 2 ;;
esac

# 3. Publication : un commentaire sur la pull request, rien n'est poussé dans le dépôt.
{ echo "Analyse d'échec de l'exécution $run (illustration d'automatisation, à relire avant tout correctif)"; echo; cat "$sortie/analyse.md"; } > "$sortie/commentaire.md"
if [ "${DRY_RUN:-0}" = "1" ]; then
  cat "$sortie/commentaire.md"
else
  gh pr comment "$pr" --body-file "$sortie/commentaire.md" >/dev/null
fi
echo "Commentaire sur la pull request $pr en $((SECONDS - debut)) s." | tee "$sortie/resume.txt"
