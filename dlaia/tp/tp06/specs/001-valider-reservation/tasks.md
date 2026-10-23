# Tasks: Valider une demande de réservation

**Input**: documents de conception de `/specs/001-valider-reservation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Tests obligatoires : une tâche Test avant chaque tâche Code.

**Organization**: une phase par exigence REG-NN, dans l'ordre des exigences de spec.md.

## Format: `[ID] [REG-NN] Test ou Code : description dans chemin`

- **[REG-NN]**: l'exigence de spec.md que la tâche vérifie (Test) ou réalise (Code)
- **Chemin**: chaque tâche cite son fichier, `tests/test_valider_reservation.py` pour un test et `bookit/domain/validate_booking.py` pour le code
- **[P]**: aucune tâche de ce fichier ne le porte, tous les fichiers sont partagés

## Phase 1 : socle de test

- [X] T001 Socle de test : fichier de test et fonctions pytest-bdd dans tests/test_valider_reservation.py, aucun scénario lié, tests existants inchangés

---

## Phase 2 : REG-01

- [X] T002 [REG-01] Test : scénarios de la durée dans tests/test_valider_reservation.py
- [X] T003 [REG-01] Code : durée dans bookit/domain/validate_booking.py

---

## Phase 3 : REG-02

- [X] T004 [REG-02] Test : scénarios des horaires dans tests/test_valider_reservation.py
- [X] T005 [REG-02] Code : horaires dans bookit/domain/validate_booking.py

---

## Phase 4 : REG-03

- [X] T006 [REG-03] Test : scénarios du préavis dans tests/test_valider_reservation.py
- [X] T007 [REG-03] Code : préavis dans bookit/domain/validate_booking.py

---

## Phase 5 : REG-04

- [X] T008 [REG-04] Test : scénarios de l'horizon dans tests/test_valider_reservation.py
- [X] T009 [REG-04] Code : horizon dans bookit/domain/validate_booking.py

---

## Phase 6 : REG-05

- [X] T010 [REG-05] Test : scénarios du chevauchement dans tests/test_valider_reservation.py
- [X] T011 [REG-05] Code : chevauchement dans bookit/domain/validate_booking.py

---

## Phase 7 : REG-06

- [X] T012 [REG-06] Test : un seul code, celui de la première règle enfreinte, dans tests/test_valider_reservation.py

---

## Phase 8 : REG-07

- [X] T013 [REG-07] Test : même demande, même instant courant, même décision, dans tests/test_valider_reservation.py

---

## Phase 9 : finition

- [X] T014 Finition : `uv run ruff check` et `uv run ruff format --check` sans constat, test de fumée vert, cases de specs/001-valider-reservation/tasks.md cochées

---

## Dependencies & Execution Order

- Phase 1 d'abord : chaque tâche Test s'appuie sur le socle de test.
- Les phases suivent l'ordre des règles, REG-01 à REG-07.
- Dans une phase, la tâche Test précède la tâche Code, et le test échoue avant le code.
- Aucun `[P]` à l'intérieur d'une paire : même fichier de test, même fichier de code.
- La finition vient en dernier.

---

## Implementation Strategy

1. Une tâche par session : fenêtre de contexte vidée entre deux tâches.
2. Après chaque tâche : `uv run pytest -q`, relecture du diff contre la constitution, commit à la main.
3. L'agent ne commite pas.

---

## Notes

- Une tâche Test REG-NN n'écrit que des scénarios liés au fichier `.feature`, aucun code du domaine.
- Une tâche Code REG-NN n'ajoute qu'une règle, appelée dans l'ordre des règles.
- Éviter : une tâche sans chemin de fichier, un fichier hors `tests/` et `bookit/domain/`.
