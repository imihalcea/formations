---
description: Relit un diff contre les règles de revue
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
specs/$ARGUMENTS/spec.md. Affiche ses findings tels quels.
