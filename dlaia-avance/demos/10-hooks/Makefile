.PHONY: check
# Contrôles sans modèle ni GitHub. gitleaks absent : tester-pre-commit.sh est signalé SKIP (GITLEAKS=<binaire> pour le jouer).
check:
	jq empty artefacts/.claude/settings.json
	jq -e '.hooks.PreToolUse[0].matcher == "Edit|Write|Bash"' artefacts/.claude/settings.json >/dev/null
	bash -n session.sh ajouter-jeton.sh tester-garde.sh tester-pre-commit.sh artefacts/.claude/hooks/garde-ci.sh artefacts/.githooks/pre-commit
	./tester-garde.sh
	node tester-plugin.mjs
	./tester-pre-commit.sh
	@echo "OK 10-hooks"
