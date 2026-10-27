# Rapport de référence, démonstration 3

Statut : observé au rejeu du 25 octobre 2026 (`claude -p`, `opencode run`, `claude-sonnet-4-6`). Non observé : TUI, panneau d'agents, mention `@` interactive.

Contenu observé : `Comment.write` (`src/tickets/domain/ticket.py`, ligne 72) ne vérifie pas `ticket.status` ; `AddComment.execute` (`src/tickets/application/comments.py`, lignes 23 à 26) appelle `Comment.write` ; `TicketClosed` (`errors.py`, ligne 21) est déclarée et jamais levée. Les deux tests rouges sont cités.

Écarts : rapport de 15 lignes (Claude Code) et 18 lignes (Open Code) pour dix demandées ; sous Open Code, `routers/comments.py` est listé comme lu sans avoir été ouvert ; l'agent principal a reformulé le rapport dans les deux outils (« tel quel » non obéi).

| Mesure | Claude Code | Open Code |
|---|---|---|
| Tokens lus par le sous-agent | 15 017 (6 outils, 18,9 s) | environ 38 000 (38 335 dont 23 365 lus en cache) |
| Tokens reçus par l'agent principal | environ 1,2k (contexte de 32 397 à 33 575) | environ 640 (fenêtre de 12 146 à 12 790) |
| Forme d'appel qui fonctionne | langage naturel (`Agent`, `subagent_type: explorateur`) ; `@"explorateur (agent)"` en `-p` aussi | langage naturel (outil `subagent`, `agent: "explorateur"`) |
| Durée, coût | 29 s, 0,22 USD | 13 s, 0,022 USD pour l'agent principal et 0,083 USD pour la session enfant |
| `git status` | propre hors overlay | propre hors overlay |
