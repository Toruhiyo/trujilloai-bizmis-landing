# ad-1 film: production pipeline

The Bizmis promo film (ad-1) is rendered from a web page: `public/promo/` holds the film engine and every
picture/voice asset; the scripts below export it frame by frame, mix it, and publish it. The landing only
streams the result (HLS on the product CDN, `src/lib/film.ts`).

## Where things live

| What | Where | In git |
|---|---|---|
| Film engine + markup + assets (voices, store clips, products) | `public/promo/` | yes |
| Export, recorders, voice, HLS scripts + beat sheets | `film/scripts/` | yes |
| Mixer / master (`master.py` → `mix2.py`, `voice_from_markers.py`), SFX generator, score builder | `film/audio/` | yes |
| DaVinci Resolve push / markers / timeline utilities | `film/resolve/` | yes |
| Demo-store pages + their recorder (the 23 stores of the reel) | `film/demo-stores/` | yes |
| SFX library, music (score + takes), mix outputs | `~/Projects/Bizmis/film-production/ad-1/audio/` (`FILM_AUDIO_MEDIA`) | no |
| Demo-store generated hero/grid images (`build24.mjs` input) | `~/Projects/Bizmis/film-production/ad-1/demo-stores-gen/` (`DEMO_STORES_GEN`) | no |
| Latest picture master, HLS ladder, raw live takes, voice takes | `~/Projects/Bizmis/film-production/ad-1/{masters,hls,takes}/` | no |
| Resolve working media + project backups | `~/Movies/ad-1-resolve/` | no |
| Finals (4K master, YouTube package) | `~/Projects/Bizmis/videos/ad-1/` | no |
| Python envs | `~/Projects/tools/ad1-audio-venv` (mixer), `~/Projects/tools/davinci-resolve-mcp/venv` (Resolve) | no |

## Rules (from the operator, non-negotiable)

- Music is fitted to the picture, never the reverse. A change must not move picture timing by a frame unless
  asked: after every export, diff `markers.json` (scene markers + voice cues) against the previous cut.
- Every voice is ElevenLabs `eleven_v4`; voices are never time-stretched. Every SFX is ElevenLabs-generated.
- Every version goes into Resolve as a new timeline.
- Effects and looks are iterated with short probe clips and approved BEFORE any full export.
- `take.at(phrase)` is case-sensitive and resolves at once when the phrase is missing (a re-voice that changes
  case moves its beat).

## ElevenLabs credits

Every script here that calls ElevenLabs (`record-store-usecases`, `generate-film-voice`, `revoice-agent`,
`audio/el_sfx.py`, `scripts/generate-replay-audio`) goes through `film/scripts/el-guard.mjs` / `el_guard.py`: nothing
paid starts when the billing period's usage is above 400,000 credits, and a run stops at 5,000 credits. Overrides on
purpose only: `EL_CREDIT_CAP` / `EL_PERIOD_CEILING` with `EL_I_KNOW=1`. Live recordings refuse to start without the
film tester token, so the backend marks their sessions `is_test`, `test_by=film`. Mint it once (90 days, never print
it): `cd ~/Projects/TrujilloAI/trujilloai-landing-backend && ./.venv/bin/python3.13 -m scripts.bizmis.mint_test_session_token --who film --days 90 --out ~/Projects/Bizmis/film-production/.test-token`.

## Iterating

Work in a short-lived worktree off `origin/main` (the main checkout is shared):

```
git worktree add ../film-work -b film-vNN origin/main
cd ../film-work && ln -s ../trujilloai-bizmis-landing/node_modules node_modules
node film/scripts/vite-export-server.mjs 8150        # serves the film (no HMR); run from the worktree root
```

The film: `http://127.0.0.1:8150/?marketing=ad-1&cta=ea` (add `&export=1&nocover=1&widget=local` for the export
clock). Probe a moment export-faithfully by seeking AND settling every frame from 0 (skipping settles drifts the
clock); a short probe clip is how an effect gets approved.

- **Narrator / clerk lines:** `public/promo/voice/film-lines.json` + `node film/scripts/generate-film-voice.mjs --only <id>`.
  A replacement line must fit its old duration (`durationMs` in its json drives the timeline).
- **SFX:** `film/audio/el_sfx.py <out dir> <table.json>`, then map the id in `film/audio/mix2.py` (SFX table).
- **Demo-store loops (tunnel + run):** serve the pages, then record:
  `cd film/demo-stores && python3 -m http.server 8766` and `node film/demo-stores/_tools/record36.mjs <slug,..|all>`
  (`--stills` for quick checks; `REEL_CUT=v37` writes a new reel folder). Widget highlight beats live in
  `film/demo-stores/_plan/flair36.json` (tunnel beats peak at each card's own exposure maximum). Rebuild pages with
  `_tools/build24.mjs` (needs `DEMO_STORES_GEN`).
- **Live hero takes (real Shopify dev stores, PROD widget):** beats in `film/scripts/store-reel-v36.json`
  (`flair` draws the native highlight in the page); run with
  `PROMO_USECASES=film/scripts/store-reel-v36.json PROMO_OUT_DIR=<takes dir> PROMO_STORE_SLUG=<slug> node film/scripts/record-store-usecases.mjs`,
  then cut the take into the hero's exact window and keep the hero's original voice track.

## Releasing a cut (vNN)

```
# 1. preview export (1080p), then the 4K master (same command, --resolution 3840x2160)
EXPORT_HOLE_SKIP=700-950 EXPORT_TIMEOUT_MS=400000 node film/scripts/export-ad-1.mjs --cta ea --part full \
  --resolution 1920x1080 --codec h264 --stream --widget local --url http://127.0.0.1:8150/ --out <dir>
# 2. diff <dir>/markers.json against the previous cut (markers + voice cues must match unless intended)
# 3. voice track + mix + master (-14 LUFS) -> ~/Movies/ad-1-resolve/<tag>/
VOICE_PUBLIC=<worktree>/public ~/Projects/tools/ad1-audio-venv/bin/python film/audio/voice_from_markers.py <dir>
STORE_CLAPS=1 PAIN_TAIL_FADE=0.1 EXPORT_DIR=<dir> SCORE=music/suno/v30/v31-final-score.wav CLIMAX=none \
  ~/Projects/tools/ad1-audio-venv/bin/python film/audio/master.py <tag>
# 4. Resolve (backs the project up first)
~/Projects/tools/davinci-resolve-mcp/venv/bin/python film/resolve/resolve_push.py ~/Movies/ad-1-resolve/<tag>/manifest.json
# 5. HLS ladder -> product CDN (refuses to overwrite a published cut)
zsh film/scripts/encode-film-hls.sh ~/Movies/ad-1-resolve/<tag>/ad-1-<tag>.mp4 <hls dir>
zsh film/scripts/publish-film-hls.sh <hls dir> ad-1 vNN
# 6. point src/lib/film.ts at https://cdn.bizmis.ai/media/film/ad-1/vNN/master.m3u8, build, push main,
#    wait for Vercel, play it on www.bizmis.ai and check every request is media/film/ad-1/vNN/
# 7. only then: aws s3 rm --recursive s3://trujilloai-bizmis-prod-default-storage/media/film/ad-1/<old>/
# 8. YouTube package + finals -> ~/Projects/Bizmis/videos/ad-1/ (4K mp4, thumbnail, .en.srt, youtube.txt)
```
