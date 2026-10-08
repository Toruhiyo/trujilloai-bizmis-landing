#!/bin/zsh
# Build the hero's ambient loop (public/film/ad-1-loop.*) from a film export:
# the Bizmis agent presented big (logo → avatar → "Your store salesagent."),
# then its pitch in the demo store (pick → details → cart → bundle → sold →
# sea of sold cards), crossfaded between beats and back into its own start
# so it loops seamlessly.
#
#   zsh scripts/make-hero-film-loop.sh <film.mkv|mp4> ["start-end[@speed] ..."]
#
# Segment times are film seconds; re-pick them for each new cut of the film.
# A segment plays at SPEED unless it carries its own @speed (text beats at
# @1 so they stay readable).
set -e
cd "$(dirname "$0")/.."
IN=$1
SEGS=(${=${2:-"49.4-56.3@1 70.0-74.5 79.5-83.0 89.0-92.5 96.0-101.0 103.0-107.5"}})
SPEED=1.5   # default playback speed of a segment
XF=0.35     # crossfade between beats (s, after speed-up)
LX=0.6      # crossfade from the end back into the start (s)
OUT=public/film/ad-1-loop
TMP=$(mktemp -d)

inputs=(); chain=""; prev=""; off=0
for i in {1..${#SEGS}}; do
  seg=${SEGS[$i]}; sp=$SPEED
  if [[ $seg == *@* ]]; then sp=${seg#*@}; seg=${seg%@*}; fi
  a=${seg%-*}; b=${seg#*-}
  inputs+=(-ss $a -t $(awk "BEGIN{print $b-$a}") -i $IN)
  chain+="[$((i-1)):v]scale=1600:900:flags=lanczos,fps=30,format=yuv420p,setpts=(PTS-STARTPTS)/${sp}[s$i];"
  len=$(awk "BEGIN{print ($b-$a)/$sp}")
  if [[ $i == 1 ]]; then prev="s1"; off=$len
  else
    off=$(awk "BEGIN{print $off-$XF}")
    chain+="[${prev}][s$i]xfade=transition=fade:duration=${XF}:offset=${off}[m$i];"
    prev="m$i"; off=$(awk "BEGIN{print $off+$len}")
  fi
done
ffmpeg -y -loglevel error "${inputs[@]}" -an -filter_complex "${chain}[${prev}]format=yuv420p[o]" -map "[o]" -c:v libx264 -crf 14 -preset fast $TMP/montage.mp4

D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $TMP/montage.mp4)
LOFF=$(awk "BEGIN{print $D-2*$LX}")
ffmpeg -y -loglevel error -i $TMP/montage.mp4 -an -filter_complex "[0:v]split[a][b];[a]trim=start=${LX},setpts=PTS-STARTPTS[m];[b]trim=0:${LX},setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=${LX}:offset=${LOFF},format=yuv420p[o]" -map "[o]" -c:v libx264 -preset slow -crf 26 -profile:v high -movflags +faststart $OUT.mp4
ffmpeg -y -loglevel error -i $OUT.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an $OUT.webm
ffmpeg -y -loglevel error -ss 1.0 -i $OUT.mp4 -frames:v 1 -q:v 4 $OUT-poster.jpg
mv $TMP ~/.Trash/hero-loop-tmp-$$
ls -la $OUT.*; ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT.mp4
