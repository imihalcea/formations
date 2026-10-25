# Sortie de référence, démonstration 1

Statut : provisoire. Tout est « à relever » jusqu'au rejeu (`/rejeu 01`, puis rejeu manuel).

## Réponse attendue (forme)

Trois lignes : un ticket fermé accepte des commentaires ; la vérification du statut manque à l'ajout du commentaire ; test qui le couvre : `tests/integration/test_comments_api.py::test_add_comment_on_closed_ticket_returns_409` (et `tests/unit/test_ticket.py::test_closed_ticket_refuses_comments`).

## À relever

| Élément | Claude Code | Open Code |
|---|---|---|
| Outils appelés (noms réels) | à relever | à relever |
| Réponse de l'agent de code | à relever | à relever |
| Fenêtre avant / après (tokens) | à relever | à relever |
| `git status` après le prompt | à relever (attendu : propre) | à relever (attendu : propre) |
| Invite d'approbation du serveur de projet | à relever | sans objet (aucune approbation, equivalences.md) |

## Repli

Texte de l'issue et de ses commentaires : `../issue/`. En direct : `gh issue view --comments` dans la copie de travail.
