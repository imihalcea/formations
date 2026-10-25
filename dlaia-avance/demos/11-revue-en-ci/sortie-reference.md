# Sortie de référence, démonstration 11 (provisoire)

Rejeu du 25 octobre 2026 avec `claude-sonnet-4-6` et un faux `gh` (aucune pull request ni CI chez GitHub). Sorties provisoires jusqu'au rejeu à la main.

## Forme d'un commentaire

Appel publié par `ci/lancer-job.sh` (un par finding valide) :

```
gh api repos/{owner}/{repo}/pulls/<N>/comments -f body="**R3** (haute) : Jeton en clair\n\nScénario : …" \
  -f commit_id=<sha de tête> -f path=<fichier> -F line=<ligne> -f side=RIGHT
```

## Findings attendus (repris de la démonstration 7)

R1 `src/tickets/adapters/inbound/http/routers/tickets.py` (import `TicketRow`, `unit._session`) ; R2 route `PATCH /{ticket_id}/assignee` sans test ; R3 `src/tickets/adapters/outbound/notifications.py:6` ; R4 `assign_ticket`, retrait du responsable d'un ticket `high`. Quatre ou cinq commentaires selon que R1 est scindé. Un finding R3 sur `tests/conftest.py` n'a jamais été produit.

## Relevé

| Point | Claude Code | Open Code |
|---|---|---|
| commentaires postés | 4 : R1 `src/tickets/adapters/inbound/http/routers/tickets.py:59` (haute), R2 `…/routers/tickets.py:56` (moyenne), R3 `src/tickets/adapters/outbound/notifications.py:6` (haute), R4 `…/routers/tickets.py:62` (haute) ; R1 non scindé | 4 : R1 `…/routers/tickets.py:55` (haute), R2 `tests/integration/test_tickets_api.py:87` (moyenne), R3 `notifications.py:6` (haute), R4 `…/routers/tickets.py:55` (haute) |
| durée du job | 146 s | 16 s |
| tokens, coût | `{"total_cost_usd":0.514,"num_turns":5,"is_error":false,"subtype":"success"}` | non mesuré |
| `subtype` avec `--max-turns 6` | `success` | sans objet |
| corps d'un commentaire | `**R3** (haute) : Un jeton d'API est assigné en dur à NOTIFY_TOKEN.` puis `Scénario : NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f" est un littéral …` | idem, avec prose avant le JSON écartée par `valider-findings.sh` |
| pull request en brouillon | `Pull request <N> en brouillon : pas de revue.` en 0,01 s | idem |
| acceptation des lignes par l'API réelle | à relever en séance | à relever en séance |
