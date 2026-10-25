.PHONY: check
# Contrôles sans modèle ni GitHub : syntaxe, YAML, validation des findings, script du job avec faux gh et faux claude.
check:
	bash -n session.sh ci/lancer-job.sh ci/valider-findings.sh tester-valider.sh tester-job.sh
	python3 -c "import yaml; [yaml.safe_load(open(f)) for f in ('workflows/revue.claude-code.yml','workflows/revue.opencode.yml')]"
	grep -q 'if: always()' workflows/revue.claude-code.yml
	grep -q 'timeout-minutes: 10' workflows/revue.opencode.yml
	./tester-valider.sh
	./tester-job.sh
	@echo "OK 11-revue-en-ci"
