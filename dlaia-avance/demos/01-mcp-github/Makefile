# Vérifications sans modèle ni réseau.
.PHONY: check
check:
	jq empty overlay/.mcp.json overlay/opencode.json overlay/.claude/settings.json
	bash -n session.sh issue/creer-issue.sh ../01-commun/prepare.sh ../01-commun/reset.sh
	@echo "OK 01-mcp-github"
