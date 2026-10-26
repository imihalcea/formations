#!/usr/bin/env bash
# Prépare la démonstration « analyse d'échec » : dépôt de session, puis agent diagnostiqueur, script du
# job et workflow commités sur la branche principale du dépôt de session (un workflow `workflow_run`
# est lu sur la branche par défaut), puis copie de travail placée sur demo/build-casse.
# Actions sortantes : création du dépôt de session et push de main vers ce dépôt de session, jamais
# vers la référence. Idempotent.
# Usage : session.sh <session> <claude|opencode> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> <claude|opencode> [dossier]}"
outil="${2:?outil : claude ou opencode}"
base="${3:-$HOME/travail}"
case "$outil" in claude) wf="analyse-echec.claude-code.yml" ;; opencode) wf="analyse-echec.opencode.yml" ;; *) echo "outil : claude ou opencode"; exit 2 ;; esac

"$ici/../00-tickets-api/session.sh" "$session" "$base"
work="$base/tickets-api-$session"
cd "$work"
git fetch --quiet origin
git checkout --quiet main
git pull --quiet --ff-only origin main
if git ls-files --error-unmatch .github/workflows/analyse-echec.yml >/dev/null 2>&1; then
  echo "OK main porte déjà analyse-echec.yml, laissé tel quel"
else
  mkdir -p .claude/agents .opencode/agents .github/workflows ci
  cp "$ici/artefacts/.claude/agents/diagnostiqueur.md" .claude/agents/
  cp "$ici/artefacts/.opencode/agents/diagnostiqueur.md" .opencode/agents/
  cp "$ici/ci/analyser-echec.sh" ci/
  cp "$ici/workflows/$wf" .github/workflows/analyse-echec.yml
  chmod +x ci/analyser-echec.sh
  git add .claude/agents/diagnostiqueur.md .opencode/agents/diagnostiqueur.md ci .github/workflows/analyse-echec.yml
  git commit --quiet -m "Analyse d'échec : agent, script du job et workflow ($outil)"
  git push --quiet origin main
  echo "OK main du dépôt de session mis à jour (analyse-echec.yml pour $outil)"
fi
git checkout --quiet demo/build-casse
git pull --quiet --ff-only origin demo/build-casse || true
make db-up >/dev/null
uv sync --quiet
echo "OK prêt : cd $work (branche demo/build-casse), puis les commandes du README"
