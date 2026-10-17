from salles.db import MIGRATIONS, connecter, version_schema


def test_une_base_neuve_est_migree_a_la_derniere_version(chemin_db):
    connexion = connecter(chemin_db)
    assert version_schema(connexion) == len(MIGRATIONS)
    tables = {
        ligne["name"]
        for ligne in connexion.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    }
    assert {"salles", "reservations"} <= tables


def test_reconnecter_ne_rejoue_pas_les_migrations(chemin_db):
    connecter(chemin_db).close()
    connexion = connecter(chemin_db)
    assert version_schema(connexion) == len(MIGRATIONS)
