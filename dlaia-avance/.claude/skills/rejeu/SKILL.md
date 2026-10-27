---
name: rejeu
description: Rejoue les démonstrations d'un module de la formation dlaia-avance, ou de toute la journée, avec Claude Code et Open Code en mode non interactif, par le sous-agent rejoueur-demo. Rend un rapport par outil et la liste des résultats attendus à corriger.
---

Arguments reçus : `$ARGUMENTS`. Formes : `/rejeu NN` (les démonstrations d'un module, les deux outils), `/rejeu NN opencode` ou `/rejeu NN claude-code` (un seul outil), `/rejeu NN K` (la démonstration K du module seule), `/rejeu tous` (tous les modules à la suite, pour la vérification finale).

Racine : `/home/ionut/formations/dlaia-avance/`. Les rapports vont dans `tmp/rejeu/` (hors dépôt).

## Déroulé

1. Préalables : `demos/NN-*` existe pour le module ; `claude --version` et `opencode --version` répondent ; les outils propres à chaque démonstration (dépôt externe accessible par `gh repo view`, `uv`, `node`, serveur MCP installable) répondent. Un préalable manquant arrête le skill.
2. Lancer le sous-agent `rejoueur-demo` (outil Agent, `subagent_type: rejoueur-demo`), une fois par outil, en parallèle. Le prompt donne le numéro du module, l'outil et la démonstration visée le cas échéant. Pour `/rejeu tous`, un agent par outil enchaîne les modules dans l'ordre et écrit un rapport par module.
3. Lire les rapports `tmp/rejeu/demos-NN-<outil>.md`. Pour chaque écart : décider s'il vient du runbook (résultat attendu faux, étape ambiguë, prompt trop ouvert), des artefacts de la démonstration ou d'un aléa du modèle. Un aléa se confirme par un second rejeu de la démonstration seule ; deux échecs sur deux rejeux font un défaut du runbook ou du prompt.
4. Corriger : les notes de la slide qui porte la démonstration, le runbook et les artefacts de `demos/NN-nom/`, le repli, `formateur/equivalences.md` (relevé daté). Les valeurs observées remplacent toute valeur estimée. Un rejeu conforme après la dernière modification de prompt suffit dans chaque outil ; une correction qui ne touche que les notes ne se rejoue pas.
5. Rapport à l'utilisateur :

```
## Rejeu module NN

Claude Code : N démonstrations, N conformes, N écarts, N non rejouables ; durée, coût.
Open Code : idem.
Écarts et décision : par démonstration, ce qui diffère et ce qui a été corrigé (fichier et ligne).
Non rejouable, à vérifier en séance : liste.
Résultats mis à jour : liste.
```

Claude Code et Open Code sont installés sur la machine et configurés par Amazon Bedrock avec le même modèle (conditions réelles). Tous les rejeux imposent le même modèle par `--model` : `claude-sonnet-5-5` sous Claude Code, et sous Open Code la clé `model` de l'`opencode.json` de la démonstration ; un identifiant qui ne contient pas `claude-sonnet-5-5` arrête le rejeu. Le rejeu ne remplace pas un essai interactif (permissions à l'écran, TUI, complétion) : l'utilisateur rejoue à la main les points « non rejouable » en fin de support. Jamais deux `opencode run` en parallèle.
