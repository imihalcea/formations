SESSION ?= demo
WORK ?= $(HOME)/travail/tickets-api-$(SESSION)

.PHONY: check opencode
check:
	jq empty artefacts/revue/finding.schema.json artefacts/.claude/settings.json
	bash -n session.sh lancer-opencode.sh ../01-commun/prepare.sh
	for r in R1 R2 R3 R4; do grep -q "^## $$r " artefacts/revue/regles.md; done
	for f in .claude/agents/reviewer.md .claude/agents/contradicteur.md .claude/commands/revue.md .claude/commands/revue-adverse.md .opencode/agents/reviewer.md .opencode/agents/contradicteur.md .opencode/commands/revue.md .opencode/commands/revue-adverse.md; do head -1 artefacts/$$f | grep -q '^---$$' && test -s artefacts/$$f; done
	jq -e '.required == ["regle","fichier","ligne","resume","scenario","severite"]' artefacts/revue/finding.schema.json >/dev/null
	@echo "OK 07-revue-a-la-demande"

# Rejeu Open Code non interactif : make opencode SESSION=x SPEC=002-responsable-priorite-haute
opencode:
	./lancer-opencode.sh $(WORK) revue $(or $(SPEC),002-responsable-priorite-haute)
