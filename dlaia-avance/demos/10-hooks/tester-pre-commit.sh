#!/usr/bin/env bash
# Teste le hook git sans modèle, dans un dépôt temporaire : gitleaks doit arrêter un commit qui porte
# un jeton factice et laisser passer un commit propre (SANS_REVIEWER=1).
# gitleaks absent du PATH : variable GITLEAKS=<binaire>, sinon le test est signalé « SKIP ».
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
if ! command -v gitleaks >/dev/null 2>&1; then
  if [ -n "${GITLEAKS:-}" ] && [ -x "$GITLEAKS" ]; then PATH="$(dirname "$GITLEAKS"):$PATH"
  else echo "SKIP gitleaks absent (go, brew ou binaire des releases) : tester-pre-commit.sh non joué"; exit 0; fi
fi
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
cd "$tmp"
git init -q . && git config user.email t@example.org && git config user.name t
mkdir .githooks && cp "$ici/artefacts/.githooks/pre-commit" .githooks/ && git config core.hooksPath .githooks
export SANS_REVIEWER=1
echo "bonjour" > note.txt && git add . && git commit -q -m propre
echo "OK commit propre accepté"
"$ici/ajouter-jeton.sh" "$tmp" >/dev/null
git add . && if git commit -q -m jeton 2>"$tmp/err"; then echo "KO le commit avec jeton est passé"; exit 1; fi
grep -qi "leaks found" "$tmp/err" && echo "OK commit avec jeton arrêté par gitleaks"
