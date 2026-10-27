"""The /v2 Setup agent charging up, anime style: Will (the studio's 3D model, in the
Bizmis shirt) in a power-up stance that never stops charging, then the big burst out
of it and back (the motion: scripts/setup-charge-clip.py), and his face goes with it:
a determined half-smile, brows down, eyes narrowed and a blink now and then while he
stands charging; eyes squeezed shut, brows knitted and teeth gritted while he gathers;
a shout with the eyes half open on the burst; then the stance's face again.
Transparent frames, full figure, 144 at 24 fps:

- f_0000..f_0047: the stance loop (2 s, seamless: frame 48 would be frame 0 again),
  played in real time whenever the scroll rests, and scrubbed before the burst;
- f_0048..f_0143: the burst (4 s), leaving the loop on its frame 0 and landing back
  on it (the loop's motion goes on under it, two whole loops), scrubbed by the scroll.

  python3 scripts/setup-charge-clip.py --out <dir>/setup-charge.glb
  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/setup-charge-anim.py -- \\
      --clip <dir>/setup-charge.glb --out <frames dir> [--start 0 --end 143 --frames 0,60 --w 720 --h 1200 --samples 32]

Encode with scripts/encode-setup-charge.sh. The clip goes on the model with the
pipeline's own importer (transform_avatar.import_animations), as the shared clips
do. Will has no angry-brow shape key: one is authored here on the eyebrow mesh
(inner ends down). Renders one frame at a time and skips frames already on disk, so
a Metal crash only costs a re-run.
"""
import argparse
import importlib.util
import math
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT.parent / "trujilloai-bizmis-studio"
spec = importlib.util.spec_from_file_location("clay_scene", ROOT / "scripts/clay-scene.py")
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)
rsc = cs.rsc
sys.path.insert(0, str(STUDIO / "avatar-pipeline"))
import transform_avatar  # noqa: E402

FPS = 24
LOOP = 48          # frames of the stance loop
LENGTH = 144       # the loop, then the burst (two loops long)
B0 = LOOP          # the burst's first frame


def find(suffix, keys=True):
    return [o for o in bpy.data.objects if o.type == "MESH" and o.name.endswith(suffix)
            and (not keys or o.data.shape_keys)]


def build_timeline(arm):
    ad = arm.animation_data
    clip = next(a for a in bpy.data.actions if a.name == "setup_charge")
    ad.action = None
    ad.use_nla = True
    for t in ad.nla_tracks:
        t.mute = True
    top = ad.nla_tracks.new()
    top.name = "setup_charge"
    c = top.strips.new("setup_charge", 0, clip)
    c.blend_type = "REPLACE"
    c.extrapolation = "HOLD"


def angry_brows():
    """Author an 'angry' shape key on the eyebrows: inner ends down, a touch lower."""
    for o in find("HEAD_Eyebrows", keys=False):
        if not o.data.shape_keys:
            o.shape_key_add(name="Basis")
        key = o.shape_key_add(name="angry", from_mix=False)
        xs = [v.co.x for v in o.data.vertices]
        mid = (min(xs) + max(xs)) / 2
        for side in (-1, 1):
            idx = [i for i, v in enumerate(o.data.vertices) if (v.co.x - mid) * side > 0]
            bcx = sum(o.data.vertices[i].co.x for i in idx) / len(idx)
            inner = -side  # toward the middle of the face
            for i in idx:
                co = key.data[i].co
                co.z -= 0.42 * (co.x - bcx) * inner + 1.1
                co.x += 0.6 * inner


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def face_at(fr):
    """The face's shape-key values on frame `fr` (keyed on every frame)."""
    sec = (fr - B0) / FPS  # seconds into the burst (negative: the loop before it)
    # the stance: determined, a half smile, brows down, eyes narrowed
    stance = {"smile": 0.2, "sad": 0.0, "F": 0.0, "blink": 0.12, "angry": 0.6}
    gather = {"smile": 0.0, "sad": 1.0, "F": 0.0, "blink": 1.0, "angry": 1.0}
    shout = {"smile": 0.0, "sad": 0.0, "F": 1.0, "blink": 0.42, "angry": 1.0}
    # the burst's weights: into the gather, the shout, back to the stance
    g = smooth((sec - 0.25) / 0.4) * (1 - smooth((sec - 1.62) / 0.14))
    sh = smooth((sec - 1.66) / 0.12) * (1 - smooth((sec - 2.65) / 0.5))
    out = {}
    for k in stance:
        out[k] = stance[k] * (1 - g - sh) + gather[k] * g + shout[k] * sh
    # a blink once a loop (phase 0.72), on top of whatever the eyes are doing
    ph = fr % LOOP
    b = max(0.0, 1 - abs(ph - 35.5) / 2.5)
    out["blink"] = max(out["blink"], smooth(b))
    return out


