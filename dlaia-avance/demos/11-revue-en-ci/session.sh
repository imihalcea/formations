#!/usr/bin/env bash
# Prépare la démonstration « revue en CI » : dépôt de session, puis règles, reviewer, script du job et
# workflow commités sur la branche principale du dépôt de session (le job relit ces fichiers sur main),
# puis copie de travail placée sur demo/revue-defauts.
# Actions sortantes : création du dépôt de session (session.sh de 00-tickets-api) et push de main
# vers ce dépôt de session, jamais vers la référence. Idempotent.
# Usage : session.sh <session> <claude|opencode> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> <claude|opencode> [dossier]}"
outil="${2:?outil : claude ou opencode}"
base="${3:-$HOME/travail}"
case "$outil" in claude) wf="revue.claude-code.yml" ;; opencode) wf="revue.opencode.yml" ;; *) echo "outil : claude ou opencode"; exit 2 ;; esac
revue="$ici/../07-revue-a-la-demande/artefacts"

"$ici/../00-tickets-api/session.sh" "$session" "$base"
work="$base/tickets-api-$session"
cd "$work"
git fetch --quiet origin
git checkout --quiet main
git pull --quiet --ff-only origin main
if git ls-files --error-unmatch .github/workflows/revue.yml >/dev/null 2>&1; then
  echo "OK main porte déjà revue.yml, laissé tel quel"
else
  cp -a "$revue/revue" .
  mkdir -p .claude/agents .opencode/agents .github/workflows ci
  cp "$revue/.claude/agents/reviewer.md" .claude/agents/
  cp "$revue/.opencode/agents/reviewer.md" .opencode/agents/
  cp "$ici"/ci/*.sh ci/
  cp "$ici/workflows/$wf" .github/workflows/revue.yml
  chmod +x ci/*.sh
  git add revue .claude/agents/reviewer.md .opencode/agents/reviewer.md ci .github/workflows/revue.yml
  git commit --quiet -m "Revue : règles, reviewer, script du job et workflow ($outil)"
  git push --quiet origin main
  echo "OK main du dépôt de session mis à jour (revue.yml pour $outil)"
fi
git checkout --quiet demo/revue-defauts
git pull --quiet --ff-only origin demo/revue-defauts || true
make db-up >/dev/null
uv sync --quiet
echo "OK prêt : cd $work (branche demo/revue-defauts), puis les commandes du README"
