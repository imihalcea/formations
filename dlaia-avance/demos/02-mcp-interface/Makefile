# WORK : copie de travail (défaut ~/travail/tickets-api-$(SESSION)).
SESSION ?= demo
WORK ?= $(HOME)/travail/tickets-api-$(SESSION)

.PHONY: check serve stop patch
check:
	jq empty overlay/opencode.json overlay/.mcp.json overlay/.claude/settings.json
	bash -n session.sh ../01-commun/prepare.sh
	@echo "OK 02-mcp-interface"

# Relance l'API et le front au premier plan (session.sh les lance déjà en arrière-plan).
serve:
	$(MAKE) -C $(WORK) run

# Arrête l'API lancée par session.sh.
stop:
	-@kill -- -$$(cat $(WORK)/serve.pid) 2>/dev/null || kill $$(cat $(WORK)/serve.pid) 2>/dev/null; rm -f $(WORK)/serve.pid

# Applique le correctif de référence (repli) sur la copie de travail.
patch:
	git -C $(WORK) apply $(CURDIR)/reference/correctif-bandeau.patch
