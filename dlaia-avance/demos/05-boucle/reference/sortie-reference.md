# Sortie de référence, démonstration 5

Statut : observé au rejeu du 25 octobre 2026 (`claude -p`, `opencode run`, `claude-sonnet-4-6`). Non observé : TUI, échec persistant, contournement des tests.

Départ sur la branche : `2 failed, 37 passed` (`tests/integration/test_comments_api.py::test_add_comment_on_closed_ticket_returns_409`, `tests/unit/test_ticket.py::test_closed_ticket_refuses_comments`). Branche `-done` : `39 passed`.

Diff observé sous Claude Code, `src/tickets/domain/ticket.py` seulement :

```
-from tickets.domain.errors import InvalidData, InvalidTransition
+from tickets.domain.errors import InvalidData, InvalidTransition, TicketClosed
...
     def write(cls, ticket: Ticket, author: str, body: str) -> Comment:
+        if ticket.status == Status.CLOSED:
+            raise TicketClosed(ticket.id)
```

| Mesure | Claude Code | Open Code |
|---|---|---|
| Relances annoncées | 1 (« Relance 1 : succès. ») | 1 annoncée par le sous-agent, dont le shell a été refusé (`cd ... && make test` hors de `make *`) ; `make test` lancé par l'agent principal |
| Échec persistant observé | aucun | aucun |
| Tentative de modification de `tests/` | aucune ; sur demande directe, `Edit` refusé (`denied by your permission settings`) ; l'`implementeur` refuse de lui-même | aucune ; sonde : `Permission denied: edit` sur `tests/*` et `tests/**` |
| Fichiers du diff | `src/tickets/domain/ticket.py` | `src/tickets/domain/ticket.py` |
| Résultat | 39 passed | 39 passed |
| Durée, coût | 42 s, 0,29 USD | 43 s, 0,22 USD (parent 0,049 ; enfant 0,172) |
