from pydantic import BaseModel, Field, NaiveDatetime


class SalleCreation(BaseModel):
    nom: str = Field(min_length=1)
    capacite: int = Field(gt=0)
    tarif_horaire: int = Field(ge=0, description="En centimes")


class SalleSortie(BaseModel):
    id: int
    nom: str
    capacite: int
    tarif_horaire: int


class ReservationCreation(BaseModel):
    salle_id: int
    titre: str = Field(min_length=1)
    debut: NaiveDatetime
    fin: NaiveDatetime
    interne: bool = False


class ReservationSortie(BaseModel):
    id: int
    salle_id: int
    titre: str
    debut: NaiveDatetime
    fin: NaiveDatetime
    interne: bool
    montant: int = Field(description="En centimes")
