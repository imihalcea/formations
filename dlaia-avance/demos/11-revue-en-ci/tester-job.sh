#!/usr/bin/env bash
# Teste ci/lancer-job.sh sans modèle ni GitHub : faux `gh` et faux `claude` dans le PATH, dépôt git
# temporaire avec un « origin » local. Vérifie les règles prises sur main, la validation et la
# publication (deux commentaires), puis le refus d'une pull request en brouillon.
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/bin"

cat > "$tmp/bin/gh" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *"--json isDraft"*) echo "${FAUX_BROUILLON:-false}" ;;
  *"--json headRefOid"*) echo abc123 ;;
  *"--json number"*) echo 7 ;;
  "api "*) echo "$*" >> "$JOURNAL_GH" ;;
  "pr comment"*) echo "$*" >> "$JOURNAL_GH" ;;
esac
STUB
cat > "$tmp/bin/claude" <<'STUB'
#!/usr/bin/env bash
cat > /dev/null
echo "regles lues : $(cat revue/regles.md)" >&2
jq -n --arg r '{"regle":"R3","fichier":"a.py","ligne":6,"resume":"Jeton en clair","scenario":"versionné","severite":"haute"}
Texte libre
{"regle":"R2","fichier":"b.py","ligne":2,"resume":"Route sans test","scenario":"aucun test","severite":"moyenne"}
{"regle":"R7","fichier":"c.py","ligne":1,"resume":"x","scenario":"y","severite":"haute"}' \
  '{result:$r,total_cost_usd:0.01,num_turns:2,is_error:false,subtype:"success"}'
STUB
chmod +x "$tmp/bin/"*
export PATH="$tmp/bin:$PATH" JOURNAL_GH="$tmp/gh.log"

git init -q --bare "$tmp/origin.git"
git clone -q "$tmp/origin.git" "$tmp/w" 2>/dev/null
cd "$tmp/w"
git config user.email t@example.org; git config user.name t
mkdir revue .claude .opencode; echo "REGLES DE MAIN" > revue/regles.md; touch .claude/a .opencode/a
git add . && git commit -q -m main && git branch -M main && git push -q origin main
git checkout -q -b pr
echo "REGLES MODIFIEES PAR LA PR" > revue/regles.md; echo x > a.py
git add . && git commit -q -m pr

SORTIE="$tmp/sortie" "$ici/ci/lancer-job.sh" claude 7 > "$tmp/log" 2>&1
grep -q "REGLES DE MAIN" revue/regles.md || { echo "KO les règles ne viennent pas de main"; exit 1; }
[ "$(grep -c "^api " "$tmp/gh.log")" = 2 ] || { echo "KO 2 commentaires attendus :"; cat "$tmp/gh.log"; exit 1; }
grep -q "path=a.py" "$tmp/gh.log" && grep -q "line=6" "$tmp/gh.log" || { echo "KO champs du commentaire"; exit 1; }
grep -q "2 finding(s) publiés" "$tmp/log" || { echo "KO résumé"; cat "$tmp/log"; exit 1; }
echo "OK règles lues sur main, 3 objets JSON dont 1 hors schéma, 2 commentaires publiés"

: > "$tmp/gh.log"
FAUX_BROUILLON=true SORTIE="$tmp/sortie2" "$ici/ci/lancer-job.sh" claude 7 > "$tmp/log2" 2>&1
grep -q "en brouillon" "$tmp/log2" && [ ! -s "$tmp/gh.log" ] || { echo "KO brouillon"; exit 1; }
echo "OK pull request en brouillon : aucune revue, aucun commentaire"
