# Brief : valider une demande de réservation

Un demandeur réserve une ressource de bookit, salle, équipement ou personne,
pour un créneau : une ressource, un début, une fin.

bookit accepte la demande ou la refuse avec un code qui dit quelle règle
est enfreinte. Les règles sont celles de `docs/regles-metier.md`, REG-01
à REG-05, avec leurs codes de refus. La décision tient compte des
réservations déjà confirmées sur la ressource.

Une même demande, jugée au même instant, donne toujours la même décision.

L'API et le stockage existants ne changent pas : seule la validation est
à spécifier.
