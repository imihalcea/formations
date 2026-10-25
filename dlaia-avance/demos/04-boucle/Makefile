.PHONY: check
check:
	jq empty overlay/.claude/settings.json
	bash -n session.sh ../01-commun/prepare.sh
	test -s overlay/.opencode/agents/implementeur.md
	@echo "OK 04-boucle"
