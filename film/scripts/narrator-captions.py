#!/usr/bin/env python3
"""Closed captions for the film's NARRATOR only (the CC track of the landing's film player).

The shopper's and the agent's lines are burned into the picture as the widget's
own caption pills, so the CC track carries the voice-over alone. Speakers are
never guessed from the text: a clip is narration when the film's voice track
(markers.json `voice`, written by the exporter) places a /promo/voice/<id>.wav
whose public/promo/voice/<id>.json says `"role": "narrator"` (the PROMO_VO
takes, t-*). Word times come from that json's `chars` (re-timed onto the
scribe_v1 STT word times), offset by the clip's `atMs` on the film's clock.

Cues: one per sentence ("..." does not end one); a sentence longer than
MAX_CUE characters splits at the comma nearest its middle. A cue starts on its
first word and holds HOLD_MS after its last one, never into the next cue.
Every cue carries a WebVTT voice span, <v Narrator>.

Usage:
  film/scripts/narrator-captions.py <markers.json> <out-basename>
  e.g. film/scripts/narrator-captions.py \
         ~/Projects/Bizmis/film-production/ad-1/masters/ad-1-v38-4k/markers.json \
         ~/Projects/Bizmis/videos/ad-1/ad-1-v38.en.narrator
  writes <out-basename>.vtt and <out-basename>.srt
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(HERE, '..', '..', 'public', 'promo', 'voice')
MAX_CUE = 80      # characters before a sentence splits at a comma
LINE = 42         # characters per line in the files (the player wraps on its own)
HOLD_MS = 300     # reading time held after the last word
GAP_MS = 40       # a cue ends at least this long before the next one starts


def words_of(take):
    """Words of the take as said, without the audio tags, with ms times (end = last letter/digit)."""
    out, cur, in_tag = [], None, False
    for c in take['chars']:
        ch = c['char']
        if ch == '[':
            in_tag = True
            continue
        if in_tag:
            in_tag = ch != ']'
            continue
        if ch.isspace():
            if cur:
                out.append(cur)
            cur = None
            continue
        if cur is None:
            cur = {'w': '', 's': c['startMs'], 'e': c['startMs'] + c['durMs']}
        cur['w'] += ch
        if ch.isalnum():
            cur['e'] = c['startMs'] + c['durMs']
    if cur:
        out.append(cur)
    return out


def sentences(words):
    group = []
    for w in words:
        group.append(w)
        if re.search(r'[.!?]$', w['w']) and not w['w'].endswith('...'):
            yield group
            group = []
    if group:
        yield group


def split_long(group):
    text = ' '.join(w['w'] for w in group)
    if len(text) <= MAX_CUE:
        return [group]
    mid, best, pos = len(text) / 2, None, 0
    for i, w in enumerate(group[:-1]):
        pos += len(w['w']) + 1
        if w['w'].endswith(',') and (best is None or abs(pos - mid) < abs(best[1] - mid)):
            best = (i, pos)
    if best is None:
        return [group]
    i = best[0]
    return split_long(group[:i + 1]) + split_long(group[i + 1:])


def wrap(text):
    if len(text) <= LINE:
        return text
    spaces = [m.start() for m in re.finditer(' ', text)]
    cut = min(spaces, key=lambda p: abs(p - len(text) / 2))
    return text[:cut] + '\n' + text[cut + 1:]


def ts(ms, sep):
    h, ms = divmod(int(round(ms)), 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'


def main(markers_path, out_base):
    markers = json.load(open(os.path.expanduser(markers_path)))
    cues = []
    for clip in markers['voice']:
        m = re.fullmatch(r'/promo/voice/([\w-]+)\.wav', clip['src'])
        if not m:
            continue  # store reels (their audio is the agent's, burned in)
        path = os.path.join(VOICE_DIR, m.group(1) + '.json')
        take = json.load(open(path))
        if take.get('role') != 'narrator':
            continue
        if abs(take['durationMs'] - (clip['endMs'] - clip['atMs'])) > 40:
            sys.exit(f"{m.group(1)}: take is {take['durationMs']} ms but the film places {clip['endMs'] - clip['atMs']} ms; the voice json is not this cut's")
        at = clip['atMs'] - round(clip.get('fromSec', 0) * 1000)
        for sentence in sentences(words_of(take)):
            for group in split_long(sentence):
                cues.append({'id': m.group(1), 's': at + group[0]['s'], 'e': at + group[-1]['e'],
                             'clipEnd': clip['endMs'], 'text': ' '.join(w['w'] for w in group)})
    cues.sort(key=lambda c: c['s'])
    for a, b in zip(cues, cues[1:] + [None]):
        end = min(a['e'] + HOLD_MS, a['clipEnd'])
        if b:
            end = min(end, b['s'] - GAP_MS)
        a['e'] = max(end, a['e'])
    vtt = ['WEBVTT', 'Kind: captions', 'Language: en', '',
           'NOTE Narrator voice-over only. The shopper and the agent are captioned in the picture.', '']
    srt = []
    for i, c in enumerate(cues, 1):
        vtt += [f"{c['id']}-{i}", f"{ts(c['s'], '.')} --> {ts(c['e'], '.')}", f"<v Narrator>{wrap(c['text'])}", '']
        srt += [str(i), f"{ts(c['s'], ',')} --> {ts(c['e'], ',')}", wrap(c['text']), '']
    out_base = os.path.expanduser(out_base)
    open(out_base + '.vtt', 'w').write('\n'.join(vtt))
    open(out_base + '.srt', 'w').write('\n'.join(srt))
    print(f'{len(cues)} narrator cues -> {out_base}.vtt, .srt')
    for c in cues:
        print(f"  {ts(c['s'], '.')} {ts(c['e'], '.')}  {c['id']:<11} {c['text']}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
