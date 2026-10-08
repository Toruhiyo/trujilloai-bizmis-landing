"""Push one ad-1 version into the open Resolve project through the
davinci-resolve-mcp bridge: back the project up as a .drp first, then add the
version as a NEW timeline (earlier timelines are left untouched). Each track
group gets as many audio tracks as its clips need so nothing overlaps.

  ~/Projects/tools/davinci-resolve-mcp/venv/bin/python resolve_push.py ~/Movies/ad-1-resolve/<tag>/manifest.json
"""
import os, sys, json, time
sys.path.insert(0, os.path.expanduser('~/Projects/tools/davinci-resolve-mcp'))
from src.utils.resolve_bridge_client import connect
man = json.load(open(sys.argv[1]))
r = connect(require_enabled=False, timeout=900)
pm = r.GetProjectManager(); p = pm.GetCurrentProject(); mp = p.GetMediaPool()
backup_dir = os.path.expanduser('~/Movies/ad-1-resolve/backups'); os.makedirs(backup_dir, exist_ok=True)
pm.SaveProject()
backup = os.path.join(backup_dir, f"{p.GetName()} before {man['timeline']} {time.strftime('%Y%m%d-%H%M%S')}.drp")
print('backup', pm.ExportProject(p.GetName(), backup, False), backup)
names = [p.GetTimelineByIndex(i).GetName() for i in range(1, p.GetTimelineCount() + 1)]
name = man['timeline']; i = 2
while name in names: name = f"{man['timeline']} ({i})"; i += 1
folder = mp.AddSubFolder(mp.GetRootFolder(), name) or mp.GetRootFolder()
mp.SetCurrentFolder(folder)
paths = [man['picture']] + [c['path'] for c in man['clips']]
imported = mp.ImportMedia(paths) or []
by_path = {it.GetClipProperty('File Path'): it for it in imported}
print('imported', len(imported), 'of', len(paths))
tl = mp.CreateEmptyTimeline(name); p.SetCurrentTimeline(tl); tl.SetStartTimecode('00:00:00:00')
# lanes per track group
lanes, track_of = [], {}
for g in man['tracks']:
    ends = []
    for c in [c for c in man['clips'] if c['track'] == g]:
        for j, e in enumerate(ends):
            if c['frame'] >= e: ends[j] = c['frame'] + c['frames']; c['lane'] = j; break
        else: ends.append(c['frame'] + c['frames']); c['lane'] = len(ends) - 1
    for j in range(len(ends)):
        track_of[(g, j)] = len(lanes) + 1; lanes.append(g if len(ends) == 1 else f'{g} {j + 1}')
while tl.GetTrackCount('audio') < len(lanes): tl.AddTrack('audio', 'stereo')
for j, n in enumerate(lanes, 1): tl.SetTrackName('audio', j, n)
base = tl.GetStartFrame()
mp.AppendToTimeline([{'mediaPoolItem': by_path[man['picture']], 'startFrame': 0, 'endFrame': man['frames'] - 1,
                      'trackIndex': 1, 'recordFrame': base, 'mediaType': 1}])
infos = [{'mediaPoolItem': by_path[c['path']], 'startFrame': 0, 'endFrame': c['frames'] - 1,
          'trackIndex': track_of[(c['track'], c['lane'])], 'recordFrame': base + c['frame'], 'mediaType': 2}
         for c in man['clips'] if c['path'] in by_path]
placed = mp.AppendToTimeline(infos) or []
print('timeline', name, 'audio clips', len(placed), 'of', len(man['clips']), 'tracks', len(lanes))
# keep the working project's name versioned: "ad-1 promo working (v1 to <latest>)"
if p.GetName().startswith('ad-1 promo working'):
    p.SetName(f"ad-1 promo working (v1 to {man['timeline'].replace('ad-1 ', '')})")
r.OpenPage('edit'); print('project', p.GetName(), 'saved', pm.SaveProject())
