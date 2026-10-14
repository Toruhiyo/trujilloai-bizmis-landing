#!/bin/zsh
# Publish an HLS ladder (scripts/encode-film-hls.sh output) to the product CDN:
#
#   https://cdn.bizmis.ai/media/film/<film>/<cut>/master.m3u8
#
#   zsh scripts/publish-film-hls.sh <ladder dir> <film> <cut>   (e.g. tmp/film-hls/ad-1-v33 ad-1 v33)
#
# cdn.bizmis.ai is the prod CloudFront distribution in trujilloai-bizmis-project
# (terraform, module multi_origin_cdn) in front of the default-storage bucket.
# Terraform owns that bucket's common/ prefix; media/ is content published by
# scripts like this one, never by terraform. CORS is open (response headers
# policy), so the player can fetch the playlists from any origin.
#
# Every cut gets a new prefix and its files are cached as immutable for a year,
# so a published cut is never overwritten: the script refuses an existing one.
# After the landing points at the new cut and plays live, remove the previous
# one with: aws s3 rm --recursive s3://$BUCKET/media/film/<film>/<old cut>/
set -e
SRC=${1%/}; FILM=$2; CUT=$3
[[ -z $SRC || -z $FILM || -z $CUT ]] && { echo "usage: $0 <ladder dir> <film> <cut>"; exit 1; }
[[ -f $SRC/master.m3u8 ]] || { echo "no master.m3u8 in $SRC"; exit 1; }
BUCKET=${FILM_BUCKET:-trujilloai-bizmis-prod-default-storage}
HOST=${FILM_HOST:-https://cdn.bizmis.ai}
PREFIX=media/film/$FILM/$CUT
CACHE="public, max-age=31536000, immutable"

if [[ -n $(aws s3 ls s3://$BUCKET/$PREFIX/) ]]; then
  echo "s3://$BUCKET/$PREFIX/ already exists: publish the new cut under a new name"; exit 1
fi

# one pass per file type, so each object gets its own Content-Type
for ext type in m3u8 application/vnd.apple.mpegurl m4s video/iso.segment mp4 video/mp4; do
  aws s3 cp --recursive --only-show-errors --exclude "*" --include "*.$ext" \
    --content-type $type --cache-control $CACHE $SRC s3://$BUCKET/$PREFIX
done

# verify through the CDN: every playlist, and each rendition's init and last segment
check() {
  local code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Origin: https://www.bizmis.ai' $HOST/$PREFIX/$1)
  [[ $code == 200 ]] || { echo "FAILED $code $1"; exit 1; }
}
local_files=(${(f)"$(cd $SRC && find . -type f \( -name '*.m3u8' -o -name '*.m4s' -o -name '*.mp4' \) | sed 's#^\./##')"})
check master.m3u8
for pl in $SRC/*/index.m3u8; do
  d=${${pl:h}:t}
  check $d/index.m3u8
  for f in $(grep -oE '[A-Za-z0-9_.-]+\.(mp4|m4s)' $pl | sort -u | sed -n '1p;$p'); do check $d/$f; done
done
echo "published ${#local_files} files"
echo "MASTER $HOST/$PREFIX/master.m3u8"
