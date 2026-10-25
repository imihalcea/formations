# check : JSON, shell, puis compilation TypeScript des deux scripts (copie dans un dossier temporaire).
.PHONY: check
check:
	jq empty overlay/scripts/package.json overlay/scripts/tsconfig.json
	bash -n session.sh ../01-commun/prepare.sh
	@t=$$(mktemp -d) && cp -r overlay/scripts/. $$t && cd $$t && npm install --silent >/dev/null 2>&1 && npx tsc -p . && echo "OK tsc" ; rc=$$?; rm -rf $$t; exit $$rc
	@echo "OK 05-sdk"
