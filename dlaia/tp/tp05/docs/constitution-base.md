# Base de la constitution de bookit

Sept principes, dans l'ordre, puis deux sections et la gouvernance. Les quatre principes de structure (I à IV) citent le ou les ADR de `docs/adr/` qui les motivent ; les trois principes de workflow (V à VII) portent leur pourquoi seul.

## I. Un refus est une valeur de retour

`validate_booking` rend `InvalidBooking(code)` quand une règle est enfreinte,
`None` sinon. Aucune exception pour refuser une demande dans `bookit/domain/`.
Pourquoi : le domaine ignore HTTP ; l'adaptateur traduit le code en 422 (ADR 1 et 2).

## II. L'horloge est un paramètre

L'instant courant arrive dans le paramètre `now`. Aucun appel à `datetime.now()`
ni à `date.today()` dans `bookit/domain/`.
Pourquoi : l'horloge est un port ; un test fixe l'instant courant et reste reproductible (ADR 1).

## III. Les dépendances pointent vers le domaine

`bookit/domain/` n'importe rien hors de `bookit.domain` et de la bibliothèque
standard. `bookit/application/` importe le domaine seulement.
`bookit/infrastructure/` importe les deux.
Pourquoi : les règles métier se testent sans serveur ni base (ADR 1).

## IV. Chaque fichier a sa couche

Une règle métier s'écrit dans `bookit/domain/validate_booking.py` ; un port dans
`bookit/domain/ports.py` ; un adaptateur dans `bookit/infrastructure/` ; un test
dans `tests/`. Une réservation dure au plus 4 heures.
Pourquoi : l'API ou le stockage se remplace sans toucher au domaine (ADR 1).

## V. Le test précède le code

Tout diff qui modifie `bookit/domain/` ajoute ou modifie un test dans `tests/`,
et ce test échoue avant le code. Claude Code lance pytest avant de répondre.
Pourquoi : un test qui échoue avant le code prouve que la règle manquait.

## VI. ruff sans constat

`uv run ruff check` et `uv run ruff format --check` passent sur chaque commit ;
la règle `I` trie les imports. Le code reste lisible et maintenable.
Pourquoi : un import interdit se lit en tête de fichier dans le diff.

## VII. Un commit par étape

Chaque étape du workflow produit un commit, relu avant d'être fait ; l'agent
ne commite pas.
Pourquoi : chaque diff se relit contre la constitution avant d'entrer dans
l'historique.

## Contraintes techniques

Python 3.14 géré par uv. FastAPI et SQLite restent en place (ADR 2 et 3) :
l'API et le stockage ne changent pas pendant l'écriture de `validate_booking`.
Le conteneur et l'authentification par fournisseur d'identité (ADR 4 et 5)
attendent la fin de `validate_booking`.

## Workflow

Spécification, plan, tâches, code : chaque artefact est relu et commité avant
l'étape suivante.

## Governance

Cette constitution prime sur toute autre pratique du projet. Un amendement porte
son pourquoi, cite l'ADR qui le motive quand il en a un, et incrémente la
version : MAJOR pour un principe retiré ou redéfini, MINOR pour un principe
ajouté, PATCH pour une reformulation.
