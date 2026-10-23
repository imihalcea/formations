# Feature Specification: Valider une demande de réservation

**Feature Branch**: `001-valider-reservation`

**Created**: 2026-10-22

**Status**: Relue

**Input**: User description: "Valider une demande de réservation d'après docs/brief.md et docs/regles-metier.md"

## Clarifications

### Session 2026-10-22

- Q: Les bornes des règles (30 minutes, 4 heures, 8h00, 20h00, 2 heures, 60 jours) sont-elles incluses ? → A: Incluses, la valeur pile est acceptée.
- Q: Quand une demande enfreint plusieurs règles, quel code est rendu ? → A: Un seul, celui de la première règle enfreinte dans l'ordre REG-01 à REG-05.
- Q: Les jours fériés sont-ils des jours ouvrés ? → A: Oui, aucune exception.
- Q: Les heures sont-elles exprimées dans un seul fuseau horaire ? → A: Oui, local, aucune conversion.
- Q: L'annulation d'une réservation est-elle dans le périmètre ? → A: Non, hors périmètre.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Une demande conforme est acceptée (Priority: P1)

Un demandeur réserve une ressource pour un créneau qui respecte les cinq règles métier ; bookit accepte la demande, qui devient une réservation confirmée de la ressource.

**Why this priority**: sans acceptation, aucune réservation n'existe ; c'est le parcours nominal de bookit.

**Independent Test**: une demande sur la salle A, un jour de semaine, dans les heures ouvrées, avec le préavis et dans l'horizon, sans chevauchement, est acceptée.

**Acceptance Scenarios**:

```gherkin
# language: fr
Fonctionnalité: Accepter une demande conforme

  Scénario: REG-01, durée de 30 minutes pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 10h30
    Alors la demande est acceptée

  Scénario: REG-01, durée de 4 heures pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 14h00
    Alors la demande est acceptée

  Scénario: REG-02, début à 8h00 pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 8h00 à 9h00
    Alors la demande est acceptée

  Scénario: REG-02, fin à 20h00 pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 19h00 à 20h00
    Alors la demande est acceptée

  Scénario: REG-03, préavis de 2 heures pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 11h00 à 12h00
    Alors la demande est acceptée

  Scénario: REG-04, 59 jours à l'avance
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le vendredi 31 juillet 2026 de 10h00 à 11h00
    Alors la demande est acceptée

  Scénario: REG-05, créneau jointif
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 15h00 à 16h00
    Alors la demande est acceptée

  Scénario: REG-05, même créneau sur une autre ressource
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle B le mardi 2 juin 2026 de 14h00 à 15h00
    Alors la demande est acceptée
```

---

### User Story 2 - Une demande hors règle est refusée avec son code (Priority: P2)

Un demandeur soumet une demande qui enfreint une règle métier ; bookit la refuse avec le code de la règle enfreinte, pour que le demandeur sache quoi corriger.

**Why this priority**: le code de refus est la seule information rendue au demandeur ; sans lui, un refus n'est pas exploitable.

**Independent Test**: pour chaque règle REG-01 à REG-05, une demande à la valeur pile de la borne est acceptée et une demande juste au-delà est refusée avec le code de la règle.

**Acceptance Scenarios**:

```gherkin
# language: fr
Fonctionnalité: Refuser une demande hors règle

  Scénario: REG-01, durée de 29 minutes
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 10h29
    Alors la demande est refusée avec le code duration

  Scénario: REG-01, durée de 4 heures et 1 minute
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 14h01
    Alors la demande est refusée avec le code duration

  Scénario: REG-02, début à 7h59
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 7h59 à 8h59
    Alors la demande est refusée avec le code hours

  Scénario: REG-02, fin à 20h01
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 19h01 à 20h01
    Alors la demande est refusée avec le code hours

  Scénario: REG-02, samedi
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le samedi 6 juin 2026 de 10h00 à 11h00
    Alors la demande est refusée avec le code hours

  Scénario: REG-03, préavis de 1 heure 59
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 10h59 à 11h59
    Alors la demande est refusée avec le code lead_time

  Scénario: REG-04, 62 jours à l'avance
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le lundi 3 août 2026 de 10h00 à 11h00
    Alors la demande est refusée avec le code horizon

  Scénario: REG-05, créneau chevauchant
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 14h30 à 15h30
    Alors la demande est refusée avec le code overlap
```

---

### User Story 3 - Une décision, toujours la même (Priority: P3)

Quand une demande enfreint plusieurs règles, le demandeur reçoit un seul code, prévisible ; quand la même demande est jugée plusieurs fois au même instant, la décision ne change pas.

**Why this priority**: la décision doit être reproductible pour être testée et expliquée ; ce parcours ne crée aucune réservation de plus.

