import sqlite3
from datetime import date, datetime, timedelta

from salles.modeles import ErreurReservation, Reservation, Salle


def _salle(ligne: sqlite3.Row) -> Salle:
    return Salle(
        id=ligne["id"],
        nom=ligne["nom"],
        capacite=ligne["capacite"],
        tarif_horaire=ligne["tarif_horaire"],
    )


def _reservation(ligne: sqlite3.Row) -> Reservation:
    return Reservation(
        id=ligne["id"],
        salle_id=ligne["salle_id"],
        titre=ligne["titre"],
        debut=datetime.fromisoformat(ligne["debut"]),
        fin=datetime.fromisoformat(ligne["fin"]),
        interne=bool(ligne["interne"]),
        montant=ligne["montant"],
    )


def ajouter_salle(
    connexion: sqlite3.Connection, nom: str, capacite: int, tarif_horaire: int
) -> Salle:
    try:
        with connexion:
            curseur = connexion.execute(
                "INSERT INTO salles (nom, capacite, tarif_horaire) VALUES (?, ?, ?)",
                (nom, capacite, tarif_horaire),
            )
    except sqlite3.IntegrityError as erreur:
        raise ErreurReservation(f"Une salle s'appelle déjà {nom}") from erreur
    return Salle(curseur.lastrowid, nom, capacite, tarif_horaire)


def lister_salles(connexion: sqlite3.Connection) -> list[Salle]:
    lignes = connexion.execute("SELECT * FROM salles ORDER BY nom").fetchall()
    return [_salle(ligne) for ligne in lignes]


def trouver_salle(connexion: sqlite3.Connection, salle_id: int) -> Salle | None:
    ligne = connexion.execute("SELECT * FROM salles WHERE id = ?", (salle_id,)).fetchone()
    return _salle(ligne) if ligne else None


def reservations_de_salle(
    connexion: sqlite3.Connection, salle_id: int, jour: date
) -> list[Reservation]:
    lignes = connexion.execute(
        "SELECT * FROM reservations WHERE salle_id = ? AND debut >= ? AND debut < ? ORDER BY debut",
        (salle_id, jour.isoformat(), (jour + timedelta(days=1)).isoformat()),
    ).fetchall()
    return [_reservation(ligne) for ligne in lignes]


def reservations_du_jour(connexion: sqlite3.Connection, jour: date) -> list[Reservation]:
    lignes = connexion.execute(
        "SELECT * FROM reservations WHERE debut >= ? AND debut < ? ORDER BY debut, salle_id",
        (jour.isoformat(), (jour + timedelta(days=1)).isoformat()),
    ).fetchall()
    return [_reservation(ligne) for ligne in lignes]


def ajouter_reservation(
    connexion: sqlite3.Connection,
    salle_id: int,
    titre: str,
    debut: datetime,
    fin: datetime,
    interne: bool,
    montant: int,
) -> Reservation:
    with connexion:
        curseur = connexion.execute(
            "INSERT INTO reservations (salle_id, titre, debut, fin, interne, montant)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (salle_id, titre, debut.isoformat(), fin.isoformat(), int(interne), montant),
        )
    return Reservation(curseur.lastrowid, salle_id, titre, debut, fin, interne, montant)


def supprimer_reservation(connexion: sqlite3.Connection, reservation_id: int) -> bool:
    with connexion:
        curseur = connexion.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
    return curseur.rowcount == 1
