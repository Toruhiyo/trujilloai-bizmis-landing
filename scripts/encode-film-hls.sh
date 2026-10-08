#!/bin/zsh
# Encode a film master into an HLS adaptive-bitrate ladder for the landing's
# FilmPlayer: 2160p, 1440p, 1080p, 720p, 480p and 360p H.264 renditions in
# 4 s fMP4 segments, one AAC track, and a master playlist the player loads.
#
#   zsh scripts/encode-film-hls.sh <master.mkv> <out dir>   (e.g. tmp/film-hls/ad-1)
#
# Upload the whole <out dir> to the film host and point VITE_FILM_SRC at
# <host>/<out dir name>/master.m3u8.
# Each rung is quality-targeted (CRF) with a bitrate cap, so the film's flat
# UI scenes stay small while the busy store reel keeps its detail.
set -e
IN=$1; OUT=$2
[[ -z $IN || -z $OUT ]] && { echo "usage: $0 <master> <out dir>"; exit 1; }
mkdir -p $OUT

# height  cap     buffer
LADDER=(
  "2160 16000k 24000k"
  "1440 9000k  13500k"
  "1080 5500k  8250k"
  "720  3000k  4500k"
  "480  1400k  2100k"
  "360  800k   1200k"
)
N=${#LADDER}
split="[0:v]split=$N"; for i in {1..$N}; do split+="[v$i]"; done; split+=";"
filters=""; maps=(); streams=""
for i in {1..$N}; do
  set -- ${=LADDER[$i]}; h=$1; cap=$2; buf=$3; k=$((i-1))
  filters+="[v$i]scale=-2:${h}:flags=lanczos,format=yuv420p[o$i];"
  maps+=(-map "[o$i]" -c:v:$k libx264 -preset slow -profile:v:$k high -crf:v:$k 20 -maxrate:v:$k $cap -bufsize:v:$k $buf)
  streams+="v:$k,agroup:aud,name:${h}p "
done
# 30 fps film, 4 s segments: keyframe every 2 s, aligned across renditions.
ffmpeg -y -loglevel error -stats -i $IN \
  -filter_complex "${split}${filters%;}" \
  ${maps[@]} -g 60 -keyint_min 60 -sc_threshold 0 \
  -map 0:a:0 -c:a aac -b:a 160k -ac 2 \
  -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_type fmp4 \
  -hls_flags independent_segments \
  -hls_segment_filename "$OUT/%v/seg_%03d.m4s" \
  -master_pl_name master.m3u8 \
  -var_stream_map "${streams}a:0,agroup:aud,name:audio" \
  "$OUT/%v/index.m3u8"
# ffmpeg also lists the audio group as a variant of its own; drop it so a
# player can never fall back to sound with no picture.
python3 - "$OUT/master.m3u8" <<'PY'
import sys
p = sys.argv[1]; lines = open(p).read().split("\n"); out = []; i = 0
while i < len(lines):
    if lines[i].startswith("#EXT-X-STREAM-INF") and "RESOLUTION=" not in lines[i]:
        i += 2; continue
    out.append(lines[i]); i += 1
open(p, "w").write("\n".join(out))
PY
du -sh $OUT/*/ | sort -h
