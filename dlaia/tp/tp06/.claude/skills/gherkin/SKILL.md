---
name: gherkin
description: Écrire les scénarios Gherkin d'une exigence de bookit en français (# language: fr), un scénario de chaque côté de chaque borne, l'instant courant fixé dans le Soit. À employer pour tout scénario de spec.md ou d'un fichier .feature.
---

# Scénario Gherkin

Mots-clés de la localisation française de Gherkin : `Fonctionnalité`, `Scénario`, `Soit`, `Quand`, `Alors`, `Et`.
Première ligne de chaque bloc : `# language: fr`.

## Règles d'écriture

- Titre du scénario : `REG-NN, ` puis le cas en quelques mots.
- `Soit` fixe l'instant courant, mardi 2 juin 2026 à 9h00, et l'état de la ressource quand il compte.
- `Quand` décrit la demande : ressource, début, fin.
- `Alors` est observable : « la demande est acceptée » ou « la demande est refusée avec le code x ».
- Un scénario de chaque côté de chaque borne : la valeur pile, acceptée ; la première valeur au-delà, refusée.
- Les créneaux choisis respectent les autres règles, pour qu'une seule règle décide.

## Exemple

```gherkin
# language: fr
Fonctionnalité: Valider une demande de réservation

  Scénario: REG-03, préavis de 2 heures pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A de 11h00 à 12h00
    Alors la demande est acceptée

  Scénario: REG-03, préavis de 1 heure 59
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A de 10h59 à 11h59
    Alors la demande est refusée avec le code lead_time
```
