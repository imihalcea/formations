"""Monthly operations report, from the incident CSV to the Markdown read by pandoc.

uv run rapport.py agregats incidents.csv build/agregats.json
uv run rapport.py markdown build/agregats.json faits.md build/rapport.md
"""

import argparse
import csv
import json
from collections import Counter
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

SEVERITIES = ["P1", "P2", "P3", "P4"]

# Resolution target in minutes for each severity, bound included.
TARGET_MINUTES = {"P1": 4 * 60, "P2": 8 * 60, "P3": 24 * 60, "P4": 72 * 60}

MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]  # fmt: skip


def round_one(numerator, denominator):
    """numerator / denominator rounded half up to one decimal: 0.25 -> 0.3."""
    value = Decimal(numerator) / Decimal(denominator)
    return float(value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def mean_hours(rows):
    if not rows:
        return None
    return round_one(sum(r["minutes"] for r in rows), 60 * len(rows))


def within_target_rate(rows):
    if not rows:
        return None
    met = sum(1 for r in rows if r["minutes"] <= TARGET_MINUTES[r["severite"]])
    return round_one(100 * met, len(rows))


def load(path):
    with open(path, encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    for row in rows:
        row["minutes"] = (
            int(row["duree_resolution_min"]) if row["statut"] == "résolu" else None
        )
    return rows


def month_label(rows):
    year, month = rows[0]["ouverture"][:7].split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def aggregates(rows):
    resolved = [r for r in rows if r["statut"] == "résolu"]
    still_open = [r for r in rows if r["statut"] == "en cours"]
    counts = Counter(r["service"] for r in rows)

    by_severity = []
    for severity in SEVERITIES:
        done = [r for r in resolved if r["severite"] == severity]
        by_severity.append(
            {
                "severite": severity,
                "incidents": sum(1 for r in rows if r["severite"] == severity),
                "resolus": len(done),
                "duree_moyenne_h": mean_hours(done),
                "taux_objectif_pct": within_target_rate(done),
            }
        )

    by_service = []
    for service, count in sorted(counts.items(), key=lambda item: (-item[1], item[0])):
        by_service.append(
            {
                "service": service,
                "incidents": count,
                "p1": sum(
                    1 for r in rows if r["service"] == service and r["severite"] == "P1"
                ),
                "duree_moyenne_h": mean_hours(
                    [r for r in resolved if r["service"] == service]
                ),
            }
        )

    longest = sorted(resolved, key=lambda r: (-r["minutes"], r["id"]))[:5]
    return {
        "mois": month_label(rows),
        "synthese": {
            "incidents": len(rows),
            "resolus": len(resolved),
            "en_cours": len(still_open),
            "p1": sum(1 for r in rows if r["severite"] == "P1"),
            "duree_moyenne_h": mean_hours(resolved),
            "taux_objectif_pct": within_target_rate(resolved),
        },
        "par_severite": by_severity,
        "par_service": by_service,
        "plus_longues": [
            {
                "id": r["id"],
                "service": r["service"],
                "severite": r["severite"],
                "titre": r["titre"],
                "duree_h": round_one(r["minutes"], 60),
            }
            for r in longest
        ],
        "en_cours": [
            {k: r[k] for k in ("id", "ouverture", "service", "severite", "titre")}
            for r in still_open
        ],
    }


def decimal(value):
    """French format with one decimal: 28.2 -> '28,2'."""
    return "-" if value is None else f"{value:.1f}".replace(".", ",")


def percent(value):
    return "-" if value is None else decimal(value) + " %"


def table(header, align, lines):
    """Pipe table; align holds one 'l' or 'r' per column."""
    rule = "|" + "|".join("---:" if a == "r" else "---" for a in align) + "|"
    out = ["| " + " | ".join(header) + " |", rule]
    out += ["| " + " | ".join(str(cell) for cell in line) + " |" for line in lines]
    return "\n".join(out)


def markdown(data, highlights):
    s = data["synthese"]
    parts = [
        "---",
        "title: Rapport mensuel d'exploitation",
        f"subtitle: {data['mois']}",
        "lang: fr",
        "---",
        "",
        "## Synthèse",
        "",
        table(
            ["Indicateur", "Valeur"],
            "lr",
            [
                ["Incidents", s["incidents"]],
                ["Résolus", s["resolus"]],
                ["En cours", s["en_cours"]],
                ["P1", s["p1"]],
                ["Durée moyenne de résolution (h)", decimal(s["duree_moyenne_h"])],
                ["Résolus dans l'objectif", percent(s["taux_objectif_pct"])],
            ],
        ),
        "",
        "## Faits marquants",
        "",
        highlights.strip(),
        "",
        "## Par sévérité",
        "",
        table(
            [
                "Sévérité",
                "Incidents",
                "Résolus",
                "Durée moyenne (h)",
                "Dans l'objectif",
            ],
            "lrrrr",
            [
                [
                    r["severite"],
                    r["incidents"],
                    r["resolus"],
                    decimal(r["duree_moyenne_h"]),
                    percent(r["taux_objectif_pct"]),
                ]
                for r in data["par_severite"]
            ],
        ),
        "",
        "## Par service",
        "",
        table(
            ["Service", "Incidents", "Dont P1", "Durée moyenne (h)"],
            "lrrr",
            [
                [r["service"], r["incidents"], r["p1"], decimal(r["duree_moyenne_h"])]
                for r in data["par_service"]
            ],
        ),
        "",
        "## Résolutions les plus longues",
        "",
        table(
            ["Identifiant", "Service", "Sévérité", "Titre", "Durée (h)"],
            "llllr",
            [
                [
                    r["id"],
                    r["service"],
                    r["severite"],
                    r["titre"],
                    decimal(r["duree_h"]),
                ]
                for r in data["plus_longues"]
            ],
        ),
        "",
        "## Incidents en cours",
        "",
        table(
            ["Identifiant", "Ouverture", "Service", "Sévérité", "Titre"],
            "lllll",
            [
                [
                    r["id"],
                    # non-breaking space: the date and the time stay on one line
                    r["ouverture"].replace("T", " "),
                    r["service"],
                    r["severite"],
                    r["titre"],
                ]
                for r in data["en_cours"]
            ],
        ),
    ]
    return "\n".join(parts) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    commands = parser.add_subparsers(dest="command", required=True)
    step = commands.add_parser("agregats", help="CSV -> aggregates JSON")
    step.add_argument("csv", type=Path)
    step.add_argument("output", type=Path)
    step = commands.add_parser(
        "markdown", help="aggregates JSON and highlights -> Markdown"
    )
    step.add_argument("aggregates", type=Path)
    step.add_argument("highlights", type=Path)
    step.add_argument("output", type=Path)
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.command == "agregats":
        text = (
            json.dumps(aggregates(load(args.csv)), ensure_ascii=False, indent=2) + "\n"
        )
    else:
        data = json.loads(args.aggregates.read_text(encoding="utf-8"))
        text = markdown(data, args.highlights.read_text(encoding="utf-8"))
    args.output.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
