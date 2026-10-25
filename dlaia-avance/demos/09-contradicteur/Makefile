.PHONY: check
check:
	bash -n session.sh
	for f in contradicteur reviewer; do test -s ../07-revue-a-la-demande/artefacts/.claude/agents/$$f.md; test -s ../07-revue-a-la-demande/artefacts/.opencode/agents/$$f.md; done
	grep -q "^## R3" ../08-faux-positif/reference/regles-r3-corrigee.md
	@echo "OK 09-contradicteur"
