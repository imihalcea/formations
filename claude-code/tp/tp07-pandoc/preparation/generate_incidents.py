# /// script
# requires-python = ">=3.14"
# ///
"""Generate the incident CSV files of TP 7A and 7B.

Seeded: running it again produces the same files.
"""

import csv
import math
import random
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "donnees"

COLUMNS = [
    "id",
    "ouverture",
    "service",
    "severite",
    "categorie",
    "titre",
    "statut",
    "duree_resolution_min",
]

SERVICES = ["authentification", "catalogue", "commandes", "paiement", "recherche", "notifications"]

SEVERITIES = ["P1", "P2", "P3", "P4"]

# Median resolution time in minutes and spread of the log-normal distribution.
DURATION = {"P1": (150, 0.6), "P2": (330, 0.6), "P3": (900, 0.7), "P4": (2400, 0.7)}

TITLES = {
    "base de données": [
        "Saturation du pool de connexions",
        "Requêtes lentes sur la base principale",
        "Réplication en retard",
        "Verrou bloquant sur une table",
    ],
    "réseau": [
        "Perte de paquets entre zones",
        "Timeouts vers le répartiteur de charge",
        "Certificat TLS expiré",
        "Résolution DNS en échec",
    ],
    "déploiement": [
        "Régression après mise en production",
        "Rollback d'une version défectueuse",
        "Variable de configuration manquante",
        "Migration interrompue",
    ],
    "dépendance externe": [
        "Fournisseur indisponible",
        "Quota d'API tiers dépassé",
        "Réponses invalides d'un partenaire",
        "Latence élevée d'un service tiers",
    ],
    "capacité": [
        "Mémoire saturée sur les instances",
        "File de messages en débordement",
        "Disque plein sur un nœud",
        "Pic de charge non absorbé",
    ],
}


def month_rows(year, month, count, weights, spikes, open_count, prefix, seed):
    """Build the rows of one month.

    weights: relative frequency of each service.
    spikes: list of (day, service, severity, n) bursts added on top of the base volume.
    """
    rng = random.Random(seed)
    start = datetime(year, month, 1)
    end = datetime(year + (month == 12), month % 12 + 1, 1)
    seconds = int((end - start).total_seconds())
    incidents = []
    for _ in range(count):
        opened = start + timedelta(seconds=rng.randrange(seconds))
        service = rng.choices(SERVICES, weights=[weights[s] for s in SERVICES])[0]
        severity = rng.choices(SEVERITIES, weights=[4, 16, 45, 35])[0]
        incidents.append((opened, service, severity))
    for day, service, severity, n in spikes:
        for _ in range(n):
            opened = datetime(year, month, day, 9) + timedelta(minutes=rng.randrange(600))
            incidents.append((opened, service, severity))
    incidents.sort()

    rows = []
    for number, (opened, service, severity) in enumerate(incidents, start=1):
        category = rng.choice(list(TITLES))
        median, sigma = DURATION[severity]
        duration = max(5, round(math.exp(rng.gauss(math.log(median), sigma))))
        rows.append(
            {
                "id": f"{prefix}-{number:04d}",
                "ouverture": opened.strftime("%Y-%m-%dT%H:%M"),
                "service": service,
                "severite": severity,
                "categorie": category,
                "titre": rng.choice(TITLES[category]),
                "statut": "résolu",
                "duree_resolution_min": duration,
            }
        )
    # The last opened P3 and P4 incidents are still open at the end of the month.
    candidates = [row for row in rows if row["severite"] in ("P3", "P4")]
    for row in candidates[-open_count:]:
        row["statut"] = "en cours"
        row["duree_resolution_min"] = ""
    return rows


def write(path, rows):
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main():
    DATA_DIR.mkdir(exist_ok=True)
    september = month_rows(
        2026,
        9,
        290,
        weights={
            "authentification": 14,
            "catalogue": 18,
            "commandes": 22,
            "paiement": 16,
            "recherche": 20,
            "notifications": 10,
        },
        spikes=[(17, "recherche", "P2", 6)],
        open_count=5,
        prefix="INC-2609",
        seed=2609,
    )
    october = month_rows(
        2026,
        10,
        320,
        weights={
            "authentification": 15,
            "catalogue": 16,
            "commandes": 20,
            "paiement": 21,
            "recherche": 17,
            "notifications": 11,
        },
        spikes=[(8, "paiement", "P1", 7), (8, "paiement", "P2", 9)],
        open_count=8,
        prefix="INC-2610",
        seed=2610,
    )
    write(DATA_DIR / "incidents-2026-09.csv", september)
    write(DATA_DIR / "incidents-2026-10.csv", october)


if __name__ == "__main__":
    main()
