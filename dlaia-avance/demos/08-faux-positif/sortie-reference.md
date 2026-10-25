# Sortie de référence, démonstration 2

Statut : observée au rejeu du 25 octobre 2026 (Claude Code et Open Code). Le rejeu manuel en séance reste à faire.

Diff de `revue/regles.md` : `reference/correctif-r3.patch` (règle de référence). La règle écrite par l'agent varie ; un exemple observé sous Claude Code avec le prompt durci est reporté dans le README.

| Finding | Avant (R3 première version) | Après (R3 corrigée) |
|---|---|---|
| R3 `notifications.py:6` | rendu | conservé (Claude Code, et Open Code après repli) |
| R4 `routers/tickets.py` | rendu | conservé |
| R1 `routers/tickets.py` | rendu (1 ou 2 objets) | conservé |
| R2 route sans test | rendu | conservé |
| R3 `tests/conftest.py:6` | jamais rendu au rejeu (faux positif attendu, non produit) | sans objet |

Nombre de relances : 1. Après la relance : 4 findings sous Claude Code, 3 sous Open Code avec la règle écrite par l'agent à contresens (R3 perdu), 5 après repli. Effet de l'exclusion de `tests/` : non observable, aucun secret planté dans `tests/`.
