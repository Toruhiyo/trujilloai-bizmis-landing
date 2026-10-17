"""Rename timelines: resolve_rename_timeline.py "old" "new" ["old2" "new2" ...]"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/Projects/tools/davinci-resolve-mcp'))
from src.utils.resolve_bridge_client import connect
r = connect(require_enabled=False, timeout=300)
pm = r.GetProjectManager(); p = pm.GetCurrentProject()
pairs = dict(zip(sys.argv[1::2], sys.argv[2::2]))
for i in range(1, p.GetTimelineCount() + 1):
    tl = p.GetTimelineByIndex(i)
    if tl and tl.GetName() in pairs: print(tl.GetName(), '->', pairs[tl.GetName()], tl.SetName(pairs[tl.GetName()]))
pm.SaveProject()
