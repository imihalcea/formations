#!/usr/bin/env bash
# Étape de validation : lit la sortie texte du reviewer sur l'entrée standard et rend sur la sortie
# standard les findings conformes à revue/finding.schema.json, un objet JSON par ligne. Les autres
# lignes (prose, balises de code, objets invalides) sont écartées ; le décompte va sur stderr.
set -uo pipefail
filtre='select(type=="object"
  and ((keys|sort) == ["fichier","ligne","regle","resume","scenario","severite"])
  and (.regle | IN("R1","R2","R3","R4"))
  and (.fichier | type == "string")
  and (.ligne | type == "number" and . == floor and . >= 1)
  and (.resume | type == "string")
  and (.scenario | type == "string" and length > 0)
  and (.severite | IN("haute","moyenne","basse")))'
objets=0; valides=0
while IFS= read -r ligne; do
  ligne="${ligne#"${ligne%%[![:space:]]*}"}"
  case "$ligne" in \{*\}) ;; *) continue ;; esac
  objets=$((objets + 1))
  sortie="$(jq -c "$filtre" <<<"$ligne" 2>/dev/null)" || continue
  [ -n "$sortie" ] || continue
  echo "$sortie"
  valides=$((valides + 1))
done
echo "findings : $valides valides sur $objets objets JSON" >&2
