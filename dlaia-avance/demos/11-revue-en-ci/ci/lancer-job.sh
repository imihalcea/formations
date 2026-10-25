#!/usr/bin/env bash
# Étapes du job « revue ». Seule source de ces étapes : le workflow revue.yml l'appelle, et le
# formateur le lance à la main sur son poste. Un runner auto-hébergé où le harnais est déployé
# exécute exactement ce script.
#
# Usage : ci/lancer-job.sh <claude|opencode> [numéro de pull request]
# Variables : PR (numéro, sinon la pull request de la branche courante), SPEC (défaut
#   002-responsable-priorite-haute), MAX_TURNS (Claude Code, défaut 6), DELAI (secondes, défaut 540),
#   SORTIE (dossier de l'archive du job, défaut revue-sortie), DRY_RUN=1 (affiche au lieu de poster).
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
outil="${1:?usage: lancer-job.sh <claude|opencode> [numéro de pull request]}"
pr="${2:-${PR:-}}"
[ -n "$pr" ] || pr="$(gh pr view --json number -q .number)"
spec="${SPEC:-002-responsable-priorite-haute}"
sortie="${SORTIE:-revue-sortie}"
mkdir -p "$sortie"
debut=$SECONDS

# 0. Brouillon : pas de revue.
if [ "$(gh pr view "$pr" --json isDraft -q .isDraft)" = "true" ]; then
  echo "Pull request $pr en brouillon : pas de revue."
  exit 0
fi

# 1. Réviseur et règles lus sur la branche principale, jamais sur la branche relue.
git fetch -q origin main || true
git checkout origin/main -- revue .claude .opencode

# 2. Diff de la pull request.
git diff origin/main...HEAD > "$sortie/diff.patch"
[ -s "$sortie/diff.patch" ] || { echo "Diff vide : rien à relire."; exit 0; }

# 3. Agent de code en lecture seule : sans le jeton qui écrit sur GitHub.
prompt_cc="Lance le sous-agent reviewer sur ce diff avec revue/regles.md et la spécification specs/$spec/spec.md. Affiche ses findings tels quels."
prompt_oc="Applique revue/regles.md à ce diff et à la spécification specs/$spec/spec.md. Rends tes findings tels quels."
case "$outil" in
  claude)
    timeout "${DELAI:-540}" env -u GH_TOKEN -u GITHUB_TOKEN claude -p "$prompt_cc" \
      --model claude-sonnet-4-6 --max-turns "${MAX_TURNS:-6}" --output-format json \
      --allowedTools Read Grep Glob < "$sortie/diff.patch" > "$sortie/sortie.json"
    jq -r '.result' "$sortie/sortie.json" > "$sortie/sortie.txt"
    jq -c '{total_cost_usd, num_turns, is_error, subtype}' "$sortie/sortie.json" > "$sortie/metriques.json"
    ;;
  opencode)
    timeout "${DELAI:-540}" env -u GH_TOKEN -u GITHUB_TOKEN opencode run \
      --model amazon-bedrock/eu.anthropic.claude-sonnet-4-6 --agent reviewer "$prompt_oc" \
      < "$sortie/diff.patch" > "$sortie/sortie.txt"
    ;;
  *) echo "Outil inconnu : $outil (claude ou opencode)"; exit 2 ;;
esac

# 4. Validation du JSON : les lignes non conformes sont écartées.
"$ici/valider-findings.sh" < "$sortie/sortie.txt" > "$sortie/findings.jsonl"

# 5. Publication : un commentaire par finding, avec le jeton qui écrit.
sha="$(gh pr view "$pr" --json headRefOid -q .headRefOid)"
n=0
while IFS= read -r finding; do
  [ -n "$finding" ] || continue
  corps="$(jq -r '"**\(.regle)** (\(.severite)) : \(.resume)\n\nScénario : \(.scenario)"' <<<"$finding")"
  fichier="$(jq -r .fichier <<<"$finding")"
  ligne="$(jq -r .ligne <<<"$finding")"
  if [ "${DRY_RUN:-0}" = "1" ]; then
    printf '%s:%s\n%s\n---\n' "$fichier" "$ligne" "$corps"
  elif ! gh api "repos/{owner}/{repo}/pulls/$pr/comments" \
        -f body="$corps" -f commit_id="$sha" -f path="$fichier" -F line="$ligne" -f side=RIGHT >/dev/null; then
    echo "Ligne $fichier:$ligne absente du diff : commentaire général."
    gh pr comment "$pr" --body "$fichier:$ligne

$corps" >/dev/null
  fi
  n=$((n + 1))
done < "$sortie/findings.jsonl"
echo "$n finding(s) publiés en $((SECONDS - debut)) s." | tee "$sortie/resume.txt"
