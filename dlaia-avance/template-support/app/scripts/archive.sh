#!/usr/bin/env bash
# Assemble l'archive distribuée au formateur : dist/dlaia-avance.zip.
# Contenu, à plat : dlaia-avance.html (support compilé) et demos/ (runbooks, dépôts
# et artefacts des démonstrations). Extraite par unzip -d ~ en ~/dlaia-avance.html
# et ~/demos/. À lancer après npm run build.
set -euo pipefail

cd "$(dirname "$0")/../../.."   # racine de la formation : dlaia-avance/
[[ -f dist/index.html ]] || { echo "dist/index.html absent : lancer npm run build" >&2; exit 1; }

rm -rf dist/dlaia-avance dist/dlaia-avance.zip
mkdir -p dist/dlaia-avance
cp dist/index.html dist/dlaia-avance/dlaia-avance.html
if [[ -d demos ]]; then
  rsync -a --exclude .venv --exclude __pycache__ --exclude .pytest_cache --exclude .ruff_cache \
    --exclude node_modules --exclude '*.db' --exclude .git demos/ dist/dlaia-avance/demos/
fi

(cd dist/dlaia-avance && zip -qr ../dlaia-avance.zip .)
echo "dist/dlaia-avance.zip : $(unzip -l dist/dlaia-avance.zip | tail -1 | awk '{print $2}') fichiers"
