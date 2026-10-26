.PHONY: check
# Contrôles sans modèle ni GitHub : syntaxe, YAML, agents, script du job avec faux gh et faux claude.
check:
	bash -n session.sh ci/analyser-echec.sh tester-job.sh
	python3 -c "import yaml; [yaml.safe_load(open(f)) for f in ('workflows/analyse-echec.claude-code.yml','workflows/analyse-echec.opencode.yml')]"
	grep -q 'workflow_run' workflows/analyse-echec.claude-code.yml
	grep -q "conclusion == 'failure'" workflows/analyse-echec.opencode.yml
	for f in artefacts/.claude/agents/diagnostiqueur.md artefacts/.opencode/agents/diagnostiqueur.md; do head -1 $$f | grep -q '^---$$' && test -s $$f; done
	python3 -I -c "import ast; ast.parse(open('reference/20260907_0002_ticket_assignee.py').read())"
	./tester-job.sh
	@echo "OK 12-analyse-echec"
