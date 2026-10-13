"""The /v2 Setup agent charging up, anime style: Will (the studio's 3D model, in the
Bizmis shirt) plays the shared `charge_up` clip a touch slower, and his face goes
with it: eyes squeezed shut, brows knitted down and teeth gritted while he gathers
(trembling a little), a shout with the eyes half open on the burst, then his smile
again. Transparent frames, full figure, starting and ending on the idle pose so the
clip's first frame is also its poster.

  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/setup-charge-anim.py -- \\
      --out <frames dir> [--start 0 --end 91 --w 720 --h 1200 --samples 32]

Encode with scripts/encode-setup-charge.sh. The clip comes from the shared
avatar-animations.glb (trujilloai-bizmis-studio/avatar-pipeline/models/input), put
on the model with the pipeline's own importer (transform_avatar.import_animations),
so it moves exactly as the widget plays it. Will has no angry-brow shape key: one is
authored here on the eyebrow mesh (inner ends down).
"""
import argparse
import importlib.util
import math
import random
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

ANIMATIONS = STUDIO / "avatar-pipeline/models/input/avatar-animations.glb"
FPS = 24
START = 6          # the clip starts here (idle before it)
SLOW = 1.3         # played 1.3x longer than authored: more weight on the gather
LENGTH = 92        # frames, ~3.8 s; ends on idle like it starts


def f(t):
    """Authored charge_up seconds -> frame of this render."""
    return round(START + t * FPS * SLOW)


def find(suffix, keys=True):
    return [o for o in bpy.data.objects if o.type == "MESH" and o.name.endswith(suffix)
            and (not keys or o.data.shape_keys)]


def build_timeline(arm):
    ad = arm.animation_data
    acts = [a for a in bpy.data.actions]
    charge = next(a for a in acts if a.name == "charge_up")
    ad.action = None
    ad.use_nla = True
    for t in ad.nla_tracks:
        t.mute = True
    # charge_up starts and ends on idle_neutral's first frame: holding its own
    # ends gives the idle before and after (a separate idle track displaced the rig)
    top = ad.nla_tracks.new()
    top.name = "setup_charge"
    c = top.strips.new("setup_charge", START, charge)
    a0, a1 = charge.frame_range
    c.action_frame_start, c.action_frame_end = a0, a1
    c.scale = SLOW
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


def key_face():
    heads = find("HEAD_Head") + find("HEAD_Mouth") + find("HEAD_Teeth")
    eyes = find("HEAD_Eyes")
    brows = find("HEAD_Eyebrows")

    def setk(objs, name, frame, value):
        for o in objs:
            kb = o.data.shape_keys.key_blocks.get(name)
            if kb:
                kb.value = value
                kb.keyframe_insert("value", frame=frame)

    def face(frame, smile=0.0, sad=0.0, shout=0.0, blink=0.0, angry=0.0):
        for n, v in (("smile", smile), ("sad", sad), ("F", shout)):
            setk(heads, n, frame, v)
        for n in ("A", "B", "C", "D", "E", "G", "H", "X", "neutral"):
            setk(heads, n, frame, 0.0)
        setk(eyes, "eyeBlinkLeft", frame, blink)
        setk(eyes, "eyeBlinkRight", frame, blink)
        setk(brows, "angry", frame, angry)

    face(0, smile=1)
    face(f(0.14), smile=1)
    # the gather: squeezed eyes, knitted brows, gritted teeth
    face(f(0.5), sad=1, blink=1, angry=1)
    face(f(1.06), sad=1, blink=1, angry=1)
    # the burst: a shout, eyes half open, brows still down
    face(f(1.22), shout=1, blink=0.45, angry=1)
    face(f(1.62), shout=1, blink=0.45, angry=0.9)
    # back to his smile
    face(f(1.98), smile=1)
    face(LENGTH - 1, smile=1)


def tremble(holder):
    """A small anime tremble while he gathers, settling as he bursts."""
    rng = random.Random(3)
    base = holder.location.copy()
    holder.keyframe_insert("location", frame=0)
    holder.keyframe_insert("location", frame=f(0.4))
    for fr in range(f(0.45), f(1.18)):
        a = 0.006 * min(1.0, (fr - f(0.45)) / 6)
        holder.location = (base.x + rng.uniform(-a, a), base.y, base.z + rng.uniform(-a, a) * 0.5)
        holder.keyframe_insert("location", frame=fr)
    holder.location = base
    holder.keyframe_insert("location", frame=f(1.2))
    holder.keyframe_insert("location", frame=LENGTH - 1)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
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
    transform_avatar.import_animations(arm, str(ANIMATIONS))
    build_timeline(arm)
    angry_brows()
    key_face()
    tremble(holder)

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
    for fr in range(a.start, a.end + 1):
        path = out / f"f_{fr:04d}.png"
        if path.exists():
            continue
        sc.frame_set(fr)
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)


main()
