import re
from pathlib import Path

import pytest

from rapport import aggregates, decimal, load, markdown, percent, round_one

TP = Path(__file__).resolve().parents[2]
REFERENCES = (TP / "preparation" / "references.md").read_text(encoding="utf-8")
MONTHS = {
    "incidents-2026-09.csv": "Septembre 2026",
    "incidents-2026-10.csv": "Octobre 2026",
}


def reference_tables(name):
    """Rows of each table of references.md for one CSV, keyed by the heading above it."""
    section = REFERENCES.split(f"(`{name}`)")[1].split("\n## ")[0]
    tables, heading = {}, "Synthèse"
    for line in section.splitlines():
        if line.startswith("### "):
            heading = line[4:]
        elif line.startswith("| "):
            tables.setdefault(heading, []).append(
                [cell.strip() for cell in line.strip("|").split("|")]
            )
    return {heading: rows[1:] for heading, rows in tables.items()}


@pytest.fixture(params=MONTHS, scope="module")
def month(request):
    name = request.param
    return name, aggregates(load(TP / "donnees" / name)), reference_tables(name)


def test_month_label(month):
    name, data, _ = month
    assert data["mois"] == MONTHS[name]


def test_summary_matches_references(month):
    _, data, ref = month
    s = data["synthese"]
    assert [
        str(s["incidents"]),
        str(s["resolus"]),
        str(s["en_cours"]),
        str(s["p1"]),
        decimal(s["duree_moyenne_h"]),
        percent(s["taux_objectif_pct"]),
    ] == [value for _, value in ref["Synthèse"]]


def test_severities_match_references(month):
    _, data, ref = month
    assert [
        [
            r["severite"],
            str(r["incidents"]),
            str(r["resolus"]),
            decimal(r["duree_moyenne_h"]),
            percent(r["taux_objectif_pct"]),
        ]
        for r in data["par_severite"]
    ] == ref["Par sévérité"]


def test_services_match_references_in_order(month):
    _, data, ref = month
    assert [
        [r["service"], str(r["incidents"]), str(r["p1"]), decimal(r["duree_moyenne_h"])]
        for r in data["par_service"]
    ] == ref["Par service, par nombre d'incidents décroissant"]


def test_longest_resolutions_match_references(month):
    _, data, ref = month
    assert [
        [r["id"], r["service"], r["severite"], r["titre"], decimal(r["duree_h"])]
        for r in data["plus_longues"]
    ] == ref["Cinq résolutions les plus longues"]


def test_open_incidents_match_references(month):
    _, data, ref = month
    assert [list(r.values()) for r in data["en_cours"]] == ref["Incidents en cours"]


def test_rounding_is_half_up():
    assert round_one(1, 4) == 0.3
    assert round_one(-1, 4) == -0.3
    assert decimal(round_one(3, 40)) == "0,1"


def test_resolution_equal_to_target_meets_it(tmp_path):
    csv = tmp_path / "incidents.csv"
    csv.write_text(
        "id,ouverture,service,severite,categorie,titre,statut,duree_resolution_min\n"
        "INC-1,2026-11-02T10:00,paiement,P1,réseau,A,résolu,240\n"
        "INC-2,2026-11-03T10:00,paiement,P1,réseau,B,résolu,241\n"
        "INC-3,2026-11-04T10:00,recherche,P2,réseau,C,en cours,\n",
        encoding="utf-8",
    )
    data = aggregates(load(csv))
    assert data["mois"] == "Novembre 2026"
    assert data["par_severite"][0]["taux_objectif_pct"] == 50.0
    assert data["par_severite"][1]["duree_moyenne_h"] is None
    assert decimal(None) == "-"


def test_markdown_sections_in_order(month):
    _, data, _ = month
    text = markdown(data, "Paragraphe des faits marquants.\n")
    assert text.startswith(
        "---\ntitle: Rapport mensuel d'exploitation\nsubtitle: " + data["mois"]
    )
    assert re.findall(r"^## (.+)$", text, re.MULTILINE) == [
        "Synthèse",
        "Faits marquants",
        "Par sévérité",
        "Par service",
        "Résolutions les plus longues",
        "Incidents en cours",
    ]
    assert (
        "## Faits marquants\n\nParagraphe des faits marquants.\n\n## Par sévérité"
        in text
    )
