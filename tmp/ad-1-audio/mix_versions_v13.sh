#!/bin/zsh
# v13: mix + master the five score versions onto one export and push each to
# Resolve as its own timeline (the recommended one marked "REC").
#   zsh mix_versions_v13.sh <name e.g. v13e> <export dir> [versions e.g. "1 2 3 4 5"] [tag suffix]
cd "$(dirname "$0")"
NAME=$1; EXP=$2; VERS=${3:-"1 2 3 4 5"}; SUF=${4:-}
PY=/private/tmp/claude-501/-Users-toruhiyo-Projects-Bizmis/3b1d8fff-50ac-4e73-9aaf-56e18b6df12f/scratchpad/ad1/venv/bin/python
RES_PY=~/Projects/tools/davinci-resolve-mcp/venv/bin/python
typeset -A SLUG CLIM
SLUG=(1 glass-light 2 intimate-to-bright-REC 3 strings-pizzicato 4 warm-groove 5 indie-pop)
CLIM=(1 bed:el11/pulse-clock 2 ../el13c/climax-warm 3 ../el13c/climax-warm1 4 ../el13c/climax-glass41 5 ../el13c/climax-warm2)
for v in ${=VERS}; do
  TAG="${NAME}-s${v}-${SLUG[$v]}${SUF}"
  if [[ $v == 2 ]]; then SCORE="music/${NAME}-v2-final-pain.wav,music/${NAME}-v2-final-pitch.wav"; SPLIT=1; else SCORE="music/${NAME}-v${v}-final.wav"; SPLIT=; fi
  echo "== $TAG ($SCORE, climax ${CLIM[$v]})"
  EXPORT_DIR=$EXP SCORE=$SCORE SCORE_SPLIT=$SPLIT CLIMAX=${CLIM[$v]} PICTURE_CODEC=${PICTURE_CODEC:-} $PY master.py $TAG 2>&1 | tail -2
  $RES_PY resolve_push.py ~/Movies/ad-1-resolve/$TAG/manifest.json 2>&1 | tail -2
done
