#!/usr/bin/env bash
# Hook PreToolUse de la démonstration : en exécution CI (CI_EXECUTE=1, variable de la démonstration,
# non définie par le harnais), refuse toute écriture sous tests/, par Edit, Write ou une commande Bash (sed -i, tee, mv, cp, rm).
if [ "$CI_EXECUTE" != "1" ]; then exit 0; fi  # hors CI : la permission s'affiche
cible=$(jq -r '.tool_input.file_path // .tool_input.command' <<<"$(cat)")
if grep -Eq '(^|/)tests/|((^|[;&| ])(sed -i|tee|mv|cp|rm) |>>?) *([^;&|]*[ /])?tests/' <<<"$cible"; then
  echo "Écriture sous tests/ refusée : corrige src/." >&2
  exit 2
fi
