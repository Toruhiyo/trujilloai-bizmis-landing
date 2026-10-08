"""Update the live Resolve project after the VO pass, in two steps:
  1. write  (any venv with numpy/scipy):   python add_vo_resolve.py write
     renders the mix and writes the changed clips (*_v3.wav) and VO_*.wav into ~/Movies/ad-1-resolve/media
  2. apply  (davinci-resolve-mcp venv):    ~/Projects/tools/davinci-resolve-mcp/venv/bin/python add_vo_resolve.py apply
     relinks the changed clips through the in-Resolve bridge and adds a VO track with the narrator lines."""
import os, re, sys, math, wave, glob
MEDIA = os.path.expanduser('~/Movies/ad-1-resolve/media')
SPF, FRAMES, TAG = 1600, 4826, 'v3'
CHANGED = {('pulse', 1152), ('pulse', 1180), ('pulse', 1215), ('music_cold', 0), ('pullback', 846)}

def write_step():
    import numpy as np, mix
    from mix import SR, write
    for start, label, x in mix.rows:
        s = int(round(max(0.0, start) * SR)); f0 = s // SPF; pad = s - f0 * SPF
        if not (label.startswith('vo_') or (label, f0) in CHANGED): continue
        y = np.concatenate([np.zeros((pad, 2), np.float32), x.astype(np.float32)])
        n = min(math.ceil(len(y) / SPF), FRAMES - f0)
        y = np.concatenate([y, np.zeros((max(0, n * SPF - len(y)), 2), np.float32)])[:n * SPF]
        name = f'VO_{f0:04d}f_{label[3:]}.wav' if label.startswith('vo_') else f'{f0:04d}f_{label}_{TAG}.wav'
        write(os.path.join(MEDIA, name), y); print('wrote', name)

def apply_step():
    sys.path.insert(0, os.path.expanduser('~/Projects/tools/davinci-resolve-mcp'))
    from src.utils.resolve_bridge_client import connect
    r = connect(require_enabled=False, timeout=900)
    pm = r.GetProjectManager(); p = pm.GetCurrentProject(); mp = p.GetMediaPool(); tl = p.GetCurrentTimeline()
    def walk(f):
        for c in f.GetClipList() or []: yield c
        for s in f.GetSubFolderList() or []: yield from walk(s)
    pool = list(walk(mp.GetRootFolder()))
    for label, f0 in sorted(CHANGED, key=lambda c: c[1]):
        path = os.path.join(MEDIA, f'{f0:04d}f_{label}_{TAG}.wav')
        pat = re.compile(rf'^\d+_{f0:04d}f_{re.escape(label)}(_v\d)?\.wav$')
        print('relink', label, f0, [(c.GetName(), c.ReplaceClip(path)) for c in pool if pat.match(c.GetName())])
    vo = sorted(glob.glob(os.path.join(MEDIA, 'VO_*.wav')))
    have = {c.GetName(): c for c in pool}
    new = [f for f in vo if os.path.basename(f) not in have]
    for c in (mp.ImportMedia(new) or []) if new else []: have[c.GetName()] = c
    names = [t for t in range(1, tl.GetTrackCount('audio') + 1) if tl.GetTrackName('audio', t) == 'VO']
    if names: vt = names[0]
    else: tl.AddTrack('audio', 'stereo'); vt = tl.GetTrackCount('audio'); tl.SetTrackName('audio', vt, 'VO')
    placed = {i.GetName() for i in tl.GetItemListInTrack('audio', vt) or []}
    base = tl.GetStartFrame(); infos = []
    for f in vo:
        nm = os.path.basename(f)
        if nm in placed: continue
        f0 = int(re.match(r'VO_(\d+)f_', nm).group(1))
        with wave.open(f) as w: n = w.getnframes() // SPF
        infos.append({'mediaPoolItem': have[nm], 'startFrame': 0, 'endFrame': n - 1, 'trackIndex': vt,
                      'recordFrame': base + f0, 'mediaType': 2})
    if infos: mp.AppendToTimeline(infos)
    print('VO track A%d' % vt, [(i.GetName(), i.GetStart()) for i in tl.GetItemListInTrack('audio', vt)])
    print('saved', pm.SaveProject())

{'write': write_step, 'apply': apply_step}[sys.argv[1]]()
