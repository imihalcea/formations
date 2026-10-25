## Constat

`POST /tickets/{id}/comments` répond 201 sur un ticket au statut `closed`. Le commentaire est enregistré.

## Attendu

Un ticket fermé refuse les commentaires. La réponse est un 409 avec un message qui nomme le statut.

## Piste

La vérification du statut manque au moment de l'ajout du commentaire.