def key_face(start, end):
    heads = find("HEAD_Head") + find("HEAD_Mouth") + find("HEAD_Teeth")
    eyes = find("HEAD_Eyes")
    brows = find("HEAD_Eyebrows")

    def setk(objs, name, frame, value):
        for o in objs:
            kb = o.data.shape_keys.key_blocks.get(name)
            if kb:
                kb.value = value
                kb.keyframe_insert("value", frame=frame)

    for fr in range(start, end + 1):
        v = face_at(fr)
        for n in ("smile", "sad", "F"):
            setk(heads, n, fr, v[n])
        for n in ("A", "B", "C", "D", "E", "G", "H", "X", "neutral"):
            setk(heads, n, fr, 0.0)
        setk(eyes, "eyeBlinkLeft", fr, v["blink"])
        setk(eyes, "eyeBlinkRight", fr, v["blink"])
        setk(brows, "angry", fr, v["angry"])


def recentre(holder):
    """Centre the stance (on the loop's first frame) in the frame, side to side."""
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    xs = []
    for o in bpy.data.objects:
        if o.type == "MESH" and not o.hide_render and o.name.startswith("done_"):
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            xs += [(o.matrix_world @ v.co).x for v in me.vertices]
            e.to_mesh_clear()
    if xs:
        holder.location.x -= (min(xs) + max(xs)) / 2


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--clip", required=True, help="scripts/setup-charge-clip.py's GLB")
    ap.add_argument("--frames", default="", help="only these frames (comma separated), for a quick look")
    ap.add_argument("--model", default="will")
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=LENGTH - 1)
    ap.add_argument("--w", type=int, default=720)
    ap.add_argument("--h", type=int, default=1200)
    ap.add_argument("--samples", type=int, default=32)
    a = ap.parse_args(argv)

    rsc._clear_scene()
    sc = bpy.context.scene
    sc.render.fps = FPS
    cs.world("#f2d2b4", 0.35)
    # the Bizmis orange shirt (the landing's --primary) with the Bizmis logo
    holder, H = cs.avatar(a.model, (0, 0, 0), height=2.0, shirt="#F9A353", expression="smile", progress=0.0)
    arm = next(o for o in bpy.data.objects if o.type == "ARMATURE" and o.animation_data and o.animation_data.nla_tracks)
    transform_avatar.import_animations(arm, a.clip)
    build_timeline(arm)
    angry_brows()
    key_face(0, LENGTH - 1)
    recentre(holder)

    focus = cs.focus_at((0, 0, H * 0.55))
    cs.area("key", 260, 4.0, (1.0, 0.96, 0.9), (-1.6, -2.6, 4.6), focus)
    cs.area("fill", 120, 4.0, (1.0, 0.93, 0.86), (2.6, -2.8, 1.6), focus)
    cs.area("rim", 260, 1.6, (1.0, 0.78, 0.55), (1.8, 2.4, 3.0), focus)
    for name in ("FillLight", "RimLight", "fill", "rim"):
        o = bpy.data.objects.get(name)
        if o is not None:
            o.data.use_shadow = False
    # the whole figure, framed like the static setup render (720 x 1199)
    cs.camera((0, -3.6, H * 0.52), (0, 0, H * 0.5), lens=50)

    sc.render.engine = "CYCLES"
    sc.cycles.samples = a.samples
    sc.cycles.use_denoising = True
    try:
        sc.cycles.device = "GPU"
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
    except Exception:
        pass
    sc.render.resolution_x = a.w
    sc.render.resolution_y = a.h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    # one frame at a time, skipping frames already on disk: a Metal crash only costs a re-run
    frames = [int(x) for x in a.frames.split(",") if x] or range(a.start, a.end + 1)
    for fr in frames:
        path = out / f"f_{fr:04d}.png"
        if path.exists():
            continue
        sc.frame_set(fr)
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)


main()
