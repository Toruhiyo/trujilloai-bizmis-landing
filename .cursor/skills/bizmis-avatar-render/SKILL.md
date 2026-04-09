---
name: bizmis-avatar-render
description: >-
  Renders Bizmis 3D avatar marketing images via the studio repo's Python API.
  Covers avatar-only PNGs, branded shirt colors, logo stamps, widget composites,
  and batch per-lead generation. Use when the user asks to generate, render, or
  tweak avatar images, clerk mockups, marketing renders, invite card avatars,
  or any Blender-based Bizmis visual asset.
---

# Bizmis avatar render

## How it works

A sibling repo (`trujilloai-bizmis-studio`) exposes a Python API that drives
Blender headless renders. This project only **imports** from it — never write
or create files inside the studio repo.

## Before every render task

1. **Read the renderer docs** (they evolve with the studio repo):

   `/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/docs/MARKETING_RENDERER.md`

   This is the single source of truth for the full API signature, available
   avatars, animations, framing presets, lighting presets, shirt stamps,
   mesh color names, camera system, and CLI examples. **Always re-read it**
   at the start of a render task — do not rely on memorized parameter lists.

2. **Check available avatars** if the docs don't have an up-to-date table:

   ```bash
   /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python -c \
       "import sys; sys.path.insert(0,'/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio'); from marketing.render import list_avatars; print(list_avatars())"
   ```

## Package: `scripts/early_access_avatars/`

Self-contained Python package that encapsulates the full pipeline.

### File structure

```
scripts/
  early_access_avatars/        # package
    __init__.py                # public API
    _config.py                 # paths, lead registry, render defaults
    _logo.py                   # SVG→PNG, tinting, logo resolution
  generate_early_access_avatars.py   # thin CLI entry point
```

### Public API

```python
from early_access_avatars import generate_all, generate_lead

# Generate clerk avatars for ALL leads (full pipeline):
generate_all()

# Generate for a single lead:
generate_lead("molekule")

# Override the default avatar:
generate_all(avatar_id="teo")
generate_lead("glowforge", avatar_id="will")
```

### Running from the command line

Always use the **studio venv** (it has Blender bindings, Playwright, Pillow):

```bash
/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \
    scripts/generate_early_access_avatars.py
```

### What the pipeline does (per lead)

1. **Resolve logo** → finds SVG or PNG in `public/invite-cards/leads/<id>/`;
   converts SVG→PNG via Playwright; re-encodes misidentified formats (AVIF, etc.)
2. **Tint logo** (if `logo_color_overlay` is set) → flat-colours the PNG to
   match the invite-card header style; cached to `_tinted-logos/`
3. **Merge params** → universal `RENDER_DEFAULTS` + per-lead `primary_color`
   for shirt mesh, widget button, and logo stamp
4. **Render** → calls `render_avatar()` from the studio repo (Blender headless
   + Playwright widget composite)
5. **Output** → `public/invite-cards/leads/<id>/clerk-avatar.png`

## Configuration

### Render defaults (`_config.py :: RENDER_DEFAULTS`)

Universal params applied to every lead render.  To change the default pose,
lighting, expression etc. for all leads, edit this dict.

### Lead registry (`_config.py :: LEAD_REGISTRY`)

Mirrors `src/data/leadPilotRegistry.ts`.  Per-lead fields:

| Field                | Purpose                                           |
|----------------------|---------------------------------------------------|
| `id`                 | Lead identifier (matches TS registry and folder)  |
| `primary_color`      | Shirt mesh colour + widget button colour          |
| `logo_color_overlay` | When set, stamp is tinted; when `None`, raw logo  |

### Output path

Each lead's avatar is written to:

```
public/invite-cards/leads/<id>/clerk-avatar.png
```

Referenced by the TS field `clerkAvatarImagePath` (set in `base()` in
`src/data/leadPilotRegistry.ts`) and consumed by the email HTML in
`src/lib/leadPilotInviteEmailHtml.ts`.

## Output rules

- **Never create, edit, or delete any file** inside
  `/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/`.
- All generated assets go under `public/invite-cards/leads/`.
- Intermediate files (converted SVGs, tinted logos) go in `_converted-svgs/`
  and `_tinted-logos/` under the leads directory.

## Troubleshooting

- If Blender is not found, check that `/Applications/Blender.app` exists or
  pass `blender_path=` explicitly to the studio `render_avatar()` call.
- If a render fails with NLA or animation errors, re-read the "Animation
  Evaluation" section in `MARKETING_RENDERER.md` — the studio repo may have
  updated its workaround.
- If a lead's logo fails to render as a stamp, check `file logo.png` — it may
  be a non-PNG format with a `.png` extension (the pipeline handles this
  automatically via `_ensure_real_png`).
