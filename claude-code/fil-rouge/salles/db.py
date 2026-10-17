import os
import sqlite3
from collections.abc import Iterator

# Chaque migration fait passer le schéma à la version suivante.
# La version courante est stockée dans PRAGMA user_version.
MIGRATIONS = [
    """
    CREATE TABLE salles (
        id INTEGER PRIMARY KEY,
        nom TEXT NOT NULL UNIQUE,
        capacite INTEGER NOT NULL,
        tarif_horaire INTEGER NOT NULL
    );
    CREATE TABLE reservations (
        id INTEGER PRIMARY KEY,
        salle_id INTEGER NOT NULL REFERENCES salles (id),
        titre TEXT NOT NULL,
        debut TEXT NOT NULL,
        fin TEXT NOT NULL,
        interne INTEGER NOT NULL DEFAULT 0,
        montant INTEGER NOT NULL
    );
    CREATE INDEX reservations_salle_debut ON reservations (salle_id, debut);
    """,
]


def version_schema(connexion: sqlite3.Connection) -> int:
    return connexion.execute("PRAGMA user_version").fetchone()[0]


def migrer(connexion: sqlite3.Connection) -> None:
    for numero in range(version_schema(connexion), len(MIGRATIONS)):
        with connexion:
            connexion.executescript(MIGRATIONS[numero])
            connexion.execute(f"PRAGMA user_version = {numero + 1}")


def connecter(chemin: str) -> sqlite3.Connection:
    # check_same_thread=False : FastAPI peut exécuter la route et la dépendance
    # qui fournit la connexion dans deux threads différents.
    connexion = sqlite3.connect(chemin, check_same_thread=False)
    connexion.row_factory = sqlite3.Row
    connexion.execute("PRAGMA foreign_keys = ON")
    migrer(connexion)
    return connexion


def chemin_base() -> str:
    return os.environ.get("SALLES_DB", "salles.db")


def obtenir_connexion() -> Iterator[sqlite3.Connection]:
    """Dépendance FastAPI : une connexion par requête."""
    connexion = connecter(chemin_base())
    try:
        yield connexion
    finally:
        connexion.close()
