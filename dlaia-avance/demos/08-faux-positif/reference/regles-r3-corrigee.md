# Règles de revue

Fichier lu par le reviewer et le contradicteur, commun à Claude Code et Open Code. Chaque règle a cinq champs : énoncé, vérification, violation, conforme, sévérité.

## R1 Accès à la base hors du routeur

Énoncé : le code de `adapters/inbound/` ne touche ni session, ni requête SQL, ni table. L'accès à la base vit dans `adapters/outbound/`.
Vérification : chercher dans le diff, sous `adapters/inbound/`, un import de `tables`, un accès à `_session` ou une requête SQL.
Violation : `row = unit._session.get(TicketRow, ticket_id)` dans un routeur
Conforme : `AssignTicket(uow).execute(ticket_id, payload.assignee)` dans un routeur
Sévérité : haute

## R2 Un test nominal et un test d'erreur par route

Énoncé : toute route ajoutée ou modifiée arrive avec un test nominal et un test d'erreur dans `tests/integration/`.
Vérification : pour chaque route du diff, chercher dans `tests/integration/` un test qui l'appelle avec succès et un test qui l'appelle en erreur.
Violation : route `PATCH /tickets/{id}/assignee` sans aucun test d'intégration
Conforme : `test_assign_ticket_nominal` et `test_assign_ticket_unknown_returns_404`
Sévérité : moyenne

## R3 Aucun secret en clair

Énoncé : aucun identifiant émis (jeton, mot de passe, clé) en dur dans `src/`.
Vérification : chercher dans le diff de `src/` un littéral qui a la forme d'un identifiant émis : préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux. Les fichiers de `tests/` sont exclus.
Violation : `API_TOKEN = "ntfy_9f3a7c21e0b44d8f"`
Conforme : `API_TOKEN = settings.api_token` ; dans `tests/`, `monkeypatch.setenv("API_TOKEN", "test-token-0000")`
Sévérité : haute

## R4 Conformité à la spécification

Énoncé : un ticket de priorité haute garde un responsable (spécification 002, FR-004) : création, changement de priorité et retrait du responsable sont refusés si le résultat est un ticket `high` sans responsable.
Vérification : lire la spécification donnée en argument, puis chercher dans le diff une route ou un cas d'usage qui contourne `domain/` pour modifier le responsable ou la priorité.
Violation : `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` répond 200
Conforme : la même requête répond 422 et le responsable reste inchangé
Sévérité : haute
