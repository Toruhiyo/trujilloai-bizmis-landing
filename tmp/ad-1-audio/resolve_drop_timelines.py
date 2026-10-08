"""Delete timelines (by exact name) this session created and has since replaced.
  ~/Projects/tools/davinci-resolve-mcp/venv/bin/python resolve_drop_timelines.py "name 1" "name 2" ..."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/Projects/tools/davinci-resolve-mcp'))
from src.utils.resolve_bridge_client import connect
r = connect(require_enabled=False, timeout=300)
pm = r.GetProjectManager(); p = pm.GetCurrentProject(); mp = p.GetMediaPool()
want = set(sys.argv[1:]); drop = []
for i in range(1, p.GetTimelineCount() + 1):
    tl = p.GetTimelineByIndex(i)
    if tl and tl.GetName() in want: drop.append(tl)
print('deleting', [t.GetName() for t in drop], mp.DeleteTimelines(drop) if drop else None)
pm.SaveProject()