**Independent Test**: une demande qui enfreint REG-01 et REG-02 est refusée avec le seul code `duration` ; une même demande jugée deux fois au même instant courant rend deux fois la même décision.

**Acceptance Scenarios**:

```gherkin
# language: fr
Fonctionnalité: Rendre une seule décision

  Scénario: REG-06, durée et jour enfreints
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le samedi 6 juin 2026 de 10h00 à 15h00
    Alors la demande est refusée avec le code duration

  Scénario: REG-06, jour et horizon enfreints
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le samedi 8 août 2026 de 10h00 à 11h00
    Alors la demande est refusée avec le code hours

  Scénario: REG-07, même demande, même instant, même décision
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 11h00, jugée deux fois
    Alors la demande est acceptée les deux fois
```

---

### Edge Cases

- Valeur pile d'une borne (30 minutes, 4 heures, 8h00, 20h00, 2 heures, 60 jours) : acceptée.
- Plusieurs règles enfreintes par la même demande : un seul code, celui de la première règle dans l'ordre REG-01 à REG-05.
- 60 jours pile après l'instant courant fixé des scénarios (mardi 2 juin 2026 à 9h00) tombe le samedi 1er août 2026 : REG-02 refuse d'abord ; les scénarios de REG-04 encadrent la borne à 59 et 62 jours.
- Jour férié en semaine : ouvré, jugé comme un autre jour.
- Deux créneaux jointifs sur la même ressource : aucun chevauchement, la fin d'un créneau est exclue.

## Requirements *(mandatory)*

### Functional Requirements

Une exigence par règle métier de `docs/regles-metier.md`, sur sa propre ligne, dans l'ordre
des règles ; une phrase EARS en français (skill `ears`), le code de refus entre accents graves.

**REG-01** : Quand une demande dure moins de 30 minutes ou plus de 4 heures, bookit doit la refuser avec le code `duration`. Quand une demande dure exactement 30 minutes ou exactement 4 heures, bookit doit l'accepter.

**REG-02** : Quand une demande sort de la plage du lundi au vendredi de 8h00 à 20h00, bookit doit la refuser avec le code `hours`. Quand une demande commence à 8h00 pile ou finit à 20h00 pile un jour de semaine, bookit doit l'accepter.

**REG-03** : Quand une demande commence avant l'instant courant plus 2 heures, bookit doit la refuser avec le code `lead_time`. Quand une demande commence exactement 2 heures après l'instant courant, bookit doit l'accepter.

**REG-04** : Quand une demande commence plus de 60 jours après l'instant courant, bookit doit la refuser avec le code `horizon`. Quand une demande commence exactement 60 jours après l'instant courant, bookit doit l'accepter.

**REG-05** : Quand une demande vise une ressource dont une réservation confirmée chevauche le créneau demandé, bookit doit la refuser avec le code `overlap`. Quand une demande commence à l'instant où finit une réservation confirmée de la même ressource, bookit doit l'accepter.

**REG-06** : Quand une demande enfreint plusieurs règles, bookit doit la refuser avec un seul code, celui de la première règle enfreinte dans l'ordre REG-01 à REG-05.

**REG-07** : Quand une même demande est jugée plusieurs fois au même instant courant, bookit doit rendre la même décision. Quand bookit valide une demande, il doit recevoir l'instant courant en entrée de la validation.

### Key Entities *(include if feature involves data)*

- **Ressource** : ce qui se réserve, salle, équipement ou personne ; connaît ses réservations confirmées.
- **Demande de réservation** : une ressource visée, un début et une fin.
- **Réservation confirmée** : demande acceptée et enregistrée sur sa ressource.
- **Instant courant** : moment auquel la demande est jugée, fourni en entrée.
- **Décision** : acceptée, ou refusée avec un code de refus parmi `duration`, `hours`, `lead_time`, `horizon`, `overlap`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : chaque exigence REG-01 à REG-07 a au moins un scénario d'acceptation ; chaque borne de REG-01, REG-02, REG-03 et REG-05 a un scénario de chaque côté.
- **SC-002** : toute demande refusée porte exactement un code, parmi les cinq codes de refus.
- **SC-003** : une même demande jugée deux fois au même instant courant rend deux fois la même décision.
- **SC-004** : une demande conforme aux cinq règles est enregistrée comme avant : l'API et le stockage existants répondent de la même façon.

## Assumptions

- Les jours fériés sont ouvrés, sans exception.
- Un seul fuseau horaire, local ; aucune conversion.
- La ressource visée existe ; les pools de ressources sont hors périmètre.
- Le quota par demandeur, l'annulation et l'approbation d'une réservation sont hors périmètre.
- L'API et le stockage existants ne changent pas : seule la validation est spécifiée.
