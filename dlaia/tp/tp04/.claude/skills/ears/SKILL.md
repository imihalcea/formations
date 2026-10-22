---
name: ears
description: Exigence EARS de bookit, REG-NN et code de refus ; pour toute exigence de spec.md.
---

# Exigence EARS

| Patron | Forme de la phrase | Quand l'employer |
|---|---|---|
| toujours | bookit doit … | règle sans condition |
| sur un événement | Quand …, bookit doit … | règle déclenchée par la demande |
| dans un état | Tant que …, bookit doit … | règle liée à l'état de la ressource |
| cas indésirable | Si …, alors bookit doit … | cas à refuser |

## Règles d'écriture

- Une phrase a un déclencheur, un verbe, « bookit doit » ; mots-clés traduits de l'anglais, convention du projet.
- Une exigence tient sur une ligne `**REG-NN** : …`, dans l'ordre de `docs/regles-metier.md`.
- Une règle à borne s'écrit en deux phrases sur la même ligne : la première refuse, la seconde dit en toutes lettres le sort de la valeur pile (« exactement », « pile »).
- Un refus nomme son code entre accents graves : `duration`, `hours`, `lead_time`, `horizon`, `overlap`.
- L'instant courant est nommé quand la règle en dépend.
- Aucun mot-clé anglais (SHALL, WHEN, WHILE, IF) dans la phrase.

## Exemple

**REG-03** : Quand une demande commence avant l'instant courant plus 2 heures, bookit doit la refuser avec le code `lead_time`. Quand une demande commence exactement 2 heures après l'instant courant, bookit doit l'accepter.

## Contre-exemple

« Le système devrait vérifier le préavis. » Aucun déclencheur, aucune borne, aucun code.
