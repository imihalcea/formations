from dataclasses import dataclass


@dataclass
class Commande:
    reference: str
    montant: float

    def avec_tva(self, taux: float = 0.2) -> float:
        return round(self.montant * (1 + taux), 2)
