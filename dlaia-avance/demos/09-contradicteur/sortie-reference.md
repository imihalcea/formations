# Sortie de référence, démonstration 3

Statut : observée au rejeu du 25 octobre 2026 (Claude Code 2.1.310, Open Code v2.0.32, `claude-sonnet-4-6`). Le rejeu manuel en séance reste à faire.

| Finding | Sévérité | Contradicteur | Verdict observé | Preuve observée |
|---|---|---|---|---|
| R1 `routers/tickets.py` (import ligne 14) | haute | oui (Claude Code, R1 scindé) | confirmé | lignes 14, 59 et 63 citées par `grep -n` |
| R1 `routers/tickets.py` (`_session`, lignes 58-64) | haute | oui | confirmé | lecture des lignes 58-63 : `unit._session.get(TicketRow, ticket_id)` |
| R3 `notifications.py:6` | haute | oui | confirmé | `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` ligne 6 ; jeton utilisé ligne 14 |
| R4 `routers/tickets.py` (`assign_ticket`) | haute | oui | confirmé | lecture des lignes 59-63 : `Ticket.assign()` et la garde du domaine jamais appelés ; aucun test rejoué |
| R2 route sans test | moyenne | non | sans objet | sans objet |

Contradicteurs : 4 sous Claude Code (R1 en deux findings), 3 sous Open Code (R1 en un). Aucun test rejoué par les contradicteurs. Coût : Claude Code 0,61 USD, Open Code 0,19 USD en session principale (sous-agents non comptés).
