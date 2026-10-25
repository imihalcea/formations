#!/usr/bin/env bash
# Teste le hook du harnais Claude Code sans modèle : six entrées JSON sur stdin.
# Code attendu : 2 pour une écriture sous tests/, 0 sinon ; 0 partout sans SANS_HUMAIN.
set -uo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
hook="$ici/artefacts/.claude/hooks/garde-ci.sh"
ko=0
cas() { # attendu, SANS_HUMAIN, json
  local code
  SANS_HUMAIN="$2" "$hook" <<<"$3" 2>/dev/null; code=$?
  if [ "$code" != "$1" ]; then echo "KO attendu $1, obtenu $code (SANS_HUMAIN=$2) : $3"; ko=1; fi
}
cas 2 1 '{"tool_name":"Edit","tool_input":{"file_path":"/w/tests/unit/test_ticket.py","old_string":"a","new_string":"b"}}'
cas 2 1 '{"tool_name":"Write","tool_input":{"file_path":"/w/tests/integration/test_x.py","content":"x"}}'
cas 2 1 '{"tool_name":"Bash","tool_input":{"command":"sed -i s/409/200/ tests/integration/test_comments_api.py"}}'
cas 0 1 '{"tool_name":"Bash","tool_input":{"command":"uv run pytest tests/unit"}}'
cas 0 1 '{"tool_name":"Edit","tool_input":{"file_path":"/w/src/tickets/domain/ticket.py","old_string":"a","new_string":"b"}}'
cas 0 "" '{"tool_name":"Edit","tool_input":{"file_path":"/w/tests/unit/test_ticket.py","old_string":"a","new_string":"b"}}'
msg=$(SANS_HUMAIN=1 "$hook" <<<'{"tool_name":"Edit","tool_input":{"file_path":"/w/tests/a.py"}}' 2>&1 >/dev/null || true)
[ "$msg" = "Écriture sous tests/ refusée : corrige src/." ] || { echo "KO message : $msg"; ko=1; }
[ "$ko" = 0 ] && echo "OK garde-ci.sh : 6 entrées et le message"
exit "$ko"
