# Rapport de référence, démonstration 2

Statut : provisoire, à relever au rejeu.

Contenu attendu (forme des instructions fixes du sous-agent, dix lignes au plus) : fichiers lus sous `src/tickets/application/`, `src/tickets/domain/`, `src/tickets/adapters/inbound/http/` ; `AddComment.execute` charge le ticket puis appelle `Comment.write` sans contrôler le statut ; `Comment.write` (domain/ticket.py) est le point d'ajout ; aucune vérification de `Status.CLOSED` n'existe pour les commentaires.

| Mesure | Claude Code | Open Code |
|---|---|---|
| Tokens lus par le sous-agent | à relever | à relever |
| Tokens reçus par l'agent principal | à relever | à relever |
| Forme d'appel qui fonctionne | à relever | à relever |
