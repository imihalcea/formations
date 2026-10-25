#!/usr/bin/env bash
# Teste l'étape de validation sans modèle : prose, balise ```json, objet valide, objets hors schéma.
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
entree='Voici les findings :
```json
{"regle":"R3","fichier":"src/tickets/adapters/outbound/notifications.py","ligne":6,"resume":"Jeton en clair","scenario":"le jeton est versionné","severite":"haute"}
  {"regle":"R1","fichier":"src/tickets/adapters/inbound/http/routers/tickets.py","ligne":59,"resume":"Le routeur écrit en base","scenario":"unit._session dans un routeur","severite":"haute"}
{"regle":"R9","fichier":"a.py","ligne":1,"resume":"x","scenario":"y","severite":"haute"}
{"regle":"R2","fichier":"a.py","ligne":0,"resume":"x","scenario":"y","severite":"moyenne"}
{"regle":"R2","fichier":"a.py","ligne":3,"resume":"x","scenario":"","severite":"moyenne"}
{"regle":"R2","fichier":"a.py","ligne":3,"resume":"x","scenario":"y","severite":"moyenne","extra":1}
{pas du json}
```
Fin.'
sortie="$("$ici/ci/valider-findings.sh" <<<"$entree" 2>"${TMPDIR:-/tmp}/valider.err")"
[ "$(wc -l <<<"$sortie")" = 2 ] || { echo "KO : 2 findings attendus, obtenu :"; echo "$sortie"; exit 1; }
[ "$(jq -r .regle <<<"$sortie" | paste -sd,)" = "R3,R1" ] || { echo "KO ordre ou règles"; exit 1; }
grep -q "2 valides sur 7 objets" "${TMPDIR:-/tmp}/valider.err" || { echo "KO décompte : $(cat "${TMPDIR:-/tmp}/valider.err")"; exit 1; }
[ -z "$("$ici/ci/valider-findings.sh" <<<"aucune règle violée" 2>/dev/null)" ] || { echo "KO sortie non vide"; exit 1; }
echo "OK valider-findings.sh : 2 findings sur 7 objets, prose écartée"
