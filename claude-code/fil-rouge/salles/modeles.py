from dataclasses import dataclass
from datetime import datetime


class ErreurReservation(Exception):
    """Règle métier non respectée."""


@dataclass(frozen=True)
class Salle:
    id: int
    nom: str
    capacite: int
    tarif_horaire: int


@dataclass(frozen=True)
class Reservation:
    id: int
    salle_id: int
    titre: str
    debut: datetime
    fin: datetime
    interne: bool
    montant: int
