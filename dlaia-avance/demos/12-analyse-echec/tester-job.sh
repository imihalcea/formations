#!/usr/bin/env bash
# Teste ci/analyser-echec.sh sans modèle ni GitHub : faux `gh` et faux `claude` dans le PATH.
# Vérifie le journal passé à l'agent (tronqué), le commentaire posté, et « rien à analyser »
# quand l'exécution de ci a réussi.
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/bin"
cat > "$tmp/bin/gh" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  "run view "*"--log-failed"*) for i in $(seq 1 50); do echo "test  Run make test  ligne $i"; done
                               echo "test  Run make test  psycopg.errors.UndefinedColumn: column tickets.assignee does not exist" ;;
  "run view "*"--json conclusion"*) echo "${FAUSSE_CONCLUSION:-failure}" ;;
  "pr comment"*) echo "$*" >> "$JOURNAL_GH"; cp "${*: -1}" "$JOURNAL_GH.corps" ;;
  *) echo "gh inattendu : $*" >&2; exit 1 ;;
esac
STUB
cat > "$tmp/bin/claude" <<'STUB'
#!/usr/bin/env bash
nb=$(wc -l)
jq -n --arg r "Cause : colonne assignee sans migration ($nb lignes lues)" '{result:$r,total_cost_usd:0.02,num_turns:3,is_error:false,subtype:"success"}'
STUB
chmod +x "$tmp/bin/"*
export PATH="$tmp/bin:$PATH" JOURNAL_GH="$tmp/gh.log"

MAX_LIGNES=10 SORTIE="$tmp/s1" "$ici/ci/analyser-echec.sh" claude 123 9 > "$tmp/log1" 2>&1
grep -q "Journal : 51 lignes" "$tmp/log1" || { echo "KO décompte"; cat "$tmp/log1"; exit 1; }
[ "$(wc -l < "$tmp/s1/journal.txt")" = 10 ] || { echo "KO troncature"; exit 1; }
grep -q "pr comment 9 --body-file" "$tmp/gh.log" || { echo "KO commentaire"; cat "$tmp/gh.log"; exit 1; }
grep -q "10 lignes lues" "$tmp/gh.log.corps" && grep -q "colonne assignee sans migration" "$tmp/gh.log.corps" || { echo "KO corps"; exit 1; }
echo "OK journal de 51 lignes tronqué à 10, commentaire posté sur la pull request 9"

: > "$tmp/gh.log"
FAUSSE_CONCLUSION=success SORTIE="$tmp/s2" "$ici/ci/analyser-echec.sh" claude 123 9 > "$tmp/log2" 2>&1
grep -q "rien à analyser" "$tmp/log2" && [ ! -s "$tmp/gh.log" ] || { echo "KO succès"; exit 1; }
echo "OK exécution réussie : rien à analyser, aucun commentaire"
