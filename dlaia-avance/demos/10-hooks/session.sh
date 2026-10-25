#!/usr/bin/env bash
# Prépare la copie de travail de la démonstration « hooks » (branche demo/hook-harnais) : hook du
# harnais des deux outils, hook git actif (core.hooksPath), reviewer et règles de la démonstration 7.
# Les fichiers sont copiés sans commit.
# Usage : session.sh <session> [dossier de travail, défaut ~/travail]
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
session="${1:?usage: session.sh <session> [dossier]}"
base="${2:-$HOME/travail}"
revue="$ici/../07-revue-a-la-demande/artefacts"

"$ici/../01-commun/prepare.sh" "$session" "demo/hook-harnais" "$ici/artefacts" "$base"
work="$base/tickets-api-$session"
cp -a "$revue/revue" "$work/"
mkdir -p "$work/.claude/agents" "$work/.opencode/agents"
cp "$revue/.claude/agents/reviewer.md" "$work/.claude/agents/"
cp "$revue/.opencode/agents/reviewer.md" "$work/.opencode/agents/"
chmod +x "$work/.claude/hooks/garde-ci.sh" "$work/.githooks/pre-commit"
git -C "$work" config core.hooksPath .githooks
command -v gitleaks >/dev/null || echo "ATTENTION : gitleaks absent du PATH, le hook git échouera (voir README)"
echo "OK hooks en place dans $work (core.hooksPath=.githooks)"
