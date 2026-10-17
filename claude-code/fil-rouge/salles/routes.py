import sqlite3
from dataclasses import asdict
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import NaiveDatetime

from salles import depot
from salles.conflits import se_chevauchent, valider_creneau, verifier_disponibilite
from salles.db import obtenir_connexion
from salles.export import planning_csv
from salles.schemas import ReservationCreation, ReservationSortie, SalleCreation, SalleSortie
from salles.tarifs import calculer_tarif

routeur = APIRouter()

Connexion = Annotated[sqlite3.Connection, Depends(obtenir_connexion)]


@routeur.post("/salles", status_code=201, response_model=SalleSortie)
def creer_salle(donnees: SalleCreation, connexion: Connexion):
    salle = depot.ajouter_salle(connexion, donnees.nom, donnees.capacite, donnees.tarif_horaire)
    return asdict(salle)


@routeur.get("/salles", response_model=list[SalleSortie])
def lister_salles(connexion: Connexion):
    return [asdict(salle) for salle in depot.lister_salles(connexion)]


@routeur.get("/salles/disponibles", response_model=list[SalleSortie])
def salles_disponibles(debut: NaiveDatetime, fin: NaiveDatetime, connexion: Connexion):
    valider_creneau(debut, fin)
    disponibles = []
    for salle in depot.lister_salles(connexion):
        reservations = depot.reservations_de_salle(connexion, salle.id, debut.date())
        if not any(se_chevauchent(r.debut, r.fin, debut, fin) for r in reservations):
            disponibles.append(asdict(salle))
    return disponibles


@routeur.post("/reservations", status_code=201, response_model=ReservationSortie)
def reserver(donnees: ReservationCreation, connexion: Connexion):
    salle = depot.trouver_salle(connexion, donnees.salle_id)
    if salle is None:
        raise HTTPException(status_code=404, detail="Salle introuvable")
    valider_creneau(donnees.debut, donnees.fin)
    existantes = depot.reservations_de_salle(connexion, salle.id, donnees.debut.date())
    verifier_disponibilite(existantes, donnees.debut, donnees.fin)
    montant = calculer_tarif(salle, donnees.debut, donnees.fin, donnees.interne)
    reservation = depot.ajouter_reservation(
        connexion,
        salle.id,
        donnees.titre,
        donnees.debut,
        donnees.fin,
        donnees.interne,
        montant,
    )
    return asdict(reservation)


@routeur.delete("/reservations/{reservation_id}", status_code=204)
def annuler(reservation_id: int, connexion: Connexion):
    if not depot.supprimer_reservation(connexion, reservation_id):
        raise HTTPException(status_code=404, detail="Réservation introuvable")


@routeur.get("/planning", response_model=list[ReservationSortie])
def planning(jour: date, connexion: Connexion):
    return [asdict(reservation) for reservation in depot.reservations_du_jour(connexion, jour)]


@routeur.get("/planning.csv")
def planning_en_csv(jour: date, connexion: Connexion):
    reservations = depot.reservations_du_jour(connexion, jour)
    contenu = planning_csv(reservations, depot.lister_salles(connexion))
    return Response(
        content=contenu,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="planning-{jour}.csv"'},
    )
