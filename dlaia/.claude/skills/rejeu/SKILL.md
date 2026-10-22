---
name: rejeu
description: Rejoue un TP de la formation dlaia, ou toute la suite TP 1 à 6 depuis l'archive, avec Claude Code et Open Code en mode non interactif, par le sous-agent rejoueur-tp. Rend un rapport par outil et la liste des attendus à corriger.
---

Arguments reçus : `$ARGUMENTS`. Formes : `/rejeu NN` (un TP, les deux outils), `/rejeu NN opencode` ou `/rejeu NN claude-code` (un seul outil), `/rejeu NN corrige` (partir du corrigé du TP précédent au lieu de l'état enchaîné), `/rejeu tous` (TP 1 à 6 à la suite, depuis l'archive, pour la vérification finale de l'issue #91).

Racine : `/home/ionut/formations/dlaia/`. Les rapports vont dans `tmp/rejeu/` (hors dépôt).

## Déroulé

1. Préalables : `fil-rouge/` existe ; `uv` et Python 3.14 répondent ; `claude --version` et `opencode --version` répondent ; pour `/rejeu tous`, lancer `npm run dist` depuis `template-support/app/` pour une archive à jour. Un préalable manquant arrête le skill.
2. Lancer le sous-agent `rejoueur-tp` (outil Agent, `subagent_type: rejoueur-tp`), une fois par outil, en parallèle. Le prompt donne le numéro du TP, l'outil, et les options (« depuis le corrigé », « à partir de l'étape K »). Pour `/rejeu tous`, un agent par outil enchaîne les six TP dans l'ordre, chacun partant de l'état laissé par le précédent, et écrit un rapport par TP.
3. Lire les rapports `tmp/rejeu/rapport-tpNN-<outil>.md`. Pour chaque écart : décider s'il vient de l'énoncé (attendu faux, étape ambiguë, prompt trop ouvert), du corrigé, du fil rouge ou d'un aléa du modèle. Un aléa se confirme par un second rejeu de l'étape seule (`à partir de l'étape K`) ; deux échecs sur deux rejeux font un défaut de l'énoncé.
4. Corriger : l'énoncé (`support/NN-*.md`, blocs `attendu`, `indice`, prompts durcis), les notes de la slide de lancement (durées, permissions demandées, nombre de tours observé), `formateur/fil-rouge.md` (relevé daté), le corrigé si c'est lui qui est faux. Les valeurs observées remplacent toute valeur estimée. Relancer `/rejeu NN` sur les étapes dont le prompt a changé ; un rejeu conforme après la dernière modification de prompt suffit dans chaque outil, une correction qui ne touche que les attendus ou les notes ne se rejoue pas.
5. Rapport à l'utilisateur :

```
## Rejeu TP NN

Claude Code : N étapes, N conformes, N écarts, N non rejouables ; durée, coût.
Open Code : idem.
Écarts et décision : par étape, ce qui diffère et ce qui a été corrigé (fichier et ligne).
Non rejouable, à vérifier sur la VM : liste.
Attendus mis à jour : liste.
```

Claude Code et Open Code sont installés et configurés sur la machine. Tous les rejeux imposent le même modèle par `--model` : `claude-sonnet-4-6` sous Claude Code, la clé `model` de l'`opencode.json` du fil rouge sous Open Code ; un identifiant qui ne contient pas `claude-sonnet-4-6` arrête le rejeu. Le rejeu ne remplace pas un essai interactif (permissions à l'écran, complétion, `/clear` et `/new`) : l'issue #57 garde cette vérification, réduite aux points « non rejouable » des rapports.
