---
description: Relit un diff contre les règles de revue
agent: reviewer
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Applique ces règles à ce diff et à la spécification specs/$ARGUMENTS/spec.md.
Rends tes findings tels quels.
