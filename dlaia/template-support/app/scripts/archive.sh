#!/usr/bin/env bash
# Assemble l'archive distribuée aux stagiaires : dist/dlaia.zip.
# Contenu : dlaia/dlaia.html (support compilé), dlaia/bookit/ (fil rouge),
# dlaia/fichiers/ (fichiers fournis par les TP). À lancer après npm run build.
set -euo pipefail

cd "$(dirname "$0")/../../.."   # racine de la formation : dlaia/
[[ -f dist/index.html ]] || { echo "dist/index.html absent : lancer npm run build" >&2; exit 1; }
[[ -d fil-rouge ]] || { echo "fil-rouge/ absent" >&2; exit 1; }

rm -rf dist/dlaia dist/dlaia.zip
mkdir -p dist/dlaia
cp dist/index.html dist/dlaia/dlaia.html
rsync -a --exclude .venv --exclude __pycache__ --exclude .pytest_cache --exclude .ruff_cache \
  --exclude '*.db' --exclude .git fil-rouge/ dist/dlaia/bookit/
if [[ -d tp/fichiers ]]; then
  rsync -a tp/fichiers/ dist/dlaia/fichiers/
fi

(cd dist && zip -qr dlaia.zip dlaia)
echo "dist/dlaia.zip : $(unzip -l dist/dlaia.zip | tail -1 | awk '{print $2}') fichiers"
