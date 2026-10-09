#!/bin/zsh
# v17 (one continuous track per style, whole-beat placement only): mix + master each placed take
# onto one export, no climax bed (the pain stays light), push each to Resolve as its own timeline.
#   zsh mix_versions_v17.sh <name> <export dir> "<take:slug> ..."
cd "$(dirname "$0")"
NAME=$1; EXP=$2; TAKES=${3:-"A-0:upbeat-groove B-1:bouncy-lounge C-0:playful-caper"}
PY=${AD1_PY:-/private/tmp/claude-501/-Users-toruhiyo-Projects-Bizmis/63d7ad37-fd19-47cb-aa34-7bad6b98befa/scratchpad/ad1/venv/bin/python}
RES_PY=~/Projects/tools/davinci-resolve-mcp/venv/bin/python
for ts in ${=TAKES}; do
  k=${ts%%:*}; TAG="${NAME}-${k}-${ts#*:}"
  echo "== $TAG"
  EXPORT_DIR=$EXP SCORE=music/${NAME}-${k}-score.wav CLIMAX=none $PY master.py $TAG 2>&1 | tail -2
  $RES_PY resolve_push.py ~/Movies/ad-1-resolve/$TAG/manifest.json 2>&1 | tail -2
  $RES_PY resolve_markers.py $EXP "ad-1 $TAG" 2>&1 | head -1   # jog points: chapters + key moments
done
