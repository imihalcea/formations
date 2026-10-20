# Fil rouge bookit

Projet fil rouge de la formation : domaine, contraintes techniques, trajectoire des TP (issue #52), composition de l'archive, procédure de superposition des corrigés, puis environnement technique relevé (issue #48). Les nombres de tests et de mutants sont confirmés par les corrigés des TP, construits module par module, et par leur rejeu (`/rejeu NN`, puis `/rejeu tous`, #57) ; d'ici là, les valeurs marquées « à confirmer » viennent de l'ancien support.

## Domaine

bookit réserve des ressources (salle, équipement, personne). L'API reçoit une demande de réservation sur une ressource nommée et l'enregistre quand la règle `validate_booking` l'accepte. Le squelette `fil-rouge/` est hexagonal :

| Couche | Fichiers | Rôle |
|---|---|---|
| domaine, `bookit/domain/` | `models.py` (`Booking`, `Resource`, `InvalidBooking`), `ports.py` (`BookingRepository`, `Clock`), `validate_booking.py` | règles métier pures : aucun import hors du domaine, horloge reçue en paramètre |
| application, `bookit/application/` | `request_booking.py` | charge la ressource, appelle `validate_booking(booking, resource, clock.now())`, enregistre si le résultat est `None` |
| infrastructure, `bookit/infrastructure/` | `api.py` (FastAPI, `POST /resources/{name}/bookings`, 201 ou 422 avec `{"detail": {"code": …}}`), `sqlite_repository.py`, `system_clock.py` | adaptateurs |
| tests, `tests/` | `conftest.py` (base SQLite temporaire par `BOOKIT_DB`), `test_fumee.py` | un test : l'API enregistre une réservation le lundi suivant de 10h à 11h |

`validate_booking(booking, resource, now) -> InvalidBooking | None` est la seule fonction que les TP font écrire. Dans le squelette elle rend `None` : l'API accepte tout, deux `POST` identiques répondent 201. Un refus est une valeur de retour `InvalidBooking(code)`, jamais une exception (ADR 1) ; le domaine ne lit pas l'horloge système (ADR 2) ; les dépendances pointent vers le domaine (ADR 3, « Architecture hexagonale », illustré au module 2). Les trois ADR sont dans `tp/fichiers/adr/`.

Règles métier fournies (`tp/fichiers/regles-metier.md`), un code d'erreur par règle :

| Exigence | Règle | Code |
|---|---|---|
| REG-01 | durée entre 30 minutes et 4 heures | `duration` |
| REG-02 | en semaine, de 8h à 20h | `hours` |
| REG-03 | au moins 2 heures de préavis | `lead_time` |
| REG-04 | au plus 60 jours à l'avance | `horizon` |
| REG-05 | aucun chevauchement sur une même ressource ; créneau demi-ouvert, deux créneaux jointifs ne se chevauchent pas | `overlap` |

Deux exigences s'ajoutent au TP 4, sans code propre : REG-06, un seul code rendu, celui de la première règle enfreinte dans l'ordre REG-01 à REG-05 (réponse du produit à `clarify`) ; REG-07, la décision dépend du seul instant courant fourni en entrée (exigence de reproductibilité du brief). Les autres réponses du produit (`tp/fichiers/clarifications.md`) : les jours fériés restent ouvrés, un seul fuseau horaire local implicite, quota, annulation, pools de ressources et approbation hors périmètre, API et stockage inchangés.

Les scénarios Gherkin fournis (`tp/fichiers/valider-reservation.feature`, 24 exemples, à confirmer) fixent l'instant courant au mardi 2 juin 2026 à 9h00 et testent chaque borne des deux côtés. L'exemple du dimanche (REG-02) en est absent à dessein : la passe de mutation du TP 6 (partie B) laisse survivre `weekday() >= 5` muté en `== 5`, le stagiaire ajoute l'exemple dans la spécification et le `.feature`, puis rejoue la passe. Convention fixée au module 2 : mots-clés français dans les skills `ears` et `gherkin`, la surcharge `spec-template.md`, le `.feature` (`# language: fr`, `Fonctionnalité`, `Scénario`, `Soit`, `Quand`, `Alors`) et les tests pytest-bdd ; la prise en charge de `# language: fr` par pytest-bdd est à vérifier par `verificateur-sources` au module 6.

Dates du `curl`. `test_fumee.py` réserve le lundi suivant de 10h à 11h, ce qui respecte les cinq règles quel que soit le jour de la formation : le test reste vert une fois les règles écrites. Le `curl` des énoncés calcule sa date de même, `$(date -d 'next monday' +%F)T10:00:00`, pour tenir dans le préavis et l'horizon. Au TP 3, deux envois identiques répondent 201 (aucune règle). Au TP 6 (partie A), l'énoncé envoie deux fois la même demande : le second envoi répond 422 `overlap` dans tous les cas ; le premier aussi quand `bookit.db` porte encore la réservation du TP 3 et que le lundi suivant n'a pas changé entre les deux journées.

## Présentation de bookit dans le support

Aux sessions précédentes, comprendre le domaine a pris trop de temps aux stagiaires et a retardé les TP. Le support présente donc le projet avant qu'ils y touchent, en deux temps.

Module 1, avant le lancement du TP 1 : une slide « Les règles métier de bookit », le tableau REG-01 à REG-05 avec les codes, parce que l'échauffement du TP 1 fait écrire une validation à partir de ces règles.

Module 3, section « Le fil rouge bookit » placée juste avant la slide de lancement du TP 3. Elle présente le projet du point de vue fonctionnel et les concepts métier avant toute considération technique ; le code n'arrive qu'en fin de section. Sept slides, chacune avec son support visuel :

| Slide | Idée | Support visuel |
|---|---|---|
| À quoi sert bookit | un demandeur réserve une ressource (salle, équipement, personne) sur un créneau ; bookit accepte, ou refuse en disant pourquoi | schéma demandeur, bookit, décision, avec un exemple concret (salle A, jeudi de 10h à 11h, acceptée ; samedi, refusée `hours`) |
| Les concepts métier | ressource, demande de réservation, créneau, réservation confirmée, décision, code de refus, instant courant | SVG : la ligne du temps d'une ressource, ses réservations confirmées, une demande, l'instant courant |
| Les règles métier | REG-01 à REG-05, un code par règle | tableau repris du module 1, chaque règle placée sur la ligne du temps |
| Une journée de la salle A | trois demandes jugées à la suite, deux acceptées, une refusée avec son code | la même ligne du temps, illustration |
| Le squelette | trois couches, dépendances vers le domaine, la décision est une valeur de retour | SVG des couches avec les fichiers de `fil-rouge/` |
| Fourni et à construire | fourni : API, dépôt SQLite, horloge, modèles, ports, test de fumée ; à construire : `validate_booking`, ses tests, les artefacts SDD | slide `compare` |
| Ce que chaque TP ajoute | constitution, spécification, plan et tâches, code et tests | la table de la trajectoire, sous forme de frise |

La slide « Fourni et à construire » montre le stub : `validate_booking` rend `None`, l'API accepte tout, ce que le TP 3 fait constater par deux `curl` à 201. Les concepts métier entrent au lexique (`formateur/lexique.md`, section « Domaine bookit ») et les slides, les énoncés et les artefacts de référence les emploient sous ce seul nom. Le plan du module 3 (#66) reprend cette section ; le plan du module 1 (#59) reprend la slide des règles.

## Contraintes techniques

- Python 3.14 géré par uv : `requires-python = ">=3.14"`, `.python-version`, `uv.lock` versionné ; dépendances `fastapi` et `uvicorn` ; groupe `dev` : `httpx2`, `pytest`, `pytest-bdd`, `ruff`. cosmic-ray entre au TP 6 (partie B) par `uv add --dev cosmic-ray==8.7.0`. `pythonpath = ["."]` dans la configuration pytest est indispensable : sans lui, le `uv run pytest` lancé par cosmic-ray échoue à la collecte (voir Environnement).
- Un seul fichier de contexte, `AGENTS.md`, écrit au TP 4 et lu par les deux outils ; aucun `CLAUDE.md`. Un seul dossier de skills, `.claude/skills/`, lu par les deux outils ; aucun `.opencode/skills/`.
- Spec Kit 1.2.2, initialisé au TP 3 par `specify init --here --force --integration claude|opencode --script sh`. Seule divergence entre les projets des deux outils : les commandes Spec Kit (`.claude/skills/speckit-<commande>/SKILL.md` sous Claude Code, `.opencode/commands/speckit.<commande>.md` sous Open Code) et `.specify/integration.json`, qui porte l'intégration choisie. Le reste de `.specify/` est identique au séparateur près : trois templates et deux scripts écrivent `/speckit-x` ou `/speckit.x` (relevé du 20 octobre 2026) ; les artefacts produits ne dépendent pas de l'outil. Pas d'extension git : tout se passe sur `main`, les artefacts vont dans `specs/001-valider-reservation/`. `.specify/feature.json` (feature courante) est écrit par `specify` au TP 4 et ignoré par git. L'option `--integration-options="--no-model-invocation"` (Claude Code seulement) reste à trancher par l'énoncé du TP 3. Détail dans `formateur/spec-kit.md`.
- Modèle `claude-sonnet-4-6` par Bedrock, épinglé dans `.claude/settings.json` et `opencode.json` du fil rouge, qui autorisent sans question `uv run pytest` et les scripts `.specify/scripts/bash/`. Toute autre commande et toute écriture demandent une permission, que le stagiaire lit avant d'accorder.
- Le stagiaire commite lui-même après chaque étape ; l'agent ne commite pas et ne lance aucune commande git. Messages au format « TP N : … ». Le nombre de commits est l'attendu de fin de chaque TP : `git log --oneline | wc -l`.
- `uv run ruff check` et `uv run ruff format --check` passent à la fin de chaque TP ; les corrigés y sont soumis.

## Trajectoire des TP

Une seule copie de `~/bookit/` du TP 1 au TP 6, aucun état intermédiaire fourni, chaque TP terminé avant le suivant. L'état d'arrivée d'un TP est le point de départ du suivant.

| Fin de | Ajouté ou modifié dans `~/bookit/` | Commits cumulés | Tests verts |
|---|---|---|---|
| TP 1 | rien ; `~/echauffement/` et `~/hello-spec/` jetables | 0 (pas de dépôt) | |
| TP 3 | `.git`, `.venv` (ignoré), `.specify/`, commandes de l'outil, `docs/adr/`, `docs/constitution-base.md`, `.specify/memory/constitution.md` 1.0.1 | 4 | 1 |
| TP 4 | `AGENTS.md`, `.claude/skills/{ears,gherkin}/`, `docs/{brief,regles-metier,clarifications}.md`, `.specify/templates/overrides/spec-template.md`, `specs/001-valider-reservation/spec.md` (REG-01 à REG-07) et `checklists/requirements.md` | 9 | 1 |
| TP 5 | `specs/001-valider-reservation/valider-reservation.feature`, `spec.md` réaligné, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `.specify/templates/overrides/tasks-template.md`, `tasks.md` | 14 | 1 |
| TP 6, partie A | `tests/test_valider_reservation.py`, `bookit/domain/validate_booking.py`, `tasks.md` coché | 19 | 25 (à confirmer) |
| TP 6, partie B | `cosmic-ray.toml`, `pyproject.toml` et `uv.lock` (cosmic-ray), `specs/001-valider-reservation/mutation.md`, exemple du dimanche dans `spec.md`, le `.feature` et les tests | 21 | 26 (à confirmer) |

### TP 1, partie A (module 1) et partie B (module 2)

Départ : VM configurée, `dlaia.zip` reçu.

Travail, partie A : `unzip -d ~ dlaia.zip` donne `~/dlaia.html`, `~/bookit/` et `~/fichiers/`. Dans `~/echauffement/`, dossier jetable, l'agent écrit une validation de réservation sur un prompt d'une phrase (v1), puis sur un prompt à quatre composants avec `docs/regles-metier.md` copié de `~/fichiers/` (v2) ; grille de comparaison à trois lignes. Partie B : `uv tool install specify-cli==1.2.2`, `specify init hello-spec --integration claude|opencode --script sh`, grille de visite à six lignes, complétion `/speckit` dans l'outil sans lancer de commande.

Arrivée : `~/bookit/` intact, sans `.git` ni `.venv` ; `specify version` répond 1.2.2. Aucun commit.

Corrigé `tp/tp01/` : v2 d'illustration, grilles remplies ; rien dans le fil rouge.

Relevé du 20 octobre 2026 (partie A, rejeu non interactif, `claude-sonnet-4-6` dans les deux outils) : le prompt d'une phrase nomme le fichier à écrire (`écris dans un fichier validate_booking_v1.py …`), parce que sans nom de fichier Claude Code en mode `-p` a répondu dans le fil sans rien écrire ; la v1 produite invente un domaine d'hôtel (`guests`, `room_id`, dates d'arrivée et de départ) et aucune des cinq règles ; la v2 couvre les cinq règles avec les cinq codes dans les deux outils, bornes 30 min, 4 h et 20h00 acceptées, `Optional[InvalidBooking]` au lieu de `| None`. Durées agent : 18 s et 21 s sous Claude Code, 9 s et 11 s sous Open Code. Piège d'outillage : après un `opencode run` lancé sans `--auto` sur une action `ask`, le service de fond d'Open Code (`opencode service status`) n'a plus rien rendu aux appels suivants, même avec `--auto` ; `opencode service restart` a suffi.

### TP 3 (module 3, 50 min)

Départ : `~/bookit/` extrait, Spec Kit installé.

Travail :

1. `uv sync`, `uv run pytest -q` (1 test), `git init`, commit du squelette. API lancée par `uv run uvicorn bookit.infrastructure.api:app`, deux `curl` identiques répondent 201 puis 201 : aucune règle.
2. `specify init --here --force --integration claude|opencode --script sh`, `~/fichiers/adr/` copié dans `docs/adr/`, `~/fichiers/constitution-base.md` copié dans `docs/constitution-base.md`, commit.
3. `/speckit-constitution` (ou `/speckit.constitution`) avec un prompt qui part de `docs/constitution-base.md`, cite un ADR par principe et interdit d'ajouter des principes ; Sync Impact Report retiré ; commit de la version 1.0.0.
4. Relecture à trois questions par principe (vérifiable sur un diff ? ADR cité ? aucune règle métier ?) ; les trois phrases pièges de la base sont corrigées à la main ; commit de la version 1.0.1.
5. `git apply ~/fichiers/violation.diff`, jugement ligne par ligne contre la constitution, `git checkout -- .` ; aucun commit.

Commits : `TP 3 : squelette bookit`, `TP 3 : Spec Kit et ADR`, `TP 3 : constitution 1.0.0`, `TP 3 : constitution 1.0.1`.

Arrivée : 4 commits, `git status --short` vide, 1 test vert, `bookit.db` (ignoré) porte deux réservations.

Corrigé `tp/tp03/` : `docs/adr/`, `docs/constitution-base.md`, `.specify/memory/constitution.md` 1.0.1.

### TP 4 (module 4, 60 min)

Départ : arrivée du TP 3.

Travail :

1. `~/fichiers/skills/ears/` et `~/fichiers/skills/gherkin/` copiés dans `.claude/skills/`, `~/fichiers/AGENTS.md` copié à la racine, ses deux `<TODO>` remplis ; commit.
2. `~/fichiers/brief.md` et `~/fichiers/regles-metier.md` copiés dans `docs/`, `~/fichiers/spec-template.md` copié dans `.specify/templates/overrides/spec-template.md` (exigences REG-NN en EARS, bloc Gherkin par parcours) ; commit.
3. `/speckit-specify` sur le brief, jusqu'à trois questions en bloc ; commit du brouillon.
4. `~/fichiers/clarifications.md` copié dans `docs/`, `/speckit-clarify`, jusqu'à cinq questions une à la fois, réponses prises dans `docs/clarifications.md` ; commit.
5. Prompt de réconciliation : sept exigences REG-01 à REG-07, un scénario Gherkin par exigence ; relecture à la main ; commit.

Commits : `TP 4 : skills et AGENTS.md`, `TP 4 : brief et template de spécification`, `TP 4 : brouillon de spécification`, `TP 4 : spécification clarifiée`, `TP 4 : spécification relue`.

Arrivée : 9 commits, `spec.md` à sept exigences, `.specify/feature.json` présent et non versionné, 1 test vert.

Corrigé `tp/tp04/` : le contenu de `tp/tp03/` plus `AGENTS.md`, `.claude/skills/{ears,gherkin}/`, `docs/{brief,regles-metier,clarifications}.md`, la surcharge, `specs/001-valider-reservation/spec.md` et `checklists/requirements.md`.

Point ouvert pour le rejeu du TP 4 (#72) : `specify` charge-t-il les skills `ears` et `gherkin` de lui-même ? Sinon le prompt de l'étape 3 les nomme.

### TP 5 (module 5, 60 min)

Départ : arrivée du TP 4.

Travail :

1. `~/fichiers/valider-reservation.feature` copié dans `specs/001-valider-reservation/`, scénarios de `spec.md` alignés sur lui ; commit.
2. `/speckit-plan` avec un prompt qui ferme les dérives : domaine seul, pytest-bdd, aucun contrat d'API, API et stockage inchangés ; commit.
3. Relecture à trois points, corrections à la main ; commit.
4. `~/fichiers/tasks-template.md` copié dans `.specify/templates/overrides/tasks-template.md` : tests obligatoires, une paire Test REG-NN et Code REG-NN par exigence, à la place de « Tests are OPTIONAL » ; commit.
5. `/speckit-tasks`, relecture (T001 harnais, paires Test et Code pour REG-01 à REG-05, Test seul pour REG-06 et REG-07), `/speckit-analyze` en lecture seule, remédiations appliquées à la main ; commit.

Commits : `TP 5 : scénarios Gherkin`, `TP 5 : plan`, `TP 5 : plan relu`, `TP 5 : template de tâches`, `TP 5 : tâches relues`.

Arrivée : 14 commits, `tasks.md` sans case cochée, `validate_booking` rend toujours `None`, 1 test vert.

Corrigé `tp/tp05/` : le contenu de `tp/tp04/` plus le `.feature`, `spec.md` réaligné, `plan.md` et ses annexes, la surcharge, `tasks.md`.

### TP 6, partie A (module 6, 65 min)

Lancée par une slide après la section « Du scénario au test ». Départ : arrivée du TP 5.

Travail :

1. `/speckit-implement` borné à T001 : harnais pytest-bdd (fichier de test, définitions des étapes, aucun scénario lié) ; diff relu, suite verte ; commit.
2. Tâche Test REG-01 : scénarios de la durée liés, échec constaté sur 10h29 et 14h01 ; commit du rouge.
3. Session neuve (`/clear` ou `/new`), tâche Code REG-01 : diff relu en deux temps, vert ; commit.
4. REG-02 à REG-05, même geste par paire, en un lot ; commit.
5. Tâches restantes (Test REG-06, Test REG-07, finition), `tasks.md` entièrement coché ; commit. API relancée, le `curl` du TP 3 envoyé deux fois répond 422 `overlap`.

Commits : `TP 6 : harnais pytest-bdd`, `TP 6 : REG-01 rouge`, `TP 6 : REG-01 vert`, `TP 6 : REG-02 à REG-05`, `TP 6 : tâches restantes`.

Arrivée : 19 commits, suite verte (1 test de fumée et 24 scénarios, à confirmer), `git log --oneline -- bookit/application bookit/infrastructure` ne montre que le commit du squelette, `tasks.md` tout coché.

### TP 6, partie B (module 6, 40 min)

Lancée en fin de module, après « Couverture et mutation » et « Converger ». Départ : arrivée de la partie A, code et tests de `validate_booking` écrits par `implement`.

Travail :

1. `uv add --dev cosmic-ray==8.7.0`, `~/fichiers/cosmic-ray.toml` copié à la racine et `~/fichiers/mutation.md` dans `specs/001-valider-reservation/`, passe 1 (`baseline`, `init`, `exec`, `cr-report --surviving-only`), survivants relevés dans `mutation.md` ; commit. Le fichier de session de cosmic-ray n'est pas commité.
2. Analyse des survivants par l'agent : prompt qui lui donne la sortie de `cr-report --show-diff` et demande, pour chaque survivant, mutant équivalent ou trou dans les tests, et le cas manquant ; le stagiaire juge le classement. Cas ajoutés dans `spec.md`, le `.feature` et les tests (l'exemple du dimanche dans tous les cas), suite verte, passe 2, `mutation.md` à deux passes ; commit.

Commits : `TP 6 : mutation, passe 1`, `TP 6 : trous comblés, passe 2`.

Arrivée : 21 commits, suite verte (1 test de fumée et 25 scénarios, à confirmer), `mutation.md` à deux passes.

Corrigé `tp/tp06/` : le contenu de `tp/tp05/` plus `bookit/domain/validate_booking.py`, `tests/test_valider_reservation.py`, `tasks.md` coché, `cosmic-ray.toml`, `pyproject.toml`, `uv.lock`, `mutation.md`, `spec.md` et `.feature` complétés.

## Archive distribuée

`npm run dist`, depuis `template-support/app/`, produit `dist/dlaia.zip` par `scripts/archive.sh`. Contenu, à plat :

| Entrée | Source | Exclusions |
|---|---|---|
| `dlaia.html` | `dist/index.html` | |
| `bookit/` | `fil-rouge/` | `.venv`, `__pycache__`, `.pytest_cache`, `.ruff_cache`, `*.db`, `.git` |
| `fichiers/` | `tp/fichiers/` | |

`unzip -d ~ dlaia.zip` donne `~/dlaia.html`, `~/bookit/` et `~/fichiers/`. Le `bookit/` extrait contient `uv.lock`, `opencode.json` et `.claude/settings.json`, aucun `.git` : le TP 3 commence par `uv sync` et `git init`. Vérifié le 19 octobre 2026 : 28 fichiers, `dlaia.html` à la racine de l'archive.

Fichiers fournis, par TP :

| Fichier de `tp/fichiers/` | TP | Destination |
|---|---|---|
| `regles-metier.md` | 1, 4 | `~/echauffement/docs/`, puis `docs/` |
| `adr/` (3 ADR) | 3 | `docs/adr/` |
| `constitution-base.md` | 3 | `docs/constitution-base.md` |
| `violation.diff` | 3 | appliqué puis annulé |
| `skills/ears/`, `skills/gherkin/` | 4 | `.claude/skills/` |
| `AGENTS.md` (deux `<TODO>`) | 4 | racine |
| `brief.md`, `clarifications.md` | 4 | `docs/` |
| `spec-template.md` | 4 | `.specify/templates/overrides/` |
| `valider-reservation.feature` | 5 | `specs/001-valider-reservation/` |
| `tasks-template.md` | 5 | `.specify/templates/overrides/` |
| `cosmic-ray.toml` | 6 | racine |
| `mutation.md` | 6 | `specs/001-valider-reservation/` |

## Superposer un corrigé au fil rouge et le tester

`tp/tpNN/` contient les fichiers ajoutés ou modifiés par le TP, en état cumulé depuis le TP 3 : `tp/tp06/` superposé au squelette donne l'état d'arrivée du TP 6. Les fichiers déposés par `specify init` (`.specify/`, commandes de l'outil) n'y figurent pas : ils se régénèrent depuis la version épinglée et leur contenu dépend de l'outil. Seuls `.specify/memory/constitution.md`, qui écrase la copie vierge du template, et `.specify/templates/overrides/` sont dans les corrigés.

```sh
cd ~/formations/dlaia
rm -rf tmp/superposition && mkdir -p tmp/superposition
rsync -a --exclude .venv --exclude __pycache__ --exclude .pytest_cache \
  --exclude .ruff_cache --exclude '*.db' fil-rouge/ tmp/superposition/bookit/
cd tmp/superposition/bookit
specify init --here --force --integration claude --script sh --ignore-agent-tools
rsync -a ../../../tp/tp06/ ./
uv sync && uv run pytest -q && uv run ruff check && uv run ruff format --check
```

`--ignore-agent-tools` saute la vérification de présence de `claude` dans le `PATH`. Procédure vérifiée le 19 octobre 2026 sur le squelette seul : `specify init` dépose `.specify/` et dix skills, 1 test vert, ruff sans constat. Les corrigés des TP 3 à 5 passent la même commande avec 1 test vert (`validate_booking` rend `None`). Pour `tp/tp06/`, la passe de mutation s'ajoute, dans l'ordre (le `baseline` doit passer avant `exec`, sinon tous les mutants comptent tués) :

```sh
uv run cosmic-ray baseline cosmic-ray.toml
uv run cosmic-ray init cosmic-ray.toml mutation.sqlite
uv run cosmic-ray exec cosmic-ray.toml mutation.sqlite
uv run cr-report mutation.sqlite --surviving-only
```

Syntaxe relevée le 19 octobre 2026 dans `cosmic-ray --help` 8.7.0 : `init CONFIG_FILE SESSION_FILE`, `baseline CONFIG_FILE`, `exec CONFIG_FILE SESSION_FILE`, `cr-report SESSION_FILE` avec `--surviving-only` et `--show-diff`.

Cette procédure vérifie le code et les tests. Les commandes Spec Kit ne sont pas rejouées par elle : c'est l'objet du rejeu non interactif (`/rejeu NN`, puis `/rejeu tous` en fin de parcours, #57).

## Environnement (issue #48)

Relevés faits le 19 octobre 2026 sur le poste de préparation, puis confirmés le même jour sur la VM des stagiaires (seule différence : Open Code v2.0.32 sur la VM).

### Versions relevées

| Composant | Poste de préparation | VM (19 octobre 2026) | Exigence du support |
|---|---|---|---|
| Python | 3.14.4 (`uv python list`) | 3.14 | 3.14, géré par uv |
| uv | 0.11.19 | conforme | |
| Claude Code | 2.1.303 | conforme | 2.1.277 au moins : lecture d'`AGENTS.md` à défaut de `CLAUDE.md` |
| Open Code | v2.0.26 | v2.0.32 | v2 |
| Spec Kit | 1.2.2, épinglé par `uv tool install specify-cli==1.2.2` | 1.2.2 | 1.2.2 |
| cosmic-ray | 8.7.0 | | |
| pytest | 9.1.1 | | |

### Mutation testing : cosmic-ray conservé

cosmic-ray 8.7.0 ne déclare pas Python 3.14 dans ses métadonnées, mais il s'installe et fonctionne sous 3.14.4. Test fait sur un projet jetable (`uv init --python 3.14`, `uv add --dev pytest cosmic-ray==8.7.0`) avec deux fonctions et deux tests :

- `cosmic-ray --version` : 8.7.0 ; `import cosmic_ray.cli` sous `python -W error` sans avertissement de dépréciation ;
- `cosmic-ray baseline` passe ; `init` puis `exec` : 18 mutants, 4 survivants, `cr-report` lisible.

Décision : cosmic-ray reste l'outil du module 6 et du TP 6 ; le repli mutmut est abandonné. Configuration de référence (reprise dans `tp/fichiers/cosmic-ray.toml`) :

```toml
[cosmic-ray]
module-path = "bookit/domain"
timeout = 30.0
excluded-modules = []
test-command = "uv run pytest -q tests"

[cosmic-ray.distributor]
name = "local"
```

Piège relevé : `test-command` est exécuté depuis la racine du projet, et pytest n'ajoute pas cette racine au `sys.path` par défaut. Sans `pythonpath = ["."]` dans `[tool.pytest.ini_options]` (ou un paquet installé), chaque exécution échoue à la collecte et cosmic-ray compte tous les mutants comme tués : le baseline doit être lancé avant `exec`.

### Modèle : Sonnet 4.6 par Amazon Bedrock

Sonnet 4.6 est servi par Bedrock sous forme de profil d'inférence (`inferenceTypesSupported: INFERENCE_PROFILE`), jamais par l'identifiant nu `anthropic.claude-sonnet-4-6` en appel à la demande. Identifiants relevés par `aws bedrock list-inference-profiles` :

| Région | Profils actifs pour Sonnet 4.6 |
|---|---|
| eu-west-1, eu-west-3 | `eu.anthropic.claude-sonnet-4-6`, `global.anthropic.claude-sonnet-4-6` |
| us-east-1 | `us.anthropic.claude-sonnet-4-6`, `global.anthropic.claude-sonnet-4-6` |

**Claude Code.** Avec `CLAUDE_CODE_USE_BEDROCK=1`, `claude --model claude-sonnet-4-6` résout l'identifiant Anthropic vers le profil du préfixe de la région (`eu.` pour une région `eu-*`, `us.` pour `us-*`, `global.` ailleurs ; `ANTHROPIC_BEDROCK_REGION_PREFIX` force le préfixe). Vérifié en eu-west-3 par `claude -p --output-format json` : `modelUsage` rapporte `canonicalModel: claude-sonnet-4-6`, `provider: bedrock`, fenêtre de 200 000 tokens, cache de prompt actif (22 210 tokens lus en cache sur un appel d'un mot). La région est lue dans l'ordre `AWS_REGION`, `AWS_DEFAULT_REGION`, région du profil AWS actif, puis `us-east-1`. Sans `--model`, le modèle par défaut de Claude Code sur Bedrock est Opus 5.5 : le fil rouge épingle `"model": "claude-sonnet-4-6"` dans `.claude/settings.json`. Source : https://code.claude.com/docs/en/amazon-bedrock (sections « Configure Claude Code », « Pin model versions », « Cross-region inference profile prefixes »).

**Open Code.** Le fournisseur `amazon-bedrock` connaît `eu.anthropic.claude-sonnet-4-6`, `us.anthropic.claude-sonnet-4-6` et `global.anthropic.claude-sonnet-4-6` (catalogue models.dev, `opencode models`). Le modèle se désigne `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`, dans la clé `model` d'`opencode.json` ou par `opencode run --model`. La région vient de `AWS_REGION` ou de `provider.amazon-bedrock.options.region` ; sans l'une ni l'autre, l'appel échoue avec « The provided model identifier is invalid » (le profil `eu.` n'existe pas dans la région par défaut). Les identifiants AWS viennent de la chaîne habituelle (variables, profil, rôle de la machine) ; `AWS_BEARER_TOKEN_BEDROCK` prime sur tout le reste. Vérifié en eu-west-3 et en eu-west-1 : `opencode run` affiche `build · eu.anthropic.claude-sonnet-4-6` et répond. Source : https://opencode.ai/docs/providers/#amazon-bedrock.

### Fichiers du fil rouge

`fil-rouge/opencode.json` : modèle `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`, région `eu-west-1`, `edit` en `ask`, `bash` en `ask` sauf `uv run pytest*` et `.specify/scripts/bash/*` (dernière règle correspondante gagnante, https://opencode.ai/docs/permissions/).

En mode non interactif (`opencode run`), une commande `ask` est refusée d'office (« This non-interactive run cannot ask the user for permission ») et l'agent continue sans elle ; `--auto` approuve tout ce qui n'est pas `deny`. Vérifié le 19 octobre 2026 avec `echo *` en `allow` et `printf` en `ask`. Le rejeu utilise donc `--auto`. Avec `--standalone`, trois appels dont la sortie partait dans un tube sans `--print-logs` n'ont jamais rendu la main ; le mode service par défaut, sortie JSON comprise, n'a pas ce défaut.

`fil-rouge/.claude/settings.json` : `model` épinglé à `claude-sonnet-4-6`, règles `allow` pour `Bash(uv run pytest *)` et `Bash(.specify/scripts/bash/*)` (https://code.claude.com/docs/en/permissions, « Wildcard patterns »). L'activation de Bedrock (`CLAUDE_CODE_USE_BEDROCK`, région) reste dans la configuration globale de la VM : le fil rouge ne porte aucune variable d'environnement.

### Contrôles faits sur la VM (19 octobre 2026)

Tous conformes, Open Code en v2.0.32. À rejouer si la VM est reconstruite :

- Versions installées : `claude --version` (2.1.277 au moins), `opencode --version` (v2), `uv --version`, `uv python list` (3.14), `specify --version` (1.2.2).
- Région et profils : `aws bedrock list-inference-profiles --region <région> --query 'inferenceProfileSummaries[?contains(inferenceProfileId, \`sonnet-4-6\`)].inferenceProfileId'`. Si la VM tourne hors `eu-*`, remplacer `eu.` par le préfixe de la région (ou `global.`) dans `opencode.json`, et ajuster `options.region`.
- Claude Code : `CLAUDE_CODE_USE_BEDROCK=1` et la région sont fournis par la configuration globale (`~/.claude/settings.json`, bloc `env`) ; `claude --model claude-sonnet-4-6 -p 'OK' --output-format json` doit rapporter `provider: bedrock`.
- Open Code : `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-4-6 'OK'` depuis `~/bookit` doit afficher `build · eu.anthropic.claude-sonnet-4-6`.
- Droits IAM du rôle : `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `bedrock:ListInferenceProfiles`, `bedrock:GetInferenceProfile` sur les profils et modèles de fondation.
