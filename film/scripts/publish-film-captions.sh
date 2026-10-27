#!/bin/zsh
# Publish a film's caption track next to its HLS ladder on the product CDN:
#
#   https://cdn.bizmis.ai/media/film/<film>/<cut>/<name>.vtt
#
#   zsh film/scripts/publish-film-captions.sh <file.vtt> <film> <cut> [name]   (name defaults to "en")
#   e.g. zsh film/scripts/publish-film-captions.sh ~/Projects/Bizmis/videos/ad-1/ad-1-v38.en.narrator.vtt ad-1 v38
#
# Same bucket, cache policy and CORS as publish-film-hls.sh (the cut must
# already be published). Objects are immutable for a year, so an existing
# track is never overwritten: publish a fix under a new name (e.g. en-2) and
# point the landing at it.
set -e
SRC=$1; FILM=$2; CUT=$3; NAME=${4:-en}
[[ -z $SRC || -z $FILM || -z $CUT ]] && { echo "usage: $0 <file.vtt> <film> <cut> [name]"; exit 1; }
[[ $(head -c 6 $SRC) == WEBVTT ]] || { echo "$SRC is not a WebVTT file"; exit 1; }
BUCKET=${FILM_BUCKET:-trujilloai-bizmis-prod-default-storage}
HOST=${FILM_HOST:-https://cdn.bizmis.ai}
KEY=media/film/$FILM/$CUT/$NAME.vtt

[[ -n $(aws s3 ls s3://$BUCKET/media/film/$FILM/$CUT/master.m3u8) ]] || { echo "no published cut at media/film/$FILM/$CUT/"; exit 1; }
if [[ -n $(aws s3 ls s3://$BUCKET/$KEY) ]]; then
  echo "s3://$BUCKET/$KEY already exists: publish the fix under a new name"; exit 1
fi
aws s3 cp --only-show-errors --content-type "text/vtt; charset=utf-8" \
  --cache-control "public, max-age=31536000, immutable" $SRC s3://$BUCKET/$KEY

# verify through the CDN, byte for byte, with CORS
OUT=$(mktemp)
code=$(curl -s -o $OUT -w '%{http_code}' -H 'Origin: https://www.bizmis.ai' $HOST/$KEY)
[[ $code == 200 ]] || { echo "FAILED $code $KEY"; exit 1; }
cmp -s $OUT $SRC || { echo "FAILED: the CDN serves different bytes for $KEY"; exit 1; }
curl -sI -H 'Origin: https://www.bizmis.ai' $HOST/$KEY | grep -qi '^access-control-allow-origin' || { echo "FAILED: no CORS header on $KEY"; exit 1; }
echo "TRACK $HOST/$KEY"
