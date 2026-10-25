---
description: Revue suivie d'un contradicteur par finding de sévérité haute
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

1. Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
   specs/$ARGUMENTS/spec.md.
2. Pour chaque finding de sévérité haute, lance dans le même tour un sous-agent
   contradicteur qui reçoit ce finding seul.
3. Affiche chaque finding avec son verdict et sa preuve. Les findings de sévérité moyenne ou
   basse sont affichés sans contradicteur.
