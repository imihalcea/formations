# /// script
# requires-python = ">=3.14"
# ///
"""Compute the reference values of the report for each incident CSV.

Writes preparation/references.md, used by the trainer to check the reports.
"""

import csv
from collections import Counter
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "donnees"

MONTHS = {"incidents-2026-09.csv": "Septembre 2026", "incidents-2026-10.csv": "Octobre 2026"}

SEVERITIES = ["P1", "P2", "P3", "P4"]

# Resolution target in hours for each severity.
TARGET_HOURS = {"P1": 4, "P2": 8, "P3": 24, "P4": 72}


def one_decimal(value):
    """French formatting, rounded half up: 12.25 -> '12,3'."""
    rounded = Decimal(str(value)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    return str(rounded).replace(".", ",")


def hours(minutes):
    return minutes / 60


def mean_hours(rows):
    return one_decimal(hours(sum(r["minutes"] for r in rows) / len(rows))) if rows else "-"


def within_target_rate(rows):
    if not rows:
        return "-"
    met = sum(1 for r in rows if hours(r["minutes"]) <= TARGET_HOURS[r["severite"]])
    return one_decimal(100 * met / len(rows)) + " %"


def load(path):
    with path.open(encoding="utf-8") as file:
        rows = list(csv.DictReader(file))
    for row in rows:
        row["minutes"] = int(row["duree_resolution_min"]) if row["statut"] == "résolu" else None
    return rows


def table(header, lines):
    out = ["| " + " | ".join(header) + " |", "|" + "---|" * len(header)]
    out += ["| " + " | ".join(str(cell) for cell in line) + " |" for line in lines]
    return "\n".join(out)


def report(name, label):
    rows = load(DATA_DIR / name)
    resolved = [r for r in rows if r["statut"] == "résolu"]
    still_open = [r for r in rows if r["statut"] == "en cours"]

    parts = [f"## {label} (`{name}`)", ""]
    parts.append(
        table(
            ["Indicateur", "Valeur"],
            [
                ["Incidents", len(rows)],
                ["Résolus", len(resolved)],
                ["En cours", len(still_open)],
                ["P1", sum(1 for r in rows if r["severite"] == "P1")],
                ["Durée moyenne de résolution (h)", mean_hours(resolved)],
                ["Résolus dans l'objectif", within_target_rate(resolved)],
            ],
        )
    )

    counts = Counter(r["service"] for r in rows)
    most_hit = max(sorted(counts), key=counts.get)
    rates = {s: within_target_rate([r for r in resolved if r["severite"] == s]) for s in SEVERITIES}
    lowest = min(SEVERITIES, key=lambda s: Decimal(rates[s].removesuffix(" %").replace(",", ".")))
    parts += ["", "### Faits marquants", ""]
    parts.append(
        f"Service le plus touché : {most_hit} ({counts[most_hit]} incidents). "
        f"Sévérité au taux dans l'objectif le plus bas : {lowest} ({rates[lowest]})."
    )

    parts += ["", "### Par sévérité", ""]
    lines = []
    for severity in SEVERITIES:
        all_rows = [r for r in rows if r["severite"] == severity]
        done = [r for r in resolved if r["severite"] == severity]
        lines.append(
            [severity, len(all_rows), len(done), mean_hours(done), within_target_rate(done)]
        )
    parts.append(
        table(["Sévérité", "Incidents", "Résolus", "Durée moyenne (h)", "Dans l'objectif"], lines)
    )

    parts += ["", "### Par service, par nombre d'incidents décroissant", ""]
    lines = []
    for service, count in sorted(counts.items(), key=lambda item: (-item[1], item[0])):
        p1 = sum(1 for r in rows if r["service"] == service and r["severite"] == "P1")
        done = [r for r in resolved if r["service"] == service]
        lines.append([service, count, p1, mean_hours(done)])
    parts.append(table(["Service", "Incidents", "Dont P1", "Durée moyenne (h)"], lines))

    parts += ["", "### Cinq résolutions les plus longues", ""]
    longest = sorted(resolved, key=lambda r: (-r["minutes"], r["id"]))[:5]
    parts.append(
        table(
            ["Identifiant", "Service", "Sévérité", "Titre", "Durée (h)"],
            [
                [r["id"], r["service"], r["severite"], r["titre"], one_decimal(hours(r["minutes"]))]
                for r in longest
            ],
        )
    )

    parts += ["", "### Incidents en cours", ""]
    parts.append(
        table(
            ["Identifiant", "Ouverture", "Service", "Sévérité", "Titre"],
            [
                [r["id"], r["ouverture"], r["service"], r["severite"], r["titre"]]
                for r in still_open
            ],
        )
    )
    return "\n".join(parts)


def main():
    sections = [
        "# Valeurs de référence des TP 7A et 7B",
        "",
        "Fichier produit par `uv run preparation/compute_references.py`. Ne pas éditer à la main.",
        "",
        (
            "Durées en heures, arrondies au dixième le plus proche (demi vers le haut). "
            "Durées et taux portent sur les incidents résolus. "
            "Objectifs de résolution : P1 4 h, P2 8 h, P3 24 h, P4 72 h, bornes incluses."
        ),
    ]
    for name, label in MONTHS.items():
        sections += ["", report(name, label)]
    (HERE / "references.md").write_text("\n".join(sections) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
