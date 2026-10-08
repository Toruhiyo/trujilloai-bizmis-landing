#!/bin/zsh
# v17 (one continuous track per style, whole-beat placement only): mix + master each placed take
# onto one export, no climax bed (the pain stays light), push each to Resolve as its own timeline.
#   zsh mix_versions_v17.sh <name> <export dir> "<take:slug> ..."
cd "$(dirname "$0")"
NAME=$1; EXP=$2; TAKES=${3:-"A-0:upbeat-groove B-1:bouncy-lounge C-0:playful-caper"}
PY=/private/tmp/claude-501/-Users-toruhiyo-Projects-Bizmis/3b1d8fff-50ac-4e73-9aaf-56e18b6df12f/scratchpad/ad1/venv/bin/python
RES_PY=~/Projects/tools/davinci-resolve-mcp/venv/bin/python
for ts in ${=TAKES}; do
  k=${ts%%:*}; TAG="${NAME}-${k}-${ts#*:}"
  echo "== $TAG"
  EXPORT_DIR=$EXP SCORE=music/${NAME}-${k}-score.wav CLIMAX=none $PY master.py $TAG 2>&1 | tail -2
  $RES_PY resolve_push.py ~/Movies/ad-1-resolve/$TAG/manifest.json 2>&1 | tail -2
done
