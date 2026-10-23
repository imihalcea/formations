# language: fr
Fonctionnalité: Valider une demande de réservation

  Scénario: REG-01, durée de 30 minutes pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 10h30
    Alors la demande est acceptée

  Scénario: REG-01, durée de 29 minutes
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 10h29
    Alors la demande est refusée avec le code duration

  Scénario: REG-01, durée de 4 heures pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 14h00
    Alors la demande est acceptée

  Scénario: REG-01, durée de 4 heures et 1 minute
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 10h00 à 14h01
    Alors la demande est refusée avec le code duration

  Scénario: REG-02, début à 8h00 pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 8h00 à 9h00
    Alors la demande est acceptée

  Scénario: REG-02, début à 7h59
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 7h59 à 8h59
    Alors la demande est refusée avec le code hours

  Scénario: REG-02, fin à 20h00 pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 19h00 à 20h00
    Alors la demande est acceptée

  Scénario: REG-02, fin à 20h01
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mercredi 3 juin 2026 de 19h01 à 20h01
    Alors la demande est refusée avec le code hours

  Scénario: REG-02, samedi
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le samedi 6 juin 2026 de 10h00 à 11h00
    Alors la demande est refusée avec le code hours

  Scénario: REG-03, préavis de 2 heures pile
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 11h00 à 12h00
    Alors la demande est acceptée

  Scénario: REG-03, préavis de 1 heure 59
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 10h59 à 11h59
    Alors la demande est refusée avec le code lead_time

  Scénario: REG-04, 59 jours à l'avance
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le vendredi 31 juillet 2026 de 10h00 à 11h00
    Alors la demande est acceptée

  Scénario: REG-04, 62 jours à l'avance
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Quand une demande vise la salle A le lundi 3 août 2026 de 10h00 à 11h00
    Alors la demande est refusée avec le code horizon

  Scénario: REG-05, créneau jointif
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 15h00 à 16h00
    Alors la demande est acceptée

  Scénario: REG-05, créneau chevauchant
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle A le mardi 2 juin 2026 de 14h30 à 15h30
    Alors la demande est refusée avec le code overlap

  Scénario: REG-05, même créneau sur une autre ressource
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée le mardi 2 juin 2026 de 14h00 à 15h00
    Quand une demande vise la salle B le mardi 2 juin 2026 de 14h00 à 15h00
    Alors la demande est acceptée

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
