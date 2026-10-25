# Sortie de référence, démonstration 1

Statut : observée au rejeu du 25 octobre 2026 (`claude-sonnet-4-6`, Claude Code 2.1.310 en `claude -p`, Open Code v2.0.32 par `lancer-opencode.sh`), sauf la dernière ligne du tableau, qui n'a jamais été produite et sert de repli. Le rejeu manuel en séance reste à faire.

Findings rendus (les lignes varient d'une exécution à l'autre) :

| Règle | Fichier, ligne | Résumé | Scénario d'échec | Sévérité |
|---|---|---|---|---|
| R1 | `src/tickets/adapters/inbound/http/routers/tickets.py:14` | import de `TicketRow` dans le routeur (parfois fusionné avec le suivant) | accès direct à la table depuis `adapters/inbound/` | haute |
| R1 | même fichier, `unit._session` lignes 59 et 63 | le routeur lit et écrit en base | toute écriture du responsable passe par le routeur et contourne `domain/` | haute |
| R2 | même fichier ou `tests/integration/test_tickets_api.py`, ligne 56 à 57 | route `PATCH /{ticket_id}/assignee` sans test nominal ni test d'erreur | `grep -n assignee tests/integration/test_tickets_api.py` ne rend aucun test de la route | moyenne |
| R3 | `src/tickets/adapters/outbound/notifications.py:6` | `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` en clair | lecture du dépôt : le jeton est versionné | haute |
| R4 | même fichier que R1, lignes 59 à 63 (`assign_ticket`) | retrait du responsable d'un ticket `high` accepté | `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` : 200 au lieu de 422 | haute |
| R3 (faux positif, repli) | `tests/conftest.py:6` | `monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")` signalé comme secret | valeur factice de test | haute |

Nombre de findings : 4 (R1 fusionné) ou 5 (R1 scindé) ; Open Code : 5 aux deux exécutions. Coût : Claude Code 0,24 à 0,51 USD par exécution (0,51 avec deux refus de permission), Open Code 0,03 à 0,10 USD (session principale). La dernière ligne est une illustration : le modèle ne l'a pas rendue.
