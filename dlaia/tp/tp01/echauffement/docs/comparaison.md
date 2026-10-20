| Critère | v1 | v2 |
|---|---|---|
| règles couvertes (combien des cinq, lesquelles manquent) | aucune des cinq : champs d'hôtel inventés (`customer_name`, `guests`, `room_id`), début dans le passé refusé, fin après début ; ni durée, ni préavis, ni horizon, ni chevauchement | les cinq, dans l'ordre REG-01 à REG-05, un commentaire par règle |
| bornes (30 min pile, 4 h pile, 20h00 pile : accepté ou refusé, lu dans les `<` et `<=`) | aucune borne métier ; `end <= start` refusé, `start < today` refusé | 30 min et 4 h acceptés (`<=` des deux côtés) ; début à 8h00 accepté, fin à 20h00 acceptée, 20h01 refusée ; 2 h de préavis pile et 60 jours pile acceptés |
| codes de refus (ceux du fichier ou inventés, en valeur de retour ou en exception) | aucun code : un tuple `(bool, list[str])` avec des messages en français | les cinq codes du fichier, en valeur de retour `InvalidBooking(code)`, `None` si acceptée |
