# Implementation Plan: Valider une demande de réservation

**Branch**: `001-valider-reservation` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-valider-reservation/spec.md`

## Summary

`validate_booking` applique les cinq règles métier REG-01 à REG-05 à une demande de réservation et rend `None` ou `InvalidBooking(code)`. Les règles s'écrivent dans le domaine seul, une fonction interne par règle, appelées dans l'ordre REG-01 à REG-05 : le premier refus donne l'unique code rendu (REG-06). L'instant courant arrive en paramètre (REG-07). Les scénarios de `valider-reservation.feature` sont liés à des tests pytest-bdd. L'API et le stockage ne changent pas.

## Technical Context

**Language/Version**: Python 3.14, géré par uv

**Primary Dependencies**: aucune dépendance nouvelle ; pytest-bdd, déjà dans le groupe `dev`, lie les scénarios aux tests

**Storage**: N/A, le dépôt SQLite existant n'est pas touché

**Testing**: pytest et pytest-bdd, scénarios de `specs/001-valider-reservation/valider-reservation.feature`

**Target Platform**: Linux, le service FastAPI existant

**Project Type**: service web existant, seul le domaine change

**Performance Goals**: N/A, la spécification n'en demande aucun

**Constraints**: domaine pur (aucun import hors de `bookit.domain` et de la bibliothèque standard), horloge reçue en paramètre, refus rendu par valeur de retour

**Scale/Scope**: une fonction publique, cinq règles, dix-neuf scénarios

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 1.0.1, une ligne par principe.

- **I. Un refus est une valeur de retour** : respecté, `validate_booking` rend `InvalidBooking(code)` ou `None`, aucune exception.
- **II. L'horloge est un paramètre** : respecté, l'instant courant arrive dans `now`, aucun appel à `datetime.now()`.
- **III. Les dépendances pointent vers le domaine** : respecté, le fichier du domaine n'importe que `bookit.domain` et la bibliothèque standard.
- **IV. Chaque fichier a sa couche** : respecté, la règle va dans `bookit/domain/validate_booking.py`, le test dans `tests/`.
- **V. Le test précède le code** : respecté, chaque tâche Code suit une tâche Test qui échoue d'abord.
- **VI. ruff sans constat** : respecté, la finition lance `uv run ruff check` et `uv run ruff format --check`.
- **VII. Un commit par étape** : respecté, un commit à la main après chaque tâche.

## Project Structure

### Documentation (this feature)

```text
specs/001-valider-reservation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── spec.md
├── valider-reservation.feature
├── checklists/
└── tasks.md
```

### Source Code (repository root)

```text
bookit/domain/validate_booking.py
tests/test_valider_reservation.py
```

**Structure Decision**: deux fichiers, la règle dans la couche domaine (principe IV) et les tests pytest-bdd dans `tests/`. Aucun module nouveau, aucun fichier dans `bookit/application/` ni `bookit/infrastructure/`, aucun `contracts/` : l'API et le stockage sont inchangés.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation : le tableau reste vide.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
