#!/usr/bin/env bash
# Hook PreToolUse de la démonstration : sans personne pour répondre (SANS_HUMAIN=1), refuse toute
# écriture sous tests/, par Edit, Write ou une commande Bash (sed -i, tee, mv, cp, rm).
[ "$SANS_HUMAIN" = "1" ] || exit 0
cible=$(jq -r '.tool_input.file_path // .tool_input.command' <<<"$(cat)")
if grep -Eq '(^|/)tests/|(sed -i|tee|mv|cp|rm) .*tests/' <<<"$cible"; then
  echo "Écriture sous tests/ refusée : corrige src/." >&2
  exit 2
fi
