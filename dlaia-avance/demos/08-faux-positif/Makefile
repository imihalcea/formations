SESSION ?= demo
WORK ?= $(HOME)/travail/tickets-api-$(SESSION)

.PHONY: check repli
check:
	bash -n session.sh
	jq empty ../07-revue-a-la-demande/artefacts/revue/finding.schema.json
	d=$$(mktemp -d) && mkdir $$d/revue && cp ../07-revue-a-la-demande/artefacts/revue/regles.md $$d/revue/ && patch -s -d $$d -p1 < reference/correctif-r3.patch && diff -q $$d/revue/regles.md reference/regles-r3-corrigee.md
	@echo "OK 08-faux-positif"

# Repli : applique la règle R3 corrigée à la copie de travail et la commite.
repli:
	git -C $(WORK) apply $(CURDIR)/reference/correctif-r3.patch
	git -C $(WORK) add revue/regles.md
	git -C $(WORK) commit -q -m "Revue : règle R3 réduite aux identifiants émis de src/" -- revue/regles.md
